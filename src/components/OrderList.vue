<template>
    <div class="order-list">
        <!-- 🔍 FİLTRELER (Sadece history modunda gösterilir) -->
        <div v-if="mode === 'history'" class="filters">
            <input type="date" v-model="filters.date" />
            <input type="text" v-model="filters.user" placeholder="Garson adı" />
            <input type="number" v-model.number="filters.minPrice" placeholder="Min ₺" />
            <input type="number" v-model.number="filters.maxPrice" placeholder="Max ₺" />
        </div>

        <!-- 📋 TABLO -->
        <table class="order-table" v-if="paginatedOrders.length">
            <thead>
                <tr>
                    <th>Masa</th>
                    <th>Toplam</th>
                    <th>Durum</th>
                    <th>Garson</th>
                    <th>Tarih</th>
                    <!-- Sadece aktif modda güncelleme yapılabilsin -->
                    <th v-if="mode !== 'history'">İşlem</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in paginatedOrders" :key="order.id">
                    <td>{{ order.table }}</td>
                    <td>{{ order.total }}₺</td>
                    <td>{{ order.status }}</td>
                    <td>{{ getGarsonName(order.createdBy) }}</td>
                    <td>{{ formatDate(order.timestamp) }}</td>
                    <!-- Eğer aktif moddaysa güncelleme select'i göster -->
                    <td v-if="mode !== 'history'">
                        <div v-if="!['teslim edildi', 'iptal edildi'].includes(order.status)">
                            <select :value="order.status" @change="updateStatus(order, $event.target.value)">
                                <option value="onay bekliyor">onay bekliyor</option>
                                <option value="hazır">hazır</option>
                                <option value="iptal edildi">iptal edildi</option>
                                <option value="teslim edildi">teslim edildi</option>
                            </select>
                        </div>
                        <div v-else>
                            {{ order.status }}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-else class="empty">Uygun sipariş bulunamadı.</div>

        <!-- 📄 SAYFALAMA -->
        <div v-if="totalPages > 1" class="pagination">
            <button @click="currentPage--" :disabled="currentPage === 1">←</button>
            <span>Sayfa {{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages">→</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'OrderList',
    props: {
        mode: {
            type: String,
            required: true // "active" veya "history"
        }
    },
    data() {
        return {
            orders: [],
            users: [],
            filters: {
                date: '',
                user: '',
                minPrice: null,
                maxPrice: null
            },
            currentPage: 1,
            itemsPerPage: 10
        };
    },
    computed: {
        filteredOrders() {
            let filtered = this.orders;

            if (this.mode === 'active') {
                // Aktif siparişler: teslim edilmemiş, iptal edilmemiş ve gün sonu olmayan siparişler
                filtered = filtered.filter(o => !['teslim edildi', 'iptal edildi', 'gün sonu'].includes(o.status));
            } else if (this.mode === 'history') {
                // Geçmiş siparişler: teslim edilmiş veya gün sonu olarak işaretlenmiş
                filtered = filtered.filter(o => o.status === 'teslim edildi' || o.status === 'gün sonu');
            }

            // Filtreleme (sadece history modda)
            if (this.mode === 'history') {
                if (this.filters.date) {
                    filtered = filtered.filter(o => o.timestamp && o.timestamp.startsWith(this.filters.date));
                }
                if (this.filters.user) {
                    const name = this.filters.user.toLowerCase();
                    filtered = filtered.filter(o => {
                        const garson = this.getGarsonName(o.createdBy).toLowerCase();
                        return garson.includes(name);
                    });
                }
                if (this.filters.minPrice != null) {
                    filtered = filtered.filter(o => o.total >= this.filters.minPrice);
                }
                if (this.filters.maxPrice != null) {
                    filtered = filtered.filter(o => o.total <= this.filters.maxPrice);
                }
            }

            // En yeni sipariş en üstte
            return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        },
        paginatedOrders() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredOrders.slice(start, start + this.itemsPerPage);
        },
        totalPages() {
            return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
        }
    },
    async created() {
        await this.fetchOrders();
        await this.fetchUsers();
    },
    methods: {
        async fetchOrders() {
            try {
                const res = await axios.get('http://localhost:3000/orders');
                console.log('Siparişler:', res.data); // Siparişleri kontrol edin
                this.orders = res.data;
            } catch (error) {
                console.error('Siparişler alınırken hata oluştu:', error);
            }
        },
        async fetchUsers() {
            try {
                const res = await axios.get('http://localhost:3000/users');
                this.users = res.data;
            } catch (error) {
                console.error('Kullanıcı verisi alınırken hata oluştu:', error);
            }
        },
        getGarsonName(email) {
            if (!this.users || this.users.length === 0) return 'Bilinmiyor';
            const user = this.users.find(u => u.email === email);
            return user ? user.name : 'Bilinmiyor';
        },
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString('tr-TR');
        },
        async updateStatus(order, newStatus) {
            console.log('Güncellenen sipariş ID:', order.id); // ID'yi kontrol edin
            order.status = newStatus;
            try {
                await axios.put(`http://localhost:3000/orders/${order.id}`, order);
                await this.fetchOrders();
            } catch (error) {
                console.error('Sipariş durumu güncellenirken hata oluştu:', error);
            }
        }
    },
    watch: {
        filters: {
            handler() {
                this.currentPage = 1;
            },
            deep: true
        }
    }
};
</script>

<style scoped>
.order-list {
    max-width: 100%;
    overflow-x: auto;
    padding-bottom: 1rem;
}

.filters {
    display: flex;
    gap: 10px;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.filters input {
    padding: 6px 10px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid #ccc;
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
    text-align: center;
    border-bottom: 1px solid #eee;
    font-size: 14px;
}

.order-table th {
    background-color: #f3f3f3;
    font-weight: 600;
}

.pagination {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 1rem;
    align-items: center;
}

.pagination button {
    padding: 6px 12px;
    border-radius: 4px;
    background: #42b983;
    color: white;
    border: none;
    cursor: pointer;
}

.pagination button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.empty {
    text-align: center;
    padding: 2rem;
    color: #777;
}
</style>