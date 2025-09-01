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
