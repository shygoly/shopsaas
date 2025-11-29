'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Footer = ({ config, variant = 'light', }) => {
    const { logo, copyright = '© 2024. All rights reserved.', sections = [] } = config;
    const bgClass = variant === 'dark'
        ? 'bg-[#111418] dark:bg-[#0a0e15]'
        : 'bg-gray-50 dark:bg-[#0f1419]';
    const borderClass = variant === 'dark'
        ? 'border-gray-800'
        : 'border-gray-200/50 dark:border-white/10';
    return (_jsx("footer", { className: `${bgClass} border-t ${borderClass} py-8 md:py-12`, children: _jsxs("div", { className: "mx-auto max-w-7xl px-4", children: [_jsxs("div", { className: "mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [logo && (_jsx("img", { src: logo, alt: "Logo", className: "h-6 w-auto" })), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: copyright })] }), sections.map((section) => (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white", children: section.title }), _jsx("div", { className: "flex flex-col gap-1", children: section.links.map((link) => (_jsx("a", { href: link.href, target: link.external ? '_blank' : undefined, rel: link.external ? 'noopener noreferrer' : undefined, className: "text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors", children: link.text }, link.href))) })] }, section.title)))] }), _jsx("div", { className: `border-t ${borderClass} my-8` }), _jsxs("div", { className: "flex flex-col items-center justify-between gap-4 md:flex-row", children: [_jsx("p", { className: "text-xs text-gray-600 dark:text-gray-500", children: copyright }), _jsxs("div", { className: "flex gap-6", children: [_jsx("a", { href: "#", className: "text-xs text-gray-600 hover:text-primary dark:text-gray-500 dark:hover:text-primary transition-colors", children: "Terms" }), _jsx("a", { href: "#", className: "text-xs text-gray-600 hover:text-primary dark:text-gray-500 dark:hover:text-primary transition-colors", children: "Privacy" }), _jsx("a", { href: "#", className: "text-xs text-gray-600 hover:text-primary dark:text-gray-500 dark:hover:text-primary transition-colors", children: "Contact" })] })] })] }) }));
};
export default Footer;
//# sourceMappingURL=Footer.js.map