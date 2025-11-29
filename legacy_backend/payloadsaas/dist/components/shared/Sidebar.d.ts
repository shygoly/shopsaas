import React from 'react';
/**
 * 侧边栏导航项类型
 */
export interface SidebarItem {
    icon: string;
    label: string;
    href: string;
    badge?: string;
    children?: SidebarItem[];
    active?: boolean;
}
export interface SidebarConfig {
    items: SidebarItem[];
    userInfo?: {
        name: string;
        email: string;
        avatar?: string;
    };
}
/**
 * 可复用的侧边栏组件
 * 支持嵌套菜单和用户信息展示
 */
interface SidebarProps {
    config: SidebarConfig;
    variant?: 'light' | 'dark';
    collapsible?: boolean;
    onNavigate?: (href: string) => void;
}
export declare const Sidebar: React.FC<SidebarProps>;
export default Sidebar;
//# sourceMappingURL=Sidebar.d.ts.map