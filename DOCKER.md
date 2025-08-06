# Docker 配置指南

Claude Code Router 支持 Docker 部署，让您可以轻松地在容器化环境中运行路由器服务。

## 快速开始

### 1. 使用 Docker Compose（推荐）

项目已提供 `docker-compose.yml` 文件，这是最简单的部署方式：

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

启动服务：

```bash
docker-compose up -d
```

停止服务：

```bash
docker-compose down
```

### 2. 使用 Docker 命令

构建镜像：

```bash
docker build -t claude-code-router .
```

运行容器：

```bash
docker run -d \
  --name claude-code-router \
  -p 3456:3456 \
  -v ~/.claude-code-router:/root/.claude-code-router \
  --restart unless-stopped \
  claude-code-router
```

## 配置说明

### 配置文件映射

容器内的配置文件位于 `/root/.claude-code-router/config.json`。通过卷映射，您可以在主机上管理配置：

```bash
# 主机配置文件路径
~/.claude-code-router/config.json

# 容器内配置文件路径
/root/.claude-code-router/config.json
```

### 环境变量配置

您可以通过环境变量配置路由器：

```bash
docker run -d \
  --name claude-code-router \
  -p 3456:3456 \
  -v ~/.claude-code-router:/root/.claude-code-router \
  -e HOST=0.0.0.0 \
  -e PORT=3456 \
  -e APIKEY=your-secret-key \
  -e PROXY_URL=http://proxy:7890 \
  --restart unless-stopped \
  claude-code-router
```

### 完整配置示例

创建配置文件 `~/.claude-code-router/config.json`：

```json
{
  "APIKEY": "your-secret-key",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "PROXY_URL": "http://proxy:7890",
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "deepseek",
      "api_base_url": "https://api.deepseek.com/chat/completions",
      "api_key": "sk-your-api-key",
      "models": ["deepseek-chat", "deepseek-reasoner"],
      "transformer": {
        "use": ["deepseek"],
        "deepseek-chat": {
          "use": ["tooluse"]
        }
      }
    }
  ],
  "Router": {
    "default": "deepseek,deepseek-chat",
    "background": "deepseek,deepseek-chat",
    "think": "deepseek,deepseek-reasoner",
    "longContext": "deepseek,deepseek-reasoner",
    "longContextThreshold": 60000
  }
}
```

## 预置配置方案切换

Claude Code Router 提供了四种预置配置方案，您可以根据需要在不同场景下切换使用：

### 1. 完全免费配置 (free-config)

适用于个人学习和轻量使用，成本为0。

配置文件示例：
```json
{
  "APIKEY": "your-router-secret-key",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "models": [
        "qwen/qwen3-235b-a22b:free",
        "z-ai/glm-4.5-air:free",
        "deepseek/deepseek-r1-0528-qwen3-8b:free",
        "moonshotai/kimi-k2:free",
        "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        "tngtech/deepseek-r1t2-chimera:free"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,qwen/qwen3-235b-a22b:free",
    "background": "openrouter,z-ai/glm-4.5-air:free",
    "think": "openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free",
    "longContext": "openrouter,qwen/qwen3-235b-a22b:free",
    "longContextThreshold": 60000,
    "webSearch": "openrouter,qwen/qwen3-235b-a22b:free"
  }
}
```

### 2. 混合经济配置 (mixed-config) - 推荐

性价比最高，成本约$2-3/月，适合开发者和重度用户。

配置文件示例：
```json
{
  "APIKEY": "your-router-secret-key",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "models": [
        "qwen/qwen3-coder",
        "qwen/qwen3-235b-a22b:free",
        "z-ai/glm-4.5",
        "z-ai/glm-4.5-air:free",
        "deepseek/deepseek-r1-0528-qwen3-8b:free",
        "moonshotai/kimi-k2:free",
        "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        "tngtech/deepseek-r1t2-chimera:free"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,qwen/qwen3-coder",
    "background": "openrouter,z-ai/glm-4.5-air:free",
    "think": "openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free",
    "longContext": "openrouter,qwen/qwen3-235b-a22b:free",
    "longContextThreshold": 60000,
    "webSearch": "openrouter,qwen/qwen3-coder"
  }
}
```

### 3. 专业开发者配置 (professional-config)

专注代码开发，高质量输出，适合专业开发者，成本约$5-8/月。

配置文件示例：
```json
{
  "APIKEY": "your-router-secret-key",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "models": [
        "qwen/qwen3-coder",
        "openai/o3",
        "qwen/qwen3-235b-a22b:free",
        "z-ai/glm-4.5",
        "deepseek/deepseek-r1-0528-qwen3-8b:free",
        "moonshotai/kimi-k2:free",
        "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        "tngtech/deepseek-r1t2-chimera:free"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,qwen/qwen3-coder",
    "background": "openrouter,z-ai/glm-4.5",
    "think": "openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free",
    "longContext": "openrouter,qwen/qwen3-235b-a22b:free",
    "longContextThreshold": 60000,
    "webSearch": "openrouter,qwen/qwen3-coder"
  }
}
```

### 4. 智能路由配置 (smart-config)

根据任务类型自动选择最佳模型，最大化性价比，成本约$3-5/月。

配置文件示例：
```json
{
  "APIKEY": "your-router-secret-key",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "models": [
        "qwen/qwen3-coder",
        "z-ai/glm-4.5",
        "qwen/qwen3-235b-a22b:free",
        "z-ai/glm-4.5-air:free",
        "deepseek/deepseek-r1-0528-qwen3-8b:free",
        "moonshotai/kimi-k2:free",
        "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        "tngtech/deepseek-r1t2-chimera:free"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,qwen/qwen3-coder",
    "background": "openrouter,z-ai/glm-4.5-air:free",
    "think": "openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free",
    "longContext": "openrouter,qwen/qwen3-235b-a22b:free",
    "longContextThreshold": 60000,
    "webSearch": "openrouter,z-ai/glm-4.5"
  }
}
```

## 在 Docker 中切换配置方案

在 Docker 环境中切换配置方案有以下几种方法：

### 方法一：替换配置文件并重启容器

1. 准备新的配置文件：
```bash
# 备份当前配置
cp ~/.claude-code-router/config.json ~/.claude-code-router/config.json.backup

# 使用新的配置方案（以免费配置为例）
cp /path/to/free-config.json ~/.claude-code-router/config.json
```

2. 重启容器：
```bash
docker-compose restart claude-code-router
# 或者
docker restart claude-code-router
```

### 方法二：使用不同的 Docker Compose 文件

为每种配置方案创建独立的 Docker Compose 文件：

```bash
# 启动免费配置方案
docker-compose -f docker-compose.free.yml up -d

# 启动混合配置方案
docker-compose -f docker-compose.mixed.yml up -d

# 启动专业配置方案
docker-compose -f docker-compose.professional.yml up -d

# 启动智能路由配置方案
docker-compose -f docker-compose.smart.yml up -d
```

### 方法三：通过环境变量切换

在运行时通过环境变量指定配置：

```bash
docker run -d \
  --name claude-code-router \
  -p 3456:3456 \
  -v ~/.claude-code-router:/root/.claude-code-router \
  -e CONFIG_SCHEME=free \
  --restart unless-stopped \
  claude-code-router
```

### 方法四：动态切换（通过 API）

如果容器正在运行，您也可以通过 API 动态切换配置：

```bash
# 获取当前配置
curl -H "Authorization: Bearer your-secret-key" http://localhost:3456/api/config

# 切换到特定模型（示例）
curl -X POST http://localhost:3456/api/config/router \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"default": "openrouter,qwen/qwen3-coder"}'
```

### 切换配置后的验证

切换配置后，建议验证配置是否生效：

```bash
# 检查容器日志
docker logs claude-code-router

# 测试 API 连接
curl -H "Authorization: Bearer your-secret-key" http://localhost:3456/health

# 查看当前配置
curl -H "Authorization: Bearer your-secret-key" http://localhost:3456/api/config
```

## 高级配置

### 1. 自定义 Dockerfile

如果需要自定义构建，可以创建 `Dockerfile.custom`：

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./
COPY ui/package*.json ./ui/

# 安装依赖
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN cd ui && npm install

# 复制源代码
COPY . .

# 构建项目
RUN pnpm run build

# 暴露端口
EXPOSE 3456

# 设置环境变量
ENV HOST=0.0.0.0
ENV PORT=3456

# 启动服务
CMD ["node", "dist/cli.js", "start"]
```

### 2. Docker Compose 高级配置

```yaml
version: "3.8"

services:
  claude-code-router:
    build: 
      context: .
      dockerfile: Dockerfile.custom
    ports:
      - "3456:3456"
    volumes:
      - ~/.claude-code-router:/root/.claude-code-router
      - ./plugins:/root/.claude-code-router/plugins
    environment:
      - HOST=0.0.0.0
      - PORT=3456
      - LOG=true
      - API_TIMEOUT_MS=600000
    restart: unless-stopped
    networks:
      - claude-network
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - claude-network

networks:
  claude-network:
    driver: bridge
```

### 3. 生产环境配置

对于生产环境，建议使用以下配置：

```yaml
version: "3.8"

services:
  claude-code-router:
    build: 
      context: .
      dockerfile: Dockerfile.prod
    container_name: claude-code-router-prod
    ports:
      - "3456:3456"
    volumes:
      - claude-config:/root/.claude-code-router
      - claude-logs:/var/log
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=3456
      - LOG=true
      - API_TIMEOUT_MS=600000
    restart: unless-stopped
    networks:
      - claude-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3456/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  claude-config:
  claude-logs:

networks:
  claude-network:
    driver: bridge
```

## 常用命令

### 查看容器状态

```bash
docker ps
docker-compose ps
```

### 查看日志

```bash
docker logs claude-code-router
docker-compose logs -f claude-code-router
```

### 进入容器

```bash
docker exec -it claude-code-router /bin/sh
```

### 重启服务

```bash
docker restart claude-code-router
docker-compose restart claude-code-router
```

### 更新镜像

```bash
docker-compose pull
docker-compose up -d --force-recreate
```

## 故障排除

### 1. 权限问题

如果遇到权限问题，可以调整卷映射：

```bash
docker run -d \
  --name claude-code-router \
  -p 3456:3456 \
  -v $(pwd)/config:/root/.claude-code-router \
  --user root \
  --restart unless-stopped \
  claude-code-router
```

### 2. 网络问题

如果容器无法访问外部 API，检查网络配置：

```bash
docker run -d \
  --name claude-code-router \
  -p 3456:3456 \
  -v ~/.claude-code-router:/root/.claude-code-router \
  --network host \
  --restart unless-stopped \
  claude-code-router
```

### 3. 调试模式

启用调试模式：

```bash
docker run -d \
  --name claude-code-router \
  -p 3456:3456 \
  -v ~/.claude-code-router:/root/.claude-code-router \
  -e LOG=true \
  --restart unless-stopped \
  claude-code-router
```

## 安全建议

1. **使用 API 密钥保护**：始终设置 `APIKEY` 环境变量
2. **限制网络访问**：使用防火墙规则限制对 3456 端口的访问
3. **定期更新**：定期拉取最新镜像以获取安全更新
4. **监控日志**：启用日志记录并定期检查
5. **使用非 root 用户**：在生产环境中考虑使用非 root 用户运行容器

## 部署示例

### 在云服务器上部署

```bash
# 在服务器上克隆项目
git clone https://github.com/your-repo/claude-code-router.git
cd claude-code-router

# 创建配置目录
mkdir -p ~/.claude-code-router

# 编辑配置文件
cat > ~/.claude-code-router/config.json << EOF
{
  "APIKEY": "$(openssl rand -hex 32)",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "Providers": [
    {
      "name": "deepseek",
      "api_base_url": "https://api.deepseek.com/chat/completions",
      "api_key": "your-api-key",
      "models": ["deepseek-chat"]
    }
  ],
  "Router": {
    "default": "deepseek,deepseek-chat"
  }
}
EOF

# 启动服务
docker-compose up -d
```

### 使用 systemd 管理

创建 `/etc/systemd/system/claude-code-router.service`：

```ini
[Unit]
Description=Claude Code Router
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/claude-code-router
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
sudo systemctl enable claude-code-router
sudo systemctl start claude-code-router
```

这样您就可以通过 systemd 管理 Claude Code Router 服务了。