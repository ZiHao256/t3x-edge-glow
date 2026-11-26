**简体中文** | [English](README.en.md)

# 边缘光

需要审批、等你回答、出错或在后台跑完时，窗口边缘亮起对应颜色的光。

![窗口边缘光：需要审批（琥珀色）、后台跑完（绿色）、出错（红色）](docs/edge-glow.png)

[T3 Code Extensions](https://github.com/ZiHao256/t3code-extensions) 的扩展，T3 Code Extensions 是 [T3 Code](https://github.com/pingdotgg/t3code) 的非官方扩展宿主。在 设置 → 扩展 →「浏览」里安装，或者把 `https://github.com/ZiHao256/t3x-edge-glow` 粘贴到那里的链接框。「检查更新」取本仓库的最新 Release，确认后安装。

## 功能

- 四种状态四种颜色，同时有几种时只亮最急的一种：需要审批（琥珀色）、等你回答（蓝色）、出错（红色）、在后台跑完（绿色）。
- “在后台跑完”指窗口不在前台时会话正常结束；中断、失败、断开连接都不算。下一轮开始后绿光熄灭。
- 主聊天和 side chat 都会触发，取两边最急的那个。
- 设置 → 扩展 → 边缘光 →「设置」里选动效档位：省电（10 秒后静止）、混合（10 秒后降到 30fps）、30fps（一直动）。改了立刻作用到正在亮的光。

## 让 agent 安装

把下面的提示词发给 Claude Code、Codex 等 coding agent：

```text
帮我在这台 Mac 上给 T3 Code 装「边缘光」扩展（https://github.com/ZiHao256/t3x-edge-glow）。
1. 确认已安装 T3 Code Extensions。没装的话，先按 https://github.com/ZiHao256/t3code-extensions 里「让 agent 安装」一节装好；要退出 T3 Code 前先问我。
2. 打开 ~/Applications/T3 Code Extensions.app，进入 设置 → 扩展 →「浏览」，在社区扩展里安装 t3x-edge-glow；或者把 https://github.com/ZiHao256/t3x-edge-glow 粘贴到链接框里点「添加」。确认框里核对来源是 ZiHao256/t3x-edge-glow 再确认。
3. 在「已安装」里确认它已启用，告诉我版本号。
如果你没法操作应用界面，做完第 1 步后，把第 2、3 步具体点哪里告诉我。
```

## 依赖

只依赖宿主提供的 `host` 接口（`apiVersion` 2），旧版宿主会拒绝安装。

## 开发

- `npm test` 运行测试（Node 22+，不依赖 npm 包）。
- 试改动：设置 → 扩展 →「添加本地扩展」选本仓库目录，改完点卡片上的刷新。

## 发版

1. 改代码和 `plugin.json` 的 `version`，跑 `npm test`，提交。
2. 在这个提交上打 `v<version>` 标签，连标签一起推送并发布 GitHub Release（「检查更新」看的是最新 Release）。

## 许可

MIT
