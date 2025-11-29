/**
 * 共享字段模板库
 * 为所有页面提供统一的字段定义和配置
 */
/**
 * SEO 字段组 - 所有页面通用
 */
export const SEOFields = [
    {
        name: 'seo',
        type: 'group',
        label: 'SEO 设置',
        fields: [
            {
                name: 'title',
                type: 'text',
                label: '页面标题',
                required: true,
                maxLength: 60,
            },
            {
                name: 'description',
                type: 'textarea',
                label: '页面描述',
                maxLength: 160,
            },
            {
                name: 'keywords',
                type: 'text',
                label: '关键词',
                admin: {
                    description: '多个关键词用逗号分隔',
                },
            },
            {
                name: 'ogImage',
                type: 'upload',
                relationTo: 'media',
                label: 'OG 图片',
                admin: {
                    description: '用于社交媒体分享的图片',
                },
            },
        ],
    },
];
/**
 * 发布状态字段 - 所有页面通用
 */
export const PublishStatusFields = [
    {
        name: 'status',
        type: 'select',
        label: '发布状态',
        defaultValue: 'draft',
        options: [
            { label: '草稿', value: 'draft' },
            { label: '已发布', value: 'published' },
            { label: '存档', value: 'archived' },
        ],
    },
    {
        name: 'publishedAt',
        type: 'date',
        label: '发布时间',
        admin: {
            description: '设置后将自动发布页面',
        },
    },
];
/**
 * 导航栏字段 - 包含导航配置
 */
export const NavigationFields = [
    {
        name: 'navigation',
        type: 'group',
        label: '导航栏配置',
        fields: [
            {
                name: 'logo',
                type: 'upload',
                relationTo: 'media',
                label: 'Logo',
            },
            {
                name: 'brandName',
                type: 'text',
                label: '品牌名称',
            },
            {
                name: 'links',
                type: 'array',
                label: '导航链接',
                fields: [
                    {
                        name: 'label',
                        type: 'text',
                        label: '链接文本',
                        required: true,
                    },
                    {
                        name: 'href',
                        type: 'text',
                        label: '链接地址',
                        required: true,
                    },
                    {
                        name: 'external',
                        type: 'checkbox',
                        label: '外链',
                    },
                ],
                minRows: 1,
                maxRows: 10,
            },
            {
                name: 'ctaButtons',
                type: 'array',
                label: 'CTA 按钮',
                fields: [
                    {
                        name: 'text',
                        type: 'text',
                        label: '按钮文本',
                        required: true,
                    },
                    {
                        name: 'href',
                        type: 'text',
                        label: '按钮链接',
                        required: true,
                    },
                    {
                        name: 'variant',
                        type: 'select',
                        label: '按钮样式',
                        options: [
                            { label: '主色', value: 'primary' },
                            { label: '次色', value: 'secondary' },
                            { label: '幽灵', value: 'ghost' },
                        ],
                    },
                ],
                minRows: 0,
                maxRows: 3,
            },
        ],
    },
];
/**
 * 页脚字段 - 包含页脚配置
 */
export const FooterFields = [
    {
        name: 'footer',
        type: 'group',
        label: '页脚配置',
        fields: [
            {
                name: 'logo',
                type: 'upload',
                relationTo: 'media',
                label: 'Logo',
            },
            {
                name: 'copyright',
                type: 'text',
                label: '版权信息',
            },
            {
                name: 'sections',
                type: 'array',
                label: '页脚栏目',
                fields: [
                    {
                        name: 'title',
                        type: 'text',
                        label: '栏目标题',
                        required: true,
                    },
                    {
                        name: 'links',
                        type: 'array',
                        label: '链接',
                        fields: [
                            {
                                name: 'text',
                                type: 'text',
                                label: '链接文本',
                                required: true,
                            },
                            {
                                name: 'href',
                                type: 'text',
                                label: '链接地址',
                                required: true,
                            },
                        ],
                        minRows: 1,
                        maxRows: 10,
                    },
                ],
                minRows: 0,
                maxRows: 6,
            },
        ],
    },
];
/**
 * Hero 部分字段
 */
export const HeroSectionFields = [
    {
        name: 'hero',
        type: 'group',
        label: 'Hero 部分',
        fields: [
            {
                name: 'title',
                type: 'text',
                label: '标题',
                required: true,
            },
            {
                name: 'subtitle',
                type: 'textarea',
                label: '副标题',
            },
            {
                name: 'backgroundImage',
                type: 'upload',
                relationTo: 'media',
                label: '背景图片',
            },
            {
                name: 'cta',
                type: 'group',
                label: 'CTA 按钮',
                fields: [
                    {
                        name: 'text',
                        type: 'text',
                        label: '按钮文本',
                    },
                    {
                        name: 'href',
                        type: 'text',
                        label: '链接',
                    },
                ],
            },
        ],
    },
];
/**
 * 功能列表字段
 */
export const FeaturesFields = [
    {
        name: 'features',
        type: 'array',
        label: '功能列表',
        fields: [
            {
                name: 'icon',
                type: 'text',
                label: '图标名称',
                admin: {
                    description: 'Material Symbols 图标名称',
                },
            },
            {
                name: 'title',
                type: 'text',
                label: '功能标题',
                required: true,
            },
            {
                name: 'description',
                type: 'textarea',
                label: '功能描述',
            },
        ],
        minRows: 0,
        maxRows: 10,
    },
];
/**
 * 推荐信字段
 */
export const TestimonialsFields = [
    {
        name: 'testimonials',
        type: 'array',
        label: '推荐信',
        fields: [
            {
                name: 'quote',
                type: 'textarea',
                label: '推荐文本',
                required: true,
            },
            {
                name: 'author',
                type: 'text',
                label: '作者',
                required: true,
            },
            {
                name: 'role',
                type: 'text',
                label: '职位',
            },
            {
                name: 'image',
                type: 'upload',
                relationTo: 'media',
                label: '头像',
            },
            {
                name: 'rating',
                type: 'number',
                label: '评分',
                min: 1,
                max: 5,
            },
        ],
        minRows: 0,
        maxRows: 20,
    },
];
/**
 * CTA 块字段
 */
export const CTABlockFields = [
    {
        name: 'cta',
        type: 'group',
        label: 'CTA 块',
        fields: [
            {
                name: 'heading',
                type: 'text',
                label: '标题',
                required: true,
            },
            {
                name: 'description',
                type: 'textarea',
                label: '描述',
            },
            {
                name: 'primaryButton',
                type: 'group',
                label: '主按钮',
                fields: [
                    {
                        name: 'text',
                        type: 'text',
                        label: '按钮文本',
                    },
                    {
                        name: 'href',
                        type: 'text',
                        label: '链接',
                    },
                ],
            },
            {
                name: 'secondaryButton',
                type: 'group',
                label: '次按钮',
                fields: [
                    {
                        name: 'text',
                        type: 'text',
                        label: '按钮文本',
                    },
                    {
                        name: 'href',
                        type: 'text',
                        label: '链接',
                    },
                ],
            },
        ],
    },
];
/**
 * 侧边栏导航字段 - 用于仪表板类页面
 */
export const SidebarNavigationFields = [
    {
        name: 'sidebarNav',
        type: 'group',
        label: '侧边栏导航',
        fields: [
            {
                name: 'items',
                type: 'array',
                label: '导航项',
                fields: [
                    {
                        name: 'icon',
                        type: 'text',
                        label: '图标',
                        admin: {
                            description: 'Material Symbols 图标名称',
                        },
                    },
                    {
                        name: 'label',
                        type: 'text',
                        label: '标签',
                        required: true,
                    },
                    {
                        name: 'href',
                        type: 'text',
                        label: '链接',
                        required: true,
                    },
                    {
                        name: 'badge',
                        type: 'text',
                        label: '徽章',
                    },
                    {
                        name: 'children',
                        type: 'array',
                        label: '子菜单',
                        fields: [
                            {
                                name: 'label',
                                type: 'text',
                                label: '标签',
                                required: true,
                            },
                            {
                                name: 'href',
                                type: 'text',
                                label: '链接',
                                required: true,
                            },
                        ],
                    },
                ],
                minRows: 1,
                maxRows: 20,
            },
        ],
    },
];
/**
 * 统计卡片字段
 */
export const StatsCardsFields = [
    {
        name: 'stats',
        type: 'array',
        label: '统计卡片',
        fields: [
            {
                name: 'icon',
                type: 'text',
                label: '图标',
                admin: {
                    description: 'Material Symbols 图标名称',
                },
            },
            {
                name: 'label',
                type: 'text',
                label: '标签',
                required: true,
            },
            {
                name: 'value',
                type: 'text',
                label: '数值',
                required: true,
            },
            {
                name: 'change',
                type: 'number',
                label: '变化百分比',
            },
            {
                name: 'trend',
                type: 'select',
                label: '趋势',
                options: [
                    { label: '上升', value: 'up' },
                    { label: '下降', value: 'down' },
                    { label: '平稳', value: 'flat' },
                ],
            },
        ],
        minRows: 0,
        maxRows: 10,
    },
];
/**
 * 表格配置字段
 */
export const TableConfigFields = [
    {
        name: 'tableConfig',
        type: 'group',
        label: '表格配置',
        fields: [
            {
                name: 'columns',
                type: 'array',
                label: '列配置',
                fields: [
                    {
                        name: 'key',
                        type: 'text',
                        label: '键',
                        required: true,
                    },
                    {
                        name: 'label',
                        type: 'text',
                        label: '标签',
                        required: true,
                    },
                    {
                        name: 'sortable',
                        type: 'checkbox',
                        label: '可排序',
                    },
                    {
                        name: 'searchable',
                        type: 'checkbox',
                        label: '可搜索',
                    },
                    {
                        name: 'width',
                        type: 'text',
                        label: '宽度',
                        admin: {
                            description: '例如: 200px, 20%',
                        },
                    },
                ],
                minRows: 1,
                maxRows: 20,
            },
            {
                name: 'pageSize',
                type: 'number',
                label: '每页数量',
                defaultValue: 10,
            },
            {
                name: 'sortBy',
                type: 'text',
                label: '默认排序字段',
            },
        ],
    },
];
/**
 * 表单字段组
 */
export const FormFieldsConfig = [
    {
        name: 'formFields',
        type: 'array',
        label: '表单字段',
        fields: [
            {
                name: 'name',
                type: 'text',
                label: '字段名',
                required: true,
            },
            {
                name: 'label',
                type: 'text',
                label: '字段标签',
                required: true,
            },
            {
                name: 'type',
                type: 'select',
                label: '字段类型',
                required: true,
                options: [
                    { label: '文本', value: 'text' },
                    { label: '邮箱', value: 'email' },
                    { label: '密码', value: 'password' },
                    { label: '数字', value: 'number' },
                    { label: '文本框', value: 'textarea' },
                    { label: '选择框', value: 'select' },
                    { label: '复选框', value: 'checkbox' },
                    { label: '日期', value: 'date' },
                ],
            },
            {
                name: 'required',
                type: 'checkbox',
                label: '必填',
            },
            {
                name: 'placeholder',
                type: 'text',
                label: '占位符',
            },
            {
                name: 'options',
                type: 'array',
                label: '选项（仅用于 select）',
                fields: [
                    {
                        name: 'label',
                        type: 'text',
                        label: '选项标签',
                        required: true,
                    },
                    {
                        name: 'value',
                        type: 'text',
                        label: '选项值',
                        required: true,
                    },
                ],
            },
            {
                name: 'validation',
                type: 'group',
                label: '验证规则',
                fields: [
                    {
                        name: 'minLength',
                        type: 'number',
                        label: '最小长度',
                    },
                    {
                        name: 'maxLength',
                        type: 'number',
                        label: '最大长度',
                    },
                    {
                        name: 'pattern',
                        type: 'text',
                        label: '正则表达式',
                    },
                ],
            },
        ],
        minRows: 0,
        maxRows: 30,
    },
];
/**
 * 生成基础页面配置
 * @param slug - 集合 slug
 * @param name - 集合名称
 * @param fields - 自定义字段
 */
export function generatePageCollection(slug, name, fields = []) {
    return {
        slug,
        admin: {
            useAsTitle: 'title',
            defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
        },
        fields: [
            {
                name: 'title',
                type: 'text',
                label: '页面标题',
                required: true,
            },
            ...fields,
            ...SEOFields,
            ...PublishStatusFields,
        ],
        timestamps: true,
    };
}
/**
 * 生成导航页面配置（包含导航栏和页脚）
 */
export function generateNavPageCollection(slug, name, fields = []) {
    return {
        ...generatePageCollection(slug, name, [
            ...NavigationFields,
            ...fields,
            ...FooterFields,
        ]),
    };
}
/**
 * 生成仪表板页面配置（包含侧边栏）
 */
export function generateDashboardCollection(slug, name, fields = []) {
    return {
        ...generatePageCollection(slug, name, [
            ...SidebarNavigationFields,
            ...StatsCardsFields,
            ...fields,
        ]),
    };
}
//# sourceMappingURL=field-templates.js.map