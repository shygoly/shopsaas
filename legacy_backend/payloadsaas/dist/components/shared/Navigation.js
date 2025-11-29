'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
export const Navigation = ({ config, sticky = true, variant = 'light', onLogoClick, }) => {
    const { logo, brandName, links = [], ctaButtons = [] } = config;
    const bgClass = variant === 'dark'
        ? 'bg-[#111418] dark:bg-background-dark border-gray-800'
        : 'bg-background-light/80 dark:bg-background-dark/80 border-gray-200/50 dark:border-white/10';
    const textClass = variant === 'dark'
        ? 'text-white'
        : 'text-gray-600 dark:text-gray-300';
    return (_jsxs("header", { className: `${sticky ? 'sticky top-0 z-50' : ''} flex items-center justify-between whitespace-nowrap border-b border-solid ${bgClass} px-10 py-3 backdrop-blur-sm transition-colors`, children: [_jsxs("div", { className: "flex items-center gap-4", children: [logo && (_jsx("img", { src: logo, alt: "Logo", className: "h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity", onClick: onLogoClick })), brandName && (_jsx("h2", { className: "text-lg font-bold leading-tight tracking-[-0.015em] text-gray-800 dark:text-white", children: brandName }))] }), _jsx(NavigationMenu.Root, { className: "hidden flex-1 justify-end gap-8 md:flex", children: _jsx(NavigationMenu.List, { className: "flex items-center gap-9", children: links.map((link) => (_jsx(NavigationMenu.Item, { children: _jsx("a", { href: link.href, target: link.external ? '_blank' : undefined, rel: link.external ? 'noopener noreferrer' : undefined, className: `text-sm font-medium leading-normal transition-colors hover:text-primary dark:hover:text-primary ${textClass}`, children: link.label }) }, link.href))) }) }), _jsx("div", { className: "hidden flex-col gap-2 md:flex md:flex-row", children: ctaButtons.map((button, idx) => (_jsx(NavButton, { text: button.text, href: button.href, variant: button.variant }, idx))) }), _jsx("div", { className: "flex md:hidden", children: _jsx(MobileMenu, { links: links, buttons: ctaButtons }) })] }));
};
export const NavButton = ({ text, href, variant = 'primary', onClick, }) => {
    const baseClass = 'flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] transition-all';
    const variantClass = {
        primary: 'bg-primary text-white hover:opacity-90',
        secondary: 'bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20',
        ghost: 'border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
    }[variant];
    return (_jsx("a", { href: href, onClick: onClick, className: `${baseClass} ${variantClass}`, children: _jsx("span", { className: "truncate", children: text }) }));
};
const MobileMenu = ({ links, buttons }) => {
    return (_jsxs(DropdownMenu.Root, { children: [_jsx(DropdownMenu.Trigger, { asChild: true, children: _jsx("button", { className: "flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800", children: _jsx("span", { className: "material-symbols-outlined text-gray-600 dark:text-gray-300", children: "menu" }) }) }), _jsx(DropdownMenu.Portal, { children: _jsxs(DropdownMenu.Content, { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111418] shadow-lg", sideOffset: 5, children: [links.map((link) => (_jsx(DropdownMenu.Item, { asChild: true, children: _jsx("a", { href: link.href, target: link.external ? '_blank' : undefined, className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors", children: link.label }) }, link.href))), _jsx(DropdownMenu.Separator, { className: "my-1 h-px bg-gray-200 dark:bg-gray-700" }), buttons.map((button, idx) => (_jsx(DropdownMenu.Item, { asChild: true, children: _jsx("a", { href: button.href, className: `px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${button.variant === 'primary'
                                    ? 'bg-primary text-white hover:opacity-90'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`, children: button.text }) }, idx)))] }) })] }));
};
export default Navigation;
//# sourceMappingURL=Navigation.js.map