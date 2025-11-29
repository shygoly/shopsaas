import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarTrigger, MainContent } from '@radix-ui/react-sidebar';
import { Navigation as RadixNavigation } from '@radix-ui/react-navigation';
import { Card as RadixCard } from '@radix-ui/react-card';
import { Button as RadixButton } from '@radix-ui/react-button';
const Page = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Define any functions needed for the component
    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    // Fetch data from Payload CMS
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://your-payload-cms-api.com/api/AIAssistantManagement');
                const result = await response.json();
                setData(result);
            }
            catch (err) {
                setError('Failed to fetch data from Payload CMS');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    if (loading)
        return _jsx("div", { children: "Loading..." });
    if (error)
        return _jsxs("div", { children: ["Error: ", error] });
    return (_jsxs("div", { className: "relative flex min-h-screen w-full", children: [_jsxs(Sidebar, { onOpenChange: setIsSidebarOpen, children: [_jsx(SidebarTrigger, { asChild: true, children: _jsx(RadixButton, { className: "text-white bg-black p-2 rounded-md", children: "Toggle Sidebar" }) }), _jsx(SidebarContent, { className: "flex h-screen flex-col bg-[#111418] p-4 w-64 sticky top-0", children: _jsx("div", { className: "flex h-full flex-col justify-between", children: _jsx(RadixNavigation, { className: "flex flex-col gap-2" }) }) })] }), _jsxs(MainContent, { className: "flex-grow", children: [_jsxs("main", { className: "flex flex-wrap justify-between items-center gap-3 mb-8", children: [_jsx("h1", { children: data?.the_dunder_mifflin_shop }), _jsx("h1", { children: data?.ai_assistant_management }), _jsx("h2", { children: data?.ai_assistant_status }), _jsx("h2", { children: data?.what_does_the_ai_assistant_do }), _jsx("h3", { children: data?.automated_customer_support }), _jsx("h3", { children: data?.product_recommendation_engine }), _jsx("h3", { children: data?.sales_trend_analysis })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 flex flex-col gap-8", children: [_jsxs(RadixCard, { className: "bg-white dark:bg-[#1C2127] rounded-xl shadow-sm p-6", children: [_jsx("p", { dangerouslySetInnerHTML: { __html: data?._supercharge_your_shop_with_ai } }), _jsx("p", { dangerouslySetInnerHTML: { __html: data?.instantly_answer_common_custom } }), _jsx("p", { dangerouslySetInnerHTML: { __html: data?.increase_average_order_value_w } }), _jsx("p", { dangerouslySetInnerHTML: { __html: data?.get_actionable_insights_from_y } })] }), _jsx(RadixCard, { className: "bg-white dark:bg-[#1C2127] rounded-xl shadow-sm p-6" })] }), _jsx("div", { className: "lg:col-span-1", children: _jsxs(RadixCard, { className: "bg-white dark:bg-[#1C2127] rounded-xl shadow-sm p-6 sticky top-8", children: [_jsx("h2", { children: data?.billing_details }), _jsx("p", { dangerouslySetInnerHTML: { __html: data?._note_charges_are_prorated_bas } })] }) })] }), _jsx(RadixButton, { className: "mt-6 w-full bg-inactive text-white font-medium py-2.5 px-4 rounded-lg cursor-not-allowed", disabled: true, children: data?._save_changes_ })] })] }));
};
export default Page;
//# sourceMappingURL=AIAssistantManagement.payload.js.map