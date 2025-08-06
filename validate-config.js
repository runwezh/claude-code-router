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

function testConnection(configPath) {
  try {
    console.log('🔄 测试配置...');
    
    // 检查 ccr 命令是否可用
    execSync('which ccr', { stdio: 'pipe' });
    
    // 尝试启动服务
    console.log('🚀 启动服务...');
    execSync('ccr start', { stdio: 'pipe' });
    
    // 等待服务启动
    setTimeout(() => {
      try {
        // 测试简单请求
        console.log('🧪 测试请求...');
        execSync('ccr code "hello"', { stdio: 'pipe' });
        console.log('✅ 连接测试成功');
      } catch (error) {
        console.log('❌ 连接测试失败');
      } finally {
        // 停止服务
        execSync('ccr stop', { stdio: 'pipe' });
      }
    }, 3000);
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
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
  }
  
  console.log('\n🔧 操作建议:');
  if (errors.length > 0) {
    console.log('   - 请修复上述错误后重试');
  } else {
    console.log('   - 配置正常，可以开始使用');
    console.log('   - 运行 "ccr start" 启动服务');
    console.log('   - 运行 "ccr code \\"hello\\"" 测试连接');
  }
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
    console.log('  node validate-config.js test     - 测试连接');
    break;
}