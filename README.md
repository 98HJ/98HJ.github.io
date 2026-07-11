# 个人学术主页 · Personal Academic Homepage

为**准博士研究生 / 在读博士**打造的编辑时尚风个人网站。纯静态 HTML/CSS/JS,**无需构建步骤**,原生支持**中英双语切换**,可托管到 GitHub Pages。

> 示例身份:苏州大学 服装设计与工程博士(准),研究方向 Digital Fashion & Wearable Systems。
> 站名暂用「华建 / Hua Jian」(取自本地 git 配置),如与你的真实姓名不符,请全局替换。

## 目录结构

```
personal-website/
├── index.html          # 主页面(双语用 .lang-zh / .lang-en 区分)
├── css/style.css       # 样式表(主色在 :root 的 --accent)
├── js/main.js          # 交互:语言切换 / 移动端菜单 / 导航高亮 / 滚动渐显
├── assets/             # 放头像 photo.jpg、简历 cv.pdf
├── blog/               # 笔记/博客
│   ├── index.html      # 归档页
│   ├── post-1.html     # 示例文章 1(数字时尚)
│   └── post-2.html     # 示例文章 2(可穿戴系统)
├── .nojekyll           # 让 GitHub Pages 跳过 Jekyll 处理
└── README.md
```

## 替换成你自己的内容

### 1. 姓名与基本信息
全局替换 `华建` / `Hua Jian`,以及 `index.html` 里的院系、研究方向、邮箱 `jhua1014@163.com`、GitHub / Scholar 链接。
双语内容成对出现,改时两种语言都改,保持对称。

### 2. 研究兴趣(#research)
`index.html` 的 `<section id="research">` 内,每个 `.card` 是一张卡片,可复制增减(建议 3–4 个)。

### 3. 论文列表(#publications)
每个 `<li class="pub">` 是一条论文,填标题、作者、`[PDF]/[Code]/[DOI]` 真实链接;没有的删掉对应 `<a>`。

### 4. 头像
把正方形照片命名为 `photo.jpg` 放进 `assets/`,再把 `index.html` 里的
`<div class="photo-placeholder">…</div>` 整段替换为:
```html
<img class="photo-img" src="assets/photo.jpg" alt="华建">
```

### 5. 简历(CV)
简历命名为 `cv.pdf` 放进 `assets/`,「下载简历」按钮即可生效。

### 6. 改主题色
`css/style.css` 的 `:root` 里改 `--accent`(默认赤陶 `#a85a3c`)即可换配色。

### 7. 写新笔记
复制 `blog/post-1.html` 改标题与内容;别忘了在主页「笔记」区块和 `blog/index.html` 各加一张卡片。

## 本地预览

```bash
python -m http.server 8000   # 然后访问 http://localhost:8000
```

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库(个人主页用 `yourname.github.io`,否则用任意仓库名)。
2. 进入本目录执行:
   ```bash
   git init
   git add -A
   git commit -m "init personal site"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```
3. 仓库 Settings → Pages → Source 选 `main` 分支根目录 → Save。
4. 几分钟后访问 `https://你的用户名.github.io`(项目仓库则为 `https://你的用户名.github.io/仓库名`)。

> 本项目已含 `.nojekyll`,确保 `blog/` 等带下划线路径被正常托管。
> 提示:GitHub Pages 项目站点的根路径是 `/仓库名/`,本站点全部使用相对路径,无需额外改动。
