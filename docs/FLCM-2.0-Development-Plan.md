# FLCM 2.0 开发执行计划

## 技术决策（已确定）
1. ✅ **Embedding模型**：本地模型 (sentence-transformers)
2. ✅ **向量数据库**：Chroma (本地持久化)
3. ✅ **Obsidian发布**：先BRAT，后社区插件

## 立即开始：环境初始化

### Step 1: 创建开发分支和目录结构
```bash
cd /Users/sheldonzhao/Downloads/content-makers

# 创建开发分支
git checkout -b feature/flcm-2.0

# 创建2.0架构目录
mkdir -p .flcm-core/v2/mentor
mkdir -p .flcm-core/v2/creator  
mkdir -p .flcm-core/v2/publisher
mkdir -p .flcm-core/shared/utils
mkdir -p .flcm-core/shared/models
mkdir -p .flcm-core/shared/config
mkdir -p .flcm-core/router
mkdir -p .flcm-core/migration/converters
mkdir -p .flcm-core/migration/schemas
mkdir -p .flcm-core/features/flags
mkdir -p .flcm-core/features/analytics
mkdir -p .flcm-core/obsidian-plugin/src
mkdir -p .flcm-core/embedding/models
mkdir -p .flcm-core/embedding/vectordb
```

### Step 2: 初始化项目配置
```bash
# 初始化TypeScript项目
cd .flcm-core
npm init -y
npm install typescript @types/node ts-node
npm install --save-dev jest @types/jest ts-jest
npx tsc --init

# 安装核心依赖
npm install express fastify yaml js-yaml
npm install winston dotenv commander
npm install --save-dev nodemon eslint prettier
```

### Step 3: 配置Embedding环境
```bash
# 创建Python环境（用于embedding）
python3 -m venv .flcm-core/venv
source .flcm-core/venv/bin/activate

# 安装embedding依赖
pip install sentence-transformers chromadb numpy
pip install fastapi uvicorn  # 用于Python服务

# 下载轻量级模型（仅22MB）
python -c "from sentence_transformers import SentenceTransformer; model = SentenceTransformer('all-MiniLM-L6-v2'); model.save('.flcm-core/embedding/models/minilm')"
```

## Week 1: 基础架构（Story 1.1, 1.2）

### Day 1-2: Story 1.1 - 双架构基础
```typescript
// .flcm-core/router/version-router.ts
export class VersionRouter {
    route(request: Request): Response {
        const version = this.detectVersion(request);
        
        if (version === '2.0') {
            return this.routeToV2(request);
        }
        
        return this.routeToLegacy(request);
    }
}
```

**任务清单**：
- [ ] 实现版本检测逻辑
- [ ] 创建路由中间件
- [ ] 设置配置系统
- [ ] 添加健康检查端点
- [ ] 编写单元测试

### Day 3-4: Story 1.2 - 文档模式迁移
```typescript
// .flcm-core/migration/converters/v1-to-v2.ts
export class DocumentConverter {
    convert(v1Doc: V1Document): V2Document {
        // 转换逻辑
    }
}
```

**任务清单**：
- [ ] 定义v1和v2模式
- [ ] 实现双向转换器
- [ ] 添加验证逻辑
- [ ] 创建批量转换工具
- [ ] 测试数据完整性

### Day 5: 集成Embedding服务
```python
# .flcm-core/embedding/embedding_service.py
from sentence_transformers import SentenceTransformer
import chromadb
from fastapi import FastAPI

app = FastAPI()
model = SentenceTransformer('./models/minilm')
chroma_client = chromadb.PersistentClient(path="./vectordb")

@app.post("/embed")
async def embed_text(text: str):
    embedding = model.encode(text)
    return {"embedding": embedding.tolist()}

@app.post("/search")
async def search_similar(query: str, top_k: int = 10):
    query_embedding = model.encode(query)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    return results
```

## Week 2: 核心功能（Story 1.3, 1.4）

### Day 6-7: Story 1.3 - 框架库实现
```typescript
// .flcm-core/v2/mentor/frameworks/index.ts
export class FrameworkLibrary {
    frameworks = {
        'swot-used': new SWOTUSEDFramework(),
        'scamper': new SCAMPERFramework(),
        'socratic': new SocraticFramework(),
        'five-w2h': new FiveW2HFramework(),
        'pyramid': new PyramidFramework(),
        // ... 15+ frameworks
    };
}
```

### Day 8-9: Story 1.4 - 协作对话模式
```typescript
// .flcm-core/v2/interaction/collaborative-mode.ts
export class CollaborativeMode {
    async process(input: string): Promise<Response> {
        const intent = await this.analyzeIntent(input);
        const framework = await this.selectFramework(intent);
        return await this.applyFramework(framework, input);
    }
}
```

## Week 3: Obsidian集成（Story 2.1-2.4）

### Day 10-11: Story 2.1 - Obsidian插件基础
```typescript
// .flcm-core/obsidian-plugin/src/main.ts
import { Plugin, Notice } from 'obsidian';

export default class FLCMPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'flcm-apply-framework',
            name: 'Apply FLCM Framework',
            callback: () => this.showFrameworkPicker()
        });
    }
}
```

### Day 12-13: Story 2.2 - 知识图谱
- 实现D3.js可视化
- 创建节点和边的数据模型
- 添加过滤和搜索功能

### Day 14-15: Story 2.3-2.4 - 学习追踪和模板
- 构建度量收集系统
- 创建框架模板生成器
- 实现批量应用功能

## Week 4: 高级功能（Story 2.5, 2.6, 1.5, 1.6）

### Day 16-17: Story 2.5 - 语义链接（使用Embedding）
```typescript
// .flcm-core/v2/semantic/linker.ts
export class SemanticLinker {
    private embeddingService: EmbeddingService;
    private vectorDB: ChromaDB;
    
    async findRelatedDocuments(doc: Document): Promise<RelatedDoc[]> {
        // 1. 获取文档embedding
        const embedding = await this.embeddingService.embed(doc.content);
        
        // 2. 在向量数据库中搜索
        const similar = await this.vectorDB.search(embedding, {
            topK: 20,
            threshold: 0.7
        });
        
        // 3. 重新排序和过滤
        return this.rerank(similar);
    }
}
```

### Day 18: Story 2.6 - 每日总结
- 实现定时任务系统
- 创建总结模板
- 添加进度分析

### Day 19-20: Story 1.5-1.6 - 功能标志和监控
- 构建功能标志系统
- 实现分析仪表板
- 添加告警机制

## 部署计划

### BRAT发布（Week 5）
```yaml
# manifest.json
{
  "id": "flcm-integration",
  "name": "FLCM 2.0 - AI Learning Companion",
  "version": "2.0.0-beta.1",
  "minAppVersion": "1.0.0",
  "description": "Transform your learning with AI-powered frameworks",
  "author": "FLCM Team",
  "authorUrl": "https://github.com/your-repo/flcm"
}
```

发布步骤：
1. 创建GitHub仓库
2. 配置releases
3. 创建BRAT安装指南
4. 招募beta测试者

## 测试策略

### 单元测试（每个Story完成后）
```bash
npm test -- --coverage
```

### 集成测试（每周末）
```bash
npm run test:integration
```

### E2E测试（发布前）
```bash
npm run test:e2e
```

## 监控指标

### 开发进度
- [ ] Story完成率
- [ ] 测试覆盖率 >80%
- [ ] 代码审查完成率

### 质量指标
- [ ] Bug密度 <5/KLOC
- [ ] 性能基准达标
- [ ] 文档完整性

## 风险管理

| 风险 | 缓解措施 |
|------|---------|
| Embedding模型过大 | 使用MiniLM（仅22MB） |
| Chroma性能问题 | 实现缓存层 |
| Obsidian API变更 | 版本锁定+适配层 |

## 下一步行动

### 今天立即执行
```bash
# 1. 初始化环境
cd /Users/sheldonzhao/Downloads/content-makers
git checkout -b feature/flcm-2.0

# 2. 创建目录结构
# [运行上面的mkdir命令]

# 3. 安装依赖
npm init -y
npm install typescript @types/node

# 4. 设置Python环境
python3 -m venv venv
source venv/bin/activate
pip install sentence-transformers chromadb

# 5. 开始编码Story 1.1
```

---

**准备就绪！现在可以开始开发了。**

建议从Story 1.1（版本路由器）开始，这是整个架构的基础。