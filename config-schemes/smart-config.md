# 方案4：智能路由配置

## 配置特点
- 根据任务类型自动选择最佳模型
- 最大化性价比
- 适合多场景用户
- 成本：~$3-5/月

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

## 模型说明
- **默认**: `qwen/qwen3-coder` - 通用任务，高质量输出
- **后台**: `z-ai/glm-4.5-air:free` - 轻量级后台任务
- **思考**: `deepseek/deepseek-r1-0528-qwen3-8b:free` - 复杂推理
- **长文本**: `qwen/qwen3-235b-a22b:free` - 大文档处理
- **搜索**: `z-ai/glm-4.5` - 中文网络搜索

## 智能路由规则

### 自动路由逻辑
1. **代码开发** → qwen/qwen3-coder
2. **中文内容** → z-ai/glm-4.5
3. **推理思考** → deepseek/deepseek-r1-0528-qwen3-8b:free
4. **长文档** → qwen/qwen3-235b-a22b:free
5. **简单任务** → z-ai/glm-4.5-air:free

### Token 阈值触发
- 超过60K tokens → 自动切换到长文本模型
- 思考模式启用 → 自动切换到推理模型
- 检测到工具使用 → 使用代码模型
- 检测到中文内容 → 优先使用中文模型

## 成本分析
- qwen/qwen3-coder: ~$2-3/1M tokens
- z-ai/glm-4.5: ~$1-2/1M tokens
- 其他模型: 完全免费
- 预估月成本: $3-5（智能调度）

## 适用场景
- 多语言开发
- 内容创作
- 技术研究
- 文档处理
- 日常办公

## 优势
- 智能调度，成本最优
- 场景适配，体验最佳
- 自动切换，无需手动选择
- 支持多种语言和场景

## 局限性
- 需要初始调优
- 路由规则可能需要调整

## 使用方法
```bash
# 保存为 ~/.claude-code-router/config.json
# 替换 APIKEY 和 OpenRouter API 密钥
ccr restart
```

## 自动路由示例
```bash
# 以下任务会自动选择对应模型：

# 编写Python代码 → qwen/qwen3-coder
# 分析大型代码库 → qwen/qwen3-235b-a22b:free
# 设计系统架构 → deepseek/deepseek-r1-0528-qwen3-8b:free
# 编写中文文档 → z-ai/glm-4.5
# 简单对话 → z-ai/glm-4.5-air:free
# 网络搜索中文内容 → z-ai/glm-4.5
```

## 手动覆盖示例
```bash
# 强制使用特定模型
/model openrouter,qwen/qwen3-coder

# 使用免费模式
/model openrouter,qwen/qwen3-235b-a22b:free

# 中文优化
/model openrouter,z-ai/glm-4.5
```

## 优化建议
1. **监控使用统计**: 定期查看各模型使用频率
2. **调整路由规则**: 根据实际使用体验调整
3. **设置预算**: 为不同类型的任务设置预算限制
4. **性能评估**: 定期评估模型性能和成本比

## 高级功能
- 支持 subagent 特殊路由
- 可通过自定义路由脚本扩展
- 支持动态模型切换
- 自动成本优化