import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const DetailRow = ({ label, value }) => (_jsxs("div", { className: "flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4", children: [_jsx("span", { className: "text-xs uppercase tracking-wide text-gray-500", children: label }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: value ?? '—' })] }));
const DangerZoneCard = ({ title, description, cta, }) => (_jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-red-700", children: title }), _jsx("p", { className: "mt-2 text-sm text-red-600", children: description }), _jsx("button", { type: "button", className: "mt-4 inline-flex items-center rounded-lg border border-red-600 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-600 hover:text-white", children: cta || 'Delete shop' })] }));
const ShopDetailsPage = () => {
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch('/api/shopdetails?limit=1')
            .then((res) => (res.ok ? res.json() : Promise.reject(res)))
            .then((json) => setDoc(json.docs?.[0] ?? null))
            .catch((err) => setError(err?.statusText || 'Failed to load shop details'))
            .finally(() => setLoading(false));
    }, []);
    if (loading) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50 text-gray-600", children: "Loading shop details\u2026" }));
    }
    if (error || !doc) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50 text-red-600", children: error || 'No shop data available' }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "border-b border-gray-200 bg-white", children: _jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm uppercase tracking-wide text-gray-500", children: doc.drsell || 'DrSell' }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: doc.my_awesome_shop || 'My Awesome Shop' })] }), _jsx("span", { className: "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700", children: doc.shop_status || 'Active' })] }) }), _jsxs("main", { className: "mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[2fr,1fr]", children: [_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: doc.general_information || 'General information' }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: doc.core_details_about_the_shop }), _jsx("p", { className: "mt-1 text-sm text-gray-600", children: doc.myawesomeshopdrsellcom })] }), _jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: doc.configuration || 'Configuration' }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: doc.manage_the_shops_settings }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-2", children: [_jsx(DetailRow, { label: doc.domain || 'Domain', value: doc.myawesomeshopdrsellcom }), _jsx(DetailRow, { label: doc.shop_id || 'Shop ID', value: doc.shop_id }), _jsx(DetailRow, { label: doc.created_date || 'Created', value: doc.created_date }), _jsx(DetailRow, { label: doc.locale || 'Locale', value: doc.locale }), _jsx(DetailRow, { label: doc.language || 'Language', value: doc.language }), _jsx(DetailRow, { label: doc.theme || 'Theme', value: doc.theme })] })] })] }), _jsx("aside", { className: "space-y-6", children: _jsx(DangerZoneCard, { title: doc.danger_zone || 'Danger zone', description: doc.once_deleted_it_will_be_gone_f || doc.these_actions_are_irreversible, cta: doc.manage_the_shops_settings }) })] })] }));
};
export default ShopDetailsPage;
//# sourceMappingURL=ShopDetails.payload.js.map