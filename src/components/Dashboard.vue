<template>
    <div class="dashboard">
        <h2>Hoş geldin, {{ user.name }}</h2>
        <p class="role-badge">Rol: {{ user.role }}</p>

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
            user: {}
        };
    },
    created() {
        const stored = localStorage.getItem('user');
        if (!stored) {
            alert('Giriş yapmalısınız.');
            // İsteğe bağlı yönlendirme:
            // this.$router.push('/login');
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
</style>


