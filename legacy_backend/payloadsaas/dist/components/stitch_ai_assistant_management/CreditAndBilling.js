import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { NavigationMenu } from '@radix-ui/react-navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@radix-ui/react-card';
import * as Table from '@radix-ui/react-table';
import * as Pagination from '@radix-ui/react-pagination';
import { ChevronLeft, ChevronRight, Download, Filter, Settings, LogOut, CreditCard, TrendingUp, Bot } from 'lucide-react';
// Layout Shell
const LayoutShell = ({ children }) => (_jsx(Slot, { className: "flex min-h-screen w-full", children: children }));
// SideNavBar
const SideNavBar = () => (_jsx(NavigationMenu, { orientation: "vertical", className: "w-64 border-r border-gray-200 dark:border-gray-800", children: _jsxs("div", { className: "flex flex-col h-full p-4", children: [_jsx(UserHeader, {}), _jsxs("nav", { className: "flex-1 py-6 space-y-2", children: [_jsx(NavLinks, { href: "#", icon: _jsx(CreditCard, {}), label: "Dashboard", active: true }), _jsx(NavLinks, { href: "#", icon: _jsx(TrendingUp, {}), label: "Analytics" }), _jsx(NavLinks, { href: "#", icon: _jsx(Bot, {}), label: "AI Services" })] }), _jsx(ActionButton, {}), _jsx(FooterLinks, {})] }) }));
// UserHeader
const UserHeader = () => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { className: "w-10 h-10", children: [_jsx(AvatarImage, { src: "/avatar.png", alt: "User Avatar" }), _jsx(AvatarFallback, { children: "DS" })] }), _jsx("div", { children: _jsx("span", { className: "text-sm font-medium dark:text-white", children: "Demo User" }) })] }));
// NavLinks
const NavLinks = ({ href, icon, label, active }) => (_jsxs(NavigationMenu.Link, { href: href, active: active, className: `flex items-center gap-3 px-3 py-2 rounded-lg ${active ? 'bg-primary/20 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`, children: [icon, _jsx("span", { children: label })] }));
// ActionButton
const ActionButton = () => (_jsxs("button", { "aria-label": "Settings", className: "flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800", children: [_jsx(Settings, { className: "w-5 h-5" }), _jsx("span", { children: "Settings" })] }));
// FooterLinks
const FooterLinks = () => (_jsx("div", { className: "mt-auto pt-4 border-t border-gray-200 dark:border-gray-800", children: _jsxs("button", { "aria-label": "Log Out", className: "flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800", children: [_jsx(LogOut, { className: "w-5 h-5" }), _jsx("span", { children: "Log Out" })] }) }));
// CreditBalanceSummary
const CreditBalanceSummary = () => (_jsxs(Card, { className: "p-6 rounded-xl shadow-sm", children: [_jsx(CardHeader, { children: _jsx("h3", { className: "text-lg font-semibold", children: "Credit Balance" }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-3xl font-bold", children: "$1,234.56" }), _jsx("p", { className: "text-sm text-gray-500", children: "Available credits" })] }), _jsx(CardFooter, { children: _jsx("button", { className: "px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90", children: "Top Up" }) })] }));
// TransactionHistory Table
const TransactionHistory = () => {
    const [page, setPage] = useState(1);
    const pageSize = 4;
    const transactions = [
        { id: '1', date: '2023-10-01', description: 'AI Service A', amount: -50.0, status: 'completed' },
        { id: '2', date: '2023-09-30', description: 'Top Up', amount: 100.0, status: 'completed' },
        { id: '3', date: '2023-09-29', description: 'AI Service B', amount: -30.0, status: 'pending' },
        { id: '4', date: '2023-09-28', description: 'AI Service C', amount: -20.0, status: 'failed' },
    ];
    const totalPages = Math.ceil(transactions.length / pageSize);
    const paginated = transactions.slice((page - 1) * pageSize, page * pageSize);
    return (_jsxs("section", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Transaction History" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { "aria-label": "Filter transactions", className: "p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800", children: _jsx(Filter, { className: "w-5 h-5" }) }), _jsx("button", { "aria-label": "Download transactions", className: "p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800", children: _jsx(Download, { className: "w-5 h-5" }) })] })] }), _jsxs(Table.Root, { className: "w-full text-sm", children: [_jsx(Table.Header, { children: _jsxs(Table.Row, { className: "border-b border-gray-200 dark:border-gray-800", children: [_jsx(Table.ColumnHeaderCell, { children: "Date" }), _jsx(Table.ColumnHeaderCell, { children: "Description" }), _jsx(Table.ColumnHeaderCell, { children: "Amount" }), _jsx(Table.ColumnHeaderCell, { children: "Status" })] }) }), _jsx(Table.Body, { children: paginated.map((tx) => (_jsxs(Table.Row, { className: "border-b border-gray-100 dark:border-gray-900", children: [_jsx(Table.Cell, { children: tx.date }), _jsx(Table.Cell, { children: tx.description }), _jsxs(Table.Cell, { className: tx.amount > 0 ? 'text-green-600' : 'text-red-600', children: [tx.amount > 0 ? '+' : '', "$", tx.amount.toFixed(2)] }), _jsx(Table.Cell, { children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs ${tx.status === 'completed'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : tx.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`, children: tx.status }) })] }, tx.id))) })] }), _jsx(TablePagination, { page: page, totalPages: totalPages, onPageChange: setPage })] }));
};
// TablePagination
const TablePagination = ({ page, totalPages, onPageChange }) => (_jsx(Pagination.Root, { page: page, total: totalPages * 4, pageSize: 4, onPageChange: onPageChange, children: _jsxs("div", { className: "flex items-center justify-between p-4", children: [_jsx(Pagination.Prev, { onClick: () => onPageChange(Math.max(1, page - 1)), disabled: page === 1, className: "p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) }), _jsxs("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Page ", page, " of ", totalPages] }), _jsx(Pagination.Next, { onClick: () => onPageChange(Math.min(totalPages, page + 1)), disabled: page === totalPages, className: "p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50", children: _jsx(ChevronRight, { className: "w-5 h-5" }) })] }) }));
// ActiveAIServices Grid
const ActiveAIServices = () => {
    const services = [
        { id: '1', name: 'AI Service A', description: 'Text generation', price: 50.0, nextBill: '2023-11-01' },
        { id: '2', name: 'AI Service B', description: 'Image recognition', price: 30.0, nextBill: '2023-11-05' },
        { id: '3', name: 'AI Service C', description: 'Speech synthesis', price: 20.0, nextBill: '2023-11-10' },
    ];
    return (_jsxs("section", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Active AI Services" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: services.map((s) => (_jsxs(Card, { className: "p-4 rounded-xl shadow-sm", children: [_jsx(CardHeader, { children: _jsx("h4", { className: "font-semibold", children: s.name }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: s.description }), _jsxs("p", { className: "mt-2 text-lg font-bold", children: ["$", s.price.toFixed(2), " / mo"] })] }), _jsx(CardFooter, { children: _jsxs("p", { className: "text-xs text-gray-500", children: ["Next bill: ", s.nextBill] }) })] }, s.id))) })] }));
};
// Main App
const App = () => (_jsxs(LayoutShell, { children: [_jsx(SideNavBar, {}), _jsxs("main", { className: "flex-1 p-6 space-y-6", children: [_jsx(CreditBalanceSummary, {}), _jsx(TransactionHistory, {}), _jsx(ActiveAIServices, {})] })] }));
export default App;
//# sourceMappingURL=CreditAndBilling.js.map