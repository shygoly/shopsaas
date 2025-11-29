import { OpenAI } from 'openai';
export class AIConverter {
    constructor(apiKey, options) {
        this.maxRetries = 2;
        this.openai = new OpenAI({ apiKey, baseURL: options.baseUrl });
        this.options = options;
    }
    async convert(html, css) {
        try {
            const { analysis, conversionPlan } = await this.analyzeAndPlan(html, css);
            const reactCode = (await this.generateReactCode({
                ...conversionPlan,
                analysis,
            })) || this.buildFallbackComponent(conversionPlan);
            return {
                code: reactCode,
                components: conversionPlan.components ?? [],
                imports: conversionPlan.imports ?? [],
                warnings: conversionPlan.warnings ?? [],
                analysis,
            };
        }
        catch (error) {
            throw new Error(`AI conversion failed: ${error?.message ?? error}`);
        }
    }
    async analyzeAndPlan(html, css) {
        const fallback = {
            analysis: [],
            conversionPlan: {
                components: [],
                imports: [],
                warnings: ['AI 响应解析失败，返回空方案'],
            },
        };
        const userPrompt = `
请阅读以下 HTML ${css ? '和 CSS ' : ''}内容，产出结构分析和 Radix UI 转换方案。请直接输出 JSON 字符串，不要包含 Markdown 代码块或多余文字。

HTML:
${html}

${css ? `CSS:\n${css}` : ''}

返回 JSON，格式如下：
{
  "analysis": ComponentAnalysis[],
  "conversionPlan": {
    "components": RadixMapping[],
    "imports": string[],
    "warnings": string[],
    "notes": string[]
  }
}
`;
        const result = await this.requestJSON('你是精通 Radix UI、TailwindCSS 与 Payload 的系统架构师，输出有效 JSON。', userPrompt, fallback);
        return {
            analysis: Array.isArray(result.analysis) ? result.analysis : [],
            conversionPlan: {
                components: result.conversionPlan?.components ?? [],
                imports: result.conversionPlan?.imports ?? [],
                warnings: result.conversionPlan?.warnings ?? [],
                notes: result.conversionPlan?.notes ?? [],
            },
        };
    }
    async requestJSON(systemPrompt, userPrompt, fallback) {
        for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
            let raw;
            try {
                raw = await this.getLLMResponse(systemPrompt, userPrompt, 3000);
                if (!raw) {
                    throw new Error('Empty response from OpenAI');
                }
                const cleaned = this.stripCodeFence(raw);
                return JSON.parse(cleaned);
            }
            catch (error) {
                const extracted = this.extractJsonPayload(raw);
                if (extracted) {
                    try {
                        return JSON.parse(extracted);
                    }
                    catch (innerError) {
                        // fall through to retry
                    }
                }
                if (attempt === this.maxRetries) {
                    console.warn('[AIConverter] JSON 解析失败，使用回退结果。', error);
                    return fallback;
                }
            }
        }
        return fallback;
    }
    extractJsonPayload(text) {
        if (!text)
            return undefined;
        const trimmed = this.stripCodeFence(text);
        const startBraces = ['{', '['];
        for (const startChar of startBraces) {
            const startIdx = trimmed.indexOf(startChar);
            if (startIdx === -1)
                continue;
            const endChar = startChar === '{' ? '}' : ']';
            let depth = 0;
            let inString = false;
            let escaped = false;
            for (let i = startIdx; i < trimmed.length; i += 1) {
                const char = trimmed[i];
                if (inString) {
                    if (escaped) {
                        escaped = false;
                    }
                    else if (char === '\\') {
                        escaped = true;
                    }
                    else if (char === '"') {
                        inString = false;
                    }
                }
                else if (char === '"') {
                    inString = true;
                }
                else if (char === startChar) {
                    depth += 1;
                }
                else if (char === endChar) {
                    depth -= 1;
                    if (depth === 0) {
                        return trimmed.slice(startIdx, i + 1);
                    }
                }
            }
        }
        return undefined;
    }
    async generateReactCode(conversionPlan) {
        const prompt = `
根据以下转换方案，生成完整的 React + TypeScript 代码：

转换方案:
${JSON.stringify(conversionPlan, null, 2)}

要求:
1. 使用函数组件和 TypeScript
2. 包含所有必要的导入
3. 使用现代 React 最佳实践 (Hooks)
4. 确保类型安全
5. 添加适当的注释
6. 保持代码整洁和可维护

请只返回代码，不要额外的解释或 Markdown 代码块。
`;
        try {
            const response = await this.getLLMResponse('你是专业的 React/TypeScript 开发者。生成高质量、可运行的代码。', prompt, 4000);
            return response;
        }
        catch (error) {
            console.warn('[AIConverter] 代码生成失败，将使用回退组件。', error);
            return '';
        }
    }
    stripCodeFence(text) {
        if (!text)
            return '';
        const trimmed = text.trim();
        if (trimmed.startsWith('```')) {
            return trimmed.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        }
        return trimmed;
    }
    async getLLMResponse(systemPrompt, userPrompt, maxTokens) {
        if (this.options.provider === 'deepseek' && this.options.baseUrl) {
            const response = await this.openai.responses.create({
                model: this.options.model ?? 'deepseek-reasoner',
                input: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_output_tokens: maxTokens,
            });
            return response.output_text?.trim() ?? '';
        }
        const completion = await this.openai.chat.completions.create({
            model: this.options.model ?? 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: this.options.temperature ?? 0.1,
            max_tokens: maxTokens,
        });
        return completion.choices[0].message?.content?.trim() ?? '';
    }
    buildFallbackComponent(conversionPlan) {
        const imports = (conversionPlan?.imports ?? []);
        const componentLines = (conversionPlan?.components ?? []).map((component) => `      {/* ${component?.component ?? 'Unknown component'} → ${component?.importPath ?? 'Unknown import'} */}`);
        return [
            "import React from 'react';",
            ...imports.filter((imp) => imp && !imp.includes("React")),
            '',
            'export const AIGeneratedComponent: React.FC = () => (',
            '  <div className="space-y-4">',
            componentLines.length ? componentLines.join('\n') : '      {/* 未生成任何组件 */}',
            '  </div>',
            ');',
        ]
            .filter(Boolean)
            .join('\n');
    }
    async convertWithHybrid(html, css) {
        const { RuleConverter } = await import('./rule-converter.js');
        const ruleConverter = new RuleConverter();
        const simpleResult = ruleConverter.convertSimpleComponents(html);
        const complexComponents = this.identifyComplexComponents(html);
        if (complexComponents.length > 0) {
            const aiResult = await this.convertComplexComponents(complexComponents, css);
            return this.mergeResults(simpleResult, aiResult);
        }
        return simpleResult;
    }
    identifyComplexComponents(html) {
        const complexPatterns = [
            /<form[^>]*>[\s\S]*?<\/form>/gi,
            /<div[^>]*class="[^"]*card[^"]*"[\s\S]*?<\/div>/gi,
            /<div[^>]*class="[^"]*grid[^"]*"[\s\S]*?<\/div>/gi,
        ];
        const complexComponents = [];
        complexPatterns.forEach((pattern) => {
            const matches = html.match(pattern);
            if (matches) {
                complexComponents.push(...matches);
            }
        });
        return complexComponents;
    }
    async convertComplexComponents(components, css) {
        const componentHtml = components.join('\n');
        return this.convert(componentHtml, css);
    }
    mergeResults(ruleResult, aiResult) {
        return {
            code: `${ruleResult.code}\n${aiResult.code}`.trim(),
            components: [...ruleResult.components, ...aiResult.components],
            imports: [...new Set([...ruleResult.imports, ...aiResult.imports])],
            warnings: [...ruleResult.warnings, ...aiResult.warnings],
            analysis: [...ruleResult.analysis, ...aiResult.analysis],
        };
    }
}
