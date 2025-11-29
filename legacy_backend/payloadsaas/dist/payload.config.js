/**
 * Payload CMS Configuration
 * Unified configuration with PostgreSQL database
 * Port: 3020
 * Database: payloadsaas
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { slateEditor } from '@payloadcms/richtext-slate';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 导入共享字段模板
import { generateNavPageCollection, generateDashboardCollection, generatePageCollection, HeroSectionFields, FeaturesFields, TestimonialsFields, CTABlockFields, StatsCardsFields, TableConfigFields, FormFieldsConfig, } from './lib/payload-field-templates/field-templates';
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
    ]),
};
// 店铺管理 - 包含侧边栏、表格配置
const ShopManagementCollection = {
    ...generateDashboardCollection('shop-management', 'Shop Management', [
        ...TableConfigFields,
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
        ...TableConfigFields,
    ]),
};
// 商店主体
const ShopsCollection = {
    slug: 'shops',
    admin: {
        useAsTitle: 'name',
        group: 'Commerce',
        defaultColumns: ['name', 'status', 'plan', 'owner', 'updatedAt'],
    },
    access: {
        read: () => true,
    },
    fields: [
        { name: 'name', type: 'text', required: true },
        {
            name: 'handle',
            type: 'text',
            required: true,
            unique: true,
            admin: { description: '用于店铺域名与 API slug，例如 awesome-shop' },
        },
        {
            name: 'domain',
            type: 'text',
            admin: { description: '可绑定自定义域名，例如 shop.example.com' },
        },
        {
            name: 'owner',
            type: 'relationship',
            relationTo: 'users',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            defaultValue: 'active',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Paused', value: 'paused' },
                { label: 'Archived', value: 'archived' },
            ],
        },
        {
            name: 'plan',
            type: 'select',
            defaultValue: 'starter',
            options: [
                { label: 'Starter', value: 'starter' },
                { label: 'Growth', value: 'growth' },
                { label: 'Scale', value: 'scale' },
            ],
        },
        {
            name: 'settings',
            type: 'group',
            fields: [
                { name: 'theme', type: 'text', admin: { placeholder: 'vitalis' } },
                {
                    name: 'locale',
                    type: 'select',
                    defaultValue: 'zh-CN',
                    options: [
                        { label: '中文', value: 'zh-CN' },
                        { label: 'English', value: 'en-US' },
                        { label: '日本語', value: 'ja-JP' },
                    ],
                },
                {
                    name: 'aiAssistantEnabled',
                    type: 'checkbox',
                    label: '启用默认智能体',
                    defaultValue: true,
                },
                {
                    name: 'aiProfile',
                    type: 'relationship',
                    relationTo: 'ai-agents',
                    admin: { description: '用于客服/营销的默认智能体配置' },
                },
            ],
        },
    ],
    timestamps: true,
};
// AI 智能体
const AIAgentCollection = {
    slug: 'ai-agents',
    admin: {
        useAsTitle: 'name',
        group: 'AI',
        defaultColumns: ['name', 'model', 'temperature', 'updatedAt'],
    },
    fields: [
        { name: 'name', type: 'text', required: true },
        {
            name: 'model',
            type: 'select',
            required: true,
            defaultValue: 'gpt-4.1-mini',
            options: [
                { label: 'GPT-4.1 mini', value: 'gpt-4.1-mini' },
                { label: 'GPT-4.1', value: 'gpt-4.1' },
                { label: 'Claude 3.5 Sonnet', value: 'claude-3.5-sonnet' },
            ],
        },
        {
            name: 'temperature',
            type: 'number',
            defaultValue: 0.4,
            min: 0,
            max: 1,
            admin: { step: 0.1 },
        },
        {
            name: 'instructions',
            type: 'textarea',
            required: true,
            admin: { description: '系统提示词，描述语气、品牌与边界' },
        },
        {
            name: 'capabilities',
            type: 'array',
            label: '能力',
            fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'action', type: 'text', required: true, admin: { placeholder: 'create-order|get-inventory' } },
            ],
        },
        {
            name: 'shop',
            type: 'relationship',
            relationTo: 'shops',
            admin: { description: '可选：限定智能体只服务某个店铺' },
        },
    ],
};
// 支付记录
const PaymentRecordCollection = {
    slug: 'payments',
    admin: {
        useAsTitle: 'reference',
        group: 'Finance',
        defaultColumns: ['reference', 'shop', 'amount', 'status', 'createdAt'],
    },
    fields: [
        {
            name: 'reference',
            type: 'text',
            required: true,
            unique: true,
            admin: { description: '对接三方支付的流水号' },
        },
        {
            name: 'shop',
            type: 'relationship',
            relationTo: 'shops',
            required: true,
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            admin: { description: '产生该笔付款的用户' },
        },
        {
            name: 'amount',
            type: 'number',
            required: true,
            admin: { description: '单位为分，便于整数存储' },
        },
        {
            name: 'currency',
            type: 'text',
            defaultValue: 'CNY',
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Succeeded', value: 'succeeded' },
                { label: 'Failed', value: 'failed' },
                { label: 'Refunded', value: 'refunded' },
            ],
            defaultValue: 'pending',
        },
        {
            name: 'method',
            type: 'select',
            options: [
                { label: 'Stripe', value: 'stripe' },
                { label: 'Alipay', value: 'alipay' },
                { label: 'WeChat Pay', value: 'wechat' },
            ],
            defaultValue: 'stripe',
        },
        {
            name: 'lineItems',
            type: 'array',
            fields: [
                { name: 'description', type: 'text', required: true },
                { name: 'quantity', type: 'number', defaultValue: 1 },
                { name: 'unitPrice', type: 'number', required: true },
            ],
        },
        {
            name: 'metadata',
            type: 'json',
            admin: { description: '原始回调/通知内容，便于排查' },
        },
    ],
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
            label: 'Alt Text',
            required: true,
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'Description',
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
            label: 'Email',
            required: true,
            unique: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'name',
            type: 'text',
            label: 'Name',
        },
        {
            name: 'avatar',
            type: 'upload',
            relationTo: 'media',
            label: 'Avatar',
        },
        {
            name: 'role',
            type: 'select',
            label: 'Role',
            defaultValue: 'user',
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Editor', value: 'editor' },
                { label: 'User', value: 'user' },
            ],
        },
        {
            name: 'status',
            type: 'select',
            label: 'Status',
            defaultValue: 'active',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Disabled', value: 'disabled' },
            ],
        },
    ],
    timestamps: true,
};
/**
 * 导出统一配置
 */
export default buildConfig({
    secret: process.env.PAYLOAD_SECRET || 'payloadsaas-dev-secret',
    collections: [
        UsersCollection,
        MediaCollection,
        ShopsCollection,
        AIAgentCollection,
        PaymentRecordCollection,
        LandingPageCollection,
        DashboardCollection,
        RegistrationCollection,
        ShopDetailsCollection,
        AIAssistantCollection,
        ShopManagementCollection,
        CreateShopCollection,
        BillingCollection,
    ],
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URI || 'postgresql://mac@localhost:5432/payloadsaas',
        },
    }),
    editor: slateEditor({}),
    admin: {
        meta: {
            titleSuffix: ' - PayloadSaaS CMS',
            favicon: '/favicon.ico',
        },
    },
    // 启用 CORS
    cors: [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3020',
    ].filter(Boolean),
    // API 配置
    routes: {
        api: '/api/cms',
        admin: '/admin',
    },
    typescript: {
        outputFile: path.resolve(__dirname, 'payload-types.ts'),
    },
    // 禁用 GraphQL（可选，根据需要启用）
    graphQL: {
        disable: true,
    },
});
/**
 * 导出集合配置供独立使用
 */
export { LandingPageCollection, DashboardCollection, RegistrationCollection, ShopDetailsCollection, AIAssistantCollection, ShopManagementCollection, CreateShopCollection, BillingCollection, MediaCollection, UsersCollection, };
//# sourceMappingURL=payload.config.js.map