# 环境变量配置指南

## 📝 环境变量配置

Claude Code Router 现在支持通过环境变量进行配置，这样可以更方便地管理不同的配置方案。

### 📁 配置文件

- `.env` - 本地环境变量配置（包含敏感信息）
- `.env.example` - 环境变量示例文件
- `generate-config.js` - 从环境变量生成配置的脚本,使用config-schemes/free-config.md文档内模板

## 🚀 使用方法

### 1. 配置环境变量

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，填入你的实际配置
nano .env
```

### 2. 生成配置文件

```bash
# 生成配置文件（交互式）
node generate-config.js

# 强制生成配置文件（非交互式）
node generate-config.js --force
```

### 3. 启动服务

```bash
# 使用 Docker Compose
docker compose up -d

# 重启服务
docker compose restart

# 或者直接使用 ccr
ccr restart
```

## 🔧 环境变量说明

### 基础配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `ROUTER_APIKEY` | `your-router-secret-key` | 路由器密钥 |
| `ROUTER_HOST` | `0.0.0.0` | 监听地址 |
| `ROUTER_PORT` | `3456` | 监听端口 |
| `ROUTER_LOG` | `true` | 是否启用日志 |
| `ROUTER_API_TIMEOUT_MS` | `600000` | API 超时时间（毫秒） |

### OpenRouter 配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `OPENROUTER_API_KEY` | `sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | OpenRouter API 密钥 |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1/chat/completions` | OpenRouter API 地址 |

### 模型配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DEFAULT_MODELS` | 多个模型逗号分隔 | 默认可用模型列表 |

### 路由配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DEFAULT_ROUTE` | `openrouter,qwen/qwen3-coder` | 默认路由 |
| `BACKGROUND_ROUTE` | `openrouter,z-ai/glm-4.5-air:free` | 后台任务路由 |
| `THINK_ROUTE` | `openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free` | 思考模式路由 |
| `LONGCONTEXT_ROUTE` | `openrouter,qwen/qwen3-235b-a22b:free` | 长文本路由 |
| `LONGCONTEXT_THRESHOLD` | `60000` | 长文本阈值 |
| `WEBSEARCH_ROUTE` | `openrouter,qwen/qwen3-coder` | 网络搜索路由 |

## 🎯 配置示例

### 免费配置方案

```bash
# .env 文件
ROUTER_APIKEY=your-secret-key
OPENROUTER_API_KEY=sk-or-your-openrouter-key

DEFAULT_MODELS=qwen/qwen3-235b-a22b:free,z-ai/glm-4.5-air:free,deepseek/deepseek-r1-0528-qwen3-8b:free,moonshotai/kimi-k2:free

DEFAULT_ROUTE=openrouter,qwen/qwen3-235b-a22b:free
BACKGROUND_ROUTE=openrouter,z-ai/glm-4.5-air:free
THINK_ROUTE=openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free
LONGCONTEXT_ROUTE=openrouter,qwen/qwen3-235b-a22b:free
WEBSEARCH_ROUTE=openrouter,qwen/qwen3-235b-a22b:free
```

### 混合配置方案

```bash
# .env 文件
ROUTER_APIKEY=your-secret-key
OPENROUTER_API_KEY=sk-or-your-openrouter-key

DEFAULT_MODELS=qwen/qwen3-coder,qwen/qwen3-235b-a22b:free,z-ai/glm-4.5,z-ai/glm-4.5-air:free,deepseek/deepseek-r1-0528-qwen3-8b:free

DEFAULT_ROUTE=openrouter,qwen/qwen3-coder
BACKGROUND_ROUTE=openrouter,z-ai/glm-4.5-air:free
THINK_ROUTE=openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free
LONGCONTEXT_ROUTE=openrouter,qwen/qwen3-235b-a22b:free
WEBSEARCH_ROUTE=openrouter,qwen/qwen3-coder
```

## 🐳 Docker 使用

### 使用环境变量启动

```bash
# 使用默认配置
docker compose up -d

# 使用自定义 .env 文件
docker compose --env-file .env.custom up -d
```

### 环境变量优先级

1. 命令行环境变量
2. `.env` 文件
3. 默认值

## 🔍 故障排除

### 常见问题

1. **配置文件未生成**
   - 检查 `.env` 文件是否存在
   - 确认环境变量格式正确
   - 运行 `node generate-config.js --force`

2. **Docker 启动失败**
   - 检查环境变量是否正确设置
   - 确认端口未被占用
   - 查看 Docker 日志：`docker compose logs`

3. **API 连接失败**
   - 验证 API 密钥是否正确
   - 检查网络连接
   - 确认 API 地址正确

### 调试命令

```bash
# 查看当前配置
node generate-config.js

# 验证配置
node validate-config.js validate

# 测试连接
node validate-config.js test

# 查看 Docker 日志
docker compose logs -f
```

## 💡 最佳实践

1. **安全性**
   - 不要将 `.env` 文件提交到版本控制
   - 使用不同的 API 密钥用于不同环境
   - 定期轮换 API 密钥

2. **配置管理**
   - 为不同环境创建不同的 `.env` 文件
   - 使用 `.env.example` 作为模板
   - 定期备份配置文件

3. **性能优化**
   - 根据使用场景选择合适的模型
   - 设置合理的超时时间
   - 监控 API 使用情况

## 📚 相关命令

```bash
# 生成配置
node generate-config.js

# 验证配置
node validate-config.js validate

# 测试连接
node validate-config.js test

# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart
```