// payload.config.ts
import path from 'path';
import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
export default buildConfig({
    collections: [
        {
            slug: 'createshop',
            admin: {
                useAsTitle: 'title',
            },
            fields: [
                {
                    name: 'create_your_new_ecommerce_shop',
                    type: 'text',
                    label: 'Heading - Create Your New E-co...',
                    defaultValue: "Create Your New E-commerce Shop"
                },
                {
                    name: 'shop_details',
                    type: 'text',
                    label: 'Heading - Shop Details',
                    defaultValue: "Shop Details"
                },
                {
                    name: 'select_a_starting_theme_for_yo',
                    type: 'text',
                    label: 'Heading - Select a starting th...',
                    defaultValue: "Select a starting theme for your shop"
                },
                {
                    name: 'vitalis',
                    type: 'text',
                    label: 'Heading - Vitalis',
                    defaultValue: "Vitalis"
                },
                {
                    name: 'momentum',
                    type: 'text',
                    label: 'Heading - Momentum',
                    defaultValue: "Momentum"
                },
                {
                    name: 'aura',
                    type: 'text',
                    label: 'Heading - Aura',
                    defaultValue: "Aura"
                },
                {
                    name: 'fill_in_the_details_below_to_g',
                    type: 'richText',
                    label: 'Content - Fill in the details ...',
                    defaultValue: [{ "children": [{ "text": "Fill in the details below to get started. You can change these settings later." }] }]
                },
                {
                    name: 'clean_and_professional_for_hea',
                    type: 'richText',
                    label: 'Content - Clean and profession...',
                    defaultValue: [{ "children": [{ "text": "Clean and professional for health products." }] }]
                },
                {
                    name: 'dynamic_and_energetic_for_spor',
                    type: 'richText',
                    label: 'Content - Dynamic and energeti...',
                    defaultValue: [{ "children": [{ "text": "Dynamic and energetic for sports apparel." }] }]
                },
                {
                    name: 'elegant_and_soft_for_skincare_',
                    type: 'richText',
                    label: 'Content - Elegant and soft for...',
                    defaultValue: [{ "children": [{ "text": "Elegant and soft for skin-care and cosmetics." }] }]
                },
                {
                    name: 'back_to_my_shops',
                    type: 'text',
                    label: 'Label - Back to My Shops',
                    defaultValue: "Back to My Shops"
                },
                {
                    name: 'create_shop',
                    type: 'text',
                    label: 'Label - Create Shop',
                    defaultValue: "Create Shop"
                },
                {
                    name: 'a_modern_clean_laboratory_sett',
                    type: 'upload',
                    label: 'Image - A modern, clean labo...',
                    relationTo: 'media'
                },
                {
                    name: 'dynamic_shot_of_a_person_runni',
                    type: 'upload',
                    label: 'Image - Dynamic shot of a pe...',
                    relationTo: 'media'
                },
                {
                    name: 'elegant_display_of_skincare_pr',
                    type: 'upload',
                    label: 'Image - Elegant display of s...',
                    relationTo: 'media'
                },
                {
                    name: 'a_preview_of_a_medicalthemed_e',
                    type: 'upload',
                    label: 'Image - A preview of a medic...',
                    relationTo: 'media'
                },
                {
                    name: 'selection_1',
                    type: 'select',
                    label: 'Selection - English (United Stat...',
                    options: [
                        { label: 'English (United States)', value: 'english_(united_states)' },
                        { label: 'Chinese (Simplified)', value: 'chinese_(simplified)' },
                        { label: 'Spanish (Spain)', value: 'spanish_(spain)' },
                        { label: 'French (France)', value: 'french_(france)' },
                        { label: 'German (Germany)', value: 'german_(germany)' }
                    ]
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