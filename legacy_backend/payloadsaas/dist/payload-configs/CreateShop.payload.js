import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Breadcrumbs, BreadcrumbsItem, BreadcrumbsSeparator } from '@radix-ui/react-breadcrumbs';
import { Card, CardHeader, CardBody, CardFooter } from '@radix-ui/react-card';
import { Input } from '@radix-ui/react-input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectArrow } from '@radix-ui/react-select';
import { Button } from '@radix-ui/react-button';
// CreateNewShop component
const CreateNewShop = () => {
    // State for form data
    const [formData, setFormData] = useState({
        name: '',
        locale: 'en-US'
    });
    // State for Payload CMS data
    const [cmsData, setCmsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Handle form data changes
    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    const handleSelectChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    // Fetch data from Payload CMS
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://your-payload-cms-api.com/data/CreateShop');
                const data = await response.json();
                setCmsData(data);
            }
            catch (err) {
                setError('Failed to fetch data from Payload CMS');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    if (error)
        return _jsxs("div", { children: ["Error: ", error] });
    return (_jsx("div", { className: "relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden", children: _jsx("div", { className: "layout-container flex h-full grow flex-col", children: _jsx("div", { className: "px-4 sm:px-6 lg:px-8 py-5", children: _jsxs("div", { className: "layout-content-container mx-auto flex max-w-7xl flex-col flex-1 gap-8", children: [_jsxs("header", { children: [_jsxs(Breadcrumbs, { children: [_jsx(BreadcrumbsItem, { children: _jsx("a", { href: "#", children: "Home" }) }), _jsx(BreadcrumbsSeparator, { children: "ChevronRight" }), _jsx(BreadcrumbsItem, { children: _jsx("a", { href: "#", children: "Shops" }) }), _jsx(BreadcrumbsSeparator, { children: "ChevronRight" }), _jsx(BreadcrumbsItem, { children: _jsx("span", { children: "Create New Shop" }) })] }), _jsx("h1", { className: "text-2xl font-semibold", children: cmsData?.create_your_new_ecommerce_shop })] }), _jsxs("main", { className: "grid grid-cols-1 lg:grid-cols-5 gap-8", children: [_jsx("aside", { className: "lg:col-span-2 hidden lg:block" }), _jsx("div", { className: "col-span-3 lg:col-span-3", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: cmsData?.shop_details }), _jsxs(CardBody, { children: [_jsx(Input, { type: "text", name: "name", placeholder: "Shop Name", value: formData.name, onChange: handleInputChange, className: "mt-2" }), _jsxs(Select, { children: [_jsxs(SelectTrigger, { children: ["Locale: ", formData.locale] }), _jsx(SelectContent, { children: _jsx(SelectGroup, { label: "Locales", children: cmsData?.selection_1.map((locale) => (_jsx(SelectItem, { value: locale, children: locale }, locale))) }) }), _jsx(SelectArrow, {})] }), _jsx("select", { name: "locale", value: formData.locale, onChange: handleSelectChange, className: "mt-2", children: cmsData?.selection_1.map((locale) => (_jsx("option", { value: locale, children: locale }, locale))) })] }), _jsxs(CardFooter, { children: [_jsx(Button, { variant: "outline", children: cmsData?.back_to_my_shops }), _jsx(Button, { className: "ml-2", children: cmsData?.create_shop })] })] }) })] })] }) }) }) }));
};
export default CreateNewShop;
//# sourceMappingURL=CreateShop.payload.js.map