/**
 * 共享字段模板库
 * 为所有页面提供统一的字段定义和配置
 */
import type { Field, CollectionConfig } from 'payload';
/**
 * SEO 字段组 - 所有页面通用
 */
export declare const SEOFields: Field[];
/**
 * 发布状态字段 - 所有页面通用
 */
export declare const PublishStatusFields: Field[];
/**
 * 导航栏字段 - 包含导航配置
 */
export declare const NavigationFields: Field[];
/**
 * 页脚字段 - 包含页脚配置
 */
export declare const FooterFields: Field[];
/**
 * Hero 部分字段
 */
export declare const HeroSectionFields: Field[];
/**
 * 功能列表字段
 */
export declare const FeaturesFields: Field[];
/**
 * 推荐信字段
 */
export declare const TestimonialsFields: Field[];
/**
 * CTA 块字段
 */
export declare const CTABlockFields: Field[];
/**
 * 侧边栏导航字段 - 用于仪表板类页面
 */
export declare const SidebarNavigationFields: Field[];
/**
 * 统计卡片字段
 */
export declare const StatsCardsFields: Field[];
/**
 * 表格配置字段
 */
export declare const TableConfigFields: Field[];
/**
 * 表单字段组
 */
export declare const FormFieldsConfig: Field[];
/**
 * 生成基础页面配置
 * @param slug - 集合 slug
 * @param name - 集合名称
 * @param fields - 自定义字段
 */
export declare function generatePageCollection(slug: string, name: string, fields?: Field[]): Partial<CollectionConfig>;
/**
 * 生成导航页面配置（包含导航栏和页脚）
 */
export declare function generateNavPageCollection(slug: string, name: string, fields?: Field[]): Partial<CollectionConfig>;
/**
 * 生成仪表板页面配置（包含侧边栏）
 */
export declare function generateDashboardCollection(slug: string, name: string, fields?: Field[]): Partial<CollectionConfig>;
//# sourceMappingURL=field-templates.d.ts.map