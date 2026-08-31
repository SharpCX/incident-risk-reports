# Incident Risk Reports

公开的链上事故风险报告档案站，部署于 GitHub Pages。

## 目录结构

```text
index.html                         # 自动读取 reports.json 的报告首页
reports.json                       # 公开报告清单
reports/<project-event-date>/      # 每个事故的稳定公开 URL
assets/                            # 首页样式与社交分享图片
```

原始数据、聊天导出和研究过程文件不会进入公开仓库；`.gitignore` 已排除本目录现有的原始报告、artifact JSON 和 Telegram 导出。

## 新增报告

1. 为事故创建 `reports/<project-event-date>/index.html`。
2. 在 `reports.json` 顶层数组添加一条报告记录。
3. 为报告补充 canonical、Open Graph 与 Twitter Card 元数据。
4. 本地检查后提交并推送到 `main`；GitHub Pages 会自动发布。

## 本地预览

由于首页通过 `fetch()` 读取 `reports.json`，请使用本地 HTTP 服务：

```bash
python3 -m http.server 8080
```

然后打开 `http://localhost:8080/`。

