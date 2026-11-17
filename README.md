# Portfolio · Benjamin Deng

Benjamin Deng 的个人作品集，使用 React 和 Vite 构建，支持中文与英文。

当前视觉以 `tmp/copilot/e-signal.html` 为基准：近黑背景、荧光黄绿、超大姓名排版、玻璃卡片，以及随页面区块变形的交互粒子场。

## 内容与动效

- 中英文文案、履历、项目和技术栈：`src/i18n/locales/zh.json`、`en.json`。
- 社交链接和图标映射：`src/data.js`。
- 页面结构：`src/App.jsx`；参考配色、排版与响应式样式：`src/styles.css`。
- 粒子场形态与物理参数：`src/components/signalField.js`。
- 写实人像的采样分配：`src/components/portrait.js`；大屏保持大幅、居中的半身构图，鼻梁、鼻尖和唇部使用独立的扫描表面粒子与阴影；鼻部细节不会被标题区域的整体淡化抹掉。
- 滚动联动、横向项目画廊、光标聚光、磁吸按钮和时间线：`src/components/useSignalMotion.js`。
- 指标计数：`src/components/AnimatedNumber.jsx`。

粒子场包括戴墨镜的写实人像、B/D、网络、画框、地层、河流、双环与信号环八种形态，支持指针排斥与点击涟漪。组件卸载时清理动画、定时器与事件监听。开启系统“减少动态效果”后，粒子场静止、项目改为纵向排列，保留全部内容。

移动端包含折叠导航，横向画廊自动改为纵向列表。联系入口包含 Email、GitHub、Bilibili 和 YouTube，邮箱支持复制反馈。

## 背景音乐

`src/components/SoundToggle.jsx` 播放用户提供的 `tmp/bg.mp3`，发布文件为 `public/audio/bg.mp3`（128 kbps、移除封面）。默认尝试有声自动循环播放；浏览器禁止自动播放时，在首次点击或按键后重试。顶部音频按钮可以随时暂停/恢复，并通过本地存储记住关闭选择；切到后台暂停，返回时恢复原先的播放状态。播放音量渐入至 45%，加载失败显示重试提示。

## 人像素材与再生成

人像来自 Lee Perry-Smith 的 **Infinite, 3D Head Scan**（基于 www.triplegangers.com，许可 [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)），不是作品集本人的肖像。原模型及许可来自 [three.js 示例](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/LeePerrySmith)。本项目将其转换为带光照的粒子数据，并添加墨镜与唇部细节；完整署名随站点发布在 `public/credits.txt`，页脚可访问。

普通构建无需下载模型。调整采样时，将原始 `LeePerrySmith.glb` 下载到本地后运行 `node scripts/build-portrait.mjs /path/to/LeePerrySmith.glb`，再生成 `src/components/portraitData.js`。

## 开发

`npm install` 安装依赖，`npm run dev` 启动 Vite，`npm run build` 输出生产文件至 `dist/`，`npm run preview` 预览生产构建。

## 部署

保留现有腾讯云 CloudBase 配置 `cloudbaserc.json`。本次改造仅修改本地项目，不自动部署。
