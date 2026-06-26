# Portfolio · Benjamin Deng

> Benjamin Deng 的个人作品集网站 —— AI 平台架构师，专注 AI Agent、多智能体协作、大数据与企业级 AI Workflow。

一个以「轨道智能（Orbital Intelligence）」为视觉主题的单页作品集：纯净的瓷白底色、石墨色文字、单一钴蓝点缀，配合真实的交互式 3D 轨道系统与丰富而克制的动效。

## ✨ 特性

- **交互式 3D 轨道视觉** —— 基于 Three.js 的珍珠白内核、银色光环、卫星节点与钴蓝信号灯（[OrbitScene](src/components/OrbitScene.jsx)）。
- **电影级动效** —— Hero 入场、指针视差、滚动揭示、指标计数器、动态职业时间线与磁吸链接（[MotionSystem](src/components/MotionSystem.jsx)、[Reveal](src/components/Reveal.jsx)、[MagneticLink](src/components/MagneticLink.jsx)、[AnimatedNumber](src/components/AnimatedNumber.jsx)）。
- **内容数据化** —— 能力、项目、经历、技术栈等内容集中在 [src/data.js](src/data.js)，易于编辑。
- **可访问性** —— 支持 `prefers-reduced-motion`，在保证观感的同时保留可读性。
- **响应式布局** —— 桌面与移动端自适应导航与排版。

## 🛠 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | React 19 |
| 构建 | Vite 6 |
| 动画 | Framer Motion |
| 3D | Three.js |
| 图标 | Phosphor Icons |
| 部署 | 腾讯云 CloudBase |

## 📁 项目结构

```
portfolio/
├── index.html              # 入口 HTML
├── src/
│   ├── main.jsx            # 应用挂载入口
│   ├── App.jsx             # 页面主体与各区块
│   ├── data.js             # 作品集内容（能力 / 项目 / 经历 / 技术栈）
│   ├── styles.css          # 全局样式
│   └── components/
│       ├── OrbitScene.jsx      # 3D 轨道系统
│       ├── MotionSystem.jsx    # 动效基础组件
│       ├── Reveal.jsx          # 滚动揭示
│       ├── MagneticLink.jsx    # 磁吸链接
│       └── AnimatedNumber.jsx  # 数字计数器
├── vite.config.mjs         # Vite 配置
└── cloudbaserc.json        # CloudBase 部署配置
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动本地开发服务器（http://127.0.0.1:5173）
npm run dev

# 生产构建（输出到 dist/）
npm run build

# 预览构建产物
npm run preview
```

## ☁️ 部署

项目通过 [cloudbaserc.json](cloudbaserc.json) 配置部署到腾讯云 CloudBase：构建命令 `vite build`，产物目录 `dist/`。

## 📝 自定义内容

绝大多数文案与展示数据集中在 [src/data.js](src/data.js)，包括导航、核心指标、能力卡片、精选项目、职业经历与技术栈。编辑该文件即可更新作品集内容，无需改动组件逻辑。

## 📬 联系

- Email: playwolf719@163.com
- GitHub: [@playwolf719](https://github.com/playwolf719)
