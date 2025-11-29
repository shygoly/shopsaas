import React from 'react';
/**
 * 导航栏配置类型
 */
export interface NavLink {
    label: string;
    href: string;
    external?: boolean;
}
export interface NavButton {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'ghost';
}
export interface NavigationConfig {
    logo?: string;
    brandName?: string;
    links?: NavLink[];
    ctaButtons?: NavButton[];
}
/**
 * 可复用的导航栏组件
 * 支持多种页面类型的导航
 */
interface NavigationProps {
    config: NavigationConfig;
    sticky?: boolean;
    variant?: 'light' | 'dark';
    onLogoClick?: () => void;
}
export declare const Navigation: React.FC<NavigationProps>;
/**
 * CTA 按钮组件
 */
interface NavButtonProps {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    onClick?: () => void;
}
export declare const NavButton: React.FC<NavButtonProps>;
export default Navigation;
//# sourceMappingURL=Navigation.d.ts.map