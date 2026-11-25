# Edge glow（边缘光）

Lights up the window edge when an approval is needed, the agent is waiting for your answer, an error occurs, or a background run finishes.

需要审批、等你回答、出错或在后台跑完时，窗口边缘亮起对应颜色的光。

An extension for [T3 Code Extensions](https://github.com/ZiHao256/t3code-extensions), an unofficial extension host for [T3 Code](https://github.com/pingdotgg/t3code). Install it in Settings → Extensions → Browse, or paste `https://github.com/ZiHao256/t3x-edge-glow` into the URL field there. "Check for updates" offers this repository's latest release, installed after you confirm.

[T3 Code Extensions](https://github.com/ZiHao256/t3code-extensions) 的扩展。在 设置 → 扩展 →“浏览”里安装，或者把 `https://github.com/ZiHao256/t3x-edge-glow` 粘贴到那里的链接框。“检查更新”取本仓库的最新 Release。

## Requirements / 依赖

`apiVersion` 2: needs a T3 Code Extensions host that supports it. Older hosts refuse to install this version.

只依赖宿主提供的 `host` 接口（`apiVersion` 2），旧版宿主会拒绝安装。

## Development / 开发

- `npm test` runs the tests (Node 22+, no dependencies). 运行测试，不依赖 npm 包。
- To try changes: Settings → Extensions → Add local extension, pick this folder, then click refresh on its card after each edit. 试改动：设置 → 扩展 →“添加本地扩展”选本仓库目录，改完点卡片上的刷新。

## Release / 发版

1. Change the code, bump `version` in `plugin.json`, run `npm test`, and commit. 改代码和 `plugin.json` 的 `version`，跑测试，提交。
2. Tag that commit `v<version>`, push it with the tag, and publish a GitHub release ("check for updates" reads the latest release). 在这个提交上打 `v<version>` 标签，连标签一起推送并发布 Release（“检查更新”看的是最新 Release）。

## License

MIT
