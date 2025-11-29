import { CollectionConfig } from 'payload/types';
export declare const Dashboard: CollectionConfig;
import React from 'react';
type NavItem = {
    label: string;
};
type User = {
    name: string;
    email: string;
    avatar?: {
        url: string;
    };
};
type Stat = {
    label: string;
    value: string;
    action?: string;
};
type Shop = {
    name: string;
    slug: string;
    domain: string;
    logo?: {
        url: string;
    };
    status: 'Live' | 'Maintenance' | 'Draft';
    todaySales: number;
    todayOrders: number;
};
type DashboardData = {
    page_title: string;
    brand_name: string;
    nav_items: NavItem[];
    current_user: User;
    credit_stat: Stat;
    ai_status_stat: Stat & {
        status?: 'success' | 'warning' | 'error';
    };
    shops_section_title: string;
    shops: Shop[];
    add_shop_cta: string;
    manage_shop_cta: string;
    view_store_cta: string;
};
export declare const ThemeProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const SideNavBar: React.FC<{
    data: DashboardData;
}>;
export declare const PageHeading: React.FC<{
    title: string;
    ctaLabel: string;
    onCtaClick?: () => void;
}>;
export declare const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    linkLabel?: string;
    onLinkClick?: () => void;
}>;
export declare const ShopCard: React.FC<{
    shop: Shop;
    manageLabel: string;
    viewLabel: string;
    onManage?: () => void;
    onView?: () => void;
}>;
export declare const App: React.FC;
export {};
//# sourceMappingURL=Dashboard.payload.d.ts.map