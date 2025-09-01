# FLCM 2.0 Architecture Refactoring Plan

## Executive Summary

FLCM 2.0需要从当前的混合架构重构为严格遵循BMAD Method的标准架构。本方案旨在解决架构错位、Agent缺失、目录混乱等关键问题，同时保护已有的高价值代码资产，实现真正的3-Agent内容创作工作流。

## 1. Current State Analysis

### 1.1 Key Problems Identified

**Architecture Misalignment:**
- 实现了Brownfield PRD的双架构迁移策略，而非Project Brief中的3-Agent革新架构
- 仍保留v1的4-agent系统（collector, scholar, creator, adapter）
- Claude slash commands指向不存在的v2 layers

**Directory Structure Issues:**
- 双重嵌套结构（flcm/flcm-core/...）
- 12个安装脚本造成用户困惑
- 800+文件结构复杂，缺乏清晰组织
- 硬编码路径问题，无法任意目录安装

**Functional Gaps:**
- 缺少真正的3-Agent工作流实现
- Claude集成不工作
- 文档流程（insights.md → content.md → platforms）未完整实现

### 1.2 High-Value Assets to Preserve

**Infrastructure (60-70% reusable):**
- TypeScript构建系统和CLI框架
- 配置管理系统
- 平台适配基础设施

**Advanced Features (7500+ lines):**
- 知识图谱模块：932行专业图算法实现
- 学习进度追踪：1636行完整分析系统
- 分析仪表板：4971行数据可视化
- **评估：代码质量极高，技术价值巨大**

**Obsidian Integration (3192 lines):**
- 完整的插件架构
- 双向同步引擎
- 冲突解决机制
- **评估：功能完善，用户价值明确**

## 2. Target Architecture

### 2.1 BMAD Method Standard Compliance

严格遵循BMAD Method的架构模式：

```
flcm/
├── .flcm-core/                          # 对应BMAD的.bmad-core/
│   ├── agents/                          # Agent定义文件
│   │   ├── mentor.md                    # 框架指导专家
│   │   ├── creator.md                   # 内容创作专家
│   │   └── publisher.md                 # 发布优化专家
│   ├── agent-teams/                     # Agent组合（如需要）
│   ├── tasks/                           # 工作流Task定义
│   │   ├── framework-explore.md         # 框架探索工作流
│   │   ├── quick-create.md              # 快速创作流程
│   │   ├── standard-create.md           # 标准创作流程
│   │   ├── voice-analysis.md            # 声音分析Task
│   │   ├── content-structure.md         # 内容结构设计
│   │   ├── platform-adapt.md            # 平台适配Task
│   │   └── growth-evaluate.md           # 成长评估Task
│   ├── methodologies/                   # 方法论库
│   │   ├── swot-used.md                # SWOT-USED方法论
│   │   ├── scamper.md                  # SCAMPER创新方法
│   │   ├── socratic-questioning.md     # 苏格拉底提问法
│   │   ├── five-w2h.md                 # 5W2H分析法
│   │   ├── pyramid-principle.md        # 金字塔原理
│   │   └── voice-dna.md                # 声音DNA方法论
│   ├── checklists/                     # 检查清单
│   │   ├── content-quality.md          # 内容质量检查
│   │   ├── voice-consistency.md        # 声音一致性检查
│   │   ├── platform-ready.md           # 发布就绪检查
│   │   └── framework-completion.md     # 框架完整性检查
│   ├── templates/                      # 模板文件
│   │   ├── insights-template.md        # insights.md模板
│   │   ├── content-template.md         # content.md模板
│   │   ├── evaluation-template.md      # 评估报告模板
│   │   └── platform-templates/         # 各平台模板
│   ├── data/                          # 数据文件
│   ├── utils/                         # 工具函数
│   ├── workflows/                     # 工作流配置
│   └── core-config.yaml               # 核心配置
├── .claude/
│   ├── commands/FLCM/flcm.md          # 主入口命令
│   └── settings.json
└── obsidian-plugin/                   # 简化版集成
```

### 2.2 Three-Agent Architecture

**Mentor Agent - 框架指导专家:**
- 专业方法论应用（SWOT, SCAMPER, Socratic, 5W2H, Pyramid）
- 深度探索和思维引导
- 输出：insights.md, knowledge.md

**Creator Agent - 内容创作专家:**
- 协作式内容创建
- 声音一致性保持（>90%）
- 成长导向评估
- 输出：content.md, prompts.md

**Publisher Agent - 发布自动化专家:**
- 100%自动化平台适配
- 零用户交互
- 输出：xiaohongshu.md, zhihu.md, wechat.md, linkedin.md

### 2.3 BMAD Standard Agent Definition

每个Agent严格遵循BMAD格式：
```yaml
activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE
  - STEP 2: Adopt the persona defined below
  - STEP 3: Load .flcm-core/core-config.yaml
  - STEP 4: Greet user and run *help
  
agent:
  name: [Agent名称]
  id: flcm-[role]
  title: [专业头衔]
  icon: [表情符号]
  whenToUse: [使用场景]
  
persona:
  role: [具体角色定义]
  style: [交互风格]
  identity: [身份认知]
  focus: [专注领域]
  
core_principles:
  - [核心原则1]
  - [核心原则2]
  
commands:
  - help: 显示可用命令
  - [特定命令]: [功能说明]
  
dependencies:
  tasks: [相关Task文件]
  methodologies: [相关方法论文件]
  checklists: [相关检查清单文件]
```

## 3. Implementation Strategy

### 3.1 Four-Phase Approach

**Phase 1: Architecture Conversion (2 days)**
- 删除v1 agents和双架构代码
- 创建标准.flcm-core/目录结构
- 重组现有代码到BMAD模式

**Phase 2: Core Functionality (2-3 days)**
- 实现3个Agent按BMAD标准
- 创建Task工作流模块
- 迁移方法论到methodologies/

**Phase 3: Advanced Features Handling (1 day)**
- 高级功能通过feature flag隐藏
- Obsidian集成简化
- 预留V2.1/V2.2激活路径

**Phase 4: Integration & Testing (1 day)**
- Claude commands集成
- 端到端测试
- 文档和部署脚本

### 3.2 Asset Preservation Strategy

**High-Value Code Retention:**
- 知识图谱、学习追踪、分析仪表板：完整保留，feature flag控制
- Obsidian插件：保留双向同步，隐藏高级功能
- 框架实现逻辑：迁移到methodologies/
- 平台适配代码：重组到publisher模块

**Technical Migration Map:**
```
Current → Target
flcm-core/ → .flcm-core/
agents/ (v1) → DELETE
v2/ → agents/ (BMAD format)
methodologies/ → methodologies/ (reformat)
obsidian-plugin/ → obsidian-plugin/ (simplify)
```

## 4. User Experience Design

### 4.1 Workflow Flexibility

**主要交互模式:**
- `/flcm` - 主入口，选择Agent或预设工作流
- `/mentor` - 直接框架探索模式
- `/creator` - 直接内容创作模式
- `/publisher` - 直接发布优化模式

**工作流组合:**
- **Quick模式**: creator agent + quick-create task（20-30分钟）
- **Standard模式**: mentor → creator → publisher 完整流程（45-60分钟）
- **Custom模式**: 用户自选Agent/Task组合

**Document Flow:**
- 保持insights.md → content.md → platforms流程
- 每个步骤可独立执行和修改
- 支持断点续传和流程跳转

### 4.2 Extension Capabilities

**Agent扩展**: 添加新专家Agent（如SEO Agent, Image Agent）
**Task扩展**: 添加新工作流无需修改Agent核心
**Methodology扩展**: 新增方法论只需markdown文件
**Workflow自定义**: 任意Agent/Task组合

## 5. Technical Requirements

### 5.1 Feature Flag Architecture

```yaml
# core-config.yaml
features:
  core:
    three_agent_workflow: true
    basic_obsidian_sync: true
    document_pipeline: true
  advanced:
    knowledge_graph: false      # V2.1激活
    learning_tracker: false     # V2.1激活
    analytics_dashboard: false  # V2.2激活
    advanced_obsidian: false    # V2.2激活
```

### 5.2 Installation Simplification

**目标**:
- 单脚本安装：`curl -fsSL install-url | bash`
- 当前目录安装：默认./flcm
- 清洁结构：<100核心文件
- 消除硬编码路径

## 6. Success Metrics

### 6.1 Technical KPIs

**Architecture Compliance:**
- ✅ 与BMAD Method 100%一致的目录结构
- ✅ Agent定义格式严格遵循BMAD标准
- ✅ Task/Methodology/Checklist标准化

**Functional Completeness:**
- ✅ `/flcm`命令在Claude Code正常工作
- ✅ 3-Agent工作流完整: insights.md → content.md → platforms
- ✅ 5个框架可独立/组合使用
- ✅ 平台适配100%自动化（0用户交互）

**Performance Targets:**
- ✅ 框架探索：<3秒响应
- ✅ 内容生成：<10秒每节
- ✅ 平台适配：<5秒全部平台
- ✅ 安装过程：<5分钟完成

### 6.2 User Experience KPIs

**Usability:**
- ✅ 想法到多平台发布<60分钟
- ✅ 声音一致性>90%
- ✅ 用户报告"学到新东西"比例>80%
- ✅ 目录结构清晰易懂

**Business Value:**
- ✅ 7500+行高级功能代码完整保留
- ✅ 为V2.1知识图谱功能奠定基础
- ✅ 为V2.2学习分析功能预留路径
- ✅ 建立差异化竞争优势

## 7. Risk Mitigation

### 7.1 Technical Risks

**代码迁移风险**: 通过保留所有高价值代码，仅重组结构来降低风险
**功能回归风险**: 建立全面测试覆盖，确保核心功能无损
**集成复杂度**: 采用BMAD成熟架构模式，降低设计风险

### 7.2 Business Risks

**用户适应性**: BMAD架构的成功案例证明用户接受度
**竞争优势**: 高级功能的保留确保长期竞争力
**技术债务**: 通过标准化架构减少未来维护成本

## 8. Next Steps

1. **Immediate Action**: 调用PM Agent分解detailed stories
2. **Development Sprint**: 按4个Phase执行实施
3. **Quality Assurance**: 每个Phase完成后进行验证
4. **User Testing**: V2.0 MVP完成后用户反馈收集
5. **Feature Activation**: 基于用户需求激活高级功能

---

**Document Version**: 1.0  
**Created**: 2025-09-01  
**Status**: Ready for Story Breakdown  
**Next Action**: PM Agent Story Decomposition

*This plan ensures FLCM 2.0 achieves architectural excellence while protecting all development investments and establishing a foundation for long-term growth.*