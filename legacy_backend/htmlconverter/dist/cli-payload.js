import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { PayloadAwareConverter } from './converters/payload-aware-converter.js';
const program = new Command();
program
    .name('html-to-payload')
    .description('将 HTML 转换为 Payload CMS + React 组件')
    .version('1.0.0');
program
    .argument('<input-file>', '输入的 HTML 文件')
    .requiredOption('-c, --collection <name>', 'Payload 集合名称')
    .option('-o, --output-dir <dir>', '输出目录', './payload-output')
    .option('--api-key <key>', 'OpenAI API 密钥')
    .action(async (inputFile, options) => {
    try {
        console.log('开始 Payload 转换...');
        const html = readFileSync(inputFile, 'utf-8');
        mkdirSync(options.outputDir, { recursive: true });
        const converter = new PayloadAwareConverter(options.apiKey, {
            useAI: true,
            model: 'gpt-4',
        });
        const result = await converter.convertWithPayload(html, options.collection);
        writeFileSync(`${options.outputDir}/${options.collection}.tsx`, result.components.react);
        writeFileSync(`${options.outputDir}/payload.config.ts`, result.components.payloadConfig);
        writeFileSync(`${options.outputDir}/dynamic-mappings.json`, JSON.stringify(result.dynamicMappings, null, 2));
        console.log(`✅ Payload 转换完成！`);
        console.log(`📁 输出目录: ${options.outputDir}`);
        console.log('📄 生成文件:');
        console.log(`   - ${options.collection}.tsx (React 组件)`);
        console.log('   - payload.config.ts (Payload 配置)');
        console.log('   - dynamic-mappings.json (内容映射)');
        console.log('\n🎯 识别的动态字段:');
        result.dynamicMappings.forEach((mapping) => {
            console.log(`   - ${mapping.fieldName} (${mapping.fieldType}): ${mapping.content.substring(0, 50)}...`);
        });
    }
    catch (error) {
        console.error('❌ Payload 转换失败:', error?.message ?? error);
        process.exit(1);
    }
});
program.parse();
