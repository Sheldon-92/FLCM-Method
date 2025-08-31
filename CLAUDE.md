# ⚠️ 重要：请勿直接修改此目录！

## 🚨 这是 FLCM 的发布目录

**此目录的所有文件都是从 `content-makers` 自动同步过来的。**  
**直接修改会导致开发环境和发布环境不同步！**

---

## ✅ 正确的修改流程

### 1️⃣ 任何修改都应该在开发环境进行
```bash
cd /Users/sheldonzhao/Downloads/content-makers
```

### 2️⃣ 在正确的位置修改
- **FLCM 核心代码**：`.flcm-core/`
- **Claude 命令定义**：`.flcm-claude/`
- **安装脚本**：根目录的 `install.sh` 等

### 3️⃣ 同步到发布目录
```bash
./sync-to-flcm.sh
```
脚本会自动：
- ✅ 复制文件到 FLCM-Method
- ✅ 更新路径引用
- ✅ 提交更改
- ✅ 推送到 GitHub

---

## 🔧 常见场景

### 场景1：用户报告 Bug
```bash
# 错误做法 ❌
cd FLCM-Method
vim install.sh  # 直接修改

# 正确做法 ✅
cd content-makers
vim install.sh  # 在开发环境修改
./sync-to-flcm.sh  # 同步并推送
```

### 场景2：添加新功能
```bash
# 1. 去开发环境
cd content-makers

# 2. 在 .flcm-core 添加功能
code .flcm-core/agents/new-feature.ts

# 3. 测试
npm run dev

# 4. 同步发布
./sync-to-flcm.sh
```

### 场景3：修改 Claude 命令
```bash
# 1. 去开发环境
cd content-makers

# 2. 修改 Claude 定义
code .flcm-claude/commands/FLCM/agents/collector.md

# 3. 同步
./sync-to-flcm.sh
```

---

## 📁 目录结构说明

```
content-makers/          # 👈 在这里开发
├── .flcm-core/         # FLCM 核心代码
├── .flcm-claude/       # Claude 命令定义
├── .bmad-core/         # BMAD（不会同步）
└── sync-to-flcm.sh     # 同步脚本

     ⬇️ 同步

FLCM-Method/            # 👈 当前目录（不要修改）
├── flcm-core/          # 自动同步自 .flcm-core
├── .claude/            # 自动同步自 .flcm-claude
└── [其他文件]          # 全部自动同步

     ⬇️ 推送

GitHub                  # 用户安装源
```

---

## ⚡ 快速命令

```bash
# 回到开发环境
alias flcm-dev='cd /Users/sheldonzhao/Downloads/content-makers'

# 同步并推送
alias flcm-sync='cd /Users/sheldonzhao/Downloads/content-makers && ./sync-to-flcm.sh'

# 查看状态
alias flcm-status='cd /Users/sheldonzhao/Downloads/content-makers && ./flcm-status.sh'
```

把这些命令添加到你的 `~/.zshrc` 或 `~/.bashrc`

---

## 🆘 如果已经在这里修改了怎么办？

1. **保存你的修改**（复制到别处）
2. **恢复到 GitHub 版本**
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```
3. **去开发环境重新修改**
   ```bash
   cd ../content-makers
   # 应用你的修改
   ./sync-to-flcm.sh
   ```

---

## 📚 相关文档

- [开发指南](../content-makers/FLCM-DEV-GUIDE.md)
- [GitHub 仓库](https://github.com/Sheldon-92/FLCM-Method)

---

**记住：所有修改都在 `content-makers`，这里只是发布目录！**