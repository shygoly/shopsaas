import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { SideNav, SideNavHeader, SideNavContent, SideNavPanel, SideNavPanelContent, SideNavSub, SideNavItem, SideNavLink, AppBar, AppBarTitle, Breadcrumbs, Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, PageHeading, TwoColumnLayout, Column, Card, DangerZone, Label } from '@radix-ui/react-navigation-menu';
const Layout = () => {
    const [shopDetails, setShopDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://api.payloadcms.com/collections/ShopDetails/items');
                const data = await response.json();
                setShopDetails(data[0]);
            }
            catch (err) {
                setError(err.message);
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
    return (_jsxs("div", { className: "flex h-screen", children: [_jsxs(SideNav, { children: [_jsx(SideNavHeader, { children: "Navigation" }), _jsx(SideNavContent, { children: _jsx(SideNavPanel, { children: _jsx(SideNavPanelContent, { children: _jsxs(SideNavSub, { children: [_jsx(SideNavItem, { children: _jsx(SideNavLink, { children: "Item 1" }) }), _jsx(SideNavItem, { children: _jsx(SideNavLink, { children: "Item 2" }) })] }) }) }) })] }), _jsxs("main", { children: [_jsx(AppBar, { children: _jsx(AppBarTitle, { children: "App Bar" }) }), _jsxs("div", { className: "p-8", children: [_jsx(Breadcrumbs, { children: _jsxs(Breadcrumb, { children: [_jsxs(BreadcrumbItem, { children: [_jsx(BreadcrumbSeparator, { children: "\u203A" }), _jsx(BreadcrumbLink, { to: "#", children: "Home" })] }), _jsxs(BreadcrumbItem, { children: [_jsx(BreadcrumbSeparator, { children: "\u203A" }), _jsx(BreadcrumbLink, { to: "#", children: "Library" })] }), _jsxs(BreadcrumbItem, { children: [_jsx(BreadcrumbSeparator, { children: "\u203A" }), _jsx(BreadcrumbLink, { to: "#", children: "Data" })] })] }) }), _jsx(PageHeading, { children: _jsx("h1", { children: shopDetails?.my_awesome_shop }) }), _jsxs(TwoColumnLayout, { children: [_jsx(Column, { className: "lg:col-span-1", children: _jsxs("div", { className: "lg:col-span-1", children: [_jsx("h2", { children: shopDetails?.general_information }), _jsx("p", { children: shopDetails?.core_details_about_the_shop }), _jsx("p", { children: shopDetails?.myawesomeshopdrsellcom })] }) }), _jsx(Column, { className: "lg:col-span-2", children: _jsxs("div", { className: "lg:col-span-2", children: [_jsxs(Card, { children: [_jsx("h2", { children: shopDetails?.configuration }), _jsx("p", { children: shopDetails?.manage_the_shops_settings }), _jsx(Label, { children: shopDetails?.domain }), _jsx(Label, { children: shopDetails?.shop_id }), _jsx(Label, { children: shopDetails?.created_date }), _jsx(Label, { children: shopDetails?.shop_status }), _jsx(Label, { children: shopDetails?.theme }), _jsx(Label, { children: shopDetails?.locale }), _jsx(Label, { children: shopDetails?.language })] }), _jsxs(DangerZone, { children: [_jsx("h2", { children: shopDetails?.danger_zone }), _jsx("p", { children: shopDetails?.these_actions_are_irreversible }), _jsx("p", { children: shopDetails?.once_deleted_it_will_be_gone_f })] })] }) })] })] })] })] }));
};
export default Layout;
//# sourceMappingURL=ShopDetails.payload.js.map