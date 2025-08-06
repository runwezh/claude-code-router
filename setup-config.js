#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const configs = {
  '1': {
    name: '完全免费配置',
    description: '100%免费使用，适合个人学习',
    cost: '$0/月',
    file: 'free-config.md'
  },
  '2': {
    name: '混合经济配置',
    description: '性价比最高，85-90% Claude体验',
    cost: '$2-3/月',
    file: 'mixed-config.md',
    recommended: true
  },
  '3': {
    name: '专业开发者配置',
    description: '专注代码开发，高质量输出',
    cost: '$5-8/月',
    file: 'professional-config.md'
  },
  '4': {
    name: '智能路由配置',
    description: '自动选择最佳模型，智能化调度',
    cost: '$3-5/月',
    file: 'smart-config.md',
    recommended: true
  }
};

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function extractJsonFromMarkdown(markdownContent) {
  const jsonMatch = markdownContent.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    return jsonMatch[1];
  }
  return null;
}

async function setupConfig() {
  console.log('\n🎯 Claude Code Router 配置向导\n');
  console.log('请选择一个配置方案：\n');
  
  for (const [key, config] of Object.entries(configs)) {
    const recommended = config.recommended ? ' ⭐推荐' : '';
    console.log(`${key}. ${config.name}${recommended}`);
    console.log(`   ${config.description}`);
    console.log(`   成本: ${config.cost}\n`);
  }
  
  const choice = await question('请输入选择 (1-4): ');
  
  if (!configs[choice]) {
    console.log('❌ 无效选择，请重新运行脚本');
    rl.close();
    return;
  }
  
  const selectedConfig = configs[choice];
  console.log(`\n✅ 已选择: ${selectedConfig.name}`);
  
  const configDir = path.join(__dirname, 'config-schemes');
  const configPath = path.join(configDir, selectedConfig.file);
  
  if (!fs.existsSync(configPath)) {
    console.log('❌ 配置文件不存在');
    rl.close();
    return;
  }
  
  const markdownContent = fs.readFileSync(configPath, 'utf8');
  const jsonConfig = extractJsonFromMarkdown(markdownContent);
  
  if (!jsonConfig) {
    console.log('❌ 无法解析配置文件');
    rl.close();
    return;
  }
  
  console.log('\n📋 配置预览：');
  console.log(jsonConfig);
  
  const confirm = await question('\n是否应用此配置？(y/N): ');
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ 配置已取消');
    rl.close();
    return;
  }
  
  const userHome = process.env.HOME || process.env.USERPROFILE;
  const targetConfigPath = path.join(userHome, '.claude-code-router', 'config.json');
  
  // 确保目录存在
  const configDirPath = path.dirname(targetConfigPath);
  if (!fs.existsSync(configDirPath)) {
    fs.mkdirSync(configDirPath, { recursive: true });
  }
  
  // 备份现有配置
  if (fs.existsSync(targetConfigPath)) {
    const backupPath = path.join(configDirPath, `config.backup.${Date.now()}.json`);
    fs.copyFileSync(targetConfigPath, backupPath);
    console.log(`💾 现有配置已备份到: ${backupPath}`);
  }
  
  fs.writeFileSync(targetConfigPath, jsonConfig);
  console.log(`✅ 配置已保存到: ${targetConfigPath}`);
  
  console.log('\n🔧 请按以下步骤完成设置：');
  console.log('1. 编辑配置文件，替换以下占位符：');
  console.log('   - "your-router-secret-key" → 您的密钥');
  console.log('   - "sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" → OpenRouter API密钥');
  console.log('2. 运行: ccr restart');
  console.log('3. 测试: ccr code "hello"');
  
  rl.close();
}

setupConfig().catch(console.error);