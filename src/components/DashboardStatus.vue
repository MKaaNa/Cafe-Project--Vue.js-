<template>
    <div class="stats-grid">
        <div class="stat-card">
            <h3>{{ totalOrders }}</h3>
            <p>Toplam Sipariş</p>
        </div>
        <div class="stat-card">
            <h3>{{ activeTables.length }}</h3>
            <p>Aktif Masalar</p>
        </div>
        <div class="stat-card">
            <h3>{{ totalRevenue }}₺</h3>
            <p>Toplam Ciro</p>
        </div>
        <div class="stat-card">
            <h3>{{ preparingOrders }}</h3>
            <p>Hazırlanıyor</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'DashboardStats',
    data() {
        return {
            orders: []
        };
    },
    computed: {
        totalOrders() {
            return this.orders.length;
        },
        activeTables() {
            const tables = this.orders.map(order => order.table);
            return [...new Set(tables)];
        },
        totalRevenue() {
            return this.orders
                .filter(order => order.status === 'teslim edildi')
                .reduce((sum, order) => sum + order.total, 0);
        },
        preparingOrders() {
            return this.orders.filter(order => order.status === 'hazırlanıyor').length;
        }
    },
    created() {
        this.fetchOrders();
        setInterval(this.fetchOrders, 10000); // 10 saniyede bir yenile
    },
    methods: {
        async fetchOrders() {
            try {
                const res = await axios.get('http://localhost:3000/orders');
                this.orders = res.data;
            } catch (err) {
                console.error('İstatistik verileri alınamadı:', err);
            }
        }
    }
};
</script>

<style scoped>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: #f7f7f7;
    padding: 1.2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.stat-card h3 {
    font-size: 28px;
    margin: 0;
    color: #2c3e50;
}

.stat-card p {
    margin-top: 0.5rem;
    color: #666;
    font-size: 14px;
}
</style>