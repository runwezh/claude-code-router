# 配置使用指南

## 🚀 快速开始

### 1. 运行配置向导
```bash
node setup-config.js
```

### 2. 验证配置
```bash
node validate-config.js validate
```

### 3. 测试连接
```bash
node validate-config.js test
```

## 📋 配置方案详情

### 方案1：完全免费配置
- **成本**: $0/月
- **适用**: 学生、个人学习
- **特点**: 100%免费使用
- **文件**: `config-schemes/free-config.md`

### 方案2：混合经济配置 ⭐
- **成本**: $2-3/月
- **适用**: 开发者、普通用户
- **特点**: 性价比最高，85-90% Claude体验
- **文件**: `config-schemes/mixed-config.md`

### 方案3：专业开发者配置
- **成本**: $5-8/月
- **适用**: 专业程序员
- **特点**: 专注代码开发，高质量输出
- **文件**: `config-schemes/professional-config.md`

### 方案4：智能路由配置 ⭐
- **成本**: $3-5/月
- **适用**: 多场景用户
- **特点**: 自动选择最佳模型，智能化调度
- **文件**: `config-schemes/smart-config.md`

## 🔧 手动配置

如果需要手动配置，请按照以下步骤：

1. **复制配置文件**：
```bash
cp config-schemes/mixed-config.md ~/.claude-code-router/config.json
```

2. **编辑配置**：
```bash
# 编辑配置文件，替换占位符
nano ~/.claude-code-router/config.json
```

3. **重启服务**：
```bash
ccr restart
```

## 🎯 推荐配置

对于大多数用户，**推荐方案2（混合经济配置）**：
- 成本极低（$2-3/月）
- 体验接近Claude Sonnet 4
- 代码能力强
- 可以随时调整到其他方案

## 📊 配置验证

验证脚本会检查：
- 配置文件格式是否正确
- 必需字段是否设置
- API密钥是否有效
- 端口和超时设置是否合理

## 🧪 连接测试

测试脚本会：
- 检查ccr命令是否可用
- 启动路由服务
- 发送测试请求
- 验证连接是否正常

## 🐳 Docker 环境配置

如果在 Docker 环境中使用 Claude Code Router，可以采用以下方法：

### 1. 使用配置文件挂载

在 docker-compose.yml 中配置卷挂载：

```yaml
version: "3.8"
services:
  claude-code-router:
    build: .
    ports:
      - "3456:3456"
    volumes:
      - ~/.claude-code-router:/root/.claude-code-router
    restart: unless-stopped
```

### 2. 选择配置方案

将选定的配置方案复制到配置目录：

```bash
# 创建配置目录
mkdir -p ~/.claude-code-router

# 复制配置方案（以混合经济配置为例）
cp config-schemes/mixed-config.md ~/.claude-code-router/config.json

# 编辑配置文件，替换API密钥等占位符
nano ~/.claude-code-router/config.json
```

### 3. 启动 Docker 服务

```bash
# 使用 docker-compose 启动
docker-compose up -d

# 或使用 docker 命令启动
docker run -d \
  --name claude-code-router \
  -p 3456:3456 \
  -v ~/.claude-code-router:/root/.claude-code-router \
  --restart unless-stopped \
  claude-code-router
```

### 4. 在 Docker 中验证配置

```bash
# 进入容器检查配置
docker exec -it claude-code-router cat /root/.claude-code-router/config.json

# 查看容器日志
docker logs claude-code-router

# 测试 API 连接
curl http://localhost:3456/health
```

### 5. Docker 环境下动态切换配置

在 Docker 环境中也可以通过以下方式切换配置：

```bash
# 方法一：替换配置文件并重启
docker exec -it claude-code-router sh -c "cp /app/config-schemes/free-config.md /root/.claude-code-router/config.json"
docker restart claude-code-router

# 方法二：通过 API 动态切换（如果服务支持）
curl -X POST http://localhost:3456/api/config/router \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"default": "openrouter,qwen/qwen3-coder"}'
```

## 💡 使用技巧

### 动态切换模型
```bash
# 使用免费模式
/model openrouter,qwen/qwen3-235b-a22b:free

# 使用付费模式
/model openrouter,qwen/qwen3-coder

# 中文优化
/model openrouter,z-ai/glm-4.5
```

### 成本控制
1. 默认使用免费模型处理简单任务
2. 只在需要高质量代码时切换到付费模型
3. 长文本和推理任务使用免费模型
4. 定期检查使用统计和成本

### 故障排除
1. 检查配置文件格式
2. 验证API密钥是否正确
3. 确认网络连接正常
4. 查看日志文件排查问题

## 📚 相关文件

- `setup-config.js` - 交互式配置向导
- `validate-config.js` - 配置验证和测试工具
- `config-schemes/` - 各种配置方案
- `config-openrouter-example.json` - OpenRouter配置示例