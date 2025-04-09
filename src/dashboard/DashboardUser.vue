<template>
    <div class="garson-dashboard">
        <!-- Header -->
        <header class="dashboard-header">
            <h1>👋 Merhaba, <span class="highlight">{{ user.name }}</span></h1>
            <button class="logout-btn" @click="logout">Çıkış Yap</button>
        </header>

        <!-- Sekmeler -->
        <nav class="tabs">
            <button :class="{ active: currentTab === 'order' }" @click="currentTab = 'order'">
                📝 Sipariş Ver
            </button>
            <button :class="{ active: currentTab === 'active' }" @click="currentTab = 'active'">
                🟢 Aktif Siparişler
            </button>
            <button :class="{ active: currentTab === 'history' }" @click="currentTab = 'history'">
                📜 Geçmiş Siparişler
            </button>
        </nav>

        <!-- İçerik -->
        <div v-if="currentTab === 'order'" class="order-form">
            <h2>📝 Yeni Sipariş Oluştur</h2>
            <div class="animated-input-container">
                <input 
                    type="number" 
                    id="tableNumber" 
                    v-model="table" 
                    class="animated-input" 
                    placeholder=" " 
                    min="1" 
                    required 
                />
                <label for="tableNumber" class="animated-label">Masa Numarası</label>
            </div>
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
            <h2>🟢 Aktif Siparişler</h2>
            <div class="order-cards">
                <div v-for="order in activeOrders" :key="order.id" class="order-card">
                    <h4>Masa {{ order.table }}</h4>
                    <ul>
                        <li v-for="(item, index) in order.items" :key="index">
                            {{ getProductInfo(item).name }} - {{ getProductInfo(item).price }}₺
                        </li>
                    </ul>Başta
                    <p><strong>Toplam:</strong> {{ order.total }}₺</p>
                    <p v-if="users.length > 0"></p>
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
            <h2>📜 Geçmiş Siparişler</h2>
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

        <!-- Ödeme Ekranı Modal -->
        <div v-if="showPaymentScreen" class="modal-overlay">
            <div class="modal-content">
                <PaymentScreen 
                    :order="currentOrder"
                    @payment-completed="handlePaymentCompleted"
                    @cancel="showPaymentScreen = false"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { fetchOrders, fetchUsers, createOrder, updateOrderStatus, fetchMenu } from '@/utils/api';
import PaymentScreen from '@/components/PaymentScreen.vue';

export default {
    name: 'DashboardUser',
    components: {
        PaymentScreen
    },
    data() {
        return {
            user: {},
            users: [],
            table: '',
            menu: [],
            order: [],
            activeOrders: [],
            historyOrders: [],
            currentTab: 'order',  // Varsayılan sekme sipariş verme ekranı olsun
            showPaymentScreen: false,
            currentOrder: null
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
        const token = localStorage.getItem('token');
        if (!stored || !token) {
            alert('Lütfen giriş yapın.');
            this.$router.push('/login'); // Giriş yapılmamışsa login sayfasına yönlendir
            return;
        }
        this.user = JSON.parse(stored);
        await this.fetchUsers();
        await this.fetchMenu();
    },
    watch: {
        currentTab: {
            immediate: true,
            async handler(newTab) {
                if (newTab === 'active' || newTab === 'history') {
                    await this.fetchOrders(); // Sipariş verilerini yalnızca ilgili sekmeye geçildiğinde getir
                }
            }
        }
    },
    methods: {
        async fetchMenu() {
            try {
                const response = await fetchMenu();
                this.menu = response.data;
            } catch (error) {
                console.error("Menu verisi alınırken hata oluştu:", error);
                alert('Menü verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
            }
        },
        async fetchOrders() {
            try {
                const response = await fetchOrders();
                // Aktif siparişler: teslim edilmemiş ve iptal edilmemiş siparişler
                this.activeOrders = response.data.filter(order => 
                    order.status !== 'teslim edildi' && 
                    order.status !== 'iptal edildi' &&
                    order.status !== 'gün sonu'
                );
                // Geçmiş siparişler: teslim edilmiş siparişler
                this.historyOrders = response.data.filter(order => 
                    order.status === 'teslim edildi' || 
                    order.status === 'gün sonu'
                );
            } catch (error) {
                console.error('Sipariş verisi alınırken hata:', error);
                alert('Sipariş verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
            }
        },
        async fetchUsers() {
            try {
                const response = await fetchUsers();
                this.users = response.data;
            } catch (error) {
                console.error('Kullanıcı verisi alınırken hata:', error);
                alert('Kullanıcı verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
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

            if (this.table < 1) {
                alert('Geçerli bir masa numarası giriniz.');
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
                await createOrder(newOrder);
                alert('Sipariş başarıyla gönderildi.');
                this.order = [];
                this.table = '';
                await this.fetchOrders();
            } catch (error) {
                console.error("Sipariş gönderilirken hata oluştu:", error);
                alert('Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        },
        async markAsDelivered(order) {
            try {
                await updateOrderStatus(order.id, 'teslim edildi');
                this.currentOrder = order;
                this.showPaymentScreen = true;
                this.fetchOrders();
            } catch (error) {
                console.error("Sipariş teslim edilirken hata oluştu:", error);
                alert('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        },
        async cancelOrder(order) {
            try {
                await updateOrderStatus(order.id, 'iptal edildi');
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
        },
        async handlePaymentCompleted() {
            this.showPaymentScreen = false;
            this.fetchOrders();
            alert('Ödeme başarıyla tamamlandı!');
        }
    }
};
</script>

<style scoped>
.garson-dashboard {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 2rem;
    background: #1e1e1e;
    border-radius: 12px;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.dashboard-header h1 {
    font-size: 24px;
    color: #42b983;
}

.logout-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.logout-btn:hover {
    background: #c0392b;
}

.tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.tabs button {
    padding: 10px 18px;
    border: none;
    border-radius: 6px;
    background: #2c3e50;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tabs button:hover {
    background: #34495e;
}

.tabs button.active {
    background: #42b983;
    color: white;
}

.order-form,
.order-list {
    margin-top: 1.5rem;
}

.menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.menu-card {
    background: #2c3e50;
    padding: 1rem;
    border-radius: 10px;
    text-align: center;
    color: white;
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
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
}

.add-btn:hover {
    background: #369f6e;
}

.order-summary {
    background: #34495e;
    padding: 1rem;
    border-radius: 10px;
    color: white;
}

.order-summary ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: 0.5rem;
}

.submit-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
}

.submit-btn:hover {
    background: #369f6e;
}

.order-cards {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.order-card {
    background: #2c3e50;
    padding: 1rem;
    border-radius: 10px;
    color: white;
}

.timestamp {
    font-size: 12px;
    color: #bdc3c7;
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

.cancel-btn:hover {
    background: #c0392b;
}

.animated-input-container {
    position: relative;
    margin-bottom: 1.5rem;
}

.animated-input {
    width: 100%;
    padding: 10px 12px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 6px;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.animated-input:focus {
    border-color: #42b983;
    box-shadow: 0 0 8px rgba(66, 185, 131, 0.3);
}

.animated-input:focus + .animated-label,
.animated-input:not(:placeholder-shown) + .animated-label {
    top: -10px;
    left: 10px;
    font-size: 12px;
    color: #42b983;
}

.animated-label {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    font-size: 16px;
    color: #aaa;
    pointer-events: none;
    transition: all 0.3s ease;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 2rem;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}
</style>