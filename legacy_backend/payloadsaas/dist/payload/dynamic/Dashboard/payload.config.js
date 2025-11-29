// payload.config.ts
import path from 'path';
import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
export default buildConfig({
    collections: [
        {
            slug: 'dashboard',
            admin: {
                useAsTitle: 'title',
            },
            fields: [
                {
                    name: 'john_doe',
                    type: 'text',
                    label: 'Heading - John Doe',
                    defaultValue: "John Doe"
                },
                {
                    name: 'your_shops',
                    type: 'text',
                    label: 'Heading - Your Shops',
                    defaultValue: "Your Shops"
                },
                {
                    name: 'moderngadgetsdrsellcom',
                    type: 'richText',
                    label: 'Content - moderngadgets.drsell...',
                    defaultValue: [{ "children": [{ "text": "moderngadgets.drsell.com" }] }]
                },
                {
                    name: 'vintagefindsdrsellcom',
                    type: 'richText',
                    label: 'Content - vintagefinds.drsell....',
                    defaultValue: [{ "children": [{ "text": "vintagefinds.drsell.com" }] }]
                },
                {
                    name: 'artisancraftsdrsellcom',
                    type: 'richText',
                    label: 'Content - artisancrafts.drsell...',
                    defaultValue: [{ "children": [{ "text": "artisancrafts.drsell.com" }] }]
                },
                {
                    name: 'manage',
                    type: 'text',
                    label: 'Label - Manage',
                    defaultValue: "Manage"
                },
                {
                    name: 'view_store',
                    type: 'text',
                    label: 'Label - View Store',
                    defaultValue: "View Store"
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