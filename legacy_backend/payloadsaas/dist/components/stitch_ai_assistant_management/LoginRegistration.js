import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Theme, Flex, Container, Card, Box, Heading, Text, Button, Separator, TextField } from '@radix-ui/themes';
import { signIn } from 'next-auth/react';
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';
import '@radix-ui/themes/styles.css';
// Google Icon Component
const GoogleIcon = () => (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z", fill: "#4285F4" }), _jsx("path", { d: "M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z", fill: "#34A853" }), _jsx("path", { d: "M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z", fill: "#FBBC05" }), _jsx("path", { d: "M12.255 4.91c1.76 0 3.32.6 4.54 1.78l3.42-3.42C18.205 1.14 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09C6.475 7.02 9.125 4.91 12.255 4.91z", fill: "#EA4335" })] }));
// Main Login Component
const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleGoogleSignIn = () => {
        signIn('google');
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Login attempt:', { email, password });
    };
    return (_jsx(Theme, { appearance: "dark", accentColor: "primary", grayColor: "slate", children: _jsx(Flex, { direction: "column", className: "min-h-screen", children: _jsx(Container, { size: "4", className: "px-4 py-5", children: _jsxs(Card, { variant: "surface", className: "w-full max-w-4xl md:flex", children: [_jsxs(Box, { className: "w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center", children: [_jsx("img", { src: "https://via.placeholder.com/300x200", alt: "DrSell Logo", className: "w-full h-auto mb-6 rounded-lg" }), _jsx(Heading, { size: "8", weight: "bold", className: "text-neutral-light-text-heading dark:text-neutral-dark-text-heading mb-4", children: "DrSell" }), _jsx(Text, { size: "3", color: "gray", className: "leading-normal", children: "Streamline your sales process with intelligent automation and powerful analytics. Join thousands of businesses growing with DrSell." })] }), _jsxs(Box, { className: "w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center", children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs(Button, { variant: "outline", className: "w-full h-12 gap-3", onClick: handleGoogleSignIn, type: "button", children: [_jsx(GoogleIcon, {}), "Sign in with Google"] }), _jsx(Separator, { orientation: "horizontal", className: "my-4" }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "email", className: "text-sm font-medium", children: "Email" }), _jsx(TextField.Root, { id: "email", type: "email", placeholder: "Enter your email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("label", { htmlFor: "password", className: "text-sm font-medium", children: "Password" }), _jsx("a", { href: "#", className: "text-sm text-primary hover:underline", children: "Forgot password?" })] }), _jsx(TextField.Root, { id: "password", type: showPassword ? 'text' : 'password', placeholder: "Enter your password", required: true, value: password, onChange: (e) => setPassword(e.target.value), children: _jsx(TextField.Slot, { side: "right", children: _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded", "aria-label": showPassword ? 'Hide password' : 'Show password', children: showPassword ? _jsx(EyeClosedIcon, {}) : _jsx(EyeOpenIcon, {}) }) }) })] }), _jsx(Button, { type: "submit", className: "w-full h-12 bg-primary text-white hover:bg-primary/90", children: "Sign In" })] }), _jsxs(Text, { size: "2", color: "gray", className: "text-center mt-6", children: ["Don't have an account?", ' ', _jsx("a", { href: "#", className: "text-primary hover:underline font-medium", children: "Sign up" })] })] })] }) }) }) }));
};
export default LoginPage;
//# sourceMappingURL=LoginRegistration.js.map