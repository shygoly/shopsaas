'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
export const Sidebar = ({ config, variant = 'light', collapsible = false, onNavigate, }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState([]);
    const bgClass = variant === 'dark'
        ? 'bg-[#111418] dark:bg-[#0a0e15] border-gray-800'
        : 'bg-white dark:bg-[#111418] border-gray-200 dark:border-gray-800';
    const toggleItemExpand = (href) => {
        setExpandedItems((prev) => prev.includes(href)
            ? prev.filter((item) => item !== href)
            : [...prev, href]);
    };
    return (_jsxs("aside", { className: `flex ${collapsed ? 'w-20' : 'w-64'} flex-col ${bgClass} border-r p-4 transition-all duration-300`, children: [_jsxs("div", { className: "mb-8 flex items-center justify-between", children: [!collapsed && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "size-8 rounded-lg bg-primary/10 flex items-center justify-center", children: _jsx("span", { className: "material-symbols-outlined text-primary text-xl", children: "store" }) }), _jsx("h2", { className: "text-lg font-bold text-gray-900 dark:text-white", children: "DrSell" })] })), collapsible && (_jsx("button", { onClick: () => setCollapsed(!collapsed), className: "flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", "aria-label": "Toggle sidebar", children: _jsx("span", { className: "material-symbols-outlined text-gray-600 dark:text-gray-300", children: collapsed ? 'menu_open' : 'menu' }) }))] }), _jsx("nav", { className: "flex flex-1 flex-col gap-2", children: config.items.map((item) => (_jsx(SidebarItemComponent, { item: item, collapsed: collapsed, expanded: expandedItems.includes(item.href), onToggle: () => toggleItemExpand(item.href), onNavigate: onNavigate }, item.href))) }), config.userInfo && !collapsed && (_jsx("div", { className: "border-t border-gray-200 dark:border-gray-800 pt-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: config.userInfo.avatar || 'https://via.placeholder.com/40', alt: config.userInfo.name, className: "h-10 w-10 rounded-full" }), _jsxs("div", { className: "flex flex-col", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 dark:text-white", children: config.userInfo.name }), _jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: config.userInfo.email })] })] }) }))] }));
};
const SidebarItemComponent = ({ item, collapsed, expanded, onToggle, onNavigate, }) => {
    const hasChildren = item.children && item.children.length > 0;
    const handleClick = () => {
        if (hasChildren) {
            onToggle();
        }
        else {
            onNavigate?.(item.href);
        }
    };
    const baseClass = `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.active
        ? 'bg-primary/10 dark:bg-primary/20 text-primary'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`;
    return (_jsxs("div", { children: [_jsxs("button", { onClick: handleClick, className: baseClass + ' w-full text-left', title: collapsed ? item.label : undefined, children: [_jsx("span", { className: "material-symbols-outlined flex-shrink-0 text-base", children: item.icon }), !collapsed && (_jsxs(_Fragment, { children: [_jsx("span", { className: "flex-1", children: item.label }), item.badge && (_jsx("span", { className: "rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white", children: item.badge })), hasChildren && (_jsx("span", { className: "material-symbols-outlined text-base transition-transform", children: expanded ? 'expand_less' : 'expand_more' }))] }))] }), hasChildren && !collapsed && (_jsx(Collapsible.Root, { open: expanded, children: _jsx(Collapsible.Content, { className: "ml-4 mt-1 flex flex-col gap-1 border-l border-gray-200 dark:border-gray-800 pl-2", children: item.children?.map((child) => (_jsxs("button", { onClick: () => onNavigate?.(child.href), className: `flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-colors ${child.active
                            ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`, children: [child.icon && (_jsx("span", { className: "material-symbols-outlined text-sm", children: child.icon })), _jsx("span", { children: child.label })] }, child.href))) }) }))] }));
};
export default Sidebar;
//# sourceMappingURL=Sidebar.js.map