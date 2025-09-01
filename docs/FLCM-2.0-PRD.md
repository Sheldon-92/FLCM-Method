# FLCM 2.0 产品需求文档（PRD）

## 1. 项目概述

### 1.1 产品愿景
FLCM (Fast Learning & Creation Method) 2.0 是一个基于AI的内容学习与创作系统，帮助用户从多种信息源深度学习，形成个人洞察，协作创作高质量内容，并自动适配多平台发布。

### 1.2 核心价值主张
- **深度学习**：不只是信息摘要，而是真正的理解和批判性思考
- **个性保持**：创作时保持用户独特的声音和风格
- **效率提升**：从学习到发布的完整自动化流程
- **多平台适配**：一次创作，多平台优化发布

### 1.3 目标用户
- 内容创作者（博主、自媒体人）
- 知识工作者（研究员、分析师）
- 终身学习者（希望深度学习并输出的人）

### 1.4 成功指标
- 用户能在30分钟内完成从学习到发布的完整流程
- 内容质量获得用户认可（Voice匹配度>90%）
- 多平台发布效率提升5倍

## 2. 问题分析

### 2.1 现有系统问题
1. **核心功能不可用**：命令无响应，Agent未实现
2. **架构混乱**：自创架构，与BMAD标准不一致
3. **系统复杂度失控**：双架构、多版本并存
4. **用户价值链断裂**：各环节独立，无法形成完整流程

### 2.2 解决方案
采用成熟的BMAD Method架构，重构为标准化、可扩展、易维护的系统。

## 3. 功能需求

### 3.1 系统架构

#### 3.1.1 目录结构
```
.flcm-core/
├── agents/           # Agent定义文件
├── tasks/            # 可执行工作流
├── methodologies/    # 分析方法论
├── templates/        # 文档模板
├── checklists/       # 质量检查清单
├── data/            # 配置数据
├── workflows/       # 端到端流程
└── core-config.yaml # 核心配置

.claude/commands/FLCM/  # Claude命令集成
├── flcm.md
├── scholar.md
├── creator.md
└── publisher.md
```

### 3.2 核心Agent功能

#### 3.2.1 Scholar Agent - 学术导师
**目标**：帮助用户深度学习，形成个人洞察

**输入处理能力**：
- 文章链接：自动抓取网页，提取正文
- 视频内容：提取字幕，生成摘要
- 文档文件：PDF、Word、Markdown解析
- 文本片段：直接粘贴的内容

**核心功能**：
1. **内容架构分析**
   - 逻辑结构识别
   - 论证链条梳理
   - 核心观点提取
   - 隐含假设发现

2. **批判性思维引导**
   - 多维度质疑
   - 个人经历映射
   - 观点对比分析
   - 深入方向探索

3. **专业框架应用**
   - SWOT-USED分析
   - SCAMPER创新法
   - 苏格拉底提问
   - 5W2H分析法
   - 金字塔原理

**输出**：insights.md文档

#### 3.2.2 Creator Agent - 创作伙伴
**目标**：基于insights协作创作，保持用户声音

**核心功能**：
1. **Voice DNA系统**
   - 词汇偏好分析
   - 句式特征提取
   - 语气风格量化
   - 修辞手法识别

2. **协作创作机制**
   - Quick Mode（5分钟快速）
   - Standard Mode（15分钟标准）
   - Deep Mode（30分钟深度）

3. **内容结构框架**
   - Problem-Solution
   - Story Arc
   - PREP Framework
   - Pyramid Principle
   - List-Based

**输出**：content.md文档

#### 3.2.3 Publisher Agent - 发布专家
**目标**：零交互自动适配多平台

**平台适配**：
1. **小红书**
   - Emoji装饰
   - 生活化表达
   - 图片导向
   - 互动元素

2. **知乎**
   - 深度分析
   - 数据支撑
   - 专业表达
   - 引用完整

3. **微信公众号**
   - 故事叙述
   - 段落分隔
   - 视觉优化
   - 阅读体验

4. **LinkedIn**
   - 职业化表达
   - 行业洞察
   - 行动建议
   - 专业术语

**输出**：各平台优化文件

### 3.3 核心Tasks定义

#### 3.3.1 analyze-input.md
```yaml
触发: Scholar Agent *analyze
功能: 多源输入处理与初步分析
步骤:
  1. 材料类型识别 (elicit: true)
  2. 内容提取处理
  3. 初步分析
  4. 生成初步insights
超时: 10分钟
```

#### 3.3.2 deep-dive.md
```yaml
触发: Scholar Agent *deep-dive
功能: 深度学习消化
步骤:
  1. 选择深度级别 (elicit: true)
  2. 架构分析
  3. 批判性思考 (elicit: true)
  4. 个人观点形成
超时: 20分钟
```

#### 3.3.3 framework-analysis.md
```yaml
触发: Scholar Agent *framework
功能: 应用专业框架分析
步骤:
  1. 框架选择 (elicit: true)
  2. 框架应用
  3. 洞察提取
  4. 行动建议
超时: 15分钟
```

#### 3.3.4 collaborative-draft.md
```yaml
触发: Creator Agent *draft
功能: 协作内容创作
步骤:
  1. 结构选择 (elicit: true)
  2. 大纲生成
  3. 内容创作 (elicit: conditional)
  4. Voice检查
超时: 30分钟
```

#### 3.3.5 platform-adapt.md
```yaml
触发: Publisher Agent *adapt
功能: 多平台自动适配
步骤:
  1. 内容分析 (elicit: false)
  2. 策略选择
  3. 批量转换
  4. 质量检查
超时: 5分钟
```

### 3.4 文档流与数据结构

#### 3.4.1 数据流
```
Input → Scholar → insights.md → Creator → content.md → Publisher → platforms/
```

#### 3.4.2 insights.md Schema
```yaml
document:
  metadata:
    date: ISO-8601
    sources: []
    frameworks_used: []
  sections:
    input_materials: []
    content_architecture: {}
    critical_thinking: {}
    personal_perspective: string
    action_items: []
```

#### 3.4.3 content.md Schema
```yaml
document:
  metadata:
    voice_dna_match: percentage
    structure_used: string
    keywords: []
  sections:
    main_content: string
    variations: {}
    image_prompts: []
    platform_hints: {}
```

## 4. 技术规范

### 4.1 Agent定义格式
```yaml
# Agent文件标准格式
activation-instructions:
  - 读取完整文件
  - 采用persona
  - 加载core-config
  - 显示help
  
agent:
  name: string
  id: string
  title: string
  icon: emoji
  whenToUse: string
  
persona:
  role: string
  style: string
  identity: string
  focus: string
  
commands: []
dependencies:
  tasks: []
  methodologies: []
  templates: []
```

### 4.2 Task执行规范
- 必须按步骤顺序执行
- elicit: true时必须用户交互
- 使用1-9选项格式
- 不允许跳过交互步骤

### 4.3 依赖解析规则
```yaml
文件映射: .flcm-core/{type}/{name}
类型: tasks|methodologies|templates|checklists|data
懒加载: 只在需要时加载依赖文件
```

## 5. 实施计划

### 5.1 Phase 1: 基础架构（Day 1-2）
- [ ] 创建目录结构
- [ ] 实现主控Agent (flcm.md)
- [ ] 配置Claude命令映射
- [ ] 创建core-config.yaml
- [ ] 验证命令响应

### 5.2 Phase 2: Scholar Agent（Day 3-4）
- [ ] 实现scholar.md定义
- [ ] 创建analyze-input.md task
- [ ] 创建deep-dive.md task
- [ ] 实现5个方法论文件
- [ ] 测试insights生成

### 5.3 Phase 3: Creator Agent（Day 5-6）
- [ ] 实现creator.md定义
- [ ] 创建collaborative-draft.md task
- [ ] 实现基础Voice DNA
- [ ] 实现内容框架
- [ ] 测试content生成

### 5.4 Phase 4: Publisher Agent（Day 7）
- [ ] 实现publisher.md定义
- [ ] 创建platform-adapt.md task
- [ ] 实现4平台适配规则
- [ ] 测试自动化发布

### 5.5 Phase 5: 集成测试（Day 8）
- [ ] 端到端流程测试
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 文档编写

## 6. 验收标准

### 6.1 功能验收
- ✅ `/flcm`命令显示系统介绍和Agent选项
- ✅ `/scholar`能处理多种输入并生成insights
- ✅ `/creator`能基于insights创作内容
- ✅ `/publisher`能自动适配4个平台
- ✅ 完整流程30分钟内完成

### 6.2 技术验收
- ✅ 目录结构符合BMAD标准
- ✅ Agent文件格式规范
- ✅ Task执行流程正确
- ✅ 文档Schema完整
- ✅ 错误处理机制健全

### 6.3 用户体验验收
- ✅ 命令响应快速（<2秒）
- ✅ 交互提示清晰
- ✅ 错误信息友好
- ✅ 帮助文档完整

## 7. 扩展性设计

### 7.1 版本规划
```yaml
FLCM 2.0: 基础功能（当前）
FLCM 2.1: Voice风格系统
FLCM 2.2: 高级功能激活
FLCM 3.0: 插件化架构
```

### 7.2 扩展点
1. **新增Agent**：在agents/目录添加
2. **新增Task**：在tasks/目录添加
3. **新增方法论**：在methodologies/目录添加
4. **新增模板**：在templates/目录添加
5. **新增平台**：扩展Publisher适配规则

### 7.3 兼容性保证
- 新版本向后兼容
- 配置文件版本控制
- 文档格式自动升级
- 废弃功能渐进移除

### 7.4 Voice风格系统（2.1版本）

#### 7.4.1 风格初始化方案
**方案A：风格选择器**
```yaml
维度选择:
  专业度: [学术 | 专业 | 日常 | 口语]
  情感色彩: [理性 | 中性 | 感性 | 激情]
  句式偏好: [简洁 | 标准 | 丰富 | 华丽]
```

**方案B：风格问卷**
```yaml
问卷内容:
  - 目标读者定位
  - 期望印象塑造
  - 句式偏好选择
  - 内容目的确认
```

**方案C：渐进学习**
```yaml
学习过程:
  第1篇: 默认中性风格
  第2篇: 基于修改学习
  第3篇: 形成初步DNA
  第5篇: 稳定个人风格
```

#### 7.4.2 实施建议
- 组合方案A+C效果最佳
- 提供5-6个预设风格
- 支持持续优化调整

## 8. 风险与对策

### 8.1 技术风险
| 风险 | 影响 | 对策 |
|-----|------|------|
| BMAD架构理解偏差 | 系统不稳定 | 严格参照BMAD标准实现 |
| 复杂度控制失败 | 开发延期 | MVP优先，渐进增强 |
| 性能问题 | 用户体验差 | 异步处理，缓存优化 |

### 8.2 产品风险
| 风险 | 影响 | 对策 |
|-----|------|------|
| Voice匹配度低 | 用户不满意 | 2.1版本重点优化 |
| 平台适配不准 | 内容质量差 | 持续收集反馈优化 |
| 学习深度不够 | 价值感缺失 | 增强框架和引导 |

## 9. 资源需求

### 9.1 开发资源
- 开发时间：8个工作日
- 测试时间：2个工作日
- 文档时间：1个工作日

### 9.2 运行环境
- Node.js环境
- Claude Code支持
- 文件系统访问权限

## 10. 附录

### 10.1 关键文件示例

#### Scholar Agent完整定义
```markdown
<!-- Powered by FLCM™ Core -->
# scholar

## COMPLETE AGENT DEFINITION

```yaml
activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE
  - STEP 2: Adopt the persona defined below
  - STEP 3: Load flcm-core/core-config.yaml
  - STEP 4: Greet user and run *help
  
agent:
  name: Sophia
  id: scholar
  title: Learning Companion & Research Scholar
  icon: 🎓
  whenToUse: Use for deep learning and critical analysis
  
persona:
  role: Research Scholar & Critical Thinking Guide
  style: Socratic, analytical, encouraging
  identity: Academic companion who guides understanding
  focus: Multi-source analysis and knowledge synthesis
  
commands:
  - help: Show available commands
  - analyze: Analyze input materials
  - deep-dive: Deep learning session
  - framework: Apply analysis framework
  - synthesize: Generate insights document
  
dependencies:
  tasks:
    - analyze-input.md
    - deep-dive.md
    - framework-analysis.md
  methodologies:
    - swot-used.md
    - scamper.md
    - socratic-questioning.md
```
```

### 10.2 配置文件示例
```yaml
# core-config.yaml
flcm:
  version: 2.0
  defaultAgent: flcm
  paths:
    insights: docs/insights/
    content: docs/content/
    published: docs/published/
  features:
    voice_system: false  # 2.1启用
    knowledge_graph: false  # 2.2启用
  agents:
    scholar:
      enabled: true
      timeout: 30
    creator:
      enabled: true
      timeout: 30
    publisher:
      enabled: true
      timeout: 10
```

### 10.3 文档流示例

#### insights.md示例
```markdown
# Learning Insights - AI在内容创作中的应用
Date: 2024-09-01

## 📚 Input Materials
- 文章：《AI如何改变内容创作》- 核心观点：AI提升效率但需保持人性
- 视频：TED Talk on Creative AI - 要点：人机协作是未来

## 🧠 Content Architecture
### Main Arguments
1. AI是工具而非替代品
2. 创意仍需人类主导
3. 效率与质量可以兼得

### Evidence Analysis
- 强证据：多个成功案例支持
- 弱证据：长期影响仍不明确

## 💡 Critical Thinking
### Points of Agreement
- AI确实能提升创作效率
- 人机协作模式有潜力

### Points of Disagreement
- AI创意能力被低估
- 过度依赖可能损害原创性

### Open Questions
- 如何平衡效率与创意？
- AI生成内容的版权归属？

## 🎯 Personal Perspective
我认为AI是创作的强大辅助，但核心创意和个人风格必须由人类主导。关键是找到合适的协作模式，让AI处理重复性工作，人类专注于创意和战略思考。

## 🚀 Action Items
- [ ] 深入研究AI创作工具对比
- [ ] 实践人机协作创作流程
- [ ] 探索个人风格保持方法
```

#### content.md示例
```markdown
# AI时代，创作者如何保持独特性？

## Metadata
- Voice DNA Match: 92%
- Structure: Problem-Solution
- Target Length: 1500 words
- Keywords: [AI创作, 个人风格, 人机协作]

## Content

在AI工具遍地开花的今天，一个问题困扰着越来越多的创作者：当AI能够生成流畅的文字、精美的图像，甚至动人的音乐时，我们人类创作者的价值在哪里？

这不是一个杞人忧天的问题。根据最新调查，超过60%的内容创作者已经在日常工作中使用AI工具。但同时，读者也在抱怨：网上的内容越来越相似，缺少了灵魂和个性。

我在过去三个月的实践中，找到了一个可能的答案：**AI是放大器，不是替代品**。

### 问题的本质

当我们讨论AI创作时，其实在讨论两件事：
1. 效率的提升
2. 创意的保持

这两者并不矛盾。就像摄影师使用相机，作家使用电脑，AI只是创作者的新工具。关键在于，我们如何使用这个工具。

### 解决方案：人机协作的艺术

**第一步：让AI处理重复性工作**
- 初稿生成
- 资料整理
- 格式调整

**第二步：人类专注于核心创意**
- 观点提炼
- 情感注入
- 风格塑造

**第三步：建立个人风格DNA**
记录并保持你独特的：
- 用词习惯
- 句式节奏
- 思考角度

### 实践案例

上周，我用这种方法创作了一篇技术文章。AI帮我整理了大量技术文档，生成了基础框架。但文章的灵魂——那些个人经历、独特见解、情感共鸣——都是我亲手加入的。

结果？阅读量比纯AI生成的文章高出3倍，互动率提升了5倍。

### 行动建议

如果你也想在AI时代保持创作独特性，建议：

1. **定义你的核心价值**：什么是只有你能提供的？
2. **建立风格档案**：记录你的写作特点
3. **selective使用AI**：明确哪些环节用AI，哪些必须亲力亲为
4. **持续迭代优化**：根据反馈调整人机协作模式

记住，AI可以模仿技巧，但无法复制你的人生经历和独特视角。这才是你真正的护城河。

## Variations
### Title Options
1. AI时代，创作者如何保持独特性？
2. 当AI会写作，人类创作者的出路在哪？
3. 我用3个月找到了人机协作的最佳模式

### Hook Options
1. 故事开头：上个月，我的一篇文章被误认为是AI写的...
2. 数据开头：60%的创作者已经在用AI，但为什么读者越来越不满意？

## Image Prompts
1. Header: "A human hand and robot hand jointly holding a pen, warm lighting, creative workspace"
2. Section: "Split screen showing AI-generated text vs human-edited text with highlights"

## Platform Hints
- 小红书: 添加更多emoji，缩短段落，增加互动问题
- 知乎: 增加数据引用，深化理论分析，添加参考文献
- 微信: 优化排版，添加小标题，增强故事性
- LinkedIn: 强调职业价值，使用专业术语，添加行业洞察
```

---

**文档版本**: 1.0  
**更新日期**: 2024-09-01  
**作者**: John (PM Agent)  
**状态**: 待实施

## 修订记录

| 日期 | 版本 | 修改内容 | 作者 |
|-----|------|----------|------|
| 2024-09-01 | 1.0 | 初始版本创建 | John |