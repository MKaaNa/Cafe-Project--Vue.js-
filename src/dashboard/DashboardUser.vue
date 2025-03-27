<template>
    <div class="garson-dashboard">
        <button class="logout-btn" @click="logout">Çıkış Yap</button>

        <!-- Dinamik Başlık -->
        <h2>👋 Merhaba, <span class="highlight">{{ user.name }}</span></h2>
        <p class="section-title">{{ currentTabTitle }}</p>

        <!-- Sekme Butonları -->
        <div class="tabs">
            <button :class="{ active: currentTab === 'order' }" @click="currentTab = 'order'">
                Sipariş Ver
            </button>
            <button :class="{ active: currentTab === 'active' }" @click="currentTab = 'active'">
                Aktif Siparişler
            </button>
            <button :class="{ active: currentTab === 'history' }" @click="currentTab = 'history'">
                Geçmiş Siparişler
            </button>
        </div>

        <!-- Sekme İçerikleri -->
        <div v-if="currentTab === 'order'" class="order-form">
            <!-- Sipariş Verme Ekranı -->
            <input v-model="table" placeholder="Masa Numarası" class="table-input" />
            <div class="menu-grid">
                <div class="menu-card" v-for="item in menu" :key="item.id">
                    <img :src="item.image" alt="product image" class="menu-img" />
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.price }}₺</p>
                    <button class="add-btn" @click="addToOrder(item)">Ekle</button>
                </div>
            </div>
            <div v-if="order.length > 0" class="order-summary">
                <h3>🧾 Sipariş Özeti</h3>
                <ul>
                    <li v-for="(item, index) in order" :key="index">
                        {{ item.name }} x{{ item.quantity }} - {{ item.price * item.quantity }}₺
                        <button @click="removeFromOrder(item)">➖</button>
                        <button @click="addToOrder(item)">➕</button>
                    </li>
                </ul>
                <p><strong>Toplam:</strong> {{ totalPrice }}₺</p>
                <button class="submit-btn" @click="submitOrder">Siparişi Gönder</button>
            </div>
        </div>
        <div v-if="currentTab === 'active'" class="order-list">
            <!-- Aktif Siparişler -->
            <div class="order-cards">
                <div v-for="order in activeOrders" :key="order.id" class="order-card">
                    <h4>Masa {{ order.table }}</h4>
                    <ul>
                        <li v-for="(item, index) in order.items" :key="index">
                            {{ getProductInfo(item).name }} - {{ getProductInfo(item).price }}₺
                        </li>
                    </ul>
                    <p><strong>Toplam:</strong> {{ order.total }}₺</p>
                    <p v-if="users.length > 0"><strong>Garson:</strong> {{ getGarsonName(order.createdBy) }}</p>
                    <p class="timestamp">📅 {{ formatDate(order.timestamp) }}</p>
                    <div class="order-actions">
                        <button @click="markAsDelivered(order)" v-if="order.status === 'hazır'">
                            Teslim Et
                        </button>
                        <button class="cancel-btn" @click="cancelOrder(order)" v-if="order.status !== 'iptal edildi'">
                            Siparişi İptal Et
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="currentTab === 'history'" class="order-list">
            <!-- Geçmiş Siparişler -->
            <div class="order-cards">
                <div v-for="order in historyOrders" :key="order.id" class="order-card">
                    <h4>Masa {{ order.table }}</h4>
                    <ul>
                        <li v-for="(item, index) in order.items" :key="index">
                            {{ getProductInfo(item).name }} - {{ getProductInfo(item).price }}₺
                        </li>
                    </ul>
                    <p><strong>Toplam:</strong> {{ order.total }}₺</p>
                    <p v-if="users.length > 0"><strong>Garson:</strong> {{ getGarsonName(order.createdBy) }}</p>
                    <p class="timestamp">📅 {{ formatDate(order.timestamp) }}</p>
                </div>
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
            users: [],
            table: '',
            menu: [],
            order: [],
            activeOrders: [],
            historyOrders: [],
            currentTab: 'order'  // Varsayılan sekme sipariş verme ekranı olsun
        };
    },
    computed: {
        totalPrice() {
            return this.order.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },
        currentTabTitle() {
            if (this.currentTab === 'order') return '📝 Yeni Sipariş Oluştur';
            if (this.currentTab === 'active') return '🟢 Aktif Siparişler';
            if (this.currentTab === 'history') return '📜 Geçmiş Siparişler';
            return '';
        }
    },
    async created() {
        const stored = localStorage.getItem('user');
        if (stored) {
            this.user = JSON.parse(stored);
        }
        await this.fetchUsers();
        await this.fetchMenu();
        await this.fetchOrders();
        // Sipariş verilerini periyodik olarak yenilemek için:
        setInterval(this.fetchOrders, 5000);
    },
    methods: {
        async fetchMenu() {
            try {
                const res = await axios.get('http://localhost:3000/menu');
                this.menu = res.data;
            } catch (error) {
                console.error("Menu verisi alınırken hata oluştu:", error);
            }
        },
        async fetchOrders() {
            try {
                const res = await axios.get('http://localhost:3000/orders');
                this.activeOrders = res.data.filter(order => order.status !== 'teslim edildi' && order.status !== 'iptal edildi');
                this.historyOrders = res.data.filter(order => order.status === 'teslim edildi');
            } catch (error) {
                console.error("Sipariş verisi alınırken hata oluştu:", error);
            }
        },
        async fetchUsers() {
            try {
                const res = await axios.get('http://localhost:3000/users');
                this.users = res.data;
            } catch (error) {
                console.error("Kullanıcı verisi alınırken hata oluştu:", error);
            }
        },
        addToOrder(item) {
            const existingItem = this.order.find(orderItem => orderItem.id === item.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.order.push({ ...item, quantity: 1 });
            }
        },
        removeFromOrder(item) {
            const existingItem = this.order.find(orderItem => orderItem.id === item.id);
            if (existingItem) {
                if (existingItem.quantity > 1) {
                    existingItem.quantity--;
                } else {
                    this.order = this.order.filter(orderItem => orderItem.id !== item.id);
                }
            }
        },
        async submitOrder() {
            if (!this.table || this.order.length === 0) {
                alert('Masa numarası ve ürün seçimi gereklidir.');
                return;
            }
            const newOrder = {
                table: this.table,
                items: this.order.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total: this.totalPrice,
                status: 'onay bekliyor',
                timestamp: new Date().toISOString(),
                createdBy: this.user.email
            };
            try {
                await axios.post('http://localhost:3000/orders', newOrder);
                alert('Sipariş gönderildi.');
                this.order = [];
                this.fetchOrders();
            } catch (error) {
                console.error("Sipariş gönderilirken hata oluştu:", error);
            }
        },
        async markAsDelivered(order) {
            order.status = 'teslim edildi';
            try {
                await axios.put(`http://localhost:3000/orders/${order.id}`, order);
                this.fetchOrders();
            } catch (error) {
                console.error("Sipariş teslim edilirken hata oluştu:", error);
            }
        },
        async cancelOrder(order) {
            try {
                // Sipariş durumunu "iptal edildi" olarak güncelle
                order.status = 'iptal edildi';
                await axios.put(`http://localhost:3000/orders/${order.id}`, order);

                // Sipariş listesini yeniden yükle
                this.fetchOrders();
                alert('Sipariş başarıyla iptal edildi.');
            } catch (error) {
                console.error("Sipariş iptal edilirken hata oluştu:", error);
                alert('Sipariş iptal edilemedi. Lütfen tekrar deneyin.');
            }
        },
        getGarsonName(email) {
            if (!this.users || this.users.length === 0) return '';
            const user = this.users.find(u => u.email === email);
            return user ? user.name : '';
        },
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString('tr-TR');
        },
        logout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        },
        getProductInfo(item) {
            // Eğer item bir nesne değilse (örneğin sadece id ise), menüden eşleşen ürünü bul
            if (typeof item === 'string') {
                const product = this.menu.find(product => product.id === item);
                return product || { name: 'Bilinmiyor', price: 0 };
            }
            // Eğer item zaten bir nesne ise, doğrudan döndür
            return item;
        }
    }
};
</script>

<style scoped>
.garson-dashboard {
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

.tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.tabs button {
    padding: 10px;
    margin: 0 10px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.tabs .active {
    background-color: #38a169;
}

.order-list {
    margin-top: 2rem;
}

.order-cards {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

.cancel-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 0.5rem;
}

.product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
}
</style>