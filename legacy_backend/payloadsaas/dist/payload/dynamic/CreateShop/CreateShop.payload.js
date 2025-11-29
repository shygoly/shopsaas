// app/(frontend)/create-shop/CreateShopPage.client.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as TextField from "@radix-ui/react-text-field";
import * as Select from "@radix-ui/react-select";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Card from "@radix-ui/react-card";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import { Button } from "@radix-ui/react-slot";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
/* ------------------------------------------------------------------ */
/* CMS 数据获取 Hook                                                   */
/* ------------------------------------------------------------------ */
function useCreateShopContent() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchContent() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/globals/create-shop`, { cache: "no-store" });
                if (!res.ok)
                    throw new Error("Network error");
                const json = await res.json();
                setData(json);
            }
            catch (e) {
                setError(e?.message || "Unknown error");
            }
            finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, []);
    return { data, loading, error };
}
/* ------------------------------------------------------------------ */
/* UI 组件                                                            */
/* ------------------------------------------------------------------ */
const Breadcrumbs = ({ items, }) => (_jsx("nav", { "aria-label": "Breadcrumb", className: "flex items-center space-x-2 text-sm", children: items.map((item, idx) => (_jsxs(React.Fragment, { children: [item.href ? (_jsx(Link, { href: item.href, className: "text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded", children: item.label })) : (_jsx("span", { className: "text-gray-900 font-medium", children: item.label })), idx < items.length - 1 && (_jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" }))] }, idx))) }));
const PageHeading = ({ title, subtitle }) => (_jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: title }), subtitle && _jsx("p", { className: "text-gray-600", children: subtitle })] }));
const TextFieldInput = ({ label, name, register, error, placeholder }) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: label }), _jsx(TextField.Root, { className: "w-full", children: _jsx(TextField.Input, { ...register(name), placeholder: placeholder, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}` }) }), error && _jsx("p", { className: "mt-1 text-sm text-red-600", children: error })] }));
const TextFieldWithAffix = ({ label, name, register, error, placeholder, suffix = ".drsell.com" }) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: label }), _jsxs(TextField.Root, { className: "w-full", children: [_jsx(TextField.Input, { ...register(name), placeholder: placeholder, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}` }), _jsx(TextField.Slot, { side: "right", className: "pr-3 text-gray-500", children: suffix })] }), error && _jsx("p", { className: "mt-1 text-sm text-red-600", children: error })] }));
const LocaleSelect = ({ name, register, error, options, onChange }) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Locale" }), _jsxs(Select.Root, { onValueChange: onChange, children: [_jsxs(Select.Trigger, { className: `inline-flex items-center justify-between w-full px-3 py-2 border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`, children: [_jsx(Select.Value, { placeholder: "Select locale" }), _jsx(ChevronDown, { className: "w-4 h-4 ml-2" })] }), _jsx(Select.Content, { className: "bg-white border border-gray-200 rounded-md shadow-lg", children: options.map((o) => (_jsx(Select.Item, { value: o.value, className: "px-3 py-2 hover:bg-gray-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", children: o.label }, o.value))) })] }), error && _jsx("p", { className: "mt-1 text-sm text-red-600", children: error })] }));
const ThemeCardGrid = ({ selected, onSelect, themes }) => (_jsx(RadioGroup.Root, { value: selected, onValueChange: onSelect, className: "grid grid-cols-3 gap-4", children: themes.map((t) => (_jsxs(RadioGroup.Item, { value: t.id, className: `relative p-4 border rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selected === t.id
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"}`, children: [_jsxs(Card.Root, { className: "space-y-2", children: [_jsx("img", { src: t.image.url, alt: t.image.alt, className: "w-full h-32 object-cover rounded" }), _jsx("div", { className: "font-semibold text-gray-900", children: t.name }), _jsx("div", { className: "text-sm text-gray-600", children: t.description })] }), selected === t.id && (_jsx(Check, { className: "absolute top-2 right-2 w-5 h-5 text-blue-600" }))] }, t.id))) }));
const ButtonGroup = ({ onBack, onCreate, isLoading, backLabel, createLabel }) => (_jsxs("div", { className: "flex space-x-3", children: [_jsx(Button, { onClick: onBack, className: "px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", children: backLabel }), _jsx(Button, { onClick: onCreate, disabled: isLoading, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50", children: isLoading ? "Creating..." : createLabel })] }));
const LivePreview = ({ src, alt }) => (_jsx(Card.Root, { className: "sticky top-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm", children: _jsx(AspectRatio.Root, { ratio: 16 / 9, children: src ? (_jsx("img", { src: src, alt: alt || "Preview", className: "w-full h-full object-cover rounded" })) : (_jsx("div", { className: "w-full h-full bg-gray-100 rounded" })) }) }));
/* ------------------------------------------------------------------ */
/* 主组件                                                             */
/* ------------------------------------------------------------------ */
const CreateShopPage = () => {
    const { data, loading, error } = useCreateShopContent();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        defaultValues: {
            shopName: "",
            shopUrl: "",
            locale: "en-US",
            theme: "vitalis",
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const selectedTheme = watch("theme");
    const onSubmit = (values) => {
        setIsLoading(true);
        console.log("Submit", values);
        setTimeout(() => {
            setIsLoading(false);
            router.push("/shops");
        }, 1500);
    };
    if (loading)
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("p", { className: "text-gray-600", children: "Loading..." }) }));
    if (error)
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("p", { className: "text-red-600", children: ["Error: ", error] }) }));
    if (!data)
        return null;
    return (_jsx("div", { className: "min-h-screen bg-gray-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8", children: [_jsx("div", { className: "mb-6", children: _jsx(Breadcrumbs, { items: [
                            { label: "Dashboard", href: "/" },
                            { label: "Shops", href: "/shops" },
                            { label: "Create Shop" },
                        ] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-8", children: [_jsx(PageHeading, { title: data.heading, subtitle: data.subheading }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: data.shopDetailsHeading }), _jsx(TextFieldInput, { label: "Shop Name", name: "shopName", register: register, error: errors.shopName?.message, placeholder: "My Awesome Shop" }), _jsx(TextFieldWithAffix, { label: "Shop URL", name: "shopUrl", register: register, error: errors.shopUrl?.message, placeholder: "my-shop" }), _jsx(LocaleSelect, { name: "locale", register: register, error: errors.locale?.message, options: data.localeOptions, onChange: (v) => setValue("locale", v) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: data.themeHeading }), _jsx(ThemeCardGrid, { selected: selectedTheme, onSelect: (t) => setValue("theme", t), themes: data.themes })] }), _jsxs("div", { className: "flex flex-col gap-4 border-t border-gray-100 pt-6", children: [_jsx("p", { className: "text-sm text-gray-600", children: data.previewImage?.alt ||
                                                        'You can update all settings later from the shop dashboard.' }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx(Link, { href: "/shops", className: "text-sm font-medium text-gray-600 hover:text-gray-900", children: data.backLabel || 'Back to shops' }), _jsx("button", { type: "submit", disabled: isLoading, className: "inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60", children: isLoading ? 'Creating...' : data.createLabel || 'Create shop' })] })] })] })] }), _jsx("aside", { className: "space-y-6", children: _jsxs(Card.Root, { className: "rounded-2xl border border-gray-100 bg-white p-6 shadow-sm", children: [_jsxs(Card.Header, { className: "mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: data.shopDetailsHeading }), _jsx("p", { className: "text-sm text-gray-600", children: "Set up your storefront in a few guided steps." })] }), _jsx(AspectRatio.Root, { ratio: 16 / 9, className: "overflow-hidden rounded-xl bg-gray-100", children: data.previewImage?.url ? (_jsx("img", { src: data.previewImage.url, alt: data.previewImage.alt || 'Shop preview', className: "h-full w-full object-cover" })) : (_jsx("div", { className: "flex h-full w-full items-center justify-center text-gray-400", children: "Preview coming soon" })) })] }) })] })] }) }));
};
export default CreateShopPage;
//# sourceMappingURL=CreateShop.payload.js.map