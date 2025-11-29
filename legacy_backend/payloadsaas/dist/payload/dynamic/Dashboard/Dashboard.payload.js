import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Dashboard = {
    slug: 'dashboard',
    admin: { useAsTitle: 'page_title' },
    access: { read: () => true },
    fields: [
        { name: 'page_title', type: 'text', required: true, maxLength: 60 },
        { name: 'brand_name', type: 'text', required: true, maxLength: 20 },
        {
            name: 'nav_items',
            type: 'array',
            minRows: 1,
            maxRows: 10,
            fields: [{ name: 'label', type: 'text', required: true }],
        },
        {
            name: 'current_user',
            type: 'group',
            fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'email', type: 'text', required: true },
                { name: 'avatar', type: 'upload', relationTo: 'media' },
            ],
        },
        {
            name: 'credit_stat',
            type: 'group',
            fields: [
                { name: 'label', type: 'text' },
                { name: 'value', type: 'text' },
                { name: 'action', type: 'text' },
            ],
        },
        {
            name: 'ai_status_stat',
            type: 'group',
            fields: [
                { name: 'label', type: 'text' },
                { name: 'value', type: 'text' },
                { name: 'status', type: 'select', options: ['success', 'warning', 'error'] },
            ],
        },
        { name: 'shops_section_title', type: 'text', maxLength: 50 },
        {
            name: 'shops',
            type: 'array',
            fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true },
                { name: 'domain', type: 'text' },
                { name: 'logo', type: 'upload', relationTo: 'media' },
                { name: 'status', type: 'select', options: ['Live', 'Maintenance', 'Draft'], required: true },
                { name: 'todaySales', type: 'number', min: 0 },
                { name: 'todayOrders', type: 'number', min: 0 },
            ],
        },
        { name: 'add_shop_cta', type: 'text', maxLength: 30 },
        { name: 'manage_shop_cta', type: 'text', maxLength: 20 },
        { name: 'view_store_cta', type: 'text', maxLength: 20 },
    ],
};
// app/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Separator from '@radix-ui/react-separator';
import * as Avatar from '@radix-ui/react-avatar';
import * as Card from '@radix-ui/react-card';
import * as Badge from '@radix-ui/react-badge';
import * as Button from '@radix-ui/react-button';
import * as Theme from '@radix-ui/react-theme';
const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
}).format(value ?? 0);
/* ---------- Hooks ---------- */
const useDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch('/api/dashboard?limit=1')
            .then((r) => (r.ok ? r.json() : Promise.reject(r)))
            .then((json) => setData(json.docs[0]))
            .catch((e) => setError(e.statusText || 'Network error'))
            .finally(() => setLoading(false));
    }, []);
    return { data, loading, error };
};
/* ---------- ThemeProvider ---------- */
export const ThemeProvider = ({ children }) => {
    React.useEffect(() => document.documentElement.classList.add('dark'), []);
    return (_jsx(Theme, { appearance: "dark", accentColor: "blue", children: children }));
};
/* ---------- SideNavBar ---------- */
export const SideNavBar = ({ data }) => (_jsxs("aside", { className: "w-64 h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900", children: [_jsxs("div", { className: "px-6 py-4 flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-md bg-blue-600" }), _jsx("span", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: data.brand_name })] }), _jsx(Separator.Root, { className: "h-px bg-gray-200 dark:bg-gray-800" }), _jsx(NavigationMenu.Root, { orientation: "vertical", className: "flex-1 px-4 py-6 space-y-2", children: data.nav_items.map(({ label }) => (_jsx(NavigationMenu.Item, { children: _jsxs(NavigationMenu.Link, { href: "#", className: "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800", children: [_jsx("span", { className: "material-symbols-outlined", children: "home" }), _jsx("span", { children: label })] }) }, label))) }), _jsx(Separator.Root, { className: "h-px bg-gray-200 dark:bg-gray-800" }), _jsxs("div", { className: "px-4 py-4 flex items-center gap-3", children: [_jsxs(Avatar.Root, { children: [_jsx(Avatar.Image, { src: data.current_user.avatar?.url, alt: data.current_user.name, className: "w-10 h-10 rounded-full" }), _jsx(Avatar.Fallback, { className: "w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-700 dark:text-gray-300", children: data.current_user.name.slice(0, 2).toUpperCase() })] }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: data.current_user.name }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: data.current_user.email })] })] })] }));
/* ---------- PageHeading ---------- */
export const PageHeading = ({ title, ctaLabel, onCtaClick, }) => (_jsxs("div", { className: "flex flex-wrap justify-between items-center gap-4", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: title }), _jsx(Button.Root, { onClick: onCtaClick, className: "px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700", children: ctaLabel })] }));
/* ---------- StatCard ---------- */
export const StatCard = ({ icon, label, value, linkLabel, onLinkClick, }) => (_jsxs(Card.Root, { className: "rounded-xl p-6 border border-gray-200 dark:border-gray-800", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [icon, _jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: label })] }), _jsx("p", { className: "text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4", children: value }), linkLabel && (_jsx(Button.Root, { onClick: onLinkClick, className: "text-sm text-blue-600 hover:underline", children: linkLabel }))] }));
/* ---------- ShopCard ---------- */
export const ShopCard = ({ shop, manageLabel, viewLabel, onManage, onView }) => {
    const badgeVariant = shop.status === 'Live' ? 'green' : shop.status === 'Maintenance' ? 'yellow' : 'gray';
    return (_jsxs(Card.Root, { className: "rounded-xl p-4 border border-gray-200 dark:border-gray-800", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar.Root, { children: [_jsx(Avatar.Image, { src: shop.logo?.url, alt: shop.name, className: "w-10 h-10 rounded-full" }), _jsx(Avatar.Fallback, { className: "w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-700 dark:text-gray-300", children: shop.name.slice(0, 2).toUpperCase() })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: shop.name }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: shop.domain })] })] }), _jsx(Badge.Root, { variant: badgeVariant, children: shop.status })] }), _jsx(Separator.Root, { className: "h-px bg-gray-200 dark:bg-gray-800 mb-4" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Revenue" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatCurrency(shop.todaySales) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Orders" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: shop.todayOrders })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button.Root, { onClick: onManage, className: "flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800", children: manageLabel }), _jsx(Button.Root, { onClick: onView, className: "flex-1 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700", children: viewLabel })] })] }));
};
/* ---------- Skeleton ---------- */
const Skeleton = () => (_jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-gray-700 rounded w-1/3 mb-4" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-6", children: [_jsx("div", { className: "h-32 bg-gray-800 rounded" }), _jsx("div", { className: "h-32 bg-gray-800 rounded" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6", children: [...Array(3)].map((_, i) => (_jsx("div", { className: "h-64 bg-gray-800 rounded" }, i))) })] }));
/* ---------- Error ---------- */
const Error = ({ message }) => (_jsx("div", { className: "flex items-center justify-center h-full text-red-400", children: message }));
/* ---------- Example App ---------- */
export const App = () => {
    const { data, loading, error } = useDashboard();
    if (loading)
        return _jsx(Skeleton, {});
    if (error || !data)
        return _jsx(Error, { message: error || 'No data' });
    return (_jsx(ThemeProvider, { children: _jsxs("div", { className: "flex h-screen", children: [_jsx(SideNavBar, { data: data }), _jsxs("main", { className: "flex-1 p-6 overflow-auto", children: [_jsx(PageHeading, { title: data.page_title, ctaLabel: data.add_shop_cta, onCtaClick: () => console.log('Add shop') }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-8", children: [_jsx(StatCard, { icon: _jsx("span", { className: "text-xl", children: "\u26A1" }), label: data.credit_stat.label, value: data.credit_stat.value, linkLabel: data.credit_stat.action }), _jsx(StatCard, { icon: _jsx("span", { className: "text-xl", children: "\uD83E\uDD16" }), label: data.ai_status_stat.label, value: `${data.ai_status_stat.value} ${data.ai_status_stat.status ? `• ${data.ai_status_stat.status}` : ''}`.trim() })] }), _jsxs("section", { className: "mt-10 space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: data.shops_section_title }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", children: data.shops.map((shop) => (_jsx(ShopCard, { shop: shop, manageLabel: data.manage_shop_cta, viewLabel: data.view_store_cta }, shop.slug))) })] })] })] }) }));
};
//# sourceMappingURL=Dashboard.payload.js.map