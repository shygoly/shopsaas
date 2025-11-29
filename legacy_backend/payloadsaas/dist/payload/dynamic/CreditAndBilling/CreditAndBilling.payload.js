import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// app/components/CreditAndBilling.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useConfig } from '@payloadcms/config';
/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const CreditAndBilling = () => {
    const router = useRouter();
    const { routes: { api }, } = useConfig();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    /* ------------------------- fetch data ------------------------- */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${api}/credit-and-billing`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!res.ok)
                    throw new Error(res.statusText);
                const json = await res.json();
                if (!json.docs?.length)
                    throw new Error('No document found');
                setData(json.docs[0]);
            }
            catch (err) {
                setError(err?.message || 'Unknown error');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);
    /* ------------------------- render ------------------------- */
    if (loading)
        return _jsx(Skeleton, {});
    if (error)
        return _jsx(ErrorMessage, { msg: error });
    if (!data)
        return _jsx(ErrorMessage, { msg: "No data" });
    const { userAvatar, userRole, mainNav, sidebarCtaLabel, creditBalance, addCreditsLabel, transactions, filterLabel, downloadStatementLabel, paginationTemplate, manageSubscriptionsLabel, aiServices, seoTitle, seoDescription, } = data;
    return (_jsxs(_Fragment, { children: [_jsx(SEO, { title: seoTitle, description: seoDescription }), _jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "profile", children: [_jsx("img", { className: "avatar", src: userAvatar.url, alt: "User avatar", width: 48, height: 48 }), _jsxs("div", { children: [_jsx("strong", { children: "Admin" }), _jsx("span", { className: "role", children: userRole })] })] }), _jsx("nav", { children: mainNav.map((item) => (_jsxs("a", { href: item.href, children: [_jsx("span", { className: "material-symbols-outlined", children: item.icon }), item.label] }, item.href))) }), _jsx("button", { className: "cta", children: sidebarCtaLabel })] }), _jsxs("main", { className: "content", children: [_jsxs("section", { className: "balance", children: [_jsx("h2", { children: "Balance" }), _jsxs("p", { className: "balance", children: ["$", creditBalance.toFixed(2)] }), _jsx("button", { children: addCreditsLabel })] }), _jsxs("section", { className: "transactions", children: [_jsxs("div", { className: "toolbar", children: [_jsx("button", { children: filterLabel }), _jsx("button", { children: downloadStatementLabel })] }), _jsxs("table", { className: "transactions", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Description" }), _jsx("th", { children: "Amount" })] }) }), _jsx("tbody", { children: transactions.map((tx) => (_jsxs("tr", { children: [_jsx("td", { children: new Date(tx.date).toLocaleDateString() }), _jsx("td", { children: tx.type }), _jsx("td", { children: tx.description }), _jsxs("td", { children: ["$", tx.amount.toFixed(2)] })] }, tx.id))) })] }), _jsx("div", { className: "pagination", children: paginationTemplate
                                    .replace('{{from}}', '1')
                                    .replace('{{to}}', String(transactions.length))
                                    .replace('{{total}}', '100') })] }), _jsxs("section", { className: "ai-services", children: [_jsxs("div", { className: "header", children: [_jsx("h2", { children: "Active AI Services" }), _jsx("button", { children: manageSubscriptionsLabel })] }), _jsx("div", { className: "grid", children: aiServices.map((svc) => (_jsxs("div", { className: "aiService", children: [_jsx("h3", { children: svc.name }), _jsx("p", { children: svc.description }), _jsx("p", { children: _jsxs("strong", { children: [svc.monthlyCredits, " credits/month"] }) }), _jsxs("p", { children: ["Next bill: ", new Date(svc.nextBillDate).toLocaleDateString()] })] }, svc.id))) })] })] })] }));
};
export default CreditAndBilling;
/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const SEO = ({ title, description }) => (_jsxs(_Fragment, { children: [_jsx("title", { children: title }), _jsx("meta", { name: "description", content: description })] }));
const Skeleton = () => (_jsxs("div", { className: "skeleton", children: [_jsx("aside", { className: "sidebar skeleton-bar" }), _jsx("main", { className: "content skeleton-bar" })] }));
const ErrorMessage = ({ msg }) => (_jsx("div", { className: "error", children: _jsxs("p", { children: ["Failed to load Credits & Billing: ", msg] }) }));
//# sourceMappingURL=CreditAndBilling.payload.js.map