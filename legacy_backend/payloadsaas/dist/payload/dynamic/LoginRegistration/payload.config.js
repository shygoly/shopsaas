// payload.config.ts
import path from 'path';
import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
export default buildConfig({
    collections: [
        {
            slug: 'loginregistration',
            admin: {
                useAsTitle: 'title',
            },
            fields: [
                {
                    name: 'drsell',
                    type: 'text',
                    label: 'Heading - DrSell',
                    defaultValue: "DrSell"
                },
                {
                    name: 'welcome_back_to_your_dashboard',
                    type: 'text',
                    label: 'Heading - Welcome back to your...',
                    defaultValue: "Welcome back to your dashboard"
                },
                {
                    name: 'sign_in',
                    type: 'text',
                    label: 'Heading - Sign In',
                    defaultValue: "Sign In"
                },
                {
                    name: 'the_allinone_platform_to_launc',
                    type: 'richText',
                    label: 'Content - The all-in-one platf...',
                    defaultValue: [{ "children": [{ "text": "The all-in-one platform to launch and scale your e-commerce business." }] }]
                },
                {
                    name: 'abstract_ecommerce_graphic_sho',
                    type: 'upload',
                    label: 'Image - Abstract e-commerce ...',
                    relationTo: 'media'
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