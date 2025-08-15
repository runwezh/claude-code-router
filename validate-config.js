#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateConfig(configPath) {
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    const errors = [];
    const warnings = [];
    
    // 检查必需字段
    if (!config.APIKEY || config.APIKEY === 'your-router-secret-key') {
      errors.push('APIKEY 未设置或使用默认值');
    }
    
    if (!config.Providers || !Array.isArray(config.Providers)) {
      errors.push('Providers 配置缺失或格式错误');
    } else {
      for (const [index, provider] of config.Providers.entries()) {
        if (!provider.name) {
          errors.push(`Provider ${index}: 缺少 name 字段`);
        }
        
        if (!provider.api_key || provider.api_key.includes('xxxxxxxx')) {
          errors.push(`Provider ${index}: api_key 未设置`);
        }
        
        if (!provider.models || !Array.isArray(provider.models) || provider.models.length === 0) {
          errors.push(`Provider ${index}: 没有配置模型`);
        }
      }
    }
    
    if (!config.Router) {
      errors.push('Router 配置缺失');
    } else {
      const requiredRoutes = ['default', 'background', 'think', 'longContext'];
      requiredRoutes.forEach(route => {
        if (!config.Router[route]) {
          errors.push(`Router.${route} 路由缺失`);
        }
      });
    }
    
    // 检查端口冲突
    if (config.PORT && config.PORT !== 3456) {
      warnings.push(`使用了非标准端口 ${config.PORT}`);
    }
    
    // 检查超时设置
    if (config.API_TIMEOUT_MS && config.API_TIMEOUT_MS < 300000) {
      warnings.push('API_TIMEOUT_MS 设置较短，可能导致大请求超时');
    }
    
    return { errors, warnings, config };
  } catch (error) {
    return { 
      errors: [`配置文件解析失败: ${error.message}`], 
      warnings: [], 
      config: null 
    };
  }
}

function checkCcrAvailable() {
  try {
    execSync('which ccr', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function testToolCalling(baseUrl, apiKey, testModel) {
  console.log('🔧 测试4: 工具调用能力检测');
  
  const toolCallRequest = {
    model: testModel,
    messages: [
      {
        role: "user",
        content: "请帮我计算 15 + 27 的结果"
      }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "calculate",
          description: "执行基本的数学计算",
          parameters: {
            type: "object",
            properties: {
              expression: {
                type: "string",
                description: "要计算的数学表达式，例如 '15 + 27'"
              }
            },
            required: ["expression"]
          }
        }
      }
    ],
    tool_choice: "auto",
    max_tokens: 300
  };
  
  try {
    const result = execSync(`curl -s -X POST "${baseUrl}/v1/messages" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${apiKey}" \
      -d '${JSON.stringify(toolCallRequest).replace(/'/g, "'\"'\"'")}'`, { encoding: 'utf8' });
    
    const response = JSON.parse(result);
    
    // 检查是否是错误响应
    if (response.error) {
      const errorCode = response.error.code;
      const errorMessage = response.error.message;
      
      if (errorCode === 429) {
        console.log('⚠️  速率限制: 免费模型暂时被限流，这不表示不支持工具调用');
        console.log('💡 建议: 等待几分钟后重试，或添加 API Key 获得更高限额');
        return { supported: 'rate_limited', error: response.error };
      } else if (errorCode === 400 && errorMessage.includes('tool')) {
        console.log('❌ 模型不支持工具调用');
        return { supported: false, error: response.error };
      } else {
        console.log(`❌ 其他错误 (${errorCode}): ${errorMessage}`);
        return { supported: 'unknown', error: response.error };
      }
    }
    
    // 检查是否有工具调用
    if (response.content) {
      const hasToolCall = response.content.some(item => item.type === 'tool_use');
      
      if (hasToolCall) {
        console.log('✅ 模型支持工具调用');
        console.log('🔧 检测到工具调用:', response.content.filter(item => item.type === 'tool_use').map(item => item.name).join(', '));
        return { supported: true, details: response };
      } else {
        console.log('⚠️  模型可能不支持工具调用或未触发工具使用');
        console.log('📝 响应内容:', response.content[0]?.text?.substring(0, 100) + '...');
        return { supported: false, details: response };
      }
    } else {
      console.log('❌ 工具调用测试失败: 无响应内容');
      return { supported: false, error: '无响应内容' };
    }
  } catch (error) {
    console.log('❌ 工具调用测试失败:', error.message);
    return { supported: false, error: error.message };
  }
}

function testConnectionCcr() {
  try {
    console.log('🔄 测试配置 (CCR 模式)...');
    
    // 尝试启动服务
    console.log('🚀 启动服务...');
    execSync('ccr start', { stdio: 'pipe' });
    
    // 等待服务启动
    setTimeout(() => {
      try {
        // 测试简单请求
        console.log('🧪 测试请求...');
        execSync('ccr code "hello"', { stdio: 'pipe' });
        console.log('✅ CCR 模式连接测试成功');
      } catch (error) {
        console.log('❌ CCR 模式连接测试失败:', error.message);
      } finally {
        // 停止服务
        try {
          execSync('ccr stop', { stdio: 'pipe' });
        } catch {}
      }
    }, 3000);
    
  } catch (error) {
    console.log('❌ CCR 模式测试失败:', error.message);
  }
}

function testConnectionDocker() {
  try {
    console.log('🔄 测试配置 (Docker 模式)...');
    
    const userHome = process.env.HOME || process.env.USERPROFILE;
    const configPath = path.join(userHome, '.claude-code-router', 'config.json');
    
    if (!fs.existsSync(configPath)) {
      console.log('❌ 配置文件不存在:', configPath);
      return;
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const baseUrl = `http://localhost:${config.PORT || 3456}`;
    const apiKey = config.APIKEY || 'runweok';
    
    // 获取第一个可用的模型
    let testModel = 'gpt-3.5-turbo'; // 默认模型
    if (config.Providers && config.Providers.length > 0) {
      const firstProvider = config.Providers[0];
      if (firstProvider.models && firstProvider.models.length > 0) {
        testModel = `${firstProvider.name}/${firstProvider.models[0]}`;
      }
    }
    
    console.log('🧪 Claude Code Router API 测试');
    console.log('==================================');
    console.log(`📋 测试模型: ${testModel}`);
    console.log(`🌐 API 端点: ${baseUrl}`);
    console.log('');
    
    const testResults = {
      basic: false,
      background: false,
      thinking: false,
      toolCalling: false
    };
    
    // 测试1: 默认路由
    console.log('📝 测试1: 默认路由 (代码开发)');
    try {
      const result1 = execSync(`curl -s -X POST "${baseUrl}/v1/messages" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${apiKey}" \
        -d '{
          "model": "${testModel}",
          "messages": [
            {"role": "user", "content": "写一个Python函数来计算斐波那契数列"}
          ],
          "max_tokens": 500
        }'`, { encoding: 'utf8' });
      
      const response1 = JSON.parse(result1);
      if (response1.content && response1.content.length > 0) {
        console.log('✅ 默认路由测试成功');
        testResults.basic = true;
      } else {
        console.log('❌ 默认路由测试失败: 无响应内容');
      }
    } catch (error) {
      console.log('❌ 默认路由测试失败:', error.message);
    }
    
    console.log('\n🔄 测试2: 后台路由 (中文文档处理)');
    try {
      const result2 = execSync(`curl -s -X POST "${baseUrl}/v1/messages" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${apiKey}" \
        -d '{
          "model": "${testModel}",
          "messages": [
            {"role": "user", "content": "请用中文解释什么是微服务架构"}
          ],
          "max_tokens": 500
        }'`, { encoding: 'utf8' });
      
      const response2 = JSON.parse(result2);
      if (response2.content && response2.content.length > 0) {
        console.log('✅ 后台路由测试成功');
        testResults.background = true;
      } else {
        console.log('❌ 后台路由测试失败: 无响应内容');
      }
    } catch (error) {
      console.log('❌ 后台路由测试失败:', error.message);
    }
    
    console.log('\n🤔 测试3: 思考路由 (复杂推理)');
    try {
      const result3 = execSync(`curl -s -X POST "${baseUrl}/v1/messages" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${apiKey}" \
        -d '{
          "model": "${testModel}",
          "messages": [
            {"role": "user", "content": "设计一个分布式系统的缓存策略"}
          ],
          "thinking": true,
          "max_tokens": 500
        }'`, { encoding: 'utf8' });
      
      const response3 = JSON.parse(result3);
      if (response3.content && response3.content.length > 0) {
        console.log('✅ 思考路由测试成功');
        testResults.thinking = true;
      } else {
        console.log('❌ 思考路由测试失败: 无响应内容');
      }
    } catch (error) {
      console.log('❌ 思考路由测试失败:', error.message);
    }
    
    // 测试4: 工具调用能力
    console.log('\n🔧 测试4: 工具调用能力检测');
    const toolResult = testToolCalling(baseUrl, apiKey, testModel);
    testResults.toolCalling = toolResult.supported;
    
    // 总结报告
    console.log('\n📊 测试结果总结');
    console.log('==================================');
    console.log(`📝 基础对话: ${testResults.basic ? '✅ 支持' : '❌ 失败'}`);
    console.log(`🔄 后台处理: ${testResults.background ? '✅ 支持' : '❌ 失败'}`);
    console.log(`🤔 复杂推理: ${testResults.thinking ? '✅ 支持' : '❌ 失败'}`);
    console.log(`🔧 工具调用: ${testResults.toolCalling ? '✅ 支持' : '❌ 不支持'}`);
    
    const successCount = Object.values(testResults).filter(Boolean).length;
    console.log(`\n🎯 总体成功率: ${successCount}/4 (${Math.round(successCount/4*100)}%)`);
    
    if (!testResults.toolCalling) {
      console.log('\n💡 工具调用建议:');
      console.log('   - 确认模型支持 Function Calling (如 GPT-4, Claude-3, DeepSeek-V3 等)');
      console.log('   - 检查 transformer 配置是否正确处理工具调用');
      console.log('   - 某些模型可能需要特定的 prompt 格式来触发工具使用');
    }
    
    console.log('\n✅ 所有测试完成！');
    console.log('💡 检查上面的输出，确认每个功能都正常工作');
    
  } catch (error) {
    console.log('❌ Docker 模式测试失败:', error.message);
  }
}

function testConnection() {
  const ccrAvailable = checkCcrAvailable();
  
  if (ccrAvailable) {
    console.log('🎯 检测到 CCR 命令，使用 CCR 模式测试');
    testConnectionCcr();
  } else {
    console.log('🐳 CCR 命令不可用，切换到 Docker 模式测试');
    testConnectionDocker();
  }
}

function showConfigInfo(configPath) {
  const userHome = process.env.HOME || process.env.USERPROFILE;
  const targetConfigPath = path.join(userHome, '.claude-code-router', 'config.json');
  
  if (!fs.existsSync(targetConfigPath)) {
    console.log('❌ 配置文件不存在:', targetConfigPath);
    return;
  }
  
  const { errors, warnings, config } = validateConfig(targetConfigPath);
  
  console.log('\n📊 配置状态报告');
  console.log('=' .repeat(50));
  
  if (errors.length > 0) {
    console.log('❌ 错误:');
    for (const error of errors) {
      console.log(`   - ${error}`);
    }
  } else {
    console.log('✅ 配置格式正确');
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  警告:');
    for (const warning of warnings) {
      console.log(`   - ${warning}`);
    }
  }
  
  if (config) {
    console.log('\n📋 配置摘要:');
    console.log(`   - 端口: ${config.PORT || 3456}`);
    console.log(`   - 日志: ${config.LOG ? '开启' : '关闭'}`);
    console.log(`   - 超时: ${config.API_TIMEOUT_MS || 600000}ms`);
    console.log(`   - 提供商数量: ${config.Providers?.length || 0}`);
    
    if (config.Router) {
      console.log('   - 路由配置:');
      for (const [key, value] of Object.entries(config.Router)) {
        console.log(`     - ${key}: ${value}`);
      }
    }
    
    // 分析模型的工具调用支持
    if (config.Providers) {
      console.log('\n🔧 模型工具调用支持分析:');
      for (const provider of config.Providers) {
        console.log(`   - ${provider.name}:`);
        if (provider.models) {
          for (const model of provider.models) {
            const modelSupport = analyzeToolCallSupport(provider.name, model);
            console.log(`     - ${model}: ${modelSupport}`);
          }
        }
      }
    }
  }
  
  console.log('\n🔧 操作建议:');
  if (errors.length > 0) {
    console.log('   - 请修复上述错误后重试');
  } else {
    console.log('   - 配置正常，可以开始使用');
    const ccrAvailable = checkCcrAvailable();
    if (ccrAvailable) {
      console.log('   - 运行 "ccr start" 启动服务');
      console.log('   - 运行 "ccr code \\"hello\\"" 测试连接');
    } else {
      console.log('   - CCR 命令不可用，请确保服务已启动在端口 ' + (config?.PORT || 3456));
      console.log('   - 或者安装 claude-code-router CLI: npm install -g @musistudio/claude-code-router');
    }
    console.log('   - 运行 "node validate-config.js test" 进行完整功能测试（包括工具调用）');
  }
}

function analyzeToolCallSupport(providerName, modelName) {
  // 基于已知模型的工具调用支持情况进行分析
  const toolCallSupportedModels = {
    'openai': {
      'gpt-4': '✅ 完全支持',
      'gpt-4-turbo': '✅ 完全支持', 
      'gpt-4o': '✅ 完全支持',
      'gpt-3.5-turbo': '✅ 支持',
      'gpt-3.5': '✅ 支持'
    },
    'anthropic': {
      'claude-3': '✅ 完全支持',
      'claude-3.5': '✅ 完全支持'
    },
    'deepseek': {
      'deepseek-chat': '✅ 支持',
      'deepseek-v3': '✅ 完全支持'
    },
    'gemini': {
      'gemini-pro': '✅ 支持',
      'gemini-2.5': '✅ 完全支持'
    }
  };
  
  // 检查精确匹配
  if (toolCallSupportedModels[providerName]) {
    for (const [pattern, support] of Object.entries(toolCallSupportedModels[providerName])) {
      if (modelName.toLowerCase().includes(pattern)) {
        return support;
      }
    }
  }
  
  // 检查通用模式
  const modelLower = modelName.toLowerCase();
  if (modelLower.includes('gpt-4') || modelLower.includes('claude-3') || 
      modelLower.includes('deepseek') || modelLower.includes('gemini')) {
    return '🟡 可能支持';
  }
  
  return '❓ 未知';
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'validate':
    showConfigInfo();
    break;
  case 'test':
    testConnection();
    break;
  default:
    console.log('用法:');
    console.log('  node validate-config.js validate  - 验证配置');
    console.log('  node validate-config.js test     - 测试连接 (自动选择 CCR 或 Docker 模式)');
    console.log('');
    console.log('测试模式说明:');
    console.log('  - CCR 模式: 使用 ccr 命令进行测试 (需要安装 claude-code-router CLI)');
    console.log('  - Docker 模式: 使用 curl 直接测试 API 端点 (适用于 Docker 部署)');
    console.log('');
    console.log('功能测试包括:');
    console.log('  - 📝 基础对话能力');
    console.log('  - 🔄 后台处理能力');
    console.log('  - 🤔 复杂推理能力');
    console.log('  - 🔧 工具调用能力 (Function Calling)');
    break;
}