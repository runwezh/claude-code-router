#\!/bin/bash

# 网络性能测试脚本
echo "🌐 网络性能测试"
echo "================="

# 测试不同API端点的延迟
echo "📡 测试API端点延迟..."
echo "1. OpenRouter (主要):"
ping -c 3 openrouter.ai

echo -e "\n2. 备用端点测试:"
# 测试可能的备用端点
ping -c 3 api.openai.com
ping -c 3 api.anthropic.com

echo -e "\n📊 测试DNS解析时间:"
echo "OpenRouter DNS解析时间:"
time nslookup openrouter.ai

echo -e "\n🔄 测试连接建立时间:"
echo "测试OpenRouter TCP连接时间:"
time nc -zv openrouter.ai 443

echo -e "\n💡 建议:"
echo "- 如果延迟 > 200ms，考虑使用VPN或代理"
echo "- 可以配置多个API提供商作为备选"
echo "- 考虑使用CDN加速的API端点"
