<template>
    <div class="order-list">
        <h2>📋 Sipariş Yönetimi</h2>

        <!-- Durum Filtreleme -->
        <div class="filter-bar">
            <label for="filter">Duruma göre filtrele:</label>
            <select id="filter" v-model="selectedStatus">
                <option value="">-- Durum Seçin --</option>
                <option value="onay bekliyor">🟡 Onay Bekliyor</option>
                <option value="hazırlanıyor">🛠️ Hazırlanıyor</option>
                <option value="hazır">✅ Hazır</option>
                <option value="teslim edildi">✔️ Teslim Edildi</option>
            </select>
        </div>

        <!-- Listeleme -->
        <table v-if="filteredOrders.length > 0" class="order-table">
            <thead>
                <tr>
                    <th>Masa</th>
                    <th>Toplam</th>
                    <th>Durum</th>
                    <th>Garson</th>
                    <th>Tarih</th>
                    <th>Yeni Durum</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in filteredOrders" :key="order.id">
                    <td>{{ order.table }}</td>
                    <td>{{ order.total }}₺</td>
                    <td>{{ order.status }}</td>
                    <td>{{ getGarsonName(order.createdBy) }}</td>
                    <td>{{ formatDate(order.timestamp) }}</td>
                    <td>
                        <select v-model="order.status" @change="updateStatus(order)">
                            <option value="onay bekliyor">Onay Bekliyor</option>
                            <option value="hazırlanıyor">Hazırlanıyor</option>
                            <option value="hazır">Hazır</option>
                            <option value="teslim edildi">Teslim Edildi</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-else class="empty-message">
            Lütfen bir sipariş durumu seçin.
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'OrderList',
    data() {
        return {
            orders: [],
            users: [],
            selectedStatus: ''
        };
    },
    computed: {
        filteredOrders() {
            if (!this.selectedStatus) return [];
            return this.orders.filter(order => order.status === this.selectedStatus);
        }
    },
    created() {
        this.fetchOrders();
        this.fetchUsers();
        setInterval(this.fetchOrders, 10000); // Her 10 saniyede güncelle
    },
    methods: {
        async fetchOrders() {
            const res = await axios.get('http://localhost:3000/orders');
            this.orders = res.data;
        },
        async fetchUsers() {
            const res = await axios.get('http://localhost:3000/users');
            this.users = res.data;
        },
        async updateStatus(order) {
            await axios.put(`http://localhost:3000/orders/${order.id}`, order);
        },
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString('tr-TR');
        },
        getGarsonName(email) {
            const user = this.users.find(u => u.email === email);
            return user ? user.name : 'Bilinmiyor';
        }
    }
};
</script>

<style scoped>
.order-list {
    max-width: 1000px;
    margin: 2rem auto;
}

.filter-bar {
    margin-bottom: 1.5rem;
    display: flex;
    gap: 10px;
    align-items: center;
}

.order-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.order-table th,
.order-table td {
    padding: 10px;
    border-bottom: 1px solid #eee;
    text-align: center;
    font-size: 14px;
}

.order-table th {
    background-color: #f3f3f3;
    font-weight: 600;
}

select {
    padding: 5px;
    border-radius: 5px;
    font-size: 14px;
}

.empty-message {
    text-align: center;
    padding: 2rem;
    color: #888;
}
</style>