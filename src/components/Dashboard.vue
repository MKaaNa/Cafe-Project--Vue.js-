<template>
    <div class="dashboard">
        <h2>Hoş geldin, {{ user.name }}</h2>
        <p class="role-badge">Rol: {{ user.role }}</p>

        <!-- 💎 Masa Numarası Giriş -->
        <div class="animated-input-container">
            <input 
                type="number" 
                id="tableNumber" 
                v-model="tableNumber" 
                class="animated-input" 
                placeholder=" " 
                min="1" 
                required 
            />
            <label for="tableNumber" class="animated-label">Masa Numarası</label>
        </div>

        <div v-if="user.role === 'admin'" class="admin-panel">
            <h3>Admin Paneli</h3>
            <ul>
                <li>👥 Kullanıcıları Yönet</li>
                <li>📋 Menüleri Düzenle</li>
                <li>📦 Siparişleri Takip Et</li>
                <li>📊 Günlük Raporlar</li>
            </ul>
        </div>

        <div v-else class="user-panel">
            <h3>Garson Paneli</h3>
            <ul>
                <li>📝 Sipariş Oluştur</li>
                <li>🍽️ Masa Durumları</li>
                <li>📖 Menüye Göz At</li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DashboardPage',
    data() {
        return {
            user: {},
            tableNumber: ''
        };
    },
    created() {
        const stored = localStorage.getItem('user');
        if (!stored) {
            alert('Giriş yapmalısınız.');
            return;
        }
        this.user = JSON.parse(stored);
    }
};
</script>

<style scoped>
.dashboard {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: #f3f3f3;
    border-radius: 10px;
    text-align: left;
}

.role-badge {
    font-size: 14px;
    color: #666;
    margin-bottom: 1rem;
}

ul {
    padding-left: 1.5rem;
}

li {
    margin-bottom: 0.7rem;
}

/* 💎 Animasyonlu Masa Numarası Giriş */
.animated-input-container {
    position: relative;
    margin: 1.5rem 0;
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
</style>