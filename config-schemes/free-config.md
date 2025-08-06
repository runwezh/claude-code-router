# 方案1：完全免费配置

## 配置特点
- 100% 免费使用
- 适合个人学习、轻量使用
- 成本：$0

## 配置文件
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

## 模型说明
- **默认**: `qwen/qwen3-235b-a22b:free` - 235B大参数，综合能力强
- **后台**: `z-ai/glm-4.5-air:free` - 轻量级任务
- **思考**: `deepseek/deepseek-r1-0528-qwen3-8b:free` - 推理能力
- **长文本**: `qwen/qwen3-235b-a22b:free` - 大上下文窗口
- **搜索**: `qwen/qwen3-235b-a22b:free` - 支持联网功能

## 适用场景
- 学生学习
- 个人项目
- 轻度开发
- 文档处理
- 日常对话

## 优势
- 完全免费
- 性能不错
- 中文支持好
- 长文本能力强

## 局限性
- 可能有使用限制
- 响应速度较慢
- 部分功能受限

## 使用方法
```bash
# 保存为 ~/.claude-code-router/config.json
# 替换 APIKEY 和 OpenRouter API 密钥
ccr restart
```

## 动态切换示例
```bash
# 使用免费大模型
/model openrouter,qwen/qwen3-235b-a22b:free

# 使用轻量模型
/model openrouter,z-ai/glm-4.5-air:free

# 使用推理模型
/model openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free
```