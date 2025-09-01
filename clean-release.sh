#!/bin/bash

# FLCM 清理发布脚本
# 功能：创建一个只包含用户需要文件的干净发布版本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 路径配置
DEV_DIR="/Users/sheldonzhao/Downloads/content-makers"
RELEASE_DIR="/Users/sheldonzhao/Downloads/FLCM-Method"
CLEAN_RELEASE_DIR="/Users/sheldonzhao/Downloads/FLCM-Method-Clean"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     FLCM 清理发布脚本 - 创建干净的用户版本${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

# 1. 创建临时清理目录
echo -e "${YELLOW}📁 步骤 1: 创建临时清理目录...${NC}"
rm -rf "$CLEAN_RELEASE_DIR"
cp -r "$RELEASE_DIR" "$CLEAN_RELEASE_DIR"
cd "$CLEAN_RELEASE_DIR"
echo -e "${GREEN}✅ 临时目录创建完成${NC}\n"

# 2. 清理开发过程文件
echo -e "${YELLOW}🧹 步骤 2: 清理开发过程文件...${NC}"

# 清理 docs 目录中的开发文档
echo "  清理 docs/stories 目录..."
rm -rf docs/stories
echo "  ✅ 已删除 stories (开发故事文档)"

echo "  清理 docs/prd 目录..."
rm -rf docs/prd docs/prd.md
echo "  ✅ 已删除 PRD 文档"

echo "  清理 docs/architecture 目录..."
rm -rf docs/architecture docs/architecture.md
echo "  ✅ 已删除架构设计文档"

echo "  清理 docs 中的开发过程文档..."
rm -f docs/FLCM-*.md
rm -f docs/phase*.md
rm -f docs/product-roadmap.md
rm -f docs/*-Brief.md
rm -f docs/*-Plan.md
rm -f docs/*-Progress.md
rm -f docs/*-Readiness.md
rm -f docs/*-Vision.md
echo "  ✅ 已删除开发过程文档"

# 清理根目录的开发文档
echo "  清理根目录的内部文档..."
rm -f FLCM-*-ACCEPTANCE-REPORT.md
rm -f FLCM-DEV-GUIDE.md
rm -f CLAUDE.md
rm -f sync-*.sh
rm -f clean-*.sh
rm -f .flcm-*.json
rm -f *.patch
rm -f *.bak
echo "  ✅ 已删除内部开发文档"

# 清理测试相关文件
echo "  清理测试文件..."
rm -f test-*.sh
find . -name "*.test.ts" -delete
find . -name "*.spec.ts" -delete
find . -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
echo "  ✅ 已删除测试文件"

echo -e "${GREEN}✅ 清理完成${NC}\n"

# 3. 创建用户友好的文档结构
echo -e "${YELLOW}📚 步骤 3: 创建用户文档...${NC}"

# 创建用户指南
mkdir -p docs/user-guide
cat > docs/user-guide/README.md << 'EOF'
# FLCM 2.0 用户指南

## 快速开始

### 安装
```bash
curl -fsSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash
```

### 基本使用
```bash
# 创建内容
flcm create "你的主题"

# 快速模式
flcm quick "AI trends 2024"

# 查看帮助
flcm help
```

## 核心功能

- **智能学习引擎**: 基于 AI/ML 的自适应学习路径
- **知识图谱**: 自动构建知识关联网络
- **15+ 学习框架**: SWOT-USED、SCAMPER、苏格拉底提问等
- **多平台支持**: LinkedIn、Twitter/X、微信、小红书

## 文档目录

- [安装指南](../installation.md)
- [API 文档](../api/)
- [配置说明](./configuration.md)
- [常见问题](./faq.md)
EOF

# 创建简化的安装文档
cat > docs/installation.md << 'EOF'
# FLCM 2.0 安装指南

## 系统要求
- Node.js 18.0.0 或更高版本
- NPM 8.0.0 或更高版本
- 4GB RAM (推荐 8GB)
- 2GB 可用磁盘空间

## 安装方法

### 方法 1: 一键安装（推荐）
```bash
curl -fsSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash
```

### 方法 2: 手动安装
```bash
git clone https://github.com/Sheldon-92/FLCM-Method.git
cd FLCM-Method
npm install
npm run build
npm link
```

### 方法 3: Docker 安装
```bash
docker pull flcm/flcm:2.0
docker run -it flcm/flcm:2.0
```

## 验证安装
```bash
flcm --version
# 应显示: FLCM version 2.0.0
```

## 故障排除
如遇到问题，请查看 [常见问题](./user-guide/faq.md) 或提交 [Issue](https://github.com/Sheldon-92/FLCM-Method/issues)
EOF

# 创建 API 文档索引
mkdir -p docs/api
cat > docs/api/README.md << 'EOF'
# FLCM 2.0 API 文档

## REST API
- [认证](./authentication.md)
- [内容创建](./content.md)
- [学习路径](./learning-paths.md)
- [知识图谱](./knowledge-graph.md)

## SDK
- [JavaScript/TypeScript](./sdk-js.md)
- [Python](./sdk-python.md)

## WebSocket API
- [实时协作](./websocket.md)
- [事件订阅](./events.md)
EOF

echo -e "${GREEN}✅ 用户文档创建完成${NC}\n"

# 4. 更新 README
echo -e "${YELLOW}📝 步骤 4: 更新 README...${NC}"
cat > README.md << 'EOF'
# 🚀 FLCM 2.0 - Enterprise AI-Powered Learning Platform

[![npm version](https://badge.fury.io/js/flcm.svg)](https://badge.fury.io/js/flcm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Sheldon-92/FLCM-Method/releases)

> 企业级 AI 驱动的学习内容管理平台，提供智能化内容创建和知识管理解决方案。

## ✨ 核心特性

- 🤖 **AI 驱动**: ML 驱动的自适应学习路径和个性化推荐
- 🕸️ **知识图谱**: 自动构建和可视化知识关联网络
- 📚 **15+ 学习框架**: 包括 SWOT-USED、SCAMPER、苏格拉底提问等
- 🌍 **多平台支持**: LinkedIn、Twitter/X、微信、小红书
- 🚀 **企业级架构**: 微服务、API 网关、完整的可观测性
- 🔄 **向后兼容**: 完全兼容 FLCM 1.0

## 🎯 快速开始

### 一键安装
```bash
curl -fsSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash
```

### 基本使用
```bash
# 创建内容
flcm create "你的主题"

# 快速模式（20-30分钟）
flcm quick "AI trends 2024"

# 查看帮助
flcm help
```

## 📚 文档

- [安装指南](./docs/installation.md)
- [用户指南](./docs/user-guide/)
- [API 文档](./docs/api/)
- [更新日志](./CHANGELOG.md)

## 🛠️ 技术规格

- **代码规模**: 72,873 行 TypeScript
- **架构**: 微服务 + 事件驱动
- **框架支持**: React、Vue、Angular、Svelte
- **部署**: Docker、Kubernetes、多云支持

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md)。

## 📄 许可证

MIT © [Friction Lab](https://github.com/friction-lab)

## 🆘 支持

- [提交问题](https://github.com/Sheldon-92/FLCM-Method/issues)
- [讨论社区](https://discord.gg/flcm)
- [邮件支持](mailto:support@flcm.io)

---

**FLCM 2.0** - 智能化学习内容管理的未来
EOF

echo -e "${GREEN}✅ README 更新完成${NC}\n"

# 5. 统计清理结果
echo -e "${YELLOW}📊 步骤 5: 统计清理结果...${NC}"
BEFORE_SIZE=$(du -sh "$RELEASE_DIR" | cut -f1)
AFTER_SIZE=$(du -sh "$CLEAN_RELEASE_DIR" | cut -f1)
BEFORE_FILES=$(find "$RELEASE_DIR" -type f | wc -l)
AFTER_FILES=$(find "$CLEAN_RELEASE_DIR" -type f | wc -l)

echo "  清理前: $BEFORE_SIZE, $BEFORE_FILES 个文件"
echo "  清理后: $AFTER_SIZE, $AFTER_FILES 个文件"
echo -e "${GREEN}✅ 减少了 $((BEFORE_FILES - AFTER_FILES)) 个文件${NC}\n"

# 6. 选择是否替换原目录
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}清理完成！干净的发布版本在: $CLEAN_RELEASE_DIR${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}是否要用清理后的版本替换当前发布目录？${NC}"
echo "  1. 是 - 替换并推送到 GitHub（推荐）"
echo "  2. 否 - 保留清理版本供检查"
echo "  3. 取消 - 删除清理版本"
read -p "选择 (1-3): " choice

case $choice in
    1)
        echo -e "${YELLOW}替换发布目录...${NC}"
        rm -rf "$RELEASE_DIR"
        mv "$CLEAN_RELEASE_DIR" "$RELEASE_DIR"
        cd "$RELEASE_DIR"
        
        echo -e "${YELLOW}提交更改...${NC}"
        git add -A
        git commit -m "Clean release: Remove development artifacts

- Removed development stories and PRDs
- Removed internal documentation
- Removed test files and scripts
- Keep only user-facing documentation
- Simplified docs structure for end users" || echo "没有更改需要提交"
        
        echo -e "${YELLOW}推送到 GitHub...${NC}"
        git push origin main
        echo -e "${GREEN}✅ 清理版本已推送到 GitHub！${NC}"
        ;;
    2)
        echo -e "${GREEN}✅ 清理版本保留在: $CLEAN_RELEASE_DIR${NC}"
        echo -e "${YELLOW}请手动检查后决定是否使用${NC}"
        ;;
    3)
        rm -rf "$CLEAN_RELEASE_DIR"
        echo -e "${YELLOW}✅ 已删除清理版本${NC}"
        ;;
esac

echo -e "\n${GREEN}脚本执行完成！${NC}"