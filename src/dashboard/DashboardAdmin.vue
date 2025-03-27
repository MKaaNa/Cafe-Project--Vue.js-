<template>
    <div class="admin-dashboard">
        <!-- Header -->
        <header class="dashboard-header">
            <h1>Admin Paneli</h1>
            <button class="logout-btn" @click="logout">Çıkış Yap</button>
        </header>

        <!-- Sekmeler -->
        <nav class="tabs">
            <button :class="{ active: activeTab === 'activeOrders' }" @click="activeTab = 'activeOrders'">
                🟢 Aktif Siparişler
            </button>
            <button :class="{ active: activeTab === 'addProduct' }" @click="activeTab = 'addProduct'">
                ➕ Yeni Ürün Ekle
            </button>
            <button :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
                📜 Geçmiş Siparişler
            </button>
            <button :class="{ active: activeTab === 'staffManagement' }" @click="activeTab = 'staffManagement'">
                👥 Personel Yönetimi
            </button>
        </nav>

        <!-- İçerik -->
        <transition name="fade" mode="out-in">
            <div :key="activeTab" class="tab-content">
                <div v-if="activeTab === 'activeOrders'">
                    <div class="header-actions">
                        <button class="clear-btn" @click="günüBitir">📦 Günü Bitir</button>
                    </div>
                    <OrderList :mode="'active'" />
                </div>
                <div v-else-if="activeTab === 'addProduct'">
                    <AddProductForm />
                </div>
                <div v-else-if="activeTab === 'history'">
                    <OrderList :mode="'history'" />
                </div>
                <div v-else-if="activeTab === 'staffManagement'">
                    <StaffManagement />
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import OrderList from '../components/OrderList.vue';
import AddProductForm from '../components/AddProductForm.vue';
import StaffManagement from '../components/StaffManagement.vue';
import axios from 'axios';

export default {
    components: {
        OrderList,
        AddProductForm,
        StaffManagement
    },
    data() {
        return {
            activeTab: 'activeOrders'
        };
    },
    methods: {
        logout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        },
        async günüBitir() {
            const res = await axios.get('http://localhost:3000/orders');
            const today = new Date().toISOString().split('T')[0]; // Bugün tarihini al

            const todaysOrders = res.data.filter(order => order.timestamp.startsWith(today));

            let totalIncome = 0; // Bugünkü toplam kazanç
            let staffPerformance = {}; // Garson performansı

            // Her siparişi inceleyelim
            for (const order of todaysOrders) {
                totalIncome += order.total; // Toplam kazancı hesapla

                // Garsonun kazancını takip et
                if (order.createdBy) {
                    if (!staffPerformance[order.createdBy]) {
                        staffPerformance[order.createdBy] = { total: 0, orders: 0 };
                    }
                    staffPerformance[order.createdBy].total += order.total;
                    staffPerformance[order.createdBy].orders += 1;
                }

                // Siparişi "gün sonu" olarak işaretle
                order.status = 'gün sonu';
                await axios.put(`http://localhost:3000/orders/${order.id.toString()}`, order);
            }

            // Staff performans verilerini kaydet
            for (const [email, performance] of Object.entries(staffPerformance)) {
                const existingStats = await axios.get(`http://localhost:3000/staffStats?user=${email}&date=${today}`);
                if (existingStats.data.length > 0) {
                    const stats = existingStats.data[0];
                    stats.amount += performance.total;
                    stats.orders += performance.orders;
                    await axios.put(`http://localhost:3000/staffStats/${stats.id}`, stats);
                } else {
                    await axios.post('http://localhost:3000/staffStats', {
                        user: email,
                        amount: performance.total,
                        orders: performance.orders,
                        date: today
                    });
                }
            }

            // Günlük kazancı kaydet
            await axios.post('http://localhost:3000/dailyIncome', {
                date: today,
                income: totalIncome
            });

            alert('Gün başarıyla sonlandırıldı.');
        }
    }
};
</script>

<style scoped>
/* Genel Stil */
.admin-dashboard {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Inter', sans-serif;
}

/* Header */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.dashboard-header h1 {
    font-size: 28px;
    color: #2c3e50;
    font-weight: 600;
}

.logout-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;
}

.logout-btn:hover {
    background: #c0392b;
}

/* Sekmeler */
.tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 1.5rem;
}

.tabs button {
    padding: 10px 18px;
    border: none;
    border-radius: 6px;
    background: #ecf0f1;
    color: #2c3e50;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tabs button:hover {
    background: #dcdde1;
}

.tabs button.active {
    background: #42b983;
    color: white;
}

/* İçerik */
.tab-content {
    min-height: 400px;
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Header Actions */
.header-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
}

.clear-btn {
    background: #f39c12;
    color: white;
    border: none;
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
}

.clear-btn:hover {
    background: #e67e22;
}

/* Animasyon */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>