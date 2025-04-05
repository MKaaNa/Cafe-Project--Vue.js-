export const filterOrders = (orders, mode, filters, getGarsonName) => {
    let filtered = orders;

    if (mode === 'active') {
        filtered = filtered.filter(o => !['teslim edildi', 'iptal edildi', 'gün sonu'].includes(o.status));
    } else if (mode === 'history') {
        filtered = filtered.filter(o => o.status === 'teslim edildi' || o.status === 'gün sonu');
    }

    if (mode === 'history') {
        if (filters.date) {
            filtered = filtered.filter(o => o.timestamp && o.timestamp.startsWith(filters.date));
        }
        if (filters.user) {
            const name = filters.user.toLowerCase();
            filtered = filtered.filter(o => {
                const garson = getGarsonName(o.createdBy).toLowerCase();
                return garson.includes(name);
            });
        }
        if (filters.minPrice != null) {
            filtered = filtered.filter(o => o.total >= filters.minPrice);
        }
        if (filters.maxPrice != null) {
            filtered = filtered.filter(o => o.total <= filters.maxPrice);
        }
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const paginateOrders = (filteredOrders, currentPage, itemsPerPage) => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
};
