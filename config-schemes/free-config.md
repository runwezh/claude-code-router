# Claude Code Router 配置模板

## 配置说明

这是一个完全免费的配置模板，适合个人学习和轻量使用。

```json
{
  "APIKEY": "your-router-secret-key",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "LOG": true,
  "API_TIMEOUT_MS": 3000000,
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "models": [
        "qwen/qwen3-coder:free",
        "openai/gpt-oss-20b:free",
        "z-ai/glm-4.5-air:free",
        "moonshotai/kimi-k2:free"
      ],
      "transformer": {
        "use": [
          "openrouter"
        ]
      }
    }
  ],
  "Router": {
    "default": "openrouter,openai/gpt-oss-20b:free"
  }
}
```
