# 歌词彩蛋网页（五月天粉丝互动告白页）

一个纯静态单页项目，支持霓虹舞台交互、彩蛋歌词、暗号触发和背景音乐。

## 文件说明

- `index.html`: 页面结构、弹窗结构、SEO/OG 元信息
- `styles.css`: 霓虹主题样式、动画、移动端适配
- `app.js`: 交互状态机、暗号弹窗、音频控制、粒子效果
- `content.js`: 你可以直接编辑的文案配置
- `assets/og-cover.svg`: 默认分享封面图
- `assets/bgm.mp3`: 背景音乐文件（可替换）

## 快速使用

1. 替换 `assets/bgm.mp3` 为你的音乐文件（文件名保持 `bgm.mp3` 最省事）。
2. 编辑 `content.js`，填入歌名、歌词和注释。
3. 本地预览（任选一种）：
   - 双击 `index.html`
   - 或运行：`python3 -m http.server 8080`
4. 推送到 `main` 分支后，GitHub Pages 会自动更新线上站点。

## `window.APP_CONFIG` 可配置项

- `title`: 页面主标题
- `subtitle`: 副标题
- `keyword`: 暗号内容
- `keywordButtonText`: 舞台上的暗号按钮文本
- `keywordPromptTitle`: 暗号弹窗标题
- `keywordPromptPlaceholder`: 暗号输入框提示词
- `keywordErrorText`: 暗号输入错误时的提示
- `unlockCount`: 解锁终章所需触发次数（默认 5）
- `bgmUrl`: 背景音乐路径（默认 `./assets/bgm.mp3`）
- `easterEggs`: 彩蛋数组
  - `id`: 唯一标识
  - `trigger`: `click-heart` / `longpress-stage` / `type-keyword` / `tap-corner` / `swipe-up`
  - `title`: 彩蛋标题
  - `song`: 歌名（例如《倔强》）
  - `lyric`: 歌词内容
  - `note`: 你的注释或回忆
  - `effect`: 预留字段
- `finalMessage`: 终章告白文案
- `finalSignature`: 终章落款

## 关键词触发说明

- 可见入口：点击舞台上的 `输入暗号` 按钮，弹窗里输入暗号后提交。
- 桌面快捷：也可直接在键盘输入暗号触发。

## 音乐接入说明

1. 把你的音频文件放到 `assets/bgm.mp3`。
2. 如果你改了文件名或目录，同步修改 `content.js` 里的 `bgmUrl`。
3. 页面按钮状态说明：
   - `音乐：未配置`
   - `音乐：加载中`
   - `音乐：加载失败`
   - `音乐：开 / 关`

## 发布

- GitHub Pages（推荐当前项目方式）：
  - 仓库 Settings -> Pages -> `main` + `/(root)`
  - 每次 `git push origin main` 自动部署

