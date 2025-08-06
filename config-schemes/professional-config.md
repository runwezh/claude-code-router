# 方案3：专业开发者配置

## 配置特点
- 专注代码开发
- 高质量输出
- 适合专业开发者
- 成本：~$5-8/月

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

## 模型说明
- **默认**: `qwen/qwen3-coder` - 主要代码开发
- **后台**: `z-ai/glm-4.5` - 中文文档处理
- **思考**: `deepseek/deepseek-r1-0528-qwen3-8b:free` - 架构设计
- **长文本**: `qwen/qwen3-235b-a22b:free` - 大型项目分析
- **搜索**: `qwen/qwen3-coder` - 技术文档搜索

## 成本分析
- qwen/qwen3-coder: ~$2-3/1M tokens
- z-ai/glm-4.5: ~$1-2/1M tokens
- openai/o3: ~$5-8/1M tokens（备用）
- 其他模型: 完全免费
- 预估月成本: $5-8（重度开发）

## 适用场景
- 大型项目开发
- 代码重构
- 架构设计
- 技术文档编写
- 代码审查
- 团队协作

## 优势
- 代码质量最高
- 多语言支持
- 复杂任务处理
- 专业级输出

## 局限性
- 成本较高
- 需要权衡使用频率

## 使用方法
```bash
# 保存为 ~/.claude-code-router/config.json
# 替换 APIKEY 和 OpenRouter API 密钥
ccr restart
```

## 动态切换示例
```bash
# 主要开发
/model openrouter,qwen/qwen3-coder

# 复杂推理
/model openrouter,openai/o3

# 中文文档
/model openrouter,z-ai/glm-4.5

# 系统架构
/model openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free

# 项目分析
/model openrouter,qwen/qwen3-235b-a22b:free
```

## 开发工作流建议
1. **日常编码**: 使用 qwen/qwen3-coder
2. **代码审查**: 使用 deepseek/deepseek-r1-0528-qwen3-8b:free
3. **文档编写**: 使用 z-ai/glm-4.5
4. **复杂算法**: 使用 openai/o3
5. **项目重构**: 使用 qwen/qwen3-235b-a22b:free

## 成本控制策略
- 80%任务使用 qwen/qwen3-coder
- 15%任务使用免费模型
- 5%复杂任务使用 openai/o3
- 定期评估模型使用效率