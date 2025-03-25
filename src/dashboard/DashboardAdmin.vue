
<template>
    <div class="admin-dashboard">
        <button class="logout-btn" @click="logout">Çıkış Yap</button>

        <OrderList />
        <DashboardStatus />


        <h2>👋 Hoş geldiniz, <span class="highlight">{{ user.name }}</span></h2>
        <p class="section-title">☕ Menü Yönetimi</p>

        <!-- Ürün Kartları -->
        <div class="menu-grid">
            <div class="menu-card" v-for="item in menu" :key="item.id">
                <img :src="item.image || defaultImage" class="menu-img" />
                <div>
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.price }}₺</p>
                </div>
                <button class="delete-btn" @click="deleteMenuItem(item.id)">Sil</button>
            </div>
        </div>

        <!-- Ürün Ekleme Formu -->
        <div class="add-section">
            <h3>Yeni Ürün Ekle</h3>
            <form @submit.prevent="addMenuItem" class="add-form">
                <input v-model="newItem.name" placeholder="Ürün adı" />
                <input v-model.number="newItem.price" type="number" placeholder="Fiyat (₺)" />
                <input v-model="newItem.image" placeholder="Resim URL (opsiyonel)" />
                <button type="submit" class="add-btn">➕ Ekle</button>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import OrderList from '../components/OrderList.vue';
import DashboardStatus from '../components/DashboardStatus.vue';

export default {
    name: 'DashboardAdmin',
    components: {
        OrderList,
        DashboardStatus
    },
    data() {
        return {
            user: {},
            menu: [],
            newItem: {
                name: '',
                price: '',
                image: ''
            },
            defaultImage: 'https://via.placeholder.com/150'
        };
    },
    created() {
        const stored = localStorage.getItem('user');
        if (stored) {
            this.user = JSON.parse(stored);
        }

        this.getMenu();
    },
    methods: {
        async getMenu() {
            try {
                const res = await axios.get('http://localhost:3000/menu');
                this.menu = res.data;
            } catch (err) {
                console.error('Menü alınamadı:', err);
            }
        },
        async addMenuItem() {
            if (!this.newItem.name || !this.newItem.price) {
                alert('Lütfen ürün adı ve fiyat girin.');
                return;
            }

            try {
                await axios.post('http://localhost:3000/menu', this.newItem);
                this.newItem = { name: '', price: '', image: '' };
                this.getMenu();
            } catch (err) {
                console.error('Ürün eklenemedi:', err);
            }
        },
        async deleteMenuItem(id) {
            if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

            try {
                await axios.delete(`http://localhost:3000/menu/${id}`);
                this.getMenu();
            } catch (err) {
                console.error('Silme hatası:', err);
            }
        },
        logout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    }
};
</script>

<style scoped>
.admin-dashboard {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 2rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    text-align: center;
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
    font-size: 18px;
    font-weight: 600;
    margin: 1rem 0;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
}

.menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.menu-card {
    background: #f7f7f7;
    padding: 1rem;
    border-radius: 10px;
    text-align: left;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.menu-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}

.menu-card h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
}

.menu-card p {
    font-size: 14px;
    color: #666;
    margin: 0.5rem 0;
}

.delete-btn {
    align-self: flex-end;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 13px;
    margin-top: auto;
}

.add-section {
    margin-top: 2rem;
    text-align: left;
}

.add-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.add-form input {
    flex: 1 1 30%;
    padding: 8px;
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

.add-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
}
</style>