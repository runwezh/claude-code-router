#\!/bin/bash

# Claude Code Router API Test Script
# 测试不同的路由策略

echo "🧪 Claude Code Router API 测试"
echo "=================================="

BASE_URL="http://localhost:3456"
APIKEY="runweok"

# 测试默认路由 (qwen/qwen3-coder)
echo "📝 测试1: 默认路由 (代码开发)"
curl -s -X POST "$BASE_URL/v1/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIKEY" \
  -d '{
    "model": "qwen/qwen3-coder",
    "messages": [
      {"role": "user", "content": "写一个Python函数来计算斐波那契数列"}
    ],
    "max_tokens": 500
  }'

echo -e "\n\n🔄 测试2: 后台路由 (中文文档处理)"
curl -s -X POST "$BASE_URL/v1/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIKEY" \
  -d '{
    "model": "claude-3-5-haiku",
    "messages": [
      {"role": "user", "content": "请用中文解释什么是微服务架构"}
    ],
    "max_tokens": 500
  }'

echo -e "\n\n🤔 测试3: 思考路由 (复杂推理)"
curl -s -X POST "$BASE_URL/v1/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIKEY" \
  -d '{
    "model": "qwen/qwen3-coder",
    "messages": [
      {"role": "user", "content": "设计一个分布式系统的缓存策略"}
    ],
    "thinking": true,
    "max_tokens": 500
  }'

echo -e "\n\n✅ 所有测试完成！"
echo "💡 检查上面的输出，确认每个路由都正常工作"
