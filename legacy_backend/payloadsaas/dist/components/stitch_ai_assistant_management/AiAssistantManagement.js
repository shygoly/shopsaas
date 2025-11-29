import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Separator from '@radix-ui/react-separator';
import * as Avatar from '@radix-ui/react-avatar';
import * as Breadcrumb from '@radix-ui/react-breadcrumb';
import * as Switch from '@radix-ui/react-switch';
import { Flex, Box, Text } from '@radix-ui/react-flex';
import * as Card from '@radix-ui/react-card';
import * as Button from '@radix-ui/react-button';
import { ChevronRight, Home, Settings, CreditCard, Shield, Support, Language, DarkMode } from '@mui/icons-material';
// SideNavBar
export const SideNavBar = () => {
    const mainNav = [
        { label: 'Dashboard', href: '/', icon: _jsx(Home, { className: "w-5 h-5" }) },
        { label: 'Settings', href: '/settings', icon: _jsx(Settings, { className: "w-5 h-5" }) },
        { label: 'Billing', href: '/billing', icon: _jsx(CreditCard, { className: "w-5 h-5" }) },
    ];
    const footerNav = [
        { label: 'Support', href: '/support', icon: _jsx(Support, { className: "w-5 h-5" }) },
        { label: 'Language', href: '/language', icon: _jsx(Language, { className: "w-5 h-5" }) },
        { label: 'Dark Mode', href: '/theme', icon: _jsx(DarkMode, { className: "w-5 h-5" }) },
    ];
    return (_jsxs("aside", { className: "w-64 h-screen sticky top-0 flex flex-col justify-between bg-gray-900 text-white p-4", children: [_jsxs("div", { children: [_jsxs(Flex, { align: "center", gap: "3", className: "mb-6", children: [_jsxs(Avatar.Root, { className: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary", children: [_jsx(Avatar.Image, { src: "/logo.png", alt: "Logo" }), _jsx(Avatar.Fallback, { className: "text-white font-bold", children: "A" })] }), _jsx(Text, { size: "4", weight: "bold", children: "Admin" })] }), _jsx(NavigationMenu.Root, { orientation: "vertical", className: "flex flex-col gap-2", children: _jsx(NavigationMenu.List, { className: "flex flex-col gap-2", children: mainNav.map((item) => (_jsx(NavigationMenu.Item, { children: _jsxs(NavigationMenu.Link, { href: item.href, className: "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition", children: [item.icon, _jsx("span", { children: item.label })] }) }, item.href))) }) }), _jsx(Separator.Root, { className: "my-4 bg-gray-700 h-px" }), _jsx(NavigationMenu.Root, { orientation: "vertical", className: "flex flex-col gap-2", children: _jsx(NavigationMenu.List, { className: "flex flex-col gap-2", children: footerNav.map((item) => (_jsx(NavigationMenu.Item, { children: _jsxs(NavigationMenu.Link, { href: item.href, className: "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition", children: [item.icon, _jsx("span", { children: item.label })] }) }, item.href))) }) })] }), _jsx(Box, { className: "text-xs text-gray-400", children: "v1.0.0" })] }));
};
// Breadcrumbs
export const Breadcrumbs = ({ items }) => (_jsx(Breadcrumb.Root, { className: "flex flex-wrap gap-2 text-sm", children: _jsx(Breadcrumb.List, { className: "flex items-center gap-2", children: items.map((item, idx) => (_jsxs(React.Fragment, { children: [_jsx(Breadcrumb.Item, { children: item.href ? (_jsx(Breadcrumb.Link, { href: item.href, className: "text-primary hover:underline", children: item.label })) : (_jsx(Breadcrumb.Page, { className: "text-gray-700 dark:text-gray-300", children: item.label })) }), idx < items.length - 1 && (_jsx(Breadcrumb.Separator, { children: _jsx(ChevronRight, { className: "w-4 h-4 text-gray-500" }) }))] }, idx))) }) }));
// ToggleSwitch
export const ToggleSwitch = ({ checked, onChange, label, id }) => (_jsxs(Flex, { align: "center", gap: "2", children: [_jsx("label", { htmlFor: id, className: "text-sm text-gray-800 dark:text-gray-200", children: label }), _jsx(Switch.Root, { id: id, checked: checked, onCheckedChange: onChange, className: "relative inline-flex h-6 w-11 items-center rounded-full transition data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-700", children: _jsx(Switch.Thumb, { className: "block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" }) })] }));
// FeatureList
export const FeatureList = ({ features }) => (_jsx(Box, { className: "space-y-4", children: features.map((f, idx) => (_jsxs(Flex, { gap: "3", align: "start", children: [_jsx(Box, { className: "text-primary mt-1", children: f.icon }), _jsxs(Box, { children: [_jsx(Text, { weight: "bold", className: "text-gray-900 dark:text-gray-100", children: f.title }), _jsx(Text, { size: "2", className: "text-gray-600 dark:text-gray-400", children: f.desc })] })] }, idx))) }));
// BillingCard
export const BillingCard = ({ plan, price, disabled, onSave }) => (_jsxs(Card.Root, { className: "p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800", children: [_jsx(Card.Header, { children: _jsx(Text, { size: "5", weight: "bold", className: "text-gray-900 dark:text-gray-100", children: plan }) }), _jsx(Card.Content, { className: "mt-4", children: _jsx(Text, { className: "text-gray-700 dark:text-gray-300", children: price }) }), _jsx(Card.Footer, { className: "mt-6", children: _jsx(Button.Root, { onClick: onSave, disabled: disabled, className: `px-4 py-2 rounded-md text-white ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`, children: "Save" }) })] }));
// MainLayout
export const MainLayout = ({ children }) => (_jsxs("div", { className: "min-h-screen w-full flex", children: [_jsx(SideNavBar, {}), _jsx("main", { className: "flex-1 p-6 bg-gray-50 dark:bg-gray-900", children: children })] }));
// Demo Page
export const DemoPage = () => {
    const [aiEnabled, setAiEnabled] = useState(false);
    const [saved, setSaved] = useState(true);
    useEffect(() => {
        setSaved(false);
    }, [aiEnabled]);
    const features = [
        { icon: _jsx(Shield, { className: "w-6 h-6" }), title: 'Security', desc: 'Enterprise-grade security' },
        { icon: _jsx(Language, { className: "w-6 h-6" }), title: 'i18n', desc: 'Multi-language support' },
    ];
    const handleSave = () => {
        setSaved(true);
        // call API
    };
    return (_jsxs(MainLayout, { children: [_jsx(Breadcrumbs, { items: [{ label: 'Home', href: '/' }, { label: 'Settings' }] }), _jsxs(Box, { className: "mt-6 space-y-6", children: [_jsx(ToggleSwitch, { id: "ai-toggle", label: "Enable AI Assistant", checked: aiEnabled, onChange: setAiEnabled }), _jsx(FeatureList, { features: features }), _jsx(BillingCard, { plan: "Pro", price: "$29 / month", disabled: saved, onSave: handleSave })] })] }));
};
export default DemoPage;
//# sourceMappingURL=AiAssistantManagement.js.map