import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Dialog from '@radix-ui/react-dialog';
import * as Separator from '@radix-ui/react-separator';
import * as Slider from '@radix-ui/react-slider';
import * as Form from '@radix-ui/react-form';
/* ------------------------------------------------------------------ */
/* TopNavBar                                                          */
/* ------------------------------------------------------------------ */
export const TopNavBar = () => {
    const [open, setOpen] = useState(false);
    const navLinks = ['Product', 'Pricing', 'Docs', 'Company'];
    return (_jsxs("header", { className: "sticky top-0 z-50 flex items-center justify-between px-10 py-3 border-b border-gray-200/50 dark:border-white/10 backdrop-blur-sm", children: [_jsx("div", { className: "text-xl font-bold", children: "YourLogo" }), _jsx(NavigationMenu.Root, { className: "hidden md:flex", children: _jsx(NavigationMenu.List, { className: "flex gap-6", children: navLinks.map((l) => (_jsx(NavigationMenu.Item, { children: _jsx(NavigationMenu.Link, { className: "text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary", href: `#${l.toLowerCase()}`, children: l }) }, l))) }) }), _jsxs("div", { className: "hidden md:flex gap-3", children: [_jsx("button", { className: "px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800", children: "Sign in" }), _jsx("button", { className: "px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/90", children: "Get started" })] }), _jsxs(Dialog.Root, { open: open, onOpenChange: setOpen, children: [_jsx(Dialog.Trigger, { asChild: true, children: _jsx("button", { className: "md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800", children: _jsx("span", { className: "material-symbols-outlined", children: "menu" }) }) }), _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "fixed inset-0 bg-black/40" }), _jsxs(Dialog.Content, { className: "fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 p-6 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx(Dialog.Title, { className: "text-lg font-semibold", children: "Menu" }), _jsx(Dialog.Close, { className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800", children: _jsx("span", { className: "material-symbols-outlined", children: "close" }) })] }), _jsxs("nav", { className: "flex flex-col gap-4", children: [navLinks.map((l) => (_jsx("a", { href: `#${l.toLowerCase()}`, onClick: () => setOpen(false), className: "text-sm font-medium", children: l }, l))), _jsx(Separator.Root, { className: "my-2 h-px bg-gray-200 dark:bg-gray-700" }), _jsx("button", { className: "px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700", children: "Sign in" }), _jsx("button", { className: "px-4 py-2 text-sm rounded-md bg-primary text-white", children: "Get started" })] })] })] })] })] }));
};
/* ------------------------------------------------------------------ */
/* HeroSection                                                        */
/* ------------------------------------------------------------------ */
export const HeroSection = () => (_jsx("section", { className: "@container py-20 lg:py-32 text-center", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsx("h1", { className: "text-4xl @lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white", children: "Build faster with blocks" }), _jsx("p", { className: "mt-4 text-lg @lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto", children: "Drag, drop, and ship. A fully-featured component library that just works." }), _jsxs("div", { className: "mt-8 flex justify-center gap-4", children: [_jsx("button", { className: "px-5 py-2.5 rounded-md bg-primary text-white hover:bg-primary/90", children: "Start building" }), _jsx("button", { className: "px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800", children: "View docs" })] }), _jsx("div", { className: "mt-12 mx-auto max-w-4xl", children: _jsx("img", { src: "/hero-placeholder.jpg", alt: "Hero", className: "rounded-xl shadow-lg w-full" }) })] }) }));
/* ------------------------------------------------------------------ */
/* FeatureSection                                                     */
/* ------------------------------------------------------------------ */
export const FeatureSection = ({ features }) => (_jsx("section", { className: "container mx-auto px-6", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: features.map((f) => (_jsxs("div", { className: "rounded-xl border border-gray-200/50 dark:border-white/10 p-6 hover:shadow-md transition", children: [_jsx("span", { className: "material-symbols-outlined text-3xl text-primary", children: f.icon }), _jsx("h3", { className: "mt-4 font-semibold text-gray-900 dark:text-white", children: f.title }), _jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: f.description })] }, f.title))) }) }));
/* ------------------------------------------------------------------ */
/* VisualDemonstrationSection                                         */
/* ------------------------------------------------------------------ */
export const VisualDemonstrationSection = () => {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    return (_jsx("section", { className: "container mx-auto px-6", children: _jsxs("div", { className: "relative aspect-video rounded-xl overflow-hidden bg-gray-900", children: [_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-white/40 text-2xl", children: "Video Player Placeholder" }) }), _jsxs(Dialog.Root, { children: [_jsx(Dialog.Trigger, { asChild: true, children: _jsx("button", { onClick: () => setPlaying(!playing), className: "absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white", children: _jsx("span", { className: "material-symbols-outlined text-3xl text-gray-900", children: playing ? 'pause' : 'play_arrow' }) }) }), _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "fixed inset-0 bg-black/80" }), _jsxs(Dialog.Content, { className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl rounded-xl overflow-hidden bg-black", children: [_jsx("div", { className: "aspect-video flex items-center justify-center text-white/40", children: "Modal Video Placeholder" }), _jsx(Dialog.Close, { className: "absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20", children: _jsx("span", { className: "material-symbols-outlined", children: "close" }) })] })] })] }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent", children: _jsxs(Slider.Root, { className: "relative flex items-center select-none touch-none w-full h-5", value: [progress], onValueChange: (v) => setProgress(v[0]), max: 100, step: 1, children: [_jsx(Slider.Track, { className: "bg-white/20 relative grow rounded-full h-1", children: _jsx(Slider.Range, { className: "absolute bg-primary rounded-full h-full" }) }), _jsx(Slider.Thumb, { className: "block w-4 h-4 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-primary" })] }) })] }) }));
};
/* ------------------------------------------------------------------ */
/* TestimonialsSection                                                */
/* ------------------------------------------------------------------ */
export const TestimonialsSection = ({ testimonials }) => (_jsx("section", { className: "container mx-auto px-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: testimonials.map((t) => (_jsxs("div", { className: "rounded-xl border border-gray-200/50 dark:border-white/10 p-6", children: [_jsxs("p", { className: "text-gray-700 dark:text-gray-300 italic", children: ["\u201C", t.quote, "\u201D"] }), _jsxs("div", { className: "mt-4 flex items-center gap-3", children: [_jsx("img", { src: t.avatar, alt: t.name, className: "w-10 h-10 rounded-full" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-white", children: t.name }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: t.role })] })] })] }, t.name))) }) }));
/* ------------------------------------------------------------------ */
/* CTABlock                                                           */
/* ------------------------------------------------------------------ */
export const CTABlock = () => {
    const [email, setEmail] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        // Wire to PayloadCMS form handler or API route
        console.log('Submit email:', email);
    };
    return (_jsx("section", { className: "container mx-auto px-6", children: _jsxs(Form.Root, { onSubmit: handleSubmit, className: "flex flex-col items-center gap-6 rounded-xl bg-primary/90 px-8 py-12 text-white", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Stay in the loop" }), _jsx("p", { className: "max-w-md text-center", children: "Get product updates and announcements." }), _jsxs("div", { className: "flex flex-col sm:flex-row w-full max-w-sm gap-3", children: [_jsxs(Form.Field, { name: "email", className: "flex-1", children: [_jsx(Form.Control, { asChild: true, children: _jsx("input", { type: "email", required: true, placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white" }) }), _jsx(Form.Message, { match: "valueMissing", className: "text-xs mt-1 opacity-90", children: "Please enter your email." }), _jsx(Form.Message, { match: "typeMismatch", className: "text-xs mt-1 opacity-90", children: "Please provide a valid email." })] }), _jsx(Form.Submit, { asChild: true, children: _jsx("button", { className: "px-5 py-2 rounded-md bg-white text-primary hover:bg-gray-100", children: "Subscribe" }) })] })] }) }));
};
/* ------------------------------------------------------------------ */
/* Footer                                                             */
/* ------------------------------------------------------------------ */
export const Footer = () => (_jsx("footer", { className: "mt-16 border-t border-gray-200/50 dark:border-white/10 py-8", children: _jsxs("div", { className: "container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400", children: [_jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " YourCompany. All rights reserved."] }), _jsxs("nav", { className: "flex gap-4", children: [_jsx("a", { href: "/privacy", className: "hover:text-primary", children: "Privacy" }), _jsx("a", { href: "/terms", className: "hover:text-primary", children: "Terms" })] })] }) }));
/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
const HomePage = () => {
    const features = [
        { icon: 'bolt', title: 'Fast', description: 'Optimized for speed and performance.' },
        { icon: 'shield', title: 'Secure', description: 'Enterprise-grade security out of the box.' },
        { icon: 'palette', title: 'Customizable', description: 'Fully themed to match your brand.' },
        { icon: 'support', title: 'Support', description: '24/7 support from our team.' },
    ];
    const testimonials = [
        {
            avatar: '/avatar1.jpg',
            quote: 'This product saved us weeks of development time.',
            name: 'Alice',
            role: 'Engineer @ Acme',
        },
        {
            avatar: '/avatar2.jpg',
            quote: 'Incredible developer experience and documentation.',
            name: 'Bob',
            role: 'Designer @ Studio',
        },
        {
            avatar: '/avatar3.jpg',
            quote: 'We launched in days, not months.',
            name: 'Carol',
            role: 'PM @ Startup',
        },
    ];
    return (_jsxs(_Fragment, { children: [_jsx(TopNavBar, {}), _jsxs("main", { children: [_jsx(HeroSection, {}), _jsx("section", { className: "py-16", children: _jsx(FeatureSection, { features: features }) }), _jsx("section", { className: "py-16", children: _jsx(VisualDemonstrationSection, {}) }), _jsx("section", { className: "py-16", children: _jsx(TestimonialsSection, { testimonials: testimonials }) }), _jsx("section", { className: "py-16", children: _jsx(CTABlock, {}) })] }), _jsx(Footer, {})] }));
};
export default HomePage;
//# sourceMappingURL=HomepageLandingPage.js.map