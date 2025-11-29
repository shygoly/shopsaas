import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
// 函数组件
const EmptyComponent = ({ collectionName }) => {
    // 使用 React Hooks 来管理组件状态
    const [state, setState] = useState({ isLoading: true });
    // 获取 Payload CMS 数据的逻辑
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://api.payloadcms.com/v1/collections/${collectionName}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }
                const data = await response.json();
                setState({ data, isLoading: false });
            }
            catch (error) {
                setState({ error: error instanceof Error ? error.message : 'Something went wrong', isLoading: false });
            }
        };
        fetchData();
    }, [collectionName]);
    // 组件渲染逻辑
    if (state.isLoading)
        return _jsx("div", { children: "Loading..." });
    if (state.error)
        return _jsxs("div", { children: ["Error: ", state.error] });
    return (_jsxs("div", { children: [_jsx("h1", { dangerouslySetInnerHTML: { __html: state.data?.dr_sell } }), _jsx("h1", { dangerouslySetInnerHTML: { __html: state.data?.credits_amp_billing } }), _jsx("h2", { dangerouslySetInnerHTML: { __html: state.data?.transaction_history } }), _jsx("h2", { dangerouslySetInnerHTML: { __html: state.data?.active_ai_services } }), _jsx("h3", { dangerouslySetInnerHTML: { __html: state.data?.ai_assistant_pro } }), _jsx("h3", { dangerouslySetInnerHTML: { __html: state.data?.image_optimizer_ai } }), _jsx("p", { dangerouslySetInnerHTML: { __html: state.data?.credits_amp_billing_content } }), _jsx("p", { dangerouslySetInnerHTML: { __html: state.data?.manage_your_credits_view_trans } }), _jsx("p", { dangerouslySetInnerHTML: { __html: state.data?.your_available_credit_balance } }), _jsx("p", { dangerouslySetInnerHTML: { __html: state.data?.advanced_product_description_g } }), _jsx("p", { dangerouslySetInnerHTML: { __html: state.data?.next_bill_on_nov_1_2023 } }), _jsx("p", { dangerouslySetInnerHTML: { __html: state.data?.automated_image_enhancement_an } }), _jsx("p", { dangerouslySetInnerHTML: { __html: state.data?.next_bill_on_nov_15_2023 } })] }));
};
export default EmptyComponent;
//# sourceMappingURL=CreditAndBilling.payload.js.map