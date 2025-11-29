import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { RdsProvider, RdsDialog, RdsDialogTrigger, RdsDialogContent, RdsButton, RdsTextField, } from '@radix-ui/react-dialog';
import { useId } from '@radix-ui/react-id';
import axios from 'axios';
const LoginForm = ({ onSignIn }) => {
    const emailId = useId();
    const passwordId = useId();
    return (_jsxs("form", { children: [_jsx(RdsTextField, { id: emailId, label: "Email", type: "email", required: true }), _jsx(RdsTextField, { id: passwordId, label: "Password", type: "password", required: true }), _jsx(RdsButton, { onClick: onSignIn, children: "Sign in" })] }));
};
const LoginDialog = () => {
    const [open, setOpen] = React.useState(false);
    return (_jsxs(_Fragment, { children: [_jsx(RdsDialogTrigger, { onClick: () => setOpen(true), children: "Sign in" }), _jsx(RdsDialog, { open: open, onOpenChange: setOpen, children: _jsx(RdsDialogContent, { children: _jsx(LoginForm, { onSignIn: () => setOpen(false) }) }) })] }));
};
const App = () => {
    const [dynamicContent, setDynamicContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://your-payload-cms-url.com/collections/Registration');
                setDynamicContent(response.data);
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
    return (_jsx(RdsProvider, { children: _jsx("div", { className: "flex items-center justify-center h-screen", children: _jsxs("div", { className: "flex flex-col gap-4 p-8 bg-white shadow-lg rounded-lg", children: [_jsx("h2", { children: dynamicContent?.drsell }), _jsx("h1", { children: dynamicContent?.welcome_back_to_your_dashboard }), _jsx("h1", { children: dynamicContent?.sign_in }), _jsx("p", { children: dynamicContent?.the_allinone_platform_to_launc }), _jsx("img", { src: dynamicContent?.abstract_ecommerce_graphic_sho, alt: "Abstract e-commerce graphic" }), _jsx(LoginDialog, {})] }) }) }));
};
export default App;
//# sourceMappingURL=Registration.payload.js.map