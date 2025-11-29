import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTheme } from './themeContext';
// Import Tailwind CSS
import 'tailwindcss/tailwind.css';
// Header component
const HeaderComponent = ({ className }) => {
    const theme = useTheme();
    return (_jsx("header", { className: `${className} ${theme === 'dark' ? 'dark' : ''}` }));
};
// Button component
const ButtonComponent = ({ className }) => {
    const theme = useTheme();
    return (_jsx("button", { className: `${className} ${theme === 'dark' ? 'dark' : ''}` }));
};
// Card component
const CardComponent = ({ className }) => {
    const theme = useTheme();
    return (_jsx("div", { className: `${className} ${theme === 'dark' ? 'dark' : ''}` }));
};
// Image component
const ImageComponent = ({ className }) => {
    const theme = useTheme();
    return (_jsx("img", { className: `${className} ${theme === 'dark' ? 'dark' : ''}`, src: "", alt: "" }));
};
// Testimonial component
const TestimonialComponent = ({ className }) => {
    const theme = useTheme();
    return (_jsx("div", { className: `${className} ${theme === 'dark' ? 'dark' : ''}` }));
};
// CallToAction component
const CallToActionComponent = ({ className }) => {
    const theme = useTheme();
    return (_jsx("div", { className: `${className} ${theme === 'dark' ? 'dark' : ''}` }));
};
// Footer component
const FooterComponent = ({ className }) => {
    const theme = useTheme();
    return (_jsx("footer", { className: `${className} ${theme === 'dark' ? 'dark' : ''}` }));
};
// Main App component
const App = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('https://api.payloadcms.com/collections/LandingPage/items');
                const json = await response.json();
                setData(json[0]);
            }
            catch (err) {
                setError('Failed to load data');
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    if (loading)
        return _jsx("div", { children: "Loading..." });
    if (error)
        return _jsxs("div", { children: ["Error: ", error] });
    return (_jsxs("div", { className: "relative flex min-h-screen w-full flex-col overflow-x-hidden", children: [_jsx(HeaderComponent, { className: "sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200/50 dark:border-white/10 bg-background-light/80 dark:bg-background-dark/80 px-10 py-3 backdrop-blur-sm" }), _jsxs("div", { className: "layout-container flex h-full grow flex-col", children: [_jsxs("div", { className: "text-center @container py-20 lg:py-32", children: [_jsx("h1", { children: data?.drsell }), _jsx("h2", { children: data?._the_allinone_hub_for_your_eco }), _jsx("h2", { children: data?._launch_manage_and_scale_multi })] }), _jsxs("div", { className: "flex flex-col gap-10 px-4 py-16 @container", children: [_jsx("h1", { children: data?._everything_you_need_to_succee }), _jsx("h2", { children: data?.instant_shop_creation }), _jsx("h2", { children: data?.aipowered_assistant }), _jsx("h2", { children: data?.centralized_management }), _jsx("h2", { children: data?.unified_credit_system })] }), _jsx("div", { className: "py-16", children: _jsx("h2", { children: data?.see_drsell_in_action }) }), _jsxs("div", { className: "py-16 @container", children: [_jsx("h1", { children: data?._trusted_by_ecommerce_entrepre }), _jsxs(TestimonialComponent, { className: "my-16 flex flex-col items-center gap-6 rounded-xl bg-primary/90 px-8 py-12 text-center text-white", children: [_jsx("p", { children: data?.drsell_revolutionized_how_we_m }), _jsx("p", { children: data?.ceo_crafty_creations }), _jsx("p", { children: data?.the_ai_assistant_writes_better }), _jsx("p", { children: data?.founder_tech_gadgets_co }), _jsx("p", { children: data?.launching_a_new_niche_store_us })] })] }), _jsx(CallToActionComponent, { className: "my-16 flex flex-col items-center gap-6 rounded-xl bg-primary/90 px-8 py-12 text-center text-white", children: _jsx("p", { children: data?.join_hundreds_of_successful_en }) })] }), _jsx(FooterComponent, { className: "mt-16 border-t border-gray-200/50 dark:border-white/10 py-8", children: _jsx("p", { children: data?._2024_drsell_all_rights_reserv }) })] }));
};
export default App;
//# sourceMappingURL=LandingPage.payload.js.map