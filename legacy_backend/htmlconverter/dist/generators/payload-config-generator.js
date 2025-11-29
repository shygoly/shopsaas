export class PayloadConfigGenerator {
    generatePayloadConfig(dynamicContent, collectionName) {
        const fields = dynamicContent.map((item) => this.convertToPayloadField(item));
        const collection = {
            slug: this.slugify(collectionName),
            labels: {
                singular: collectionName,
                plural: `${collectionName}s`,
            },
            fields: [
                ...fields,
                {
                    name: 'status',
                    type: 'select',
                    label: 'Status',
                    defaultValue: 'draft',
                    options: [
                        { label: 'Draft', value: 'draft' },
                        { label: 'Published', value: 'published' },
                    ],
                },
            ],
            timestamps: true,
        };
        return { collection, fields };
    }
    convertToPayloadField(analysis) {
        const baseField = {
            name: analysis.fieldName,
            type: analysis.fieldType,
            label: this.generateLabel(analysis),
            required: analysis.validation?.required ?? false,
        };
        switch (analysis.fieldType) {
            case 'text':
                return {
                    ...baseField,
                    defaultValue: analysis.content,
                };
            case 'richText':
                return {
                    ...baseField,
                    defaultValue: [{ children: [{ text: analysis.content }] }],
                };
            case 'select': {
                const options = this.parseSelectOptions(analysis.content);
                return {
                    ...baseField,
                    options: options.length
                        ? options
                        : [
                            { label: 'Option 1', value: 'option1' },
                            { label: 'Option 2', value: 'option2' },
                        ],
                };
            }
            case 'array':
                return {
                    ...baseField,
                    fields: this.generateArrayFields(analysis),
                };
            case 'upload':
                return {
                    ...baseField,
                    relationTo: 'media',
                };
            default:
                return baseField;
        }
    }
    generateLabel(analysis) {
        const contextLabels = {
            heading: 'Heading',
            content: 'Content',
            ui_text: 'Label',
            card_grid: 'Cards',
            list: 'List Items',
            media: 'Image',
            form_selection: 'Selection',
        };
        const contextLabel = contextLabels[analysis.context] ?? 'Field';
        const contentPreview = analysis.content.length > 20
            ? `${analysis.content.substring(0, 20)}...`
            : analysis.content;
        return `${contextLabel} - ${contentPreview}`;
    }
    parseSelectOptions(content) {
        if (content.includes(',')) {
            return content.split(',').map((opt) => {
                const trimmed = opt.trim();
                return {
                    label: trimmed,
                    value: trimmed.toLowerCase().replace(/\s+/g, '_'),
                };
            });
        }
        return [];
    }
    generateArrayFields(analysis) {
        switch (analysis.context) {
            case 'card_grid':
                return [
                    {
                        name: 'title',
                        type: 'text',
                        label: 'Title',
                        required: true,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        label: 'Description',
                    },
                    {
                        name: 'image',
                        type: 'upload',
                        label: 'Image',
                        relationTo: 'media',
                    },
                ];
            case 'list':
                return [
                    {
                        name: 'text',
                        type: 'text',
                        label: 'Item Text',
                        required: true,
                    },
                ];
            default:
                return [
                    {
                        name: 'text',
                        type: 'text',
                        label: 'Text',
                    },
                ];
        }
    }
    slugify(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    generateCompleteConfig(collections) {
        return `// payload.config.ts
import path from 'path';
import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';

export default buildConfig({
  collections: [
    ${collections.map((collection) => this.generateCollectionConfig(collection)).join(',\n    ')}
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  editor: slateEditor({}),
  admin: {
    bundler: webpackBundler(),
  },
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
});
`;
    }
    generateCollectionConfig(collection) {
        return `{
  slug: '${collection.slug}',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    ${collection.fields.map((field) => this.generateFieldConfig(field)).join(',\n    ')}
  ],
  timestamps: ${collection.timestamps ?? true}
}`;
    }
    generateFieldConfig(field) {
        let config = `{
      name: '${field.name}',
      type: '${field.type}',
      label: '${field.label}'`;
        if (field.required) {
            config += `,\n      required: true`;
        }
        if (field.defaultValue !== undefined) {
            config += `,\n      defaultValue: ${JSON.stringify(field.defaultValue)}`;
        }
        if (field.options) {
            config += `,\n      options: [\n        ${field.options
                .map((opt) => `{ label: '${opt.label}', value: '${opt.value}' }`)
                .join(',\n        ')}\n      ]`;
        }
        if (field.fields) {
            config += `,\n      fields: [\n        ${field.fields
                .map((subField) => this.generateFieldConfig(subField))
                .join(',\n        ')}\n      ]`;
        }
        if (field.relationTo) {
            config += `,\n      relationTo: '${field.relationTo}'`;
        }
        config += '\n    }';
        return config;
    }
}
