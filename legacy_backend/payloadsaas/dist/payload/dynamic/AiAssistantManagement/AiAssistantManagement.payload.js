import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Payload CMS 动态数据版本
 * 集合：AiAssistantManagement
 */
import React, { useEffect, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Separator from '@radix-ui/react-separator';
import * as Avatar from '@radix-ui/react-avatar';
import * as Breadcrumb from '@radix-ui/react-breadcrumb';
import * as Switch from '@radix-ui/react-switch';
import * as Card from '@radix-ui/react-card';
import * as Badge from '@radix-ui/react-badge';
import { Box } from '@radix-ui/react-box';
import { ChevronRight, Zap, Shield, BarChart3, HeadphonesIcon } from 'lucide-react';
import { usePayload } from '@payloadcms/live-preview-react'; // 或者你项目的真实 hook
import { format } from 'date-fns';
/* ------------------------------------------------------------------ */
/* SideNavBar                                                         */
/* ------------------------------------------------------------------ */
export const SideNavBar = () => {
    const { data, isLoading, error } = usePayload({
        collection: 'AiAssistantManagement',
        depth: 0,
    });
    if (isLoading)
        return _jsx("aside", { className: "w-64 h-screen bg-gray-950 text-white p-4", children: "Loading\u2026" });
    if (error)
        return _jsx("aside", { className: "w-64 h-screen bg-gray-950 text-white p-4", children: "Error loading nav" });
    const { shopLogo, shopLogoAlt, shopDomain, navItems = [] } = data || {};
    return (_jsxs("aside", { className: "w-64 h-screen sticky top-0 bg-gray-950 text-white flex flex-col p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsxs(Avatar.Root, { className: "inline-flex items-center justify-center align-middle overflow-hidden w-10 h-10 rounded-full bg-gray-800", children: [_jsx(Avatar.Image, { src: shopLogo?.url || '/placeholder-logo.png', alt: shopLogoAlt || 'Shop Logo', className: "w-full h-full object-cover" }), _jsx(Avatar.Fallback, { className: "w-full h-full flex items-center justify-center bg-gray-700 text-sm font-medium", children: "SL" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-lg font-semibold", children: "ShopLens" }), shopDomain && _jsx("p", { className: "text-xs text-gray-400", children: shopDomain })] })] }), _jsx(NavigationMenu.Root, { className: "flex-1 flex flex-col", orientation: "vertical", children: _jsx(NavigationMenu.List, { className: "m-0 list-none p-0 flex flex-col gap-1", children: navItems.map((item) => (_jsx(NavigationMenu.Item, { children: _jsx(NavigationMenu.Link, { href: item.href, className: `block px-3 py-2 rounded-md hover:bg-white/10 transition-colors ${item.active ? 'bg-white/10' : ''}`, children: item.label }) }, item.href))) }) }), _jsx(Separator.Root, { className: "bg-gray-700 h-px w-full my-4" }), _jsx(NavigationMenu.Root, { orientation: "vertical", children: _jsx(NavigationMenu.List, { className: "m-0 list-none p-0 flex flex-col gap-1", children: navItems
                        .filter((i) => i.href === '/settings' || i.href === '/help')
                        .map((link) => (_jsx(NavigationMenu.Item, { children: _jsx(NavigationMenu.Link, { href: link.href, className: "block px-3 py-2 rounded-md hover:bg-white/10 transition-colors", children: link.label }) }, link.href))) }) })] }));
};
/* ------------------------------------------------------------------ */
/* Breadcrumbs                                                        */
/* ------------------------------------------------------------------ */
export const Breadcrumbs = () => {
    const { data } = usePayload({ collection: 'AiAssistantManagement', depth: 0 });
    const crumbs = data?.breadcrumbs || [];
    return (_jsx(Breadcrumb.Root, { children: _jsx(Breadcrumb.List, { className: "flex flex-wrap gap-2 text-sm", children: crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return (_jsx(React.Fragment, { children: _jsx(Breadcrumb.Item, { children: isLast ? (_jsx(Breadcrumb.Page, { className: "text-gray-700 dark:text-gray-300", children: crumb.label })) : (_jsxs(_Fragment, { children: [_jsx(Breadcrumb.Link, { href: crumb.href, className: "text-gray-500 hover:text-primary transition-colors", children: crumb.label }), _jsx(ChevronRight, { className: "w-3 h-3 mx-1 text-gray-400" })] })) }) }, idx));
            }) }) }));
};
/* ------------------------------------------------------------------ */
/* ToggleCard                                                         */
/* ------------------------------------------------------------------ */
export const ToggleCard = () => {
    const { data, update } = usePayload({ collection: 'AiAssistantManagement', depth: 0 });
    const [checked, setChecked] = useState(data?.aiAssistantEnabled ?? false);
    useEffect(() => {
        setChecked(data?.aiAssistantEnabled ?? false);
    }, [data?.aiAssistantEnabled]);
    const handleChange = async (val) => {
        setChecked(val);
        await update({ aiAssistantEnabled: val });
    };
    const status = data?.aiAssistantStatus || 'Inactive';
    return (_jsxs(Card.Root, { className: "p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Card.Title, { className: "text-lg font-semibold", children: "AI Assistant" }), _jsx(Card.Description, { className: "text-sm text-gray-600 dark:text-gray-400", children: "Enable smart product recommendations" })] }), _jsx(Switch.Root, { checked: checked, onCheckedChange: handleChange, className: "w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer", children: _jsx(Switch.Thumb, { className: "block w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" }) })] }), _jsx("div", { className: "mt-4", children: _jsx(Badge.Root, { color: status === 'Active' ? 'green' : 'gray', className: "px-2 py-1 rounded-full text-xs", children: status }) })] }));
};
/* ------------------------------------------------------------------ */
/* InfoPanel                                                          */
/* ------------------------------------------------------------------ */
export const InfoPanel = () => {
    const { data } = usePayload({ collection: 'AiAssistantManagement', depth: 0 });
    const features = data?.aiFeatures || [];
    const iconMap = {
        support_agent: HeadphonesIcon,
        auto_awesome: Zap,
        insights: BarChart3,
    };
    return (_jsxs(Card.Root, { className: "p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm space-y-4", children: [_jsx(Card.Title, { className: "text-lg font-semibold", children: "Features" }), _jsx("ul", { className: "space-y-3", children: features.map((item, idx) => {
                    const Icon = iconMap[item.icon] || Shield;
                    return (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx(Box, { className: "flex items-center justify-center w-5 h-5 text-blue-600", children: _jsx(Icon, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: item.title }), _jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: item.description })] })] }, idx));
                }) })] }));
};
/* ------------------------------------------------------------------ */
/* BillingCard                                                        */
/* ------------------------------------------------------------------ */
export const BillingCard = () => {
    const { data } = usePayload({ collection: 'AiAssistantManagement', depth: 0 });
    const cost = data?.aiServiceCost ?? 29;
    const currency = data?.aiServiceCurrency ?? '$';
    const cycle = data?.aiServiceCycle ?? 'month';
    const next = data?.aiNextBillingDate ? format(new Date(data.aiNextBillingDate), 'PPP') : '—';
    const notice = data?.billingNotice || '';
    return (_jsxs(Card.Root, { className: "p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm sticky top-8", children: [_jsxs(Card.Header, { children: [_jsx(Card.Title, { className: "text-lg font-semibold", children: "Billing" }), _jsx(Card.Description, { className: "text-sm text-gray-600 dark:text-gray-400", children: "Current plan and pricing" })] }), _jsxs(Card.Content, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsxs("span", { className: "text-2xl font-bold", children: [currency, cost] }), _jsxs("span", { className: "text-sm text-gray-500", children: ["/", cycle] })] }), _jsx(Badge.Root, { className: "px-2 py-1 rounded-full text-xs", children: "Pro Plan" }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Next billing: ", next] }), notice && _jsx("p", { className: "text-xs text-gray-500", children: notice })] }), _jsx(Card.Footer, { children: _jsx("button", { disabled: true, className: "w-full py-2 px-4 rounded-md font-medium transition-colors bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed", children: data?.saveButtonLabel || 'Upgrade' }) })] }));
};
/* ------------------------------------------------------------------ */
/* ExamplePage（入口）                                                */
/* ------------------------------------------------------------------ */
export const ExamplePage = () => (_jsxs("div", { className: "flex", children: [_jsx(SideNavBar, {}), _jsxs("main", { className: "flex-1 p-8 space-y-6", children: [_jsx(Breadcrumbs, {}), _jsx(ToggleCard, {}), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx(InfoPanel, {}), _jsx(BillingCard, {})] })] })] }));
//# sourceMappingURL=AiAssistantManagement.payload.js.map