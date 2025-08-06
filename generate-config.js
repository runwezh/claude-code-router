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

// Load configuration template from config-schemes
function loadConfigTemplate(templatePath) {
  if (!fs.existsSync(templatePath)) {
    console.log('❌ Config template file not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(templatePath, 'utf8');
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  
  if (!jsonMatch) {
    console.log('❌ Invalid config template format');
    process.exit(1);
  }
  
  try {
    return JSON.parse(jsonMatch[1]);
  } catch (error) {
    console.log('❌ Failed to parse config template');
    process.exit(1);
  }
}

// Generate config.json from environment variables and template
function generateConfig(env, template) {
  // Override template with environment variables
  const config = {
    APIKEY: env.ROUTER_APIKEY || template.APIKEY,
    HOST: env.ROUTER_HOST || template.HOST,
    PORT: Number.parseInt(env.ROUTER_PORT) || template.PORT,
    LOG: env.ROUTER_LOG === 'true' ? true : template.LOG,
    API_TIMEOUT_MS: Number.parseInt(env.ROUTER_API_TIMEOUT_MS) || template.API_TIMEOUT_MS,
    Providers: template.Providers.map(provider => {
      // Override provider config with environment variables
      return {
        name: provider.name,
        api_base_url: env[`${provider.name.toUpperCase()}_BASE_URL`] || provider.api_base_url,
        api_key: env[`${provider.name.toUpperCase()}_API_KEY`] || provider.api_key,
        models: provider.models,
        transformer: provider.transformer
      };
    }),
    Router: template.Router
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
  const templatePath = path.join(__dirname, 'config-scheme.md');
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.claude-code-router', 'config.json');
  
  console.log('🔧 从模板和环境变量生成配置...\n');
  
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
  
  // Load config template from config-schemes
  const templateConfig = loadConfigTemplate(path.join(__dirname, 'config-schemes', 'free-config.md'));
  
  const config = generateConfig(env, templateConfig);
  
  console.log('\n📄 生成的配置:');
  console.log(JSON.stringify(config, null, 2));
  
  let confirm = process.argv.includes('--force');
  
  if (!confirm) {
    const readline = await import('node:readline');
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

export { loadEnvFile, loadConfigTemplate, generateConfig, saveConfig };