// payload.config.ts
import path from 'path';
import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
export default buildConfig({
    collections: [
        {
            slug: 'creditandbilling',
            admin: {
                useAsTitle: 'title',
            },
            fields: [
                {
                    name: 'dr_sell',
                    type: 'text',
                    label: 'Heading - Dr. Sell',
                    defaultValue: "Dr. Sell"
                },
                {
                    name: 'credits_amp_billing',
                    type: 'text',
                    label: 'Heading - Credits &amp; Billin...',
                    defaultValue: "Credits &amp; Billing"
                },
                {
                    name: 'transaction_history',
                    type: 'text',
                    label: 'Heading - Transaction History',
                    defaultValue: "Transaction History"
                },
                {
                    name: 'active_ai_services',
                    type: 'text',
                    label: 'Heading - Active AI Services',
                    defaultValue: "Active AI Services"
                },
                {
                    name: 'ai_assistant_pro',
                    type: 'text',
                    label: 'Heading - AI Assistant Pro',
                    defaultValue: "AI Assistant Pro"
                },
                {
                    name: 'image_optimizer_ai',
                    type: 'text',
                    label: 'Heading - Image Optimizer AI',
                    defaultValue: "Image Optimizer AI"
                },
                {
                    name: 'credits_amp_billing',
                    type: 'richText',
                    label: 'Content - Credits &amp; Billin...',
                    defaultValue: [{ "children": [{ "text": "Credits &amp; Billing" }] }]
                },
                {
                    name: 'manage_your_credits_view_trans',
                    type: 'richText',
                    label: 'Content - Manage your credits,...',
                    defaultValue: [{ "children": [{ "text": "Manage your credits, view transaction history, and oversee your AI service subscriptions." }] }]
                },
                {
                    name: 'your_available_credit_balance',
                    type: 'richText',
                    label: 'Content - Your Available Credi...',
                    defaultValue: [{ "children": [{ "text": "Your Available Credit Balance" }] }]
                },
                {
                    name: 'advanced_product_description_g',
                    type: 'richText',
                    label: 'Content - Advanced product des...',
                    defaultValue: [{ "children": [{ "text": "Advanced product description generation and customer support." }] }]
                },
                {
                    name: 'next_bill_on_nov_1_2023',
                    type: 'richText',
                    label: 'Content - Next bill on Nov 1, ...',
                    defaultValue: [{ "children": [{ "text": "Next bill on Nov 1, 2023" }] }]
                },
                {
                    name: 'automated_image_enhancement_an',
                    type: 'richText',
                    label: 'Content - Automated image enha...',
                    defaultValue: [{ "children": [{ "text": "Automated image enhancement and background removal." }] }]
                },
                {
                    name: 'next_bill_on_nov_15_2023',
                    type: 'richText',
                    label: 'Content - Next bill on Nov 15,...',
                    defaultValue: [{ "children": [{ "text": "Next bill on Nov 15, 2023" }] }]
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