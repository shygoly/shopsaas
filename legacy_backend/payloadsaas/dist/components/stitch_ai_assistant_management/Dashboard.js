import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from '@radix-ui/react-navigation-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Separator } from '@radix-ui/react-separator';
import { Button } from '@radix-ui/react-button';
import { Card, CardHeader, CardContent } from '@radix-ui/react-card';
import { Badge } from '@radix-ui/react-badge';
import { Plus, Store, CreditCard, Sparkles, TrendingUp, Users, Settings, LogOut } from 'lucide-react';
// SideNavBar Component
export const SideNavBar = () => {
    const router = useRouter();
    const navItems = [
        { label: 'Shops', href: '/shops', icon: Store },
        { label: 'Credits', href: '/credits', icon: CreditCard },
        { label: 'AI Tools', href: '/ai-tools', icon: Sparkles },
        { label: 'Analytics', href: '/analytics', icon: TrendingUp },
        { label: 'Customers', href: '/customers', icon: Users },
        { label: 'Settings', href: '/settings', icon: Settings },
    ];
    return (_jsxs("aside", { className: "w-64 h-screen flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-4 flex", children: [_jsx("div", { className: "mb-6", children: _jsx(Link, { href: "/", passHref: true, legacyBehavior: true, children: _jsx("a", { className: "text-xl font-bold text-gray-900 dark:text-gray-100", children: "ShopHub" }) }) }), _jsx(NavigationMenu, { orientation: "vertical", className: "flex-1 flex flex-col", children: navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = router.pathname.startsWith(item.href);
                    return (_jsx(NavigationMenuItem, { className: "mb-2", children: _jsx(Link, { href: item.href, passHref: true, legacyBehavior: true, children: _jsxs(NavigationMenuLink, { className: `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'}`, children: [_jsx(Icon, { className: "w-5 h-5" }), _jsx("span", { children: item.label })] }) }) }, item.href));
                }) }), _jsx(Separator, { className: "my-4 bg-gray-200 dark:bg-gray-800" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: "https://via.placeholder.com/40", alt: "User" }), _jsx(AvatarFallback, { children: "U" })] }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "John Doe" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "john@example.com" })] }), _jsx(Button, { variant: "ghost", size: "sm", className: "p-1", children: _jsx(LogOut, { className: "w-4 h-4 text-gray-500 dark:text-gray-400" }) })] })] }));
};
// PageHeading Component
export const PageHeading = ({ title, ctaLabel, ctaHref }) => {
    const router = useRouter();
    return (_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: title }), _jsxs(Button, { onClick: () => router.push(ctaHref), className: "inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition", children: [_jsx(Plus, { className: "w-4 h-4" }), ctaLabel] })] }));
};
// StatCard Component
export const StatCard = ({ icon: Icon, label, value, linkLabel, linkHref }) => (_jsx(Card, { className: "p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950", children: _jsxs(CardContent, { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-gray-100 dark:bg-gray-800 rounded-lg", children: _jsx(Icon, { className: "w-6 h-6 text-gray-700 dark:text-gray-300" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: label }), _jsx("p", { className: "text-2xl font-semibold text-gray-900 dark:text-gray-100", children: value })] })] }), linkLabel && linkHref && (_jsx(Link, { href: linkHref, passHref: true, legacyBehavior: true, children: _jsx("a", { className: "text-sm text-blue-600 dark:text-blue-400 hover:underline", children: linkLabel }) }))] }) }));
// ShopCard Component
export const ShopCard = ({ id, name, logo, status, sales, revenue, onEdit, onView }) => (_jsxs(Card, { className: "p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 grid gap-4", children: [_jsx(CardHeader, { className: "flex items-center justify-between flex-row", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: logo, alt: name }), _jsx(AvatarFallback, { children: name.slice(0, 2).toUpperCase() })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: name }), _jsx(Badge, { className: `px-2 py-0.5 text-xs rounded-full ${status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`, children: status })] })] }) }), _jsxs(CardContent, { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Sales" }), _jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: sales })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Revenue" }), _jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: revenue })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => onView(id), className: "flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition", children: "View" }), _jsx(Button, { onClick: () => onEdit(id), className: "flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition", children: "Edit" })] })] }));
//# sourceMappingURL=Dashboard.js.map