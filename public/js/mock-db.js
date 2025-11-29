/**
 * Simple Mock Database using LocalStorage for the ShopSaaS Prototype
 */

const MOCK_DB = {
    KEY_USER: 'shopsaas_user',
    KEY_SHOPS: 'shopsaas_shops',
    KEY_BILLING: 'shopsaas_billing',
    KEY_TRANSACTIONS: 'shopsaas_transactions',

    // --- Initialization ---
    init() {
        if (!localStorage.getItem(this.KEY_SHOPS)) {
            const initialShops = [
                {
                    id: 101,
                    shop_name: 'Modern Gadgets Co.',
                    app_name: 'modern-gadgets',
                    status: 'active',
                    chatbot_enabled: true,
                    created_at: new Date().toISOString().split('T')[0]
                },
                {
                    id: 102,
                    shop_name: 'Vintage Finds',
                    app_name: 'vintage-finds',
                    status: 'maintenance',
                    chatbot_enabled: false,
                    created_at: new Date(Date.now() - 86400000).toISOString().split('T')[0]
                }
            ];
            localStorage.setItem(this.KEY_SHOPS, JSON.stringify(initialShops));
        }

        if (!localStorage.getItem(this.KEY_BILLING)) {
            localStorage.setItem(this.KEY_BILLING, JSON.stringify({ credits: 150 }));
        }

        if (!localStorage.getItem(this.KEY_TRANSACTIONS)) {
            localStorage.setItem(this.KEY_TRANSACTIONS, JSON.stringify([
                { date: '2023-10-01', type: 'debit', amount: -25, description: 'AI Assistant - Monthly Fee' },
                { date: '2023-09-25', type: 'credit', amount: 1000, description: 'Credits Purchased' }
            ]));
        }
    },

    // --- User ---
    login(email) {
        localStorage.setItem(this.KEY_USER, JSON.stringify({ email, name: email.split('@')[0] }));
    },

    logout() {
        localStorage.removeItem(this.KEY_USER);
    },

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.KEY_USER));
        } catch { return null; }
    },

    // --- Shops ---
    getShops() {
        return JSON.parse(localStorage.getItem(this.KEY_SHOPS) || '[]');
    },

    addShop(shopData) {
        const shops = this.getShops();
        const newId = shops.length > 0 ? Math.max(...shops.map(s => s.id)) + 1 : 101;
        const slug = shopData.shop_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const newShop = {
            id: newId,
            shop_name: shopData.shop_name,
            app_name: slug,
            status: 'active', // Default to active for demo
            chatbot_enabled: false,
            created_at: new Date().toISOString().split('T')[0],
            ...shopData
        };
        
        shops.push(newShop);
        localStorage.setItem(this.KEY_SHOPS, JSON.stringify(shops));
        return newShop;
    },

    deleteShop(id) {
        let shops = this.getShops();
        shops = shops.filter(s => s.id !== id);
        localStorage.setItem(this.KEY_SHOPS, JSON.stringify(shops));
    },

    toggleChatbot(shopId, enabled) {
        const shops = this.getShops();
        const shopIndex = shops.findIndex(s => s.id === shopId);
        if (shopIndex > -1) {
            shops[shopIndex].chatbot_enabled = enabled;
            localStorage.setItem(this.KEY_SHOPS, JSON.stringify(shops));
            return true;
        }
        return false;
    },

    // --- Billing ---
    getCredits() {
        const data = JSON.parse(localStorage.getItem(this.KEY_BILLING) || '{"credits":0}');
        return data.credits;
    },

    addCredits(amount) {
        let credits = this.getCredits();
        credits += amount;
        localStorage.setItem(this.KEY_BILLING, JSON.stringify({ credits }));
        
        // Add transaction
        this.addTransaction({
            type: 'credit',
            amount: amount,
            description: 'Credits Purchased'
        });
        
        return credits;
    },

    spendCredits(amount, description) {
        let credits = this.getCredits();
        if (credits < amount) return false;
        
        credits -= amount;
        localStorage.setItem(this.KEY_BILLING, JSON.stringify({ credits }));
        
        this.addTransaction({
            type: 'debit',
            amount: -amount,
            description: description || 'Service Charge'
        });
        
        return true;
    },

    getTransactions() {
        return JSON.parse(localStorage.getItem(this.KEY_TRANSACTIONS) || '[]');
    },

    addTransaction(tx) {
        const list = this.getTransactions();
        list.unshift({
            date: new Date().toISOString().split('T')[0],
            ...tx
        });
        localStorage.setItem(this.KEY_TRANSACTIONS, JSON.stringify(list));
    }
};

// Auto-init on load
MOCK_DB.init();
