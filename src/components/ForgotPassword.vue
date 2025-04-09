<template>
    <div class="auth-container">
        <img class="logo" alt="Vue logo" src="../assets/image.png" />
        <h1>Şifremi Unuttum</h1>
        <p v-if="!showResetForm">Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
        <p v-else>Yeni şifrenizi belirleyin.</p>

        <div v-if="!showResetForm && !emailSent" class="auth-form">
            <input type="email" placeholder="Email" v-model="email" class="input-field" />
            <button class="submit-button" @click="requestReset">Şifre Sıfırlama Bağlantısı Gönder</button>
        </div>

        <div v-if="emailSent" class="success-message">
            <p>Şifre sıfırlama bağlantısı email adresinize gönderildi.</p>
            <p>Lütfen email kutunuzu kontrol edin.</p>
        </div>

        <form class="auth-form" @submit.prevent="resetPassword" v-if="showResetForm">
            <input type="password" placeholder="Yeni Şifre" v-model="newPassword" class="input-field" />
            <input type="password" placeholder="Yeni Şifre (Tekrar)" v-model="confirmPassword" class="input-field" />
            <button class="submit-button" type="submit">Şifreyi Güncelle</button>
        </form>

        <p class="switch-link">
            <a href="#" @click.prevent="goToLogin">Giriş sayfasına dön</a>
        </p>
    </div>
</template>

<script>
import api from '@/utils/api';

export default {
    name: 'ForgotPassword',
    data() {
        return {
            email: '',
            newPassword: '',
            confirmPassword: '',
            showResetForm: false,
            resetToken: null,
            emailSent: false
        };
    },
    created() {
        // URL'den token'ı al
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            this.resetToken = token;
            this.showResetForm = true;
        }
    },
    methods: {
        async requestReset() {
            if (!this.email) {
                alert('Lütfen email adresinizi girin.');
                return;
            }

            try {
                const response = await api.post('/forgot-password', { email: this.email });
                if (response.data.success) {
                    this.emailSent = true;
                } else {
                    alert('Bir hata oluştu. Lütfen tekrar deneyin.');
                }
            } catch (error) {
                console.error('Şifre sıfırlama hatası:', error);
                alert(error.response?.data?.message || 'Bir hata oluştu.');
            }
        },
        async resetPassword() {
            if (!this.newPassword || !this.confirmPassword) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }

            if (this.newPassword !== this.confirmPassword) {
                alert('Şifreler eşleşmiyor.');
                return;
            }

            if (this.newPassword.length < 6) {
                alert('Şifreniz en az 6 karakter olmalıdır.');
                return;
            }

            try {
                await api.post('/reset-password', {
                    token: this.resetToken,
                    newPassword: this.newPassword
                });
                alert('Şifreniz başarıyla güncellendi.');
                this.$router.push('/login');
            } catch (error) {
                console.error('Şifre güncelleme hatası:', error);
                alert(error.response?.data?.message || 'Bir hata oluştu.');
            }
        },
        goToLogin() {
            this.$router.push('/login');
        }
    }
};
</script>

<style scoped>
.auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 10px;
    text-align: center;
}

.logo {
    width: 200px;
    height: auto;
    margin-bottom: 20px;
}

h1 {
    font-size: 24px;
    margin-bottom: 10px;
}

p {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.input-field {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
}

.submit-button {
    background: #42b983;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;
}

.submit-button:hover {
    background: #369f6e;
}

.switch-link {
    margin-top: 20px;
    font-size: 14px;
}

.switch-link a {
    color: #42b983;
    text-decoration: none;
}

.switch-link a:hover {
    text-decoration: underline;
}

.success-message {
    background: #d4edda;
    color: #155724;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
}

.success-message p {
    margin: 5px 0;
    color: #155724;
}
</style> 