import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import * as TextField from '@radix-ui/react-text-field';
import * as Select from '@radix-ui/react-select';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import { Button } from 'ui/button';
import { Card } from 'ui/card';
import { Heading } from 'ui/heading';
import { Text } from 'ui/text';
import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const LOCALES = ['en-US', 'zh-CN', 'es-ES', 'fr-FR', 'de-DE'];
const THEMES = [
    { id: 'minimal', name: 'Minimal', thumb: '/themes/minimal.png' },
    { id: 'bold', name: 'Bold', thumb: '/themes/bold.png' },
    { id: 'elegant', name: 'Elegant', thumb: '/themes/elegant.png' },
];
const StoreContext = React.createContext(undefined);
const useStore = () => {
    const ctx = React.useContext(StoreContext);
    if (!ctx)
        throw new Error('useStore must be used inside StoreProvider');
    return ctx;
};
const StoreProvider = ({ children }) => {
    const [shopName, setShopName] = React.useState('');
    const [shopUrl, setShopUrl] = React.useState('');
    const [locale, setLocale] = React.useState('en-US');
    const [theme, setTheme] = React.useState('minimal');
    const value = React.useMemo(() => ({ shopName, setShopName, shopUrl, setShopUrl, locale, setLocale, theme, setTheme }), [shopName, shopUrl, locale, theme]);
    return _jsx(StoreContext.Provider, { value: value, children: children });
};
/* ------------------------------------------------------------------ */
/* Components                                                         */
/* ------------------------------------------------------------------ */
export const Breadcrumbs = () => (_jsxs("nav", { "aria-label": "Breadcrumb", className: "flex items-center gap-2 text-sm", children: [_jsx(Link, { href: "/dashboard", passHref: true, legacyBehavior: true, children: _jsx(Text, { as: "a", className: "text-muted-foreground hover:underline", children: "Dashboard" }) }), _jsx(Text, { className: "text-muted-foreground", children: "/" }), _jsx(Text, { children: "Create Shop" })] }));
export const PageHeading = ({ title, subtitle }) => (_jsxs("div", { className: "space-y-1", children: [_jsx(Heading, { as: "h1", size: "4xl", children: title }), subtitle && (_jsx(Text, { size: "sm", className: "text-muted-foreground", children: subtitle }))] }));
export const TextField = ({ placeholder }) => {
    const { shopName, setShopName } = useStore();
    return (_jsx(TextField.Root, { children: _jsx(TextField.Input, { value: shopName, onChange: (e) => setShopName(e.target.value), placeholder: placeholder, className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" }) }));
};
export const TextFieldWithAffix = () => {
    const { shopUrl, setShopUrl } = useStore();
    return (_jsxs("div", { className: "flex w-full items-center rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring", children: [_jsx(TextField.Root, { className: "flex-1", children: _jsx(TextField.Input, { value: shopUrl, onChange: (e) => setShopUrl(e.target.value), placeholder: "my-awesome-store", className: "w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none" }) }), _jsx(Text, { size: "sm", className: "ml-2 text-muted-foreground", children: ".myshop.com" })] }));
};
export const LocaleSelect = () => {
    const { locale, setLocale } = useStore();
    return (_jsxs(Select.Root, { value: locale, onValueChange: (v) => setLocale(v), children: [_jsxs(Select.Trigger, { className: "inline-flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring", children: [_jsx(Select.Value, {}), _jsx(Select.Icon, { className: "ml-2 h-4 w-4" })] }), _jsx(Select.Portal, { children: _jsx(Select.Content, { className: "z-50 rounded-md border bg-popover shadow-md", children: LOCALES.map((l) => (_jsx(Select.Item, { value: l, className: "relative cursor-pointer select-none px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground", children: _jsx(Select.ItemText, { children: l }) }, l))) }) })] }));
};
export const ThemeCardGrid = () => {
    const { theme, setTheme } = useStore();
    return (_jsx(RadioGroup.Root, { value: theme, onValueChange: (v) => setTheme(v), className: "grid grid-cols-3 gap-4", children: THEMES.map((t) => (_jsx(RadioGroup.Item, { value: t.id, asChild: true, className: twMerge('rounded-lg border-2 p-1 transition', theme === t.id ? 'border-ring' : 'border-transparent hover:border-border'), children: _jsxs(Card, { className: "cursor-pointer overflow-hidden", children: [_jsx(AspectRatio.Root, { ratio: 16 / 9, children: _jsx(Image, { src: t.thumb, alt: t.name, fill: true, className: "object-cover" }) }), _jsx("div", { className: "p-2 text-center", children: _jsx(Text, { size: "sm", weight: "medium", children: t.name }) })] }) }, t.id))) }));
};
export const ButtonGroup = ({ onBack, onCreate }) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { asChild: true, variant: "secondary", children: _jsx(Link, { href: "/dashboard", children: "Back" }) }), _jsx(Button, { onClick: onCreate, children: "Create" })] }));
export const LivePreview = () => (_jsxs(Card, { className: "sticky top-6 overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-2 border-b px-3 py-2", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-red-500" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-yellow-500" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-green-500" }), _jsx(Text, { size: "xs", className: "ml-auto text-muted-foreground", children: "Preview" })] }), _jsx(AspectRatio.Root, { ratio: 16 / 9, children: _jsx("div", { className: "flex h-full items-center justify-center bg-muted", children: _jsx(Text, { className: "text-muted-foreground", children: "Live preview placeholder" }) }) })] }));
/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function CreateShopPage() {
    return (_jsx(StoreProvider, { children: _jsxs("div", { className: "mx-auto grid max-w-6xl gap-8 p-6 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-8", children: [_jsx(Breadcrumbs, {}), _jsx(PageHeading, { title: "Create Shop", subtitle: "Fill in the details to get started." }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Shop Name" }), _jsx(TextField, { placeholder: "e.g. My Awesome Store" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Shop URL" }), _jsx(TextFieldWithAffix, {})] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Locale" }), _jsx(LocaleSelect, {})] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Theme" }), _jsx(ThemeCardGrid, {})] }), _jsx(ButtonGroup, {})] })] }), _jsx("div", { children: _jsx(LivePreview, {}) })] }) }));
}
//# sourceMappingURL=CreateShop.js.map