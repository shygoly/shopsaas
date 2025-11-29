// payload.config.ts
import path from 'path';
import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
export default buildConfig({
    collections: [
        {
            slug: 'shopdetails',
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
                    name: 'my_awesome_shop',
                    type: 'text',
                    label: 'Heading - My Awesome Shop',
                    defaultValue: "My Awesome Shop"
                },
                {
                    name: 'general_information',
                    type: 'text',
                    label: 'Heading - General Information',
                    defaultValue: "General Information"
                },
                {
                    name: 'configuration',
                    type: 'text',
                    label: 'Heading - Configuration',
                    defaultValue: "Configuration"
                },
                {
                    name: 'danger_zone',
                    type: 'text',
                    label: 'Heading - Danger Zone',
                    defaultValue: "Danger Zone"
                },
                {
                    name: 'core_details_about_the_shop',
                    type: 'richText',
                    label: 'Content - Core details about t...',
                    defaultValue: [{ "children": [{ "text": "Core details about the shop." }] }]
                },
                {
                    name: 'myawesomeshopdrsellcom',
                    type: 'richText',
                    label: 'Content - my-awesome-shop.drse...',
                    defaultValue: [{ "children": [{ "text": "my-awesome-shop.drsell.com" }] }]
                },
                {
                    name: 'manage_the_shops_settings',
                    type: 'richText',
                    label: "Content - Manage the shop's se...",
                    defaultValue: [{ "children": [{ "text": "Manage the shop's settings." }] }]
                },
                {
                    name: 'these_actions_are_irreversible',
                    type: 'richText',
                    label: 'Content - These actions are ir...',
                    defaultValue: [{ "children": [{ "text": "These actions are irreversible. Please proceed with caution." }] }]
                },
                {
                    name: 'once_deleted_it_will_be_gone_f',
                    type: 'richText',
                    label: 'Content - Once deleted, it wil...',
                    defaultValue: [{ "children": [{ "text": "Once deleted, it will be gone forever." }] }]
                },
                {
                    name: 'domain',
                    type: 'text',
                    label: 'Label - Domain',
                    defaultValue: "Domain"
                },
                {
                    name: 'shop_id',
                    type: 'text',
                    label: 'Label - Shop ID',
                    defaultValue: "Shop ID"
                },
                {
                    name: 'created_date',
                    type: 'text',
                    label: 'Label - Created Date',
                    defaultValue: "Created Date"
                },
                {
                    name: 'shop_status',
                    type: 'text',
                    label: 'Label - Shop Status',
                    defaultValue: "Shop Status"
                },
                {
                    name: 'theme',
                    type: 'text',
                    label: 'Label - Theme',
                    defaultValue: "Theme"
                },
                {
                    name: 'locale',
                    type: 'text',
                    label: 'Label - Locale',
                    defaultValue: "Locale"
                },
                {
                    name: 'language',
                    type: 'text',
                    label: 'Label - Language',
                    defaultValue: "Language"
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