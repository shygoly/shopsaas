import React from 'react';
/**
 * 页脚配置类型
 */
export interface FooterLink {
    text: string;
    href: string;
    external?: boolean;
}
export interface FooterSection {
    title: string;
    links: FooterLink[];
}
export interface FooterConfig {
    logo?: string;
    copyright?: string;
    sections?: FooterSection[];
}
/**
 * 可复用的页脚组件
 */
interface FooterProps {
    config: FooterConfig;
    variant?: 'light' | 'dark';
}
export declare const Footer: React.FC<FooterProps>;
export default Footer;
//# sourceMappingURL=Footer.d.ts.map