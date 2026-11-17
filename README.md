# Portfolio · Benjamin Deng

Benjamin Deng 的个人作品集，使用 React 和 Vite 构建，支持中文与英文。

当前视觉以 `tmp/copilot/e-signal.html` 为基准：近黑背景、荧光黄绿、超大姓名排版、玻璃卡片，以及随页面区块变形的交互粒子场。

## 内容与动效

- 中英文文案、履历、项目和技术栈：`src/i18n/locales/zh.json`、`en.json`。
- 社交链接和图标映射：`src/data.js`。
- 页面结构：`src/App.jsx`；参考配色、排版与响应式样式：`src/styles.css`。
- 粒子场形态与物理参数：`src/components/signalField.js`。
- 滚动联动、横向项目画廊、光标聚光、磁吸按钮和时间线：`src/components/useSignalMotion.js`。
- 指标计数：`src/components/AnimatedNumber.jsx`。

粒子场包括 B/D、网络、画框、地层、河流、双环与信号环七种形态，支持指针排斥与点击涟漪。组件卸载时清理动画、定时器与事件监听。开启系统“减少动态效果”后，粒子场静止、项目改为纵向排列，保留全部内容。

移动端包含折叠导航，横向画廊自动改为纵向列表。联系入口包含 Email、GitHub、Bilibili 和 YouTube，邮箱支持复制反馈。

## 开发

`npm install` 安装依赖，`npm run dev` 启动 Vite，`npm run build` 输出生产文件至 `dist/`，`npm run preview` 预览生产构建。

## 部署

保留现有腾讯云 CloudBase 配置 `cloudbaserc.json`。本次改造仅修改本地项目，不自动部署。
