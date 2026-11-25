"use strict";
// 边缘光扩展的测试：状态优先级、后台跑完判定。
// 用法：npm test（不依赖任何 npm 包，Node 22+）。
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const glow = require("../logic.js");

// 测试按登记顺序在文件末尾依次执行，支持 async。
let passed = 0;
const queue = [];
function test(name, fn) {
  queue.push([name, fn]);
}

// 扩展脚本作为 function(host){…} 的函数体执行，这里只检查能编译。
test("脚本能编译", () => {
  const m = JSON.parse(read("plugin.json"));
  new Function("host", [].concat(m.entries.web).map(read).join("\n;\n"));
});

test("边缘光状态", () => {
  assert.equal(glow.attentionState({ awaiting: "approval", error: true }), "approval");
  assert.equal(glow.attentionState({ error: true, done: true }), "error");
  assert.equal(glow.attentionState({ done: true, working: true }), null);
  const prev = { key: "a", working: true };
  assert.deepEqual(glow.backgroundFinish(false, prev, { key: "a", runStatus: "completed" }, false), { pending: false, done: true });
  assert.deepEqual(glow.backgroundFinish(false, prev, { key: "a", runStatus: "completed" }, true), { pending: false, done: false });
  assert.deepEqual(glow.backgroundFinish(false, prev, { key: "a", runStatus: "running" }, false), { pending: true, done: false });
  assert.deepEqual(glow.backgroundFinish(true, { key: "a" }, { key: "a", runStatus: "failed" }, false), { pending: false, done: false });
});


(async () => {
  for (const [name, fn] of queue) {
    await fn();
    passed += 1;
    console.log(`✓ ${name}`);
  }
  console.log(`\n全部通过（${passed} 项）`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
