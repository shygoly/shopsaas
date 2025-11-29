import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Separator from '@radix-ui/react-separator';
import * as Avatar from '@radix-ui/react-avatar';
import * as Badge from '@radix-ui/react-badge';
import { ChevronRight, Store, Home, ShoppingBag, Users, Settings, HelpCircle, LogOut, Bell, Search, Save, ExternalLink, Trash2, Check, ChevronDown, } from 'lucide-react';
/* ------------------------------------------------------------------ */
/* Layout: SideNavBar                                                 */
/* ------------------------------------------------------------------ */
const SideNavBar = () => {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'shops', label: 'Shops', icon: Store, active: true },
        { id: 'products', label: 'Products', icon: ShoppingBag },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    const bottomItems = [
        { id: 'help', label: 'Help', icon: HelpCircle },
        { id: 'logout', label: 'Logout', icon: LogOut },
    ];
    return (_jsxs(NavigationMenu.Root, { orientation: "vertical", className: "w-64 h-full flex flex-col justify-between bg-gray-900 text-gray-100 dark:bg-gray-950", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-6 border-b border-gray-800", children: [_jsx(Store, { className: "w-6 h-6 text-primary" }), _jsx("span", { className: "text-lg font-semibold", children: "ShopAdmin" })] }), _jsx(NavigationMenu.List, { className: "flex flex-col gap-2 p-4", children: navItems.map((item) => (_jsx(NavigationMenu.Item, { asChild: true, children: _jsx(NavItem, { icon: item.icon, label: item.label, active: item.active }) }, item.id))) })] }), _jsx(NavigationMenu.List, { className: "flex flex-col gap-2 p-4 border-t border-gray-800", children: bottomItems.map((item) => (_jsx(NavigationMenu.Item, { asChild: true, children: _jsx(NavItem, { icon: item.icon, label: item.label }) }, item.id))) })] }));
};
/* ------------------------------------------------------------------ */
/* NavItem                                                            */
/* ------------------------------------------------------------------ */
const NavItem = ({ icon: Icon, label, active }) => (_jsxs(NavigationMenu.Link, { href: "#", "data-active": active, className: `
      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
      hover:bg-gray-800 dark:hover:bg-gray-800
      data-[active=true]:bg-primary data-[active=true]:text-white
    `, children: [_jsx(Icon, { className: "w-5 h-5" }), _jsx("span", { children: label })] }));
/* ------------------------------------------------------------------ */
/* Layout: TopNavBar                                                  */
/* ------------------------------------------------------------------ */
const TopNavBar = () => (_jsxs("header", { className: "sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Search, { className: "w-5 h-5 text-gray-500" }), _jsx("input", { type: "text", placeholder: "Search...", className: "bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { className: "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800", children: _jsx(Bell, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }) }), _jsx(UserAvatar, { src: "https://github.com/shadcn.png", fallback: "CN" })] })] }));
/* ------------------------------------------------------------------ */
/* UserAvatar                                                         */
/* ------------------------------------------------------------------ */
const UserAvatar = ({ src, fallback, }) => (_jsxs(Avatar.Root, { className: "size-10 rounded-full", children: [_jsx(Avatar.Image, { src: src, alt: "User", className: "size-full rounded-full object-cover" }), _jsx(Avatar.Fallback, { className: "flex items-center justify-center size-full rounded-full bg-gray-200 dark:bg-gray-800 text-sm font-medium", children: fallback })] }));
/* ------------------------------------------------------------------ */
/* Breadcrumbs                                                        */
/* ------------------------------------------------------------------ */
const Breadcrumbs = () => (_jsxs("nav", { className: "flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400", children: [_jsx("span", { children: "Shops" }), _jsx(ChevronRight, { className: "w-4 h-4" }), _jsx("span", { className: "text-gray-900 dark:text-gray-100", children: "My Shop" })] }));
/* ------------------------------------------------------------------ */
/* PageHeading                                                        */
/* ------------------------------------------------------------------ */
const PageHeading = () => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900 dark:text-gray-100", children: "My Shop" }), _jsx(ActiveStatusBadge, {})] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800", children: [_jsx(ExternalLink, { className: "w-4 h-4" }), "Visit Shop"] }), _jsxs("button", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90", children: [_jsx(Save, { className: "w-4 h-4" }), "Save Changes"] })] })] }));
/* ------------------------------------------------------------------ */
/* ActiveStatusBadge                                                  */
/* ------------------------------------------------------------------ */
const ActiveStatusBadge = () => (_jsx(Badge.Root, { className: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium", children: "Active" }));
/* ------------------------------------------------------------------ */
/* GeneralInfoCard                                                    */
/* ------------------------------------------------------------------ */
const GeneralInfoCard = () => (_jsxs("section", { className: "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm", children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-4", children: "General Information" }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Shop ID" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100 font-medium", children: "#12345" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Created" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100 font-medium", children: "12 Jun 2023" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Owner" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100 font-medium", children: "John Doe" })] })] })] }));
/* ------------------------------------------------------------------ */
/* ConfigurationCard                                                  */
/* ------------------------------------------------------------------ */
const ConfigurationCard = () => {
    const [shopEnabled, setShopEnabled] = useState(true);
    const [theme, setTheme] = useState('light');
    const [locale, setLocale] = useState('en');
    return (_jsxs("section", { className: "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm", children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-4", children: "Configuration" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Shop Enabled" }), _jsx(Switch.Root, { checked: shopEnabled, onCheckedChange: setShopEnabled, className: `
              relative w-10 h-6 rounded-full bg-gray-300 dark:bg-gray-700
              data-[state=checked]:bg-primary
              transition-colors
            `, children: _jsx(Switch.Thumb, { className: "block w-5 h-5 bg-white rounded-full shadow-md translate-x-0.5 data-[state=checked]:translate-x-[1.1rem] transition-transform" }) })] }), _jsx(Separator.Root, { className: "h-px bg-gray-200 dark:bg-gray-800" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 dark:text-gray-300 mb-2", children: "Theme" }), _jsxs(Select.Root, { value: theme, onValueChange: setTheme, children: [_jsxs(Select.Trigger, { className: "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm flex items-center justify-between", children: [_jsx("span", { children: theme === 'light' ? 'Light' : 'Dark' }), _jsx(ChevronDown, { className: "w-4 h-4" })] }), _jsx(Select.Portal, { children: _jsxs(Select.Content, { className: "rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-2 z-50", children: [_jsxs(Select.Item, { value: "light", className: "px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between", children: [_jsx(Select.ItemText, { children: "Light" }), _jsx(Select.ItemIndicator, { children: _jsx(Check, { className: "w-4 h-4" }) })] }), _jsxs(Select.Item, { value: "dark", className: "px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between", children: [_jsx(Select.ItemText, { children: "Dark" }), _jsx(Select.ItemIndicator, { children: _jsx(Check, { className: "w-4 h-4" }) })] })] }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 dark:text-gray-300 mb-2", children: "Language" }), _jsxs(Select.Root, { value: locale, onValueChange: setLocale, children: [_jsxs(Select.Trigger, { className: "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm flex items-center justify-between", children: [_jsx("span", { children: locale === 'en' ? 'English' : 'Spanish' }), _jsx(ChevronDown, { className: "w-4 h-4" })] }), _jsx(Select.Portal, { children: _jsxs(Select.Content, { className: "rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-2 z-50", children: [_jsxs(Select.Item, { value: "en", className: "px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between", children: [_jsx(Select.ItemText, { children: "English" }), _jsx(Select.ItemIndicator, { children: _jsx(Check, { className: "w-4 h-4" }) })] }), _jsxs(Select.Item, { value: "es", className: "px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between", children: [_jsx(Select.ItemText, { children: "Spanish" }), _jsx(Select.ItemIndicator, { children: _jsx(Check, { className: "w-4 h-4" }) })] })] }) })] })] })] })] }));
};
/* ------------------------------------------------------------------ */
/* DangerZoneCard                                                     */
/* ------------------------------------------------------------------ */
const DangerZoneCard = () => {
    const [open, setOpen] = useState(false);
    return (_jsxs("section", { className: "rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6 shadow-sm", children: [_jsx("h2", { className: "text-lg font-medium text-red-800 dark:text-red-300 mb-4", children: "Danger Zone" }), _jsx("p", { className: "text-sm text-red-700 dark:text-red-400 mb-4", children: "Deleting your shop is irreversible. Please proceed with caution." }), _jsxs(AlertDialog.Root, { open: open, onOpenChange: setOpen, children: [_jsx(AlertDialog.Trigger, { asChild: true, children: _jsxs("button", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700", children: [_jsx(Trash2, { className: "w-4 h-4" }), "Delete Shop"] }) }), _jsxs(AlertDialog.Portal, { children: [_jsx(AlertDialog.Overlay, { className: "fixed inset-0 bg-black/50 z-40" }), _jsxs(AlertDialog.Content, { className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-xl z-50", children: [_jsx(AlertDialog.Title, { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Confirm Deletion" }), _jsx(AlertDialog.Description, { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Are you absolutely sure? This action cannot be undone." }), _jsxs("div", { className: "mt-6 flex items-center justify-end gap-3", children: [_jsx(AlertDialog.Cancel, { asChild: true, children: _jsx("button", { className: "px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800", children: "Cancel" }) }), _jsx(AlertDialog.Action, { asChild: true, children: _jsx("button", { className: "px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700", children: "Delete" }) })] })] })] })] })] }));
};
/* ------------------------------------------------------------------ */
/* Main Page                                                          */
/* ------------------------------------------------------------------ */
const ShopSettingsPage = () => (_jsxs("div", { className: "flex h-screen bg-gray-50 dark:bg-gray-950", children: [_jsx(SideNavBar, {}), _jsxs("main", { className: "flex-1 flex flex-col overflow-y-auto", children: [_jsx(TopNavBar, {}), _jsxs("div", { className: "p-6 space-y-6", children: [_jsx(Breadcrumbs, {}), _jsx(PageHeading, {}), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(GeneralInfoCard, {}), _jsx(ConfigurationCard, {})] }), _jsx(DangerZoneCard, {})] })] })] }));
export default ShopSettingsPage;
//# sourceMappingURL=ShopDetails.js.map