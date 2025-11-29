#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AIConverter } from './converters/ai-converter.js';
import { PayloadAwareConverter } from './converters/payload-aware-converter.js';
dotenv.config();
const program = new Command();
program
    .name('html-to-radix')
    .description('将 HTML 转换为 Radix UI + Tailwind CSS React 组件')
    .version('1.0.0');
program
    .argument('<input-file>', '输入的 HTML 文件')
    .option('-o, --output <file>', '输出文件', 'output.tsx')
    .option('--api-key <key>', 'OpenAI/DeepSeek/Kimi API 密钥')
    .option('--model <model>', 'AI 模型 (如 gpt-4, deepseek-reasoner, kimi-k2-thinking)', '')
    .option('--provider <provider>', 'AI 提供商 openai|deepseek|kimi', '')
    .option('--no-ai', '不使用 AI（使用规则引擎）')
    .option('--css <file>', '可选的 CSS 文件')
    .option('--collection <name>', '同时生成 Payload 集合，指定集合名称')
    .option('--payload-dir <dir>', 'Payload 输出目录', './payload-output')
    .action(async (inputFile, options) => {
    try {
        console.log('开始转换...');
        const html = readFileSync(inputFile, 'utf-8');
        const css = options.css ? readFileSync(options.css, 'utf-8') : undefined;
        const useAI = options.ai !== undefined ? options.ai : true;
        const providerOption = options.provider?.toLowerCase();
        const envKeys = {
            openai: process.env.OPENAI_API_KEY,
            deepseek: process.env.DEEPSEEK_API_KEY,
            kimi: process.env.MOONSHOT_API_KEY,
        };
        const detectedProvider = () => {
            if (providerOption === 'deepseek')
                return 'deepseek';
            if (providerOption === 'openai')
                return 'openai';
            if (providerOption === 'kimi')
                return 'kimi';
            if (envKeys.openai)
                return 'openai';
            if (envKeys.deepseek)
                return 'deepseek';
            if (envKeys.kimi)
                return 'kimi';
            return 'openai';
        };
        const provider = detectedProvider();
        const resolvedApiKey = options.apiKey || envKeys[provider] || process.env.OPENAI_API_KEY;
        if (useAI && !resolvedApiKey) {
            throw new Error('AI 模式需要提供有效的 API Key，可在 .env 或 --api-key 中配置。');
        }
        if (options.collection && !useAI) {
            throw new Error('Payload 输出依赖 AI 模式，请不要使用 --no-ai。');
        }
        const resolvedModel = options.model ||
            (provider === 'deepseek'
                ? 'deepseek-reasoner'
                : provider === 'kimi'
                    ? 'kimi-k2-thinking'
                    : 'gpt-4');
        const conversionOptions = {
            useAI,
            model: resolvedModel,
            framework: 'react',
            language: 'typescript',
            temperature: 0.1,
            baseUrl: provider === 'deepseek'
                ? 'https://api.deepseek.com/v1'
                : provider === 'kimi'
                    ? 'https://api.moonshot.cn/v1'
                    : undefined,
            provider,
        };
        let result;
        if (useAI) {
            const converter = new AIConverter(resolvedApiKey, conversionOptions);
            result = await converter.convert(html, css);
        }
        else {
            const { RuleConverter } = await import('./converters/rule-converter.js');
            const converter = new RuleConverter();
            result = converter.convertSimpleComponents(html);
        }
        writeFileSync(options.output, result.code);
        console.log(`✅ 转换完成！输出文件: ${options.output}`);
        if (result.warnings.length > 0) {
            console.log('\n⚠️  警告:');
            result.warnings.forEach((warning) => console.log(`  - ${warning}`));
        }
        let payloadSummary;
        if (options.collection) {
            const payloadDir = options.payloadDir || './payload-output';
            mkdirSync(payloadDir, { recursive: true });
            const payloadConverter = new PayloadAwareConverter(resolvedApiKey, conversionOptions);
            const payloadResult = await payloadConverter.convertWithPayload(html, options.collection);
            const payloadReactPath = path.join(payloadDir, `${options.collection}.payload.tsx`);
            const payloadConfigPath = path.join(payloadDir, 'payload.config.ts');
            const mappingPath = path.join(payloadDir, 'dynamic-mappings.json');
            writeFileSync(payloadReactPath, payloadResult.components.react);
            writeFileSync(payloadConfigPath, payloadResult.components.payloadConfig);
            writeFileSync(mappingPath, JSON.stringify(payloadResult.dynamicMappings, null, 2));
            console.log('\n📦 Payload 输出:');
            console.log(`  - ${payloadReactPath}`);
            console.log(`  - ${payloadConfigPath}`);
            console.log(`  - ${mappingPath}`);
            payloadSummary = {
                collection: options.collection,
                dir: payloadDir,
                fields: payloadResult.collections[0]?.fields?.length ?? 0,
            };
        }
        const summary = {
            status: 'success',
            mode: useAI ? `ai:${provider}` : 'rule',
            output: options.output,
            imports: result.imports.length,
            components: result.components.length,
            warnings: result.warnings,
            payload: payloadSummary,
        };
        console.log('\nSummary:');
        console.log(JSON.stringify(summary, null, 2));
    }
    catch (error) {
        console.error('❌ 转换失败:', error?.message ?? error);
        process.exit(1);
    }
});
program.parse();
