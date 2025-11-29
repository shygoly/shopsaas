/**
 * 统一的 Payload CMS 配置文件
 * 集成所有页面集合，使用共享字段模板
 */
import { CollectionConfig } from 'payload/types';
/**
 * 页面集合定义
 */
declare const LandingPageCollection: CollectionConfig;
declare const DashboardCollection: CollectionConfig;
declare const RegistrationCollection: CollectionConfig;
declare const ShopDetailsCollection: CollectionConfig;
declare const AIAssistantCollection: CollectionConfig;
declare const ShopManagementCollection: CollectionConfig;
declare const CreateShopCollection: CollectionConfig;
declare const BillingCollection: CollectionConfig;
/**
 * Media 集合 - 用于上传图片、视频等
 */
declare const MediaCollection: CollectionConfig;
/**
 * 用户集合
 */
declare const UsersCollection: CollectionConfig;
/**
 * 导出统一配置
 */
declare const _default: any;
export default _default;
/**
 * 导出集合配置供独立使用
 */
export { LandingPageCollection, DashboardCollection, RegistrationCollection, ShopDetailsCollection, AIAssistantCollection, ShopManagementCollection, CreateShopCollection, BillingCollection, MediaCollection, UsersCollection, };
//# sourceMappingURL=unified.config.d.ts.map