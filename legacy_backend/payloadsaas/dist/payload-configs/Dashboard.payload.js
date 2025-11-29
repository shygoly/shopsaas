import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarTrigger, Navbar, NavbarItem, NavbarLink, Avatar, Button, Card, CardHeader, CardBody, CardFooter } from '@radix-ui/react-sidebar';
import { useId } from '@radix-ui/react-id';
import { useToggle } from '@radix-ui/react-toggle';
// Custom hook to handle sidebar visibility
const useSidebar = () => {
    const [open, toggle] = useToggle();
    return { open, toggle };
};
// Custom hook to handle navbar visibility
const useNavbar = () => {
    const [open, toggle] = useToggle();
    return { open, toggle };
};
// Custom hook to handle avatar visibility
const useAvatar = () => {
    const [open, toggle] = useToggle();
    return { open, toggle };
};
// Custom hook to handle button visibility
const useButton = () => {
    const [open, toggle] = useToggle();
    return { open, toggle };
};
// Custom hook to handle card visibility
const useCard = () => {
    const [open, toggle] = useToggle();
    return { open, toggle };
};
// Fetch data from Payload CMS
const fetchData = async () => {
    try {
        const response = await fetch('https://api.payloadcms.com/collections/Dashboard');
        const data = await response.json();
        return data;
    }
    catch (error) {
        throw new Error('Failed to fetch data from Payload CMS');
    }
};
// Sidebar component
const SidebarComponent = ({ data }) => {
    const { open, toggle } = useSidebar();
    const sidebarId = useId();
    return (_jsxs(Sidebar, { open: open, onOpenChange: toggle, id: sidebarId, children: [_jsx(SidebarTrigger, { asChild: true, children: _jsx("button", { children: "Open Sidebar" }) }), _jsx(SidebarContent, { children: _jsxs("div", { children: [_jsx("div", { children: data.john_doe }), _jsx("div", { children: data.your_shops }), _jsxs(Navbar, { children: [_jsx(NavbarItem, { children: _jsx(NavbarLink, { children: "Home" }) }), _jsx(NavbarItem, { children: _jsx(NavbarLink, { children: "About" }) })] }), _jsx("div", { children: _jsx(Avatar, {}) })] }) })] }));
};
// Navbar component
const NavbarComponent = ({ data }) => {
    const { open, toggle } = useNavbar();
    return (_jsxs(Navbar, { children: [_jsx(NavbarItem, { children: _jsx(NavbarLink, { onClick: toggle, children: "Toggle" }) }), _jsx(NavbarItem, { children: _jsx(NavbarLink, { children: "Home" }) }), _jsx(NavbarItem, { children: _jsx(NavbarLink, { children: "About" }) })] }));
};
// Avatar component
const AvatarComponent = () => {
    const { open, toggle } = useAvatar();
    return (_jsx(Avatar, { onClick: toggle }));
};
// Button component
const ButtonComponent = ({ data }) => {
    const { open, toggle } = useButton();
    return (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: toggle, children: data.manage }), _jsx(Button, { onClick: toggle, children: data.view_store })] }));
};
// Card component
const CardComponent = ({ data }) => {
    const { open, toggle } = useCard();
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { onClick: toggle, children: "Title" }) }), _jsxs(CardBody, { children: [_jsx("p", { children: data.moderngadgetsdrsellcom }), _jsx("p", { children: data.vintagefindsdrsellcom }), _jsx("p", { children: data.artisancraftsdrsellcom })] }), _jsx(CardFooter, { children: _jsx(CardAction, { children: "Action" }) })] }));
};
// Main component
const MainComponent = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchData()
            .then((fetchedData) => {
            setData(fetchedData);
            setLoading(false);
        })
            .catch((error) => {
            setError(error.message);
            setLoading(false);
        });
    }, []);
    if (loading)
        return _jsx("div", { children: "Loading..." });
    if (error)
        return _jsxs("div", { children: ["Error: ", error] });
    return (_jsxs("div", { children: [_jsx(SidebarComponent, { data: data }), _jsx(NavbarComponent, { data: data }), _jsx(AvatarComponent, {}), _jsx(ButtonComponent, { data: data }), _jsx(CardComponent, { data: data })] }));
};
export default MainComponent;
//# sourceMappingURL=Dashboard.payload.js.map