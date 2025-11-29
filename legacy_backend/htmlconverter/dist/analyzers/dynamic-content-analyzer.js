export class DynamicContentAnalyzer {
    analyzeDynamicContent(html, _componentAnalysis) {
        const dynamicElements = [];
        dynamicElements.push(...this.analyzeTextPatterns(html));
        dynamicElements.push(...this.analyzeRepeatablePatterns(html));
        dynamicElements.push(...this.analyzeMediaPatterns(html));
        dynamicElements.push(...this.analyzeSelectorPatterns(html));
        return this.deduplicateFields(dynamicElements);
    }
    analyzeTextPatterns(html) {
        const patterns = [];
        const headings = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g) ?? [];
        headings.forEach((heading, index) => {
            const content = heading.replace(/<[^>]*>/g, '');
            patterns.push({
                element: heading.match(/<h[1-6]/)?.[0] ?? 'h2',
                content,
                fieldType: 'text',
                fieldName: this.generateFieldName(`heading_${index + 1}`, content),
                isRepeatable: false,
                context: 'heading',
            });
        });
        const paragraphs = html.match(/<p[^>]*>([^<]+)<\/p>/g) ?? [];
        paragraphs.forEach((paragraph, index) => {
            const content = paragraph.replace(/<[^>]*>/g, '');
            if (content.length > 20) {
                patterns.push({
                    element: 'p',
                    content,
                    fieldType: 'richText',
                    fieldName: this.generateFieldName(`content_${index + 1}`, content),
                    isRepeatable: false,
                    context: 'content',
                });
            }
        });
        const labels = html.match(/<label[^>]*>([^<]+)<\/label>|<button[^>]*>([^<]+)<\/button>/g) ??
            [];
        labels.forEach((label) => {
            const content = label.replace(/<[^>]*>/g, '');
            patterns.push({
                element: label.startsWith('<label') ? 'label' : 'button',
                content,
                fieldType: 'text',
                fieldName: this.generateFieldName('label', content),
                isRepeatable: false,
                context: 'ui_text',
            });
        });
        return patterns;
    }
    analyzeRepeatablePatterns(html) {
        const patterns = [];
        const cardGrids = html.match(/<div[^>]*class="[^"]*grid[^"]*"[^>]*>[\s\S]*?<\/div>/g) ?? [];
        cardGrids.forEach((grid) => {
            const cards = grid.match(/<div[^>]*class="[^"]*card[^"]*"[^>]*>[\s\S]*?<\/div>/g) ?? [];
            if (cards.length >= 2) {
                const sampleCard = cards[0];
                if (sampleCard && sampleCard.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/)) {
                    patterns.push({
                        element: 'div.card',
                        content: sampleCard.replace(/<[^>]*>/g, '').trim().slice(0, 50),
                        fieldType: 'array',
                        fieldName: 'cards',
                        isRepeatable: true,
                        context: 'card_grid',
                    });
                }
            }
        });
        const lists = html.match(/<ul[^>]*>[\s\S]*?<\/ul>|<ol[^>]*>[\s\S]*?<\/ol>/g) ?? [];
        lists.forEach((list, listIndex) => {
            const items = list.match(/<li[^>]*>([^<]+)<\/li>/g) ?? [];
            if (items.length >= 2) {
                patterns.push({
                    element: 'li',
                    content: items[0]?.replace(/<[^>]*>/g, '') ?? 'item',
                    fieldType: 'array',
                    fieldName: `list_items_${listIndex + 1}`,
                    isRepeatable: true,
                    context: 'list',
                });
            }
        });
        return patterns;
    }
    analyzeMediaPatterns(html) {
        const patterns = [];
        const images = html.match(/<img[^>]*src="([^"]*)"[^>]*>/g) ?? [];
        images.forEach((img, index) => {
            const altMatch = img.match(/alt="([^"]*)"/);
            patterns.push({
                element: 'img',
                content: altMatch?.[1] ?? `Image ${index + 1}`,
                fieldType: 'upload',
                fieldName: this.generateFieldName('image', altMatch?.[1] ?? `image_${index + 1}`),
                isRepeatable: false,
                context: 'media',
            });
        });
        return patterns;
    }
    analyzeSelectorPatterns(html) {
        const patterns = [];
        const selects = html.match(/<select[^>]*>[\s\S]*?<\/select>/g) ?? [];
        selects.forEach((select, selectIndex) => {
            const options = select.match(/<option[^>]*value="([^"]*)"[^>]*>([^<]+)<\/option>/g) ?? [];
            if (options.length > 0) {
                const optionValues = options.map((opt) => {
                    const valueMatch = opt.match(/value="([^"]*)"/);
                    const textMatch = opt.match(/>([^<]+)</);
                    return {
                        value: valueMatch?.[1] ?? textMatch?.[1] ?? '',
                        label: textMatch?.[1] ?? valueMatch?.[1] ?? '',
                    };
                });
                patterns.push({
                    element: 'select',
                    content: optionValues.map((ov) => ov.label).join(', '),
                    fieldType: 'select',
                    fieldName: `selection_${selectIndex + 1}`,
                    isRepeatable: false,
                    context: 'form_selection',
                    validation: { required: select.includes('required') },
                });
            }
        });
        return patterns;
    }
    generateFieldName(baseName, content) {
        const cleanContent = content
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .slice(0, 30);
        return cleanContent || baseName;
    }
    deduplicateFields(fields) {
        const seen = new Set();
        return fields.filter((field) => {
            const key = `${field.fieldName}_${field.fieldType}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}
