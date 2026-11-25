// 边缘光的状态判断（纯函数，tests/verify.cjs 直接测）。

/** 按紧急程度：approval / input 来自 T3 自己算出的 awaitingUser；新一轮运行开始后不再显示 done。 */
function attentionState({ awaiting, error, done, working }) {
  return awaiting || (error ? "error" : done && !working ? "done" : null);
}

/**
 * 后台完成：同一会话的运行在窗口不在前台时结束，且最后一次运行是 completed（中断、失败、断连都不算）。
 * “停止运行”和运行状态可能分两次渲染到达，所以先记为 pending，等运行状态确定再下结论。
 */
function backgroundFinish(pending, prev, cur, focused) {
  if (!prev || prev.key !== cur.key || cur.working || cur.awaiting || cur.error || focused) return { pending: false, done: false };
  if (!pending && !prev.working) return { pending: false, done: false };
  if (cur.runStatus === "completed") return { pending: false, done: true };
  return { pending: !["failed", "interrupted", "cancelled"].includes(cur.runStatus), done: false };
}

if (typeof module === "object" && module.exports) module.exports = { attentionState, backgroundFinish };
