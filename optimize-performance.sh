#\!/bin/bash

# Claude Code Router 性能优化脚本
echo "🚀 开始优化 Claude Code Router 性能..."

# 1. 停止当前容器
echo "🛑 停止当前容器..."
docker-compose down

# 2. 清理Docker缓存
echo "🧹 清理Docker缓存..."
docker system prune -f

# 3. 重建并启动优化容器
echo "🏗️  重建优化容器..."
docker-compose up -d --build

# 4. 等待容器启动
echo "⏳ 等待容器启动..."
sleep 10

# 5. 检查容器状态
echo "📊 检查容器状态..."
docker ps | grep claude-code-router

# 6. 测试性能
echo "🧪 测试API性能..."
echo "测试响应时间..."
time curl -s -X POST "http://localhost:3456/v1/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer runweok" \
  -d '{
    "model": "qwen/qwen3-coder",
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "max_tokens": 50
  }' > /dev/null

echo "✅ 性能优化完成！"
echo "💡 使用 'docker-compose -f docker-compose.yml logs -f' 查看日志"
