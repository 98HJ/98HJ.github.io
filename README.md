# 个人学术主页 · Personal Academic Homepage

为**博士 / 研究者**打造的编辑时尚风个人网站。纯静态 HTML/CSS/JS,**无需构建步骤**,原生支持**中英双语切换**与**深色 / 浅色主题切换**,可托管到 GitHub Pages。

<<<<<<< HEAD

=======
>>>>>>> cae6c8c85fe93b49616ecc89b15866695f68650d
## 目录结构

```
personal-website/
├── index.html          # 主页面(双语用 .lang-zh / .lang-en 区分)
├── css/style.css       # 样式表(主色在 :root 的 --accent)
├── js/main.js          # 交互:语言切换 / 移动端菜单 / 导航高亮 / 滚动渐显
├── assets/             # 放头像 photo.jpg
├── blog/               # 笔记/博客
│   ├── index.html      # 归档页
│   ├── post-1.html     # 示例文章 1(数字时尚)
│   └── post-2.html     # 示例文章 2(可穿戴系统)
├── .nojekyll           # 让 GitHub Pages 跳过 Jekyll 处理
└── README.md
```

## 替换成你自己的内容

### 1. 姓名与基本信息
按需更新 `index.html` 里的院系、研究方向、邮箱、GitHub / ORCID / Web of Science 链接（姓名已设为 花健 / Jian Hua）。
双语内容成对出现,改时两种语言都改,保持对称。

### 2. 研究兴趣(#research)
`index.html` 的 `<section id="research">` 内,每个 `.card` 是一张卡片,可复制增减(建议 3–4 个)。

### 3. 论文列表(#publications)
每个 `<li class="pub">` 是一条论文,填标题、作者、`[PDF]/[Code]/[DOI]` 真实链接;没有的删掉对应 `<a>`。

### 4. 头像
头像以 base64 data URI 形式存放在 `assets/avatar.js`(由脚本从 `assets/photo.jpg` 生成,`index.html` 末尾引入后注入 `id="siteAvatar"` 的 `<img>`)。纯静态托管无需单独上传图片二进制。
如需更换:把新照片放进 `assets/photo.jpg`,用 Pillow 重新生成 `assets/avatar.js` 即可(见仓库内 `_gen_avatar_js.py`)。

### 5. 改主题色
`css/style.css` 的 `:root` 里改 `--accent`(默认赤陶 `#a85a3c`)即可换配色;深色主题配色在 `[data-theme="dark"]` 块中,可一并调整。
右上角 ☀ / 🌙 按钮切换深 / 浅色,选择会被记住(localStorage),未手动设定时跟随系统偏好。

### 6. 写新笔记
复制 `blog/post-1.html` 改标题与内容;别忘了在主页「笔记」区块和 `blog/index.html` 各加一张卡片。

> 站点当前未含「简历 / CV」独立板块(如需,可在 `index.html` 末尾联系板块前加一个 `<section id="cv">`,并把 `cv.pdf` 放进 `assets/`)。

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
