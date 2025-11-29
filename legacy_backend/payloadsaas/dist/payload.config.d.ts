/**
 * Payload CMS Configuration
 * Unified configuration with PostgreSQL database
 * Port: 3020
 * Database: payloadsaas
 */
import type { CollectionConfig } from 'payload';
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
declare const _default: Promise<import("payload").SanitizedConfig>;
export default _default;
/**
 * 导出集合配置供独立使用
 */
export { LandingPageCollection, DashboardCollection, RegistrationCollection, ShopDetailsCollection, AIAssistantCollection, ShopManagementCollection, CreateShopCollection, BillingCollection, MediaCollection, UsersCollection, };
//# sourceMappingURL=payload.config.d.ts.map