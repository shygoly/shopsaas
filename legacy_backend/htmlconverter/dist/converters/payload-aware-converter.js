import { AIConverter } from './ai-converter.js';
import { DynamicContentAnalyzer } from '../analyzers/dynamic-content-analyzer.js';
import { PayloadConfigGenerator } from '../generators/payload-config-generator.js';
export class PayloadAwareConverter extends AIConverter {
    constructor(apiKey, options) {
        super(apiKey, options);
        this.dynamicAnalyzer = new DynamicContentAnalyzer();
        this.payloadGenerator = new PayloadConfigGenerator();
    }
    async convertWithPayload(html, collectionName) {
        const regularResult = await this.convert(html);
        const dynamicContent = this.dynamicAnalyzer.analyzeDynamicContent(html, regularResult.analysis);
        const payloadConfig = this.payloadGenerator.generatePayloadConfig(dynamicContent, collectionName);
        const enhancedAnalysis = await this.enhanceWithAI(html, dynamicContent);
        const dynamicReactCode = await this.generateDynamicReactCode(regularResult.code, enhancedAnalysis, collectionName);
        return {
            collections: [payloadConfig.collection],
            components: {
                react: dynamicReactCode,
                payloadConfig: this.payloadGenerator.generateCompleteConfig([payloadConfig.collection]),
            },
            dynamicMappings: enhancedAnalysis,
        };
    }
    async enhanceWithAI(html, initialAnalysis) {
        const prompt = `
请分析以下 HTML 代码，识别所有可能从 CMS（如 Payload）动态获取的内容：

HTML:
${html}

已识别的内容：
${JSON.stringify(initialAnalysis, null, 2)}

请补充识别：
1. 可能遗漏的动态内容区域
2. 内容的语义含义和用途
3. 更适合的字段类型建议
4. 验证规则建议

请用 JSON 格式返回增强的分析结果。
`;
        try {
            const response = await this.getLLMResponse('你是 CMS 内容建模专家。识别 HTML 中的动态内容并建议合适的字段结构，输出 JSON。', prompt, 2000);
            return JSON.parse(this.stripCodeFence(response ?? '[]'));
        }
        catch (error) {
            console.warn('AI 增强分析失败，使用基础分析结果');
            return initialAnalysis;
        }
    }
    async generateDynamicReactCode(baseCode, dynamicContent, collectionName) {
        const prompt = `
请将以下 React 组件转换为支持 Payload CMS 动态数据的版本：

原始组件:
${baseCode}

动态内容映射:
${JSON.stringify(dynamicContent, null, 2)}

要求：
1. 添加从 Payload CMS 获取数据的逻辑
2. 使用合适的 Hook（useEffect, useState）
3. 添加加载状态和错误处理
4. 保持原有的样式和布局
5. 使用 TypeScript 类型

集合名称: ${collectionName}

请生成完整的组件代码。
`;
        try {
            const response = await this.getLLMResponse('你是 React 和 Payload CMS 集成专家。生成支持动态数据的组件代码。', prompt, 3000);
            return response || baseCode;
        }
        catch (error) {
            console.warn('生成 Payload 组件失败，返回基础代码', error);
            return baseCode;
        }
    }
}
