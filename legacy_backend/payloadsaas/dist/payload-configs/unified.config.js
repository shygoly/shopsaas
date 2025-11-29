/**
 * 统一的 Payload CMS 配置文件
 * 集成所有页面集合，使用共享字段模板
 */
import path from 'path';
import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
// 导入共享字段模板
import { generateNavPageCollection, generateDashboardCollection, generatePageCollection, HeroSectionFields, FeaturesFields, TestimonialsFields, CTABlockFields, StatsCardsFields, TableConfigFields, FormFieldsConfig, } from './shared/field-templates';
/**
 * 页面集合定义
 */
// 首页 - 包含导航、Hero、功能、推荐信、CTA、页脚
const LandingPageCollection = {
    ...generateNavPageCollection('landing-pages', 'Landing Pages', [
        ...HeroSectionFields,
        ...FeaturesFields,
        ...TestimonialsFields,
        ...CTABlockFields,
    ]),
};
// 仪表板 - 包含侧边栏、统计卡片
const DashboardCollection = {
    ...generateDashboardCollection('dashboards', 'Dashboards', [
        ...FeaturesFields,
        ...StatsCardsFields,
    ]),
};
// 注册页面 - 简单的页面配置
const RegistrationCollection = {
    ...generatePageCollection('registrations', 'Registrations', [
        ...FormFieldsConfig,
    ]),
};
// 店铺详情 - 包含导航、表格配置
const ShopDetailsCollection = {
    ...generateNavPageCollection('shop-details', 'Shop Details', [
        ...StatsCardsFields,
        ...TableConfigFields,
    ]),
};
// AI 助手管理 - 包含侧边栏、功能列表
const AIAssistantCollection = {
    ...generateDashboardCollection('ai-assistants', 'AI Assistants', [
        ...FeaturesFields,
        ...StatsCardsFields,
    ]),
};
// 店铺管理 - 包含侧边栏、表格配置
const ShopManagementCollection = {
    ...generateDashboardCollection('shop-management', 'Shop Management', [
        ...TableConfigFields,
        ...StatsCardsFields,
    ]),
};
// 创建店铺 - 表单配置为主
const CreateShopCollection = {
    ...generatePageCollection('create-shops', 'Create Shops', [
        ...FormFieldsConfig,
        ...HeroSectionFields,
    ]),
};
// 信用和账单 - 表格和统计配置
const BillingCollection = {
    ...generateDashboardCollection('billings', 'Billing', [
        ...StatsCardsFields,
        ...TableConfigFields,
    ]),
};
/**
 * Media 集合 - 用于上传图片、视频等
 */
const MediaCollection = {
    slug: 'media',
    admin: {
        useAsTitle: 'filename',
    },
    upload: {
        staticURL: '/media',
        staticDir: 'media',
        imageSizes: [
            {
                name: 'thumbnail',
                width: 400,
                height: 300,
                crop: 'center',
            },
            {
                name: 'card',
                width: 768,
                height: 512,
                crop: 'center',
            },
            {
                name: 'hero',
                width: 1920,
                height: 1080,
                crop: 'center',
            },
        ],
        mimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
        ],
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            label: '替代文本',
            required: true,
        },
        {
            name: 'description',
            type: 'textarea',
            label: '描述',
        },
    ],
    timestamps: true,
};
/**
 * 用户集合
 */
const UsersCollection = {
    slug: 'users',
    auth: true,
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['email', 'name', 'role', 'createdAt'],
    },
    fields: [
        {
            name: 'email',
            type: 'email',
            label: '邮箱',
            required: true,
            unique: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'name',
            type: 'text',
            label: '名称',
        },
        {
            name: 'avatar',
            type: 'upload',
            relationTo: 'media',
            label: '头像',
        },
        {
            name: 'role',
            type: 'select',
            label: '角色',
            defaultValue: 'user',
            options: [
                { label: '管理员', value: 'admin' },
                { label: '编辑', value: 'editor' },
                { label: '用户', value: 'user' },
            ],
        },
        {
            name: 'status',
            type: 'select',
            label: '状态',
            defaultValue: 'active',
            options: [
                { label: '激活', value: 'active' },
                { label: '禁用', value: 'disabled' },
            ],
        },
    ],
    timestamps: true,
};
/**
 * 导出统一配置
 */
export default buildConfig({
    collections: [
        UsersCollection,
        MediaCollection,
        LandingPageCollection,
        DashboardCollection,
        RegistrationCollection,
        ShopDetailsCollection,
        AIAssistantCollection,
        ShopManagementCollection,
        CreateShopCollection,
        BillingCollection,
    ],
    db: mongooseAdapter({
        url: process.env.DATABASE_URI || 'mongodb://localhost:27017/drsell',
    }),
    editor: slateEditor({}),
    admin: {
        bundler: webpackBundler(),
        meta: {
            titleSuffix: ' - DrSell CMS',
            favicon: '/favicon.ico',
        },
    },
    // 启用 CORS
    cors: [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ].filter(Boolean),
    // API 配置
    routes: {
        api: '/api/cms',
        admin: '/admin',
    },
    typescript: {
        outputFile: path.resolve(__dirname, 'payload-types.ts'),
    },
});
/**
 * 导出集合配置供独立使用
 */
export { LandingPageCollection, DashboardCollection, RegistrationCollection, ShopDetailsCollection, AIAssistantCollection, ShopManagementCollection, CreateShopCollection, BillingCollection, MediaCollection, UsersCollection, };
//# sourceMappingURL=unified.config.js.map