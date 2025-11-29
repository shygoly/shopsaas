// payload.config.ts
import path from 'path';
import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
export default buildConfig({
    collections: [
        {
            slug: 'homepagelandingpage',
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
                    name: '_the_allinone_hub_for_your_eco',
                    type: 'text',
                    label: 'Heading - The All-in-One Hub for Your E-commerce Empire.',
                    defaultValue: "\n                                    The All-in-One Hub for Your E-commerce Empire.\n                                "
                },
                {
                    name: '_launch_manage_and_scale_multi',
                    type: 'text',
                    label: 'Heading - Launch, manage, and scale multiple stores.',
                    defaultValue: "\n                                    Launch, manage, and scale multiple online stores from a single, intelligent dashboard with DrSell.\n                                "
                },
                {
                    name: '_everything_you_need_to_succee',
                    type: 'text',
                    label: 'Heading - Everything You Need to Succeed',
                    defaultValue: "\n                                Everything You Need to Succeed\n                            "
                },
                {
                    name: 'instant_shop_creation',
                    type: 'text',
                    label: 'Heading - Instant Shop Creatio...',
                    defaultValue: "Instant Shop Creation"
                },
                {
                    name: 'aipowered_assistant',
                    type: 'text',
                    label: 'Heading - AI-Powered Assistant',
                    defaultValue: "AI-Powered Assistant"
                },
                {
                    name: 'centralized_management',
                    type: 'text',
                    label: 'Heading - Centralized Manageme...',
                    defaultValue: "Centralized Management"
                },
                {
                    name: 'unified_credit_system',
                    type: 'text',
                    label: 'Heading - Unified Credit Syste...',
                    defaultValue: "Unified Credit System"
                },
                {
                    name: 'see_drsell_in_action',
                    type: 'text',
                    label: 'Heading - See DrSell in Action',
                    defaultValue: "See DrSell in Action"
                },
                {
                    name: '_trusted_by_ecommerce_entrepre',
                    type: 'text',
                    label: 'Heading - Trusted by E-commerce Entrepreneurs',
                    defaultValue: "\n                                Trusted by E-commerce Entrepreneurs\n                            "
                },
                {
                    name: 'ready_to_streamline_your_ecomm',
                    type: 'text',
                    label: 'Heading - Ready to streamline ...',
                    defaultValue: "Ready to streamline your e-commerce business?"
                },
                {
                    name: '_drsell_provides_a_powerful_su',
                    type: 'richText',
                    label: 'Content - DrSell provides a powerful suite of tools',
                    defaultValue: [{ "children": [{ "text": "\n                                DrSell provides a powerful suite of tools designed to streamline your operations and accelerate your growth.\n                            " }] }]
                },
                {
                    name: 'effortlessly_launch_new_fullyf',
                    type: 'richText',
                    label: 'Content - Effortlessly launch ...',
                    defaultValue: [{ "children": [{ "text": "Effortlessly launch new, fully-functional storefronts in minutes with our intuitive setup process." }] }]
                },
                {
                    name: 'leverage_ai_for_compelling_pro',
                    type: 'richText',
                    label: 'Content - Leverage AI for comp...',
                    defaultValue: [{ "children": [{ "text": "Leverage AI for compelling product descriptions, smart marketing campaigns, and insightful analytics." }] }]
                },
                {
                    name: 'oversee_all_your_stores_produc',
                    type: 'richText',
                    label: 'Content - Oversee all your sto...',
                    defaultValue: [{ "children": [{ "text": "Oversee all your stores, products, and orders from a single, powerful and centralized dashboard." }] }]
                },
                {
                    name: 'manage_services_and_features_a',
                    type: 'richText',
                    label: 'Content - Manage services and ...',
                    defaultValue: [{ "children": [{ "text": "Manage services and features across all your shops with a simple and transparent credit system." }] }]
                },
                {
                    name: 'drsell_revolutionized_how_we_m',
                    type: 'richText',
                    label: 'Content - "DrSell revolutioniz...',
                    defaultValue: [{ "children": [{ "text": "\"DrSell revolutionized how we manage our stores. The centralized dashboard is a game-changer, saving us hours of work every single day.\"" }] }]
                },
                {
                    name: 'ceo_crafty_creations',
                    type: 'richText',
                    label: 'Content - CEO, Crafty Creation...',
                    defaultValue: [{ "children": [{ "text": "CEO, Crafty Creations" }] }]
                },
                {
                    name: 'the_ai_assistant_writes_better',
                    type: 'richText',
                    label: 'Content - "The AI assistant wr...',
                    defaultValue: [{ "children": [{ "text": "\"The AI assistant writes better product descriptions than I can! It's an incredible tool that has boosted our conversion rates.\"" }] }]
                },
                {
                    name: 'founder_tech_gadgets_co',
                    type: 'richText',
                    label: 'Content - Founder, Tech Gadget...',
                    defaultValue: [{ "children": [{ "text": "Founder, Tech Gadgets Co." }] }]
                },
                {
                    name: 'launching_a_new_niche_store_us',
                    type: 'richText',
                    label: 'Content - "Launching a new nic...',
                    defaultValue: [{ "children": [{ "text": "\"Launching a new niche store used to take weeks. With DrSell, I had a new shop up and running in under an hour. Absolutely brilliant.\"" }] }]
                },
                {
                    name: 'join_hundreds_of_successful_en',
                    type: 'richText',
                    label: 'Content - Join hundreds of suc...',
                    defaultValue: [{ "children": [{ "text": "Join hundreds of successful entrepreneurs who use DrSell to build their e-commerce empires. Get started for free, no credit card required." }] }]
                },
                {
                    name: '_2024_drsell_all_rights_reserv',
                    type: 'richText',
                    label: 'Content - © 2024 DrSell. All r...',
                    defaultValue: [{ "children": [{ "text": "© 2024 DrSell. All rights reserved." }] }]
                },
                {
                    name: 'photo_of_jane_doe',
                    type: 'upload',
                    label: 'Image - Photo of Jane Doe',
                    relationTo: 'media'
                },
                {
                    name: 'photo_of_john_smith',
                    type: 'upload',
                    label: 'Image - Photo of John Smith',
                    relationTo: 'media'
                },
                {
                    name: 'photo_of_emily_white',
                    type: 'upload',
                    label: 'Image - Photo of Emily White',
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