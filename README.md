# 歌词彩蛋网页（五月天粉丝互动告白页）

一个可直接部署到 Vercel 的静态单页项目。

## 文件说明

- `index.html`: 页面结构和 SEO/OG 元信息
- `styles.css`: 霓虹演唱会视觉、动画、响应式样式
- `app.js`: 彩蛋状态机、触发器、粒子、音频控制
- `content.js`: 你需要改的文案配置
- `assets/og-cover.svg`: 默认分享封面图

## 快速使用

1. 编辑 `content.js`，替换 5 段歌词与告白文案。
2. 本地预览（任选一种）：
   - 直接双击 `index.html`
   - 或执行 `python3 -m http.server 8080`
3. 部署到 Vercel：
   - 推到 GitHub
   - 在 Vercel 导入仓库
   - Framework 选 `Other`（静态）
   - 直接 Deploy

## 可配置项（`window.APP_CONFIG`）

- `title`: 页面主标题
- `subtitle`: 副标题
- `keyword`: 键盘暗号（输入后触发彩蛋）
- `unlockCount`: 解锁终章所需触发次数（默认 5）
- `bgmUrl`: 背景音乐 URL（留空则不启用）
- `easterEggs`: 彩蛋数组
  - `id`: 唯一标识
  - `trigger`: `click-heart` / `longpress-stage` / `type-keyword` / `tap-corner` / `swipe-up`
  - `title`: 彩蛋标题
  - `text`: 歌词原文
  - `note`: 你的注释
  - `effect`: 预留字段
- `finalMessage`: 终章告白文案
- `finalSignature`: 落款

## 交互触发器

- 点击中央心形：`click-heart`
- 长按舞台约 700ms：`longpress-stage`
- 键盘输入暗号：`type-keyword`
- 点击四角隐藏区域：`tap-corner`
- 移动端上滑：`swipe-up`

## 分享优化

- `index.html` 中 `og:title` / `og:description` / `og:image` 可按你们故事改。
- 若要更好社媒预览，建议把 `og:image` 换成线上绝对 URL。
