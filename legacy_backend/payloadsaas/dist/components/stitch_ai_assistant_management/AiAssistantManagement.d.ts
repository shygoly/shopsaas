import React from 'react';
type BreadcrumbItem = {
    label: string;
    href?: string;
};
type Feature = {
    icon: React.ReactNode;
    title: string;
    desc: string;
};
export declare const SideNavBar: React.FC;
export declare const Breadcrumbs: React.FC<{
    items: BreadcrumbItem[];
}>;
export declare const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    id: string;
}>;
export declare const FeatureList: React.FC<{
    features: Feature[];
}>;
export declare const BillingCard: React.FC<{
    plan: string;
    price: string;
    disabled: boolean;
    onSave: () => void;
}>;
export declare const MainLayout: React.FC<{
    children: React.ReactNode;
}>;
export declare const DemoPage: React.FC;
export default DemoPage;
//# sourceMappingURL=AiAssistantManagement.d.ts.map