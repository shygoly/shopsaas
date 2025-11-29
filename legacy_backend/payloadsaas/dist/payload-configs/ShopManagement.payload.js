import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { RdsProvider, RdsCss } from '@radix-ui/react-primitives';
import { RdsHeader } from '@radix-ui/react-header';
import { RdsMain } from '@radix-ui/react-main';
import { RdsTable } from '@radix-ui/react-table';
import { RdsButton } from '@radix-ui/react-button';
import { RdsAvatar } from '@radix-ui/react-avatar';
import { RdsSearchInput } from '@radix-ui/react-search';
import { RdsTabs } from '@radix-ui/react-tabs';
// Main application component
const App = () => {
    // State for shops data
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Fetch shops data from Payload CMS
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://api.payloadcms.com/collections/ShopManagement/items');
                const data = await response.json();
                setShops(data);
            }
            catch (err) {
                setError('Failed to fetch shops data');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    // Render loading state
    if (loading) {
        return _jsx("div", { children: "Loading..." });
    }
    // Render error state
    if (error) {
        return _jsxs("div", { children: ["Error: ", error] });
    }
    return (_jsxs(RdsProvider, { children: [_jsx(RdsCss, {}), _jsxs(RdsHeader, { children: [_jsx(RdsAvatar, {}), _jsx("div", { children: "Branding and Navigation" })] }), _jsxs(RdsMain, { children: [_jsx(RdsSearchInput, { placeholder: "Search shops..." }), _jsxs(RdsTabs, { defaultValue: "all", children: [_jsx(RdsTabs.Tab, { value: "all", children: "All" }), _jsx(RdsTabs.Tab, { value: "active", children: "Active" }), _jsx(RdsTabs.Tab, { value: "inactive", children: "Inactive" })] }), _jsxs(RdsTable, { children: [_jsxs(RdsTable.Header, { children: [_jsx(RdsTable.HeadCell, { children: "Shop Name" }), _jsx(RdsTable.HeadCell, { children: "Status" }), _jsx(RdsTable.HeadCell, { children: "Last Updated" }), _jsx(RdsTable.HeadCell, { children: "Actions" })] }), _jsx(RdsTable.Body, { children: shops.map((shop) => (_jsxs(RdsTable.Row, { children: [_jsx(RdsTable.Cell, { children: shop.name }), _jsx(RdsTable.Cell, { children: shop.status }), _jsx(RdsTable.Cell, { children: shop.lastUpdated }), _jsxs(RdsTable.Cell, { children: [_jsx(RdsButton, { children: "View" }), _jsx(RdsButton, { children: "Edit" })] })] }, shop.id))) })] })] })] }));
};
export default App;
//# sourceMappingURL=ShopManagement.payload.js.map