// app/(frontend)/login/page.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Flex, Card, Heading, Text, Separator, TextField, IconButton, Button, Toggle } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import Image from 'next/image';
import Link from 'next/link';
import { Chrome, Eye, EyeOff } from 'lucide-react';
/* ---------- HOOK ---------- */
function useLoginPageData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/globals/login-registration`, {
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                });
                if (!res.ok)
                    throw new Error(res.statusText);
                const json = await res.json();
                setData(json);
            }
            catch (err) {
                setError(err?.message || 'Unknown error');
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    return { data, loading, error };
}
/* ---------- COMPONENT ---------- */
export default function LoginPage() {
    const { data, loading, error } = useLoginPageData();
    const [showPassword, setShowPassword] = useState(false);
    /* ---------- LOADING ---------- */
    if (loading)
        return (_jsx(ThemeProvider, { attribute: "class", defaultTheme: "dark", children: _jsx(Flex, { align: "center", justify: "center", className: "min-h-screen", children: _jsx(Text, { size: "3", children: "Loading\u2026" }) }) }));
    /* ---------- ERROR ---------- */
    if (error)
        return (_jsx(ThemeProvider, { attribute: "class", defaultTheme: "dark", children: _jsx(Flex, { align: "center", justify: "center", className: "min-h-screen", children: _jsxs(Card, { className: "p6", children: [_jsx(Heading, { size: "5", color: "red", children: "Failed to load login page" }), _jsx(Text, { size: "2", children: error })] }) }) }));
    /* ---------- RENDER ---------- */
    const { page_title, brand_name, hero_headline, hero_subline, hero_image, oauth_google_label, email_label, email_placeholder, password_label, password_placeholder, forgot_password_link, submit_button_label, signup_prompt, signup_link_label, divider_text = 'OR', } = data;
    return (_jsxs(ThemeProvider, { attribute: "class", defaultTheme: "dark", children: [_jsx("head", { children: _jsx("title", { children: page_title }) }), _jsx(Flex, { direction: "row", gap: "4", className: "items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-neutral-light-text-body dark:text-neutral-dark-text-body font-display", children: _jsxs(Card, { className: "w-full max-w-4xl shadow-lg rounded-xl overflow-hidden md:flex", children: [_jsxs(Flex, { direction: "column", justify: "center", gap: "3", className: "w-full md:w-1/2 p-8 lg:p-12 bg-gray-50 dark:bg-background-dark/50", children: [_jsx(Heading, { size: "8", className: "text-3xl font-bold text-neutral-light-text-heading dark:text-neutral-dark-text-heading", children: hero_headline }), hero_subline && (_jsx(Text, { size: "3", className: "text-base text-neutral-light-text-body dark:text-neutral-dark-text-body", children: hero_subline })), hero_image && (_jsx("div", { className: "relative w-full h-64 mt-4", children: _jsx(Image, { src: hero_image.url, alt: hero_image.alt || 'Hero', fill: true, className: "rounded-lg object-cover" }) }))] }), _jsxs(Flex, { direction: "column", justify: "center", gap: "4", className: "w-full md:w-1/2 p-8 lg:p-12", children: [_jsx(Heading, { size: "7", className: "text-2xl font-bold pb-4 text-neutral-light-text-heading dark:text-neutral-dark-text-heading", children: "Sign in to your account" }), _jsxs(Toggle, { variant: "outline", className: "w-full h-12 border border-neutral-light-border dark:border-neutral-dark-border hover:bg-gray-50 dark:hover:bg-white/5 justify-center gap-3", children: [_jsx(Chrome, { className: "w-6 h-6" }), _jsx(Text, { size: "3", className: "truncate", children: oauth_google_label })] }), _jsx(Separator, { size: "2", my: "4", className: "w-full" }), _jsx(Text, { size: "2", align: "center", className: "text-neutral-light-text-body dark:text-neutral-dark-text-body", children: divider_text }), _jsxs(Form.Root, { className: "flex flex-col gap-4", children: [_jsxs("label", { children: [_jsx(Text, { size: "2", as: "p", className: "mb-1", children: email_label }), _jsx(TextField, { size: "3", placeholder: email_placeholder || 'Enter your email', type: "email", className: "w-full" })] }), _jsx(Form.Field, { name: "password", children: _jsxs("label", { children: [_jsx(Text, { size: "2", as: "p", className: "mb-1", children: password_label }), _jsxs("div", { className: "relative w-full", children: [_jsx(TextField, { size: "3", placeholder: password_placeholder || 'Enter your password', type: showPassword ? 'text' : 'password', className: "w-full pr-10" }), _jsx(IconButton, { variant: "ghost", type: "button", onClick: () => setShowPassword((v) => !v), className: "absolute inset-y-0 right-0 pr-3", children: showPassword ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) })] })] }) }), _jsxs(Flex, { className: "justify-between items-center", children: [_jsx(Text, { size: "2", as: "label", className: "text-sm text-neutral-light-text-body dark:text-neutral-dark-text-body", children: "Remember me" }), _jsx(Link, { href: "/forgot", className: "text-primary text-sm hover:underline", children: forgot_password_link })] }), _jsx(Button, { size: "3", className: "w-full h-12 bg-primary text-white hover:bg-primary/90 font-bold tracking-[0.015em]", children: submit_button_label })] }), _jsxs(Flex, { gap: "2", justify: "center", className: "mt-2", children: [_jsx(Text, { size: "2", children: signup_prompt?.[0]?.children?.[0]?.text || 'New to DrSell? ' }), _jsx(Link, { href: "/register", className: "text-primary text-sm hover:underline", children: signup_link_label })] })] })] }) })] }));
}
//# sourceMappingURL=LoginRegistration.payload.js.map