import React from 'react';
type StatCardProps = {
    icon: React.ElementType;
    label: string;
    value: string | number;
    linkLabel?: string;
    linkHref?: string;
};
type ShopStatus = 'active' | 'inactive';
type ShopCardProps = {
    id: string;
    name: string;
    logo: string;
    status: ShopStatus;
    sales: number;
    revenue: string;
    onEdit: (id: string) => void;
    onView: (id: string) => void;
};
export declare const SideNavBar: React.FC;
export declare const PageHeading: React.FC<{
    title: string;
    ctaLabel: string;
    ctaHref: string;
}>;
export declare const StatCard: React.FC<StatCardProps>;
export declare const ShopCard: React.FC<ShopCardProps>;
export {};
//# sourceMappingURL=Dashboard.d.ts.map