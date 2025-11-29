import { loadHtml } from '../utils/html-parser.js';
import { StyleMapper } from './style-mapper.js';
const CARD_CLASS = 'rounded-lg border border-border bg-card p-6 shadow-sm';
export class RuleConverter {
    convertSimpleComponents(html) {
        const $ = loadHtml(html);
        const imports = new Set(["import React from 'react';"]);
        const components = [];
        const snippets = [];
        $('button').each((index, element) => {
            const text = $(element).text().trim() || `Button ${index + 1}`;
            const classAttr = $(element).attr('class') ?? '';
            const tailwindClasses = StyleMapper.mapClassList(classAttr);
            const variant = StyleMapper.inferVariant(classAttr);
            imports.add("import { Button } from '@/components/ui/button';");
            components.push({
                component: 'Button',
                importPath: '@/components/ui/button',
                props: { children: text, variant },
                children: [],
                tailwindClasses,
            });
            snippets.push(`    <Button variant="${variant}"${tailwindClasses.length ? ` className="${tailwindClasses.join(' ')}"` : ''}>${text}</Button>`);
        });
        $('input').each((index, element) => {
            const type = $(element).attr('type') ?? 'text';
            const placeholder = $(element).attr('placeholder') ?? '';
            const classAttr = $(element).attr('class') ?? '';
            const tailwindClasses = StyleMapper.mapClassList(classAttr);
            imports.add("import { Input } from '@/components/ui/input';");
            components.push({
                component: 'Input',
                importPath: '@/components/ui/input',
                props: { type, placeholder },
                children: [],
                tailwindClasses,
            });
            snippets.push(`    <Input type="${type}"${placeholder ? ` placeholder="${placeholder}"` : ''}${tailwindClasses.length ? ` className="${tailwindClasses.join(' ')}"` : ''} />`);
        });
        $('select').each((index, element) => {
            const classAttr = $(element).attr('class') ?? '';
            const tailwindClasses = StyleMapper.mapClassList(classAttr);
            const options = $(element)
                .find('option')
                .map((_, option) => ({
                value: $(option).attr('value') ?? $(option).text().trim(),
                label: $(option).text().trim(),
            }))
                .get();
            imports.add("import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';");
            components.push({
                component: 'Select',
                importPath: '@/components/ui/select',
                props: { placeholder: options[0]?.label ?? 'Choose an option' },
                children: options.map((opt) => ({
                    component: 'SelectItem',
                    importPath: '@/components/ui/select',
                    props: { value: opt.value },
                    children: [],
                    tailwindClasses: [],
                })),
                tailwindClasses,
            });
            const optionSnippets = options
                .map((opt) => `        <SelectItem value="${opt.value}">${opt.label}</SelectItem>`)
                .join('\n');
            snippets.push([
                '    <Select>',
                `      <SelectTrigger${tailwindClasses.length ? ` className="${tailwindClasses.join(' ')}"` : ''}><SelectValue placeholder="${options[0]?.label ?? 'Select'}" /></SelectTrigger>`,
                '      <SelectContent>',
                optionSnippets || '        {/* Select options were empty */}',
                '      </SelectContent>',
                '    </Select>',
            ].join('\n'));
        });
        $('[class*="card"]').each((index, element) => {
            const text = $(element).text().trim();
            const classAttr = $(element).attr('class') ?? '';
            const tailwindClasses = StyleMapper.mapClassList(classAttr);
            imports.add("import { Card, CardContent } from '@/components/ui/card';");
            components.push({
                component: 'Card',
                importPath: '@/components/ui/card',
                props: { body: text.slice(0, 60) },
                children: [],
                tailwindClasses,
            });
            const mergedClasses = [CARD_CLASS, ...tailwindClasses].join(' ').trim();
            snippets.push([
                `    <Card className="${mergedClasses}">`,
                `      <CardContent>${text || 'Card content'}</CardContent>`,
                '    </Card>',
            ].join('\n'));
        });
        const warningMessages = [];
        if (!snippets.length) {
            warningMessages.push('规则引擎未检测到可转换的元素，建议启用 AI 模式。');
        }
        const importLines = Array.from(imports);
        const code = [
            ...importLines,
            '',
            'export const RuleConvertedComponent: React.FC = () => (',
            '  <div className="space-y-4">',
            snippets.length ? snippets.join('\n') : '    {/* 无匹配的基础组件 */}',
            '  </div>',
            ');',
        ].join('\n');
        return {
            code,
            components,
            imports: importLines,
            warnings: warningMessages,
            analysis: [],
        };
    }
}
