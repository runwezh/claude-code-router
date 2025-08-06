# 方案2：混合经济配置（推荐）

## 配置特点
- 成本低廉（约15%原价）
- 性能接近Claude Sonnet 4
- 适合开发者、重度用户
- 成本：~$2-3/月

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

## 模型说明
- **默认**: `qwen/qwen3-coder` - 代码能力强，通用性好（付费）
- **后台**: `z-ai/glm-4.5-air:free` - 轻量级任务（免费）
- **思考**: `deepseek/deepseek-r1-0528-qwen3-8b:free` - 推理能力（免费）
- **长文本**: `qwen/qwen3-235b-a22b:free` - 大上下文窗口（免费）
- **搜索**: `qwen/qwen3-coder` - 支持联网功能（付费）

## 成本分析
- qwen/qwen3-coder: ~$2-3/1M tokens
- 其他模型: 完全免费
- 预估月成本: $2-3（中度使用）

## 适用场景
- 软件开发
- 代码审查
- 技术文档
- 项目管理
- 重度用户

## 优势
- 性价比最高
- 代码能力强
- 中英文均衡
- 成本可控

## 局限性
- 少量付费
- 部分高级功能可能不如Claude

## 使用方法
```bash
# 保存为 ~/.claude-code-router/config.json
# 替换 APIKEY 和 OpenRouter API 密钥
ccr restart
```

## 动态切换示例
```bash
# 主要工作模型
/model openrouter,qwen/qwen3-coder

# 省钱模式
/model openrouter,qwen/qwen3-235b-a22b:free

# 推理任务
/model openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free

# 中文创作
/model openrouter,z-ai/glm-4.5
```

## 成本优化建议
1. 默认使用免费模型处理简单任务
2. 只在需要高质量代码时切换到付费模型
3. 长文本和推理任务使用免费模型
4. 定期检查使用统计和成本