<template>
    <div class="auth-container">
        <img class="logo" alt="Vue logo" src="../assets/image.png" />
        <h1>Welcome</h1>
        <p>Please log in to continue</p>

        <form class="auth-form" @submit.prevent="login">
            <input type="email" placeholder="Email" v-model="email" class="input-field" />
            <input type="password" placeholder="Password" v-model="password" class="input-field" />
            <button class="submit-button" type="submit">Login</button>
        </form>

        <p class="switch-link">
            Hesabınız yok mu?
            <a href="#" @click.prevent="goToRegister">Kayıt olun</a>
        </p>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'LoginPage',
    data() {
        return {
            email: '',
            password: ''
        };
    },
    methods: {
        async login() {
            if (!this.email || !this.password) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }

            try {
                const response = await axios.post('http://localhost:3000/login', {
                    email: this.email,
                    password: this.password
                });

                const { user, token } = response.data;

                if (!user || !token) {
                    alert('Email veya şifre hatalı.');
                    return;
                }

                localStorage.setItem('user', JSON.stringify(user)); // Kullanıcı bilgilerini kaydet
                localStorage.setItem('token', token); // Token'ı kaydet

                if (user.role === 'admin') {
                    this.$router.push('/dashboard/admin');
                } else if (user.role === 'user') {
                    this.$router.push('/dashboard/user');
                } else {
                    alert('Geçersiz kullanıcı rolü.');
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    alert('Email veya şifre hatalı.');
                } else {
                    console.error('Giriş hatası:', error);
                    alert('Bir hata oluştu.');
                }
            }
        },
        goToRegister() {
            this.$router.push('/signup');
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
}

.input-field {
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
}

.input-field:focus {
    border-color: #42b983;
    outline: none;
}

.submit-button {
    padding: 10px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-button:hover {
    background-color: #369f6e;
}

.switch-link {
    font-size: 14px;
    margin-top: 1rem;
}

.switch-link a {
    color: #42b983;
    cursor: pointer;
    text-decoration: underline;
}
</style>