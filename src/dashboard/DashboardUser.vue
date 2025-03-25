<template>
    <div class="user-dashboard">
        <button class="logout-btn" @click="logout">Çıkış Yap</button>

        <h2>👋 Merhaba, <span class="highlight">{{ user.name }}</span></h2>
        <p class="section-title">📝 Yeni Sipariş Oluştur</p>

        <!-- Masa Girişi -->
        <input v-model="table" placeholder="Masa Numarası" class="table-input" />

        <!-- Menü -->
        <div class="menu-grid">
            <div class="menu-card" v-for="item in menu" :key="item.id">
                <img :src="item.image || defaultImage" class="menu-img" />
                <h3>{{ item.name }}</h3>
                <p>{{ item.price }}₺</p>
                <button class="add-btn" @click="addToOrder(item)">Ekle</button>
            </div>
        </div>

        <!-- Sipariş Özeti -->
        <div v-if="order.length > 0" class="order-summary">
            <h3>🧾 Sipariş Özeti</h3>
            <ul>
                <li v-for="(item, index) in order" :key="index">
                    {{ item.name }} - {{ item.price }}₺
                </li>
            </ul>
            <p><strong>Toplam:</strong> {{ totalPrice }}₺</p>
            <button class="submit-btn" @click="submitOrder">Siparişi Gönder</button>
        </div>

        <!-- Bugünkü Siparişlerim -->
        <div v-if="todaysOrders.length > 0" class="active-orders">
            <h3>📅 Bugünkü Siparişlerim</h3>
            <div class="order-card" v-for="order in todaysOrders" :key="order.id">
                <p><strong>Masa:</strong> {{ order.table }}</p>
                <p><strong>Durum:</strong> {{ order.status }}</p>
                <ul>
                    <li v-for="(item, index) in order.items" :key="index">
                        {{ item.name }} - {{ item.price }}₺
                    </li>
                </ul>
                <p><strong>Toplam:</strong> {{ order.total }}₺</p>
                <p class="timestamp">📅 {{ formatDate(order.timestamp) }}</p>
                <button v-if="order.status === 'hazır'" class="submit-btn" @click="markAsDelivered(order)">
                    ✅ Teslim Et
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'DashboardUser',
    data() {
        return {
            user: {},
            table: '',
            menu: [],
            order: [],
            allOrders: [],
            defaultImage: 'https://via.placeholder.com/150'
        };
    },
    computed: {
        totalPrice() {
            return this.order.reduce((sum, item) => sum + item.price, 0);
        },
        todaysOrders() {
            const today = new Date().toISOString().split('T')[0];
            return this.allOrders.filter(order => {
                const isToday = order.timestamp?.startsWith(today);
                const isMine = order.createdBy === this.user.email;
                return isToday && isMine;
            });
        }
    },
    created() {
        const stored = localStorage.getItem('user');
        if (stored) this.user = JSON.parse(stored);
        this.fetchMenu();
        this.fetchOrders();
        setInterval(this.fetchOrders, 5000);
    },
    methods: {
        async fetchMenu() {
            const res = await axios.get('http://localhost:3000/menu');
            this.menu = res.data;
        },
        async fetchOrders() {
            const res = await axios.get('http://localhost:3000/orders');
            this.allOrders = res.data;
        },
        addToOrder(item) {
            this.order.push(item);
        },
        async submitOrder() {
            if (!this.table || this.order.length === 0) {
                alert('Masa ve ürün bilgisi gerekli.');
                return;
            }

            const newOrder = {
                table: this.table,
                items: this.order,
                total: this.totalPrice,
                status: 'onay bekliyor',
                timestamp: new Date().toISOString(),
                createdBy: this.user.email
            };

            await axios.post('http://localhost:3000/orders', newOrder);
            alert('Sipariş gönderildi.');
            this.order = [];
            this.fetchOrders();
        },
        async markAsDelivered(order) {
            // 1. Siparişin durumunu "teslim edildi" olarak güncelle
            order.status = 'teslim edildi';
            await axios.put(`http://localhost:3000/orders/${order.id}`, order);

            // 2. Performans verisini güncelle
            const today = new Date().toISOString().split('T')[0];

            // staffStats içinde aynı kullanıcı ve aynı gün varsa -> toplam üzerine ekle
            const existingStats = await axios.get(`http://localhost:3000/staffStats?user=${this.user.email}&date=${today}`);

            if (existingStats.data.length > 0) {
                const stat = existingStats.data[0];
                const updated = {
                    ...stat,
                    amount: stat.amount + order.total
                };
                await axios.put(`http://localhost:3000/staffStats/${stat.id}`, updated);
            } else {
                await axios.post('http://localhost:3000/staffStats', {
                    user: this.user.email,
                    amount: order.total,
                    date: today
                });
            }

            // 3. Sipariş listesini yenile
            this.fetchOrders();
        },
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString('tr-TR');
        },
        logout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    }
};
</script>

<style scoped>
.user-dashboard {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 2rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    position: relative;
}

.logout-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: #e74c3c;
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 13px;
}

.highlight {
    color: #42b983;
    font-weight: bold;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 1rem 0;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
}

.table-input {
    width: 200px;
    padding: 8px;
    font-size: 14px;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.menu-card {
    background: #fdfdfd;
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    text-align: center;
}

.menu-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}

.add-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
}

.order-summary {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 2rem;
}

.order-summary ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: 0.5rem;
}

.submit-btn {
    background: #35495e;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    margin-top: 0.5rem;
    cursor: pointer;
}

.active-orders {
    margin-top: 2rem;
}

.order-card {
    background: #f2f2f2;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 10px;
}

.timestamp {
    font-size: 12px;
    color: #777;
    margin-top: 0.5rem;
}
</style>