# 物理基础演习 PPT×网站 联动执行计划

> 三智能体共识方案 | 2026-04-05

## 📋 执行概览

| 阶段 | 任务 | 优先级 | 工作量 |
|------|------|--------|--------|
| Phase 1 | PPT 加入 QR 码引流 | 🔴 高 | 2h |
| Phase 2 | 网站新增交互组件 | 🔴 高 | 8h |
| Phase 3 | 单一数据源架构 | 🟡 中 | 4h |
| Phase 4 | 移动端优化 | 🟡 中 | 4h |
| Phase 5 | 游戏化系统 | 🟢 低 | 8h |

---

## 🔴 Phase 1: PPT QR 码引流 (2h)

### 目标
每份 PPT 自动生成指向对应周网站的 QR 码

### 技术实现

```python
# 在 create_weekXX_ppt.py 中添加
import qrcode
from pptx.util import Inches

def add_qr_slide(prs, week_num, position='end'):
    """添加 QR 码引流页"""
    url = f"https://jasonsosen.github.io/physics-basic/weeks/week{week_num:02d}/"
    
    # 生成 QR 码
    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1e3a5f", back_color="white")
    img.save(f"temp_qr_week{week_num:02d}.png")
    
    # 添加到 PPT
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    
    # 标题
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(12), Inches(1))
    tf = title_box.text_frame
    tf.paragraphs[0].text = "📱 課後学習サイト"
    tf.paragraphs[0].font.size = Pt(36)
    tf.paragraphs[0].font.bold = True
    
    # QR 码
    slide.shapes.add_picture(f"temp_qr_week{week_num:02d}.png", 
                             Inches(4.5), Inches(1.5), width=Inches(4))
    
    # 说明文字
    desc_box = slide.shapes.add_textbox(Inches(1), Inches(5.8), Inches(11), Inches(1.5))
    tf = desc_box.text_frame
    tf.paragraphs[0].text = "スマホでスキャン → インタラクティブ練習問題"
    tf.paragraphs[0].font.size = Pt(24)
```

### PPT 页面设计

| 位置 | 内容 | 目的 |
|------|------|------|
| **首页后** | "课前预习" QR 码 | 5分钟微体验 |
| **休憩前** | "随堂验证" QR 码 → VectorAdder | BYOD 互动 |
| **末页前** | "课后闯关" QR 码 + 截图作业说明 | 闭环激励 |

---

## 🔴 Phase 2: 网站新增交互组件 (8h)

### 2.1 FBD 受力分析绘制器 (FreeBodyDiagram.astro)

**功能：**
- 拖拽箭头到物体上
- 自动检测受力是否正确
- 错误时高亮提示

**技术栈：** SVG + Drag & Drop API

```astro
<!-- src/components/FreeBodyDiagram.astro -->
<div class="fbd-container">
  <svg id="fbd-canvas" width="400" height="300">
    <!-- 物体 -->
    <rect id="object" x="150" y="120" width="100" height="60" fill="#3b82f6"/>
    
    <!-- 可拖拽的力箭头 -->
    <g class="force-arrow" draggable="true" data-force="gravity">
      <line x1="0" y1="0" x2="0" y2="50" stroke="#ef4444" stroke-width="3"/>
      <polygon points="-8,50 8,50 0,65" fill="#ef4444"/>
      <text x="15" y="30">mg</text>
    </g>
  </svg>
  
  <div class="force-palette">
    <button data-force="normal">N (垂直抗力)</button>
    <button data-force="friction">f (摩擦力)</button>
    <button data-force="tension">T (張力)</button>
  </div>
  
  <button id="check-fbd">受力分析をチェック</button>
</div>
```

### 2.2 动态运动学图像 (KinematicsGraph.astro)

**功能：**
- 实时生成 v-t, s-t, a-t 图像
- 滑块调参数，图像即时更新
- 支持触摸拖拽

**技术栈：** Chart.js 或 Plotly.js

### 2.3 能量守恒柱状图 (EnergyBarChart.astro)

**功能：**
- 动能、势能、热能柱状图
- 拖动物体位置，柱高度变化
- 动画展示能量转化

### 2.4 公式步进器 (FormulaStepper.astro)

**功能：**
- 点击 "Next Step" 逐步显示公式推导
- 当前步骤高亮
- 支持 KaTeX 渲染

```astro
<div class="formula-stepper">
  <div class="step active">
    <Math formula="v = v_0 + at" />
  </div>
  <div class="step hidden">
    <Math formula="v = 0 + (9.8)(2)" />
  </div>
  <div class="step hidden">
    <Math formula="v = 19.6 \, \text{m/s}" />
  </div>
  <button id="next-step">次のステップ →</button>
</div>
```

---

## 🟡 Phase 3: 单一数据源架构 (4h)

### 目标
从同一 MDX 文件同时生成 PPT 和网站

### 文件结构

```
physics-basic/
├── content/           # 📁 单一数据源
│   ├── week02.mdx
│   ├── week03.mdx
│   └── ...
├── scripts/
│   ├── generate_ppt.py    # MDX → PPT
│   └── generate_images.py # 配图生成
├── src/
│   └── pages/weeks/       # Astro 自动读取 content/
└── .github/workflows/
    └── build.yml          # 自动化构建
```

### MDX 格式规范

```mdx
---
week: 2
title_jp: "単位系と単位換算"
title_en: "Unit Systems and Conversion"
concepts:
  - SI基本単位
  - 接頭語
  - 面積・体積換算
---

## 導入：火星探査機の悲劇 🚀

<StoryBox 
  icon="🚀"
  title="1999年、火星探査機が墜落"
  content="NASAはメートル法、下請け会社はヤード・ポンド法..."
  highlight="単位の違いで1億ドル以上の探査機が失われた！"
/>

## Quiz: 基礎換算

<QuizCard 
  id="1"
  question="3.5 km → ? m"
  answer="3500"
  unit="m"
  steps={["k = 10³", "3.5 × 1000 = 3500"]}
/>
```

### Python 解析器

```python
import frontmatter
from pathlib import Path

def parse_mdx(week_num):
    """解析 MDX 文件，提取结构化数据"""
    path = Path(f"content/week{week_num:02d}.mdx")
    post = frontmatter.load(path)
    
    return {
        'meta': post.metadata,
        'content': post.content,
        'quizzes': extract_quizzes(post.content),
        'formulas': extract_formulas(post.content),
    }
```

---

## 🟡 Phase 4: 移动端优化 (4h)

### 4.1 滑块代替数字输入

```css
/* 大触控区滑块 */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 44px; /* iOS 推荐最小触控高度 */
  background: linear-gradient(to right, #3b82f6 0%, #3b82f6 var(--value), #e5e7eb var(--value));
  border-radius: 22px;
}

input[type="range"]::-webkit-slider-thumb {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #1d4ed8;
}
```

### 4.2 QuizCard 滑动手势

```javascript
// 左滑 = 不会，右滑 = 已掌握
let startX = 0;
card.addEventListener('touchstart', e => startX = e.touches[0].clientX);
card.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].clientX - startX;
  if (diff > 80) markAsKnown(card);
  if (diff < -80) markAsUnknown(card);
});
```

### 4.3 深色模式

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1e293b;
    --text: #f1f5f9;
    --card-bg: #334155;
    --accent: #60a5fa;
  }
}
```

### 4.4 PWA 离线支持

```javascript
// service-worker.js
const CACHE_NAME = 'physics-basic-v1';
const ASSETS = [
  '/',
  '/weeks/week02/',
  '/weeks/week03/',
  // ... QuizCard 数据
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
```

---

## 🟢 Phase 5: 游戏化系统 (8h)

### 5.1 技能树

```
力学基礎
├── 単位換算 ✅
│   └── 複合単位 ✅
├── ベクトル 🔓
│   ├── 力の合成 🔒
│   └── 力の分解 🔒
└── ニュートン力学 🔒
    ├── 第一法則 🔒
    ├── 第二法則 🔒
    └── 第三法則 🔒
```

### 5.2 情景挑战模式

| 挑战名 | 使用组件 | 通关条件 |
|--------|----------|----------|
| 🌉 橋梁工程師 | MomentCalculator + TensionBalance | 吊桥不塌 |
| 🚗 安全運転手 | KinematicsSolver | 刹车距离 < 障碍物距离 |
| 🎯 砲手マスター | VectorAdder | 命中目标 |

### 5.3 艾宾浩斯复习推送

```javascript
// 错题3天后自动出现在首页
function scheduleReview(quizId, wrongDate) {
  const intervals = [1, 3, 7, 14, 30]; // 天数
  intervals.forEach(days => {
    const reviewDate = addDays(wrongDate, days);
    scheduleNotification(quizId, reviewDate);
  });
}
```

---

## 📅 执行时间表

| 周 | 任务 | 交付物 |
|----|------|--------|
| Week 1 | Phase 1: PPT QR 码 | 12份更新的 PPT |
| Week 1-2 | Phase 2: FBD + KinematicsGraph | 2个新组件 |
| Week 2 | Phase 3: MDX 架构 | 重构后的 content/ |
| Week 3 | Phase 4: 移动端优化 | PWA + 深色模式 |
| Week 4+ | Phase 5: 游戏化 | 技能树 + 挑战模式 |

---

## ✅ 立即可执行的快速胜利 (Quick Wins)

1. **今天**：给现有12份 PPT 末页加上网站 QR 码
2. **本周**：QuizCard 添加"显示步骤"高亮效果（支架褪散）
3. **本周**：网站加深色模式 CSS

---

*Created: 2026-04-05*
*Contributors: theorist-gpt, theorist-claude, theorist-gemini*
