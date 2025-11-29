// payload.config.ts
import path from 'path';
import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
export default buildConfig({
    collections: [
        {
            slug: 'aiassistantmanagement',
            admin: {
                useAsTitle: 'title',
            },
            fields: [
                {
                    name: 'the_dunder_mifflin_shop',
                    type: 'text',
                    label: 'Heading - The Dunder Mifflin S...',
                    defaultValue: "The Dunder Mifflin Shop"
                },
                {
                    name: 'ai_assistant_management',
                    type: 'text',
                    label: 'Heading - AI Assistant Managem...',
                    defaultValue: "AI Assistant Management"
                },
                {
                    name: 'ai_assistant_status',
                    type: 'text',
                    label: 'Heading - AI Assistant Status',
                    defaultValue: "AI Assistant Status"
                },
                {
                    name: 'what_does_the_ai_assistant_do',
                    type: 'text',
                    label: 'Heading - What does the AI Ass...',
                    defaultValue: "What does the AI Assistant do?"
                },
                {
                    name: 'automated_customer_support',
                    type: 'text',
                    label: 'Heading - Automated customer s...',
                    defaultValue: "Automated customer support"
                },
                {
                    name: 'product_recommendation_engine',
                    type: 'text',
                    label: 'Heading - Product recommendati...',
                    defaultValue: "Product recommendation engine"
                },
                {
                    name: 'sales_trend_analysis',
                    type: 'text',
                    label: 'Heading - Sales trend analysis',
                    defaultValue: "Sales trend analysis"
                },
                {
                    name: 'billing_details',
                    type: 'text',
                    label: 'Heading - Billing Details',
                    defaultValue: "Billing Details"
                },
                {
                    name: '_supercharge_your_shop_with_ai',
                    type: 'richText',
                    label: 'Content - Supercharge your shop with AI',
                    defaultValue: [{ "children": [{ "text": "\n                                Supercharge your shop with AI-powered features designed to boost sales and improve customer satisfaction.\n                            " }] }]
                },
                {
                    name: 'instantly_answer_common_custom',
                    type: 'richText',
                    label: 'Content - Instantly answer com...',
                    defaultValue: [{ "children": [{ "text": "Instantly answer common customer questions 24/7." }] }]
                },
                {
                    name: 'increase_average_order_value_w',
                    type: 'richText',
                    label: 'Content - Increase average ord...',
                    defaultValue: [{ "children": [{ "text": "Increase average order value with smart suggestions." }] }]
                },
                {
                    name: 'get_actionable_insights_from_y',
                    type: 'richText',
                    label: 'Content - Get actionable insig...',
                    defaultValue: [{ "children": [{ "text": "Get actionable insights from your sales data automatically." }] }]
                },
                {
                    name: '_note_charges_are_prorated_bas',
                    type: 'richText',
                    label: 'Content - Billing notice',
                    defaultValue: [{ "children": [{ "text": "\n                                        Note: Charges are prorated based on your activation date within the billing cycle.\n                                    " }] }]
                },
                {
                    name: 'enable_ai_assistant_for_this_s',
                    type: 'text',
                    label: 'Label - Enable AI Assistant ...',
                    defaultValue: "Enable AI Assistant for this shop"
                },
                {
                    name: '_save_changes_',
                    type: 'text',
                    label: 'Label - Save Changes button',
                    defaultValue: "\n                                Save Changes\n                            "
                },
                {
                    name: 'status',
                    type: 'select',
                    label: 'Status',
                    defaultValue: "draft",
                    options: [
                        { label: 'Draft', value: 'draft' },
                        { label: 'Published', value: 'published' }
                    ]
                }
            ],
            timestamps: true
        }
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
//# sourceMappingURL=payload.config.js.map