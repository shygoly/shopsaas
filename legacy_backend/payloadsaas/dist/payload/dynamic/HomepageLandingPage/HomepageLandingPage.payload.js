import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/LandingPage.tsx
import { useEffect, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Button } from '@radix-ui/react-button';
import { Card } from '@radix-ui/react-card';
import { Progress } from '@radix-ui/react-progress';
import { IconButton } from '@radix-ui/react-icon-button';
import { TextField } from '@radix-ui/react-text-field';
/* ---------- 工具 ---------- */
const materialIcon = (name) => (_jsx("span", { className: "material-symbols-outlined text-2xl align-middle", children: name }));
/* ---------- 主组件 ---------- */
const LandingPage = () => {
    const [cms, setCms] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchHomepage() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/homepage?depth=2`);
                if (!res.ok)
                    throw new Error('Network error');
                const { docs } = await res.json();
                setCms(docs?.[0] ?? null);
            }
            catch (e) {
                setError(e?.message || 'Unknown error');
            }
            finally {
                setLoading(false);
            }
        }
        fetchHomepage();
    }, []);
    if (loading)
        return _jsx("div", { className: "min-h-screen grid place-items-center", children: "Loading\u2026" });
    if (error)
        return _jsx("div", { className: "min-h-screen grid place-items-center text-red-600", children: error });
    if (!cms)
        return _jsx("div", { className: "min-h-screen grid place-items-center", children: "No data" });
    /* 解构，带默认值 */
    const { seoTitle, navLinks = [], loginButtonLabel = 'Sign In', signupButtonLabel = 'Get Started', heroCtaLabel = 'Start Building Now', heroImage, features = [], testimonials = [], demoVideoPoster, playIcon = 'play_arrow', emailPlaceholder = 'Enter your email', emailCtaLabel = 'Sign Up Now', footerLinks = [], copyright = '© 2024 DrSell. All rights reserved.', brandColor = '#137fec', } = cms;
    /* 动态主色 */
    useEffect(() => {
        document.documentElement.style.setProperty('--color-primary', brandColor);
    }, [brandColor]);
    return (_jsxs("div", { className: "min-h-screen bg-background-light dark:bg-background-dark", children: [_jsx(TopNavBar, { links: navLinks, login: loginButtonLabel, signup: signupButtonLabel }), _jsxs("main", { children: [_jsx(HeroSection, { title: cms.heroTitle, subtitle: cms.heroSubtitle, cta: heroCtaLabel, image: heroImage }), _jsx(FeatureSection, { items: features }), _jsx(VisualDemoSection, { poster: demoVideoPoster, playIcon: playIcon }), _jsx(TestimonialsSection, { items: testimonials }), _jsx(CTABlock, { title: cms.ctaTitle, subtitle: cms.ctaSubtitle, placeholder: emailPlaceholder, cta: emailCtaLabel })] }), _jsx(Footer, { links: footerLinks, copyright: copyright })] }));
};
/* ---------- 子组件（纯展示，全部接收 props） ---------- */
const TopNavBar = ({ links, login, signup, }) => (_jsxs("header", { className: "sticky top-0 z-50 flex items-center justify-between h-16 px-10 py-3 border-b border-gray-200/50 dark:border-white/10 backdrop-blur-sm", children: [_jsx("div", { className: "text-xl font-bold", children: "DrSell" }), _jsx(NavigationMenu.Root, { children: _jsx(NavigationMenu.List, { className: "hidden md:flex items-center gap-9", children: links.map(({ label, href }, i) => (_jsx(NavigationMenu.Item, { children: _jsx(NavigationMenu.Link, { className: "text-sm font-medium hover:text-primary transition-colors", href: href, children: label }) }, i))) }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", children: login }), _jsx(Button, { className: "h-12 px-5 bg-primary text-white hover:opacity-90", size: "sm", children: signup })] })] }));
const HeroSection = ({ title, subtitle, cta, image }) => (_jsx("section", { className: "@container py-20 lg:py-32 text-center", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsx("h1", { className: "text-4xl md:text-6xl font-bold mb-6", children: title }), _jsx("p", { className: "text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto", children: subtitle }), _jsx(Button, { className: "h-12 px-5 bg-primary text-white hover:opacity-90", children: cta }), image && (_jsx("div", { className: "mt-12", children: _jsx("img", { src: image.url, alt: image.alt, className: "rounded-xl shadow-2xl mx-auto max-w-4xl w-full" }) }))] }) }));
const FeatureSection = ({ items }) => (_jsx("section", { id: "features", className: "py-20 bg-gray-50 dark:bg-gray-900", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "Everything You Need" }), _jsx("p", { className: "text-lg text-gray-600 dark:text-gray-300", children: "Powerful features to help you build better products" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: items.map(({ icon, title, description }, i) => (_jsxs(Card, { className: "flex flex-col gap-3 p-6 rounded-xl border border-gray-200/50 dark:border-white/10", children: [_jsx("div", { className: "mb-2", children: materialIcon(icon) }), _jsx("h3", { className: "text-xl font-semibold", children: title }), _jsx("p", { className: "text-gray-600 dark:text-gray-300", children: description })] }, i))) })] }) }));
const VisualDemoSection = ({ poster, playIcon }) => {
    const [playing, setPlaying] = useState(false);
    return (_jsx("section", { id: "demo", className: "py-20", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "See It In Action" }), _jsx("p", { className: "text-lg text-gray-600 dark:text-gray-300", children: "Watch how easy it is to get started" })] }), _jsxs("div", { className: "max-w-4xl mx-auto relative", children: [_jsxs("div", { className: "relative rounded-xl overflow-hidden bg-gray-900 aspect-video", children: [poster && _jsx("img", { src: poster.url, alt: poster.alt, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx(IconButton, { onClick: () => setPlaying((p) => !p), className: "rounded-full size-16 bg-black/50 hover:bg-black/70 text-white", children: _jsx("span", { className: "text-2xl material-symbols-outlined", children: playing ? 'pause' : playIcon }) }) })] }), _jsxs("div", { className: "mt-4 flex items-center gap-4", children: [_jsx("span", { className: "text-sm text-gray-600 dark:text-gray-300", children: "0:00" }), _jsx(Progress, { value: 33, className: "h-1 flex-1 rounded-full" }), _jsx("span", { className: "text-sm text-gray-600 dark:text-gray-300", children: "3:45" })] })] })] }) }));
};
const TestimonialsSection = ({ items }) => (_jsx("section", { id: "testimonials", className: "py-20 bg-gray-50 dark:bg-gray-900", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "Loved by Teams Worldwide" }), _jsx("p", { className: "text-lg text-gray-600 dark:text-gray-300", children: "See what our customers are saying" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: items.map(({ quote, name, role, image }, i) => (_jsxs(Card, { className: "flex flex-col gap-4 p-6 rounded-xl border border-gray-200/50 dark:border-white/10", children: [_jsxs("p", { className: "text-gray-700 dark:text-gray-300 italic", children: ["\u201C", quote, "\u201D"] }), _jsxs("div", { className: "flex items-center gap-3 mt-auto", children: [image && _jsx("img", { src: image.url, alt: image.alt, className: "w-12 h-12 rounded-full" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: name }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: role })] })] })] }, i))) })] }) }));
const CTABlock = ({ title, subtitle, placeholder, cta }) => {
    const [email, setEmail] = useState('');
    return (_jsx("section", { className: "py-20 bg-primary text-white", children: _jsxs("div", { className: "container mx-auto px-4 text-center", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: title }), _jsx("p", { className: "text-lg mb-8 opacity-90", children: subtitle }), _jsxs("form", { className: "max-w-md mx-auto flex gap-2", onSubmit: (e) => e.preventDefault(), children: [_jsx(TextField, { value: email, onChange: (e) => setEmail(e.target.value), placeholder: placeholder, className: "w-full h-12 rounded-lg border-white/20 bg-white/10 placeholder-white/60" }), _jsx(Button, { className: "h-12 px-5 bg-white text-primary hover:opacity-90", children: cta })] })] }) }));
};
const Footer = ({ links, copyright }) => (_jsx("footer", { className: "py-8 border-t border-gray-200/50 dark:border-white/10", children: _jsxs("div", { className: "container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4", children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: copyright }), _jsx("div", { className: "flex gap-6", children: links.map(({ label, href }, i) => (_jsx("a", { href: href, className: "text-sm text-gray-600 dark:text-gray-400 hover:text-primary", children: label }, i))) })] }) }));
export default LandingPage;
//# sourceMappingURL=HomepageLandingPage.payload.js.map