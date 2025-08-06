#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('❌ .env file not found');
    return {};
  }
  
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        env[key.trim()] = values.join('=').trim();
      }
    }
  });
  
  return env;
}

// Generate config.json from environment variables
function generateConfig(env) {
  const models = env.DEFAULT_MODELS ? env.DEFAULT_MODELS.split(',') : [];
  
  const config = {
    APIKEY: env.ROUTER_APIKEY || 'your-router-secret-key',
    HOST: env.ROUTER_HOST || '0.0.0.0',
    PORT: parseInt(env.ROUTER_PORT) || 3456,
    LOG: env.ROUTER_LOG === 'true',
    API_TIMEOUT_MS: parseInt(env.ROUTER_API_TIMEOUT_MS) || 600000,
    Providers: [
      {
        name: 'openrouter',
        api_base_url: env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions',
        api_key: env.OPENROUTER_API_KEY || 'sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        models: models,
        transformer: {
          use: ['openrouter']
        }
      }
    ],
    Router: {
      default: env.DEFAULT_ROUTE || 'openrouter,qwen/qwen3-coder',
      background: env.BACKGROUND_ROUTE || 'openrouter,z-ai/glm-4.5-air:free',
      think: env.THINK_ROUTE || 'openrouter,deepseek/deepseek-r1-0528-qwen3-8b:free',
      longContext: env.LONGCONTEXT_ROUTE || 'openrouter,qwen/qwen3-235b-a22b:free',
      longContextThreshold: parseInt(env.LONGCONTEXT_THRESHOLD) || 60000,
      webSearch: env.WEBSEARCH_ROUTE || 'openrouter,qwen/qwen3-coder'
    }
  };
  
  return config;
}

// Save config to file
function saveConfig(config, outputPath) {
  const configDir = path.dirname(outputPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Backup existing config
  if (fs.existsSync(outputPath)) {
    const backupPath = path.join(configDir, `config.backup.${Date.now()}.json`);
    fs.copyFileSync(outputPath, backupPath);
    console.log(`💾 现有配置已备份到: ${backupPath}`);
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
  console.log(`✅ 配置已生成: ${outputPath}`);
}

// Main function
async function main() {
  const envPath = path.join(__dirname, '.env');
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.claude-code-router', 'config.json');
  
  console.log('🔧 从 .env 文件生成配置...\n');
  
  const env = loadEnvFile(envPath);
  
  if (Object.keys(env).length === 0) {
    console.log('❌ 无法加载 .env 文件');
    return;
  }
  
  console.log('📋 当前环境变量:');
  for (const [key, value] of Object.entries(env)) {
    if (key.includes('API_KEY') || key.includes('APIKEY')) {
      console.log(`   ${key}: ${value.substring(0, 8)}...`);
    } else {
      console.log(`   ${key}: ${value}`);
    }
  }
  
  const config = generateConfig(env);
  
  console.log('\n📄 生成的配置:');
  console.log(JSON.stringify(config, null, 2));
  
  let confirm = process.argv.includes('--force') ? true : false;
  
  if (!confirm) {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('\n是否应用此配置？(y/N): ', resolve);
    });
    
    confirm = answer.toLowerCase() === 'y';
    rl.close();
  }
  
  if (confirm) {
    saveConfig(config, configPath);
    console.log('\n🎉 配置生成完成！');
    console.log('💡 运行以下命令启动服务:');
    console.log('   docker compose up -d');
    console.log('   # 或者');
    console.log('   ccr restart');
  } else {
    console.log('❌ 配置生成已取消');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { loadEnvFile, generateConfig, saveConfig };