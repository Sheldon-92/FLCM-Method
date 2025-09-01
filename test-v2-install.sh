#!/bin/bash

# FLCM 2.0 安装测试脚本
# 用于验证 FLCM 2.0 的安装和基本功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           FLCM 2.0 Installation Test${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

# 测试结果计数
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}  ❌ FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

# 1. 检查 Node.js 版本
echo -e "${BLUE}1. Environment Checks${NC}"
run_test "Node.js version >= 18.0.0" "node -v | grep -E 'v(1[89]|2[0-9])'"
run_test "NPM version >= 8.0.0" "npm -v | grep -E '^([89]|[0-9]{2})'"

# 2. 检查目录结构
echo -e "\n${BLUE}2. Directory Structure${NC}"
run_test "flcm-core directory exists" "[ -d 'flcm-core' ]"
run_test "TypeScript files present" "[ $(find flcm-core -name '*.ts' | wc -l) -gt 100 ]"
run_test "Package.json exists" "[ -f 'package.json' ]"
run_test "TypeScript config exists" "[ -f 'tsconfig.json' ]"

# 3. 检查核心组件
echo -e "\n${BLUE}3. Core Components${NC}"
run_test "Knowledge Graph module" "[ -d 'flcm-core/knowledge-graph' ]"
run_test "AI Recommendations module" "[ -d 'flcm-core/ai-recommendations' ]"
run_test "Analytics module" "[ -d 'flcm-core/analytics' ]"
run_test "API Gateway module" "[ -d 'flcm-core/api-gateway' ]"
run_test "Observability module" "[ -d 'flcm-core/observability' ]"
run_test "UI Manager module" "[ -d 'flcm-core/ui' ]"

# 4. 检查框架实现
echo -e "\n${BLUE}4. Framework Library${NC}"
run_test "Framework library exists" "[ -d 'flcm-core/framework-library' ]"
run_test "SWOT-USED framework" "[ -f 'flcm-core/framework-library/swot-used.ts' ]"
run_test "SCAMPER framework" "[ -f 'flcm-core/framework-library/scamper.ts' ]"
run_test "Socratic framework" "[ -f 'flcm-core/framework-library/socratic.ts' ]"

# 5. 安装依赖
echo -e "\n${BLUE}5. Dependencies Installation${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install --silent
fi
run_test "Dependencies installed" "[ -d 'node_modules' ]"
run_test "TypeScript installed" "[ -f 'node_modules/.bin/tsc' ]"

# 6. 构建测试
echo -e "\n${BLUE}6. Build Test${NC}"
echo -e "${YELLOW}Running TypeScript build...${NC}"
if npm run build 2>/dev/null; then
    run_test "TypeScript build successful" "true"
    run_test "Dist directory created" "[ -d 'dist' ]"
else
    run_test "TypeScript build successful" "false"
fi

# 7. 检查 Epic 实现
echo -e "\n${BLUE}7. Epic Implementation Check${NC}"
run_test "Epic 1: Learning Framework" "[ -d 'flcm-core/learning-paths' ]"
run_test "Epic 2: Content Management" "[ -d 'flcm-core/pipeline' ]"
run_test "Epic 3: Intelligent Engine" "[ -d 'flcm-core/ml-models' ]"
run_test "Epic 4: Integration Layer" "[ -d 'flcm-core/integration' ]"

# 8. 检查文档
echo -e "\n${BLUE}8. Documentation${NC}"
run_test "README.md exists" "[ -f 'README.md' ]"
run_test "CHANGELOG.md exists" "[ -f 'CHANGELOG.md' ]"
run_test "RELEASE-NOTES.md exists" "[ -f 'RELEASE-NOTES.md' ]"
run_test "Documentation directory" "[ -d 'docs' ]"

# 9. 验证代码规模
echo -e "\n${BLUE}9. Code Metrics${NC}"
TS_FILES=$(find flcm-core -name "*.ts" | wc -l)
TS_LINES=$(find flcm-core -name "*.ts" -exec wc -l {} + | tail -1 | awk '{print $1}')
echo -e "  TypeScript Files: ${GREEN}$TS_FILES${NC}"
echo -e "  Lines of Code: ${GREEN}$TS_LINES${NC}"
run_test "TypeScript files >= 139" "[ $TS_FILES -ge 139 ]"
run_test "Lines of code >= 70000" "[ $TS_LINES -ge 70000 ]"

# 10. 运行基本命令测试
echo -e "\n${BLUE}10. CLI Command Test${NC}"
if [ -f "flcm-core/cli/index.ts" ]; then
    run_test "CLI entry point exists" "true"
else
    run_test "CLI entry point exists" "false"
fi

# 总结
echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "  Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "  Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! FLCM 2.0 is ready for use.${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "  1. Run: ${BLUE}npm start${NC} to start the application"
    echo -e "  2. Run: ${BLUE}npm test${NC} to run unit tests"
    echo -e "  3. Visit documentation at ${BLUE}docs/${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the installation.${NC}"
    echo -e "\n${YELLOW}Troubleshooting:${NC}"
    echo -e "  1. Ensure Node.js >= 18.0.0 is installed"
    echo -e "  2. Run: ${BLUE}npm install${NC} to install dependencies"
    echo -e "  3. Check error messages above for details"
    exit 1
fi