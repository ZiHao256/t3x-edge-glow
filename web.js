// 边缘光：chat.overlay 拿到会话状态，按紧急程度点亮 body 上的一个全窗口元素。
const { React, h } = host;

// 动效档位：省电约 10 秒后定格；混合前 10 秒平滑、之后 30fps 一直动；30fps 从头到尾 30fps。
const MODES = {
  eco: () => host.t("省电（10 秒后静止）", "Power saving (static after 10 sec)"),
  hybrid: () => host.t("混合（10 秒后降到 30fps）", "Hybrid (drops to 30 fps after 10 sec)"),
  steady: () => host.t("30fps（一直动）", "30 fps (always animated)"),
};
const mode = () => {
  const m = host.storage.get("mode", "eco");
  return Object.hasOwn(MODES, m) ? m : "eco";
};

// 主聊天和 side chat 各有一个实例，按紧急程度取最高的那个显示。
const owners = new Map();
const reducedQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
let el = null;
let disposed = false; // 停用后组件卸载时还会回调一次 setAttention，不能再建元素

function glowEl() {
  if (el) return el;
  el = document.createElement("div");
  el.className = "t3x-attention-glow";
  el.setAttribute("aria-hidden", "true");
  el.dataset.visible = "false";
  document.body.appendChild(el);
  return el;
}

// stepped 时所有动画按 30fps 出帧：steps 每步一帧（时长基本是 1/30 秒的整数倍）且同一起点，所以同帧更新。
// 否则恢复平滑：updateTiming 的覆盖会一直留在动画上，切回省电时要清掉。
function pace(stepped) {
  for (const a of el.getAnimations({ subtree: true })) {
    if (!a.animationName) continue;
    const steps = stepped ? Math.round((a.effect.getTiming().duration * 30) / 1000) : 0;
    a.effect.updateTiming({ easing: steps ? `steps(${steps})` : "linear" });
  }
}

// 从头播放当前状态的动画，并按档位决定是否循环、何时降到 30fps。
// 有限动画播完后浏览器不会自己重播（淡出期间同状态重现、approval/input 互切时流光同名），所以手动从头播；
// 新建（尚未开始）和已有的动画用同一个 startTime，30fps 时才同帧更新。
function restart() {
  const m = mode();
  el.dataset.loop = String(m !== "eco");
  const t0 = document.timeline.currentTime;
  for (const a of el.getAnimations({ subtree: true })) if (a.animationName) a.startTime = t0;
  clearTimeout(el.stepTimer);
  pace(m === "steady");
  if (m === "hybrid") el.stepTimer = setTimeout(() => pace(true), 10000);
}

// 隐藏时先保留 data-state 让淡出保持原色，淡出结束再移除，循环动画随之停止。
function setAttention(owner, own) {
  if (disposed) return;
  if (own) owners.set(owner, own);
  else owners.delete(owner);
  const states = [...owners.values()];
  const state = ["approval", "input", "error", "done"].find((s) => states.includes(s)) || null;
  const node = glowEl();
  clearTimeout(node.clearTimer);
  if (state) {
    const replay = node.dataset.state !== state || node.dataset.visible !== "true";
    node.dataset.state = state;
    node.dataset.visible = "true";
    if (replay) restart();
    return;
  }
  clearTimeout(node.stepTimer);
  node.dataset.visible = "false";
  node.clearTimer = setTimeout(() => {
    if (node.dataset.visible === "false") delete node.dataset.state;
  }, 700);
}

// 系统切换“减弱动态效果”后 CSS 会重建动画（新动画没有 30fps 限制），按当前档位重新起播。
const onReducedChange = () => el?.dataset.visible === "true" && restart();
reducedQuery?.addEventListener?.("change", onReducedChange);
// 档位改了立刻作用到正在亮的光。
const offMode = host.storage.subscribe("mode", onReducedChange);

function AttentionGlow({ awaiting, working, error, threadKey, runStatus }) {
  const [owner] = React.useState(() => ({}));
  const [done, setDone] = React.useState(false);
  const prevRef = React.useRef(null);
  const pendingRef = React.useRef(false);
  React.useEffect(() => {
    const cur = { key: threadKey, working: !!working, awaiting, error: !!error, runStatus };
    const prev = prevRef.current;
    prevRef.current = cur;
    if ((prev && prev.key !== cur.key) || cur.working) setDone(false);
    const next = backgroundFinish(pendingRef.current, prev, cur, document.hasFocus());
    pendingRef.current = next.pending;
    if (next.done) setDone(true);
  }, [threadKey, working, awaiting, error, runStatus]);
  React.useEffect(() => {
    if (!done) return;
    const back = () => document.hasFocus() && setDone(false);
    window.addEventListener("focus", back);
    document.addEventListener("visibilitychange", back);
    back(); // 窗口可能在监听器装上之前就已回到前台
    return () => {
      window.removeEventListener("focus", back);
      document.removeEventListener("visibilitychange", back);
    };
  }, [done]);
  const state = attentionState({ awaiting, error: !!error, done, working: !!working });
  React.useEffect(() => setAttention(owner, state), [state]);
  React.useEffect(() => () => setAttention(owner, null), []);
  return null;
}

function Settings({ ui }) {
  host.useLang();
  const current = host.storage.use("mode", "eco");
  return h(
    "div",
    { className: "t3x-glow-settings" },
    h("span", { className: "t3x-glow-settings-label" }, host.t("动效档位", "Animation mode")),
    Object.entries(MODES).map(([id, label]) =>
      h(ui.Button, { key: id, size: "xs", variant: current === id ? "default" : "outline", onClick: () => host.storage.set("mode", id) }, label()),
    ),
  );
}

host.register("chat.overlay", AttentionGlow);
host.settings(Settings);
host.style(".t3x-glow-settings{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.t3x-glow-settings-label{font-size:12px;color:var(--muted-foreground);margin-right:4px}");

return () => {
  disposed = true;
  reducedQuery?.removeEventListener?.("change", onReducedChange);
  offMode();
  owners.clear();
  if (!el) return;
  clearTimeout(el.stepTimer);
  clearTimeout(el.clearTimer);
  el.remove();
  el = null;
};
