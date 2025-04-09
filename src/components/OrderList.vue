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
                            <select :value="order.status" @change="updateStatus(order.id, $event.target.value)">
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
import { fetchOrders, fetchUsers, updateOrderStatus } from '@/utils/api';
import { filterOrders, paginateOrders } from '@/utils/orderHelpers';
import debounce from 'lodash/debounce';

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
            itemsPerPage: 10,
            loading: false,
            error: null
        };
    },
    computed: {
        filteredOrders() {
            return filterOrders(this.orders, this.mode, this.filters, this.getGarsonName);
        },
        paginatedOrders() {
            return paginateOrders(this.filteredOrders, this.currentPage, this.itemsPerPage);
        },
        totalPages() {
            return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
        }
    },
    async created() {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!user || !token) {
            alert('Lütfen giriş yapın.');
            this.$router.push('/login'); // Giriş yapılmamışsa login sayfasına yönlendir
            return;
        }
        this.debouncedLoadUsers();
        this.debouncedLoadOrders();
    },
    methods: {
        async loadUsers() {
            try {
                const response = await fetchUsers();
                this.users = response.data;
            } catch (error) {
                console.error('Kullanıcılar yüklenirken hata oluştu:', error);
                this.error = 'Kullanıcılar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.';
                alert(this.error);
            }
        },
        async loadOrders() {
            try {
                const response = await fetchOrders();
                this.orders = response.data;
            } catch (error) {
                console.error('Siparişler yüklenirken hata oluştu:', error);
                this.error = 'Siparişler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.';
                alert(this.error);
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
        async updateStatus(orderId, status) {
            try {
                await updateOrderStatus(orderId, status);
                await this.loadOrders();
            } catch (error) {
                console.error('Sipariş durumu güncellenirken hata oluştu:', error);
                this.error = 'Sipariş durumu güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
                alert(this.error);
            }
        },
        debouncedLoadUsers: debounce(async function () {
            await this.loadUsers();
        }, 500),
        debouncedLoadOrders: debounce(async function () {
            await this.loadOrders();
        }, 500),
        debouncedUpdateStatus: debounce(async function (orderId, status) {
            await this.updateStatus(orderId, status);
        }, 500)
    },
    watch: {
        filters: {
            handler() {
                this.currentPage = 1;
                this.debouncedLoadOrders();
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

/* Responsive Design */
@media (max-width: 768px) {
    .filters {
        flex-direction: column;
        gap: 5px;
    }

    .order-table th,
    .order-table td {
        font-size: 12px;
        padding: 8px;
    }

    .pagination {
        flex-direction: column;
        gap: 8px;
    }

    .pagination button {
        width: 100%;
    }
}
</style>