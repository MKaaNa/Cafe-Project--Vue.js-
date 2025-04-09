<template>
  <div class="auth-container">
    <img class="logo" alt="Vue logo" src="../assets/image.png" />
    <h1>Welcome</h1>
    <p>Please sign up to continue</p>

    <form class="auth-form" @submit.prevent="signUp">
      <input type="text" placeholder="Name" class="input-field" v-model="name" />
      <input type="email" placeholder="Email" class="input-field" v-model="email" />
      <input type="password" placeholder="Password" class="input-field" v-model="password" />
      <button class="submit-button" type="submit">Sign Up</button>
    </form>

    <p class="switch-link">
      Zaten hesabınız var mı?
      <a href="#" @click.prevent="goToLogin">Giriş yapın</a>
    </p>
  </div>
</template>

<script>
import { register } from '@/utils/api';

export default {
  name: 'SignUpPage',
  data() {
    return {
      name: '',
      email: '',
      password: ''
    };
  },
  methods: {
    async signUp() {
      if (!this.name || !this.email || !this.password) {
        alert('Lütfen tüm alanları doldurun.');
        return;
      }

      if (this.password.length < 6) {
        alert('Şifreniz en az 6 karakter olmalı.');
        return;
      }

      try {
        const user = {
          name: this.name,
          email: this.email,
          password: this.password
        };

        const response = await register(user);
        
        if (response.status === 201) {
          alert('Kayıt başarılı! Giriş yapabilirsiniz.');
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Kayıt hatası:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('Kayıt işlemi sırasında bir hata oluştu.');
        }
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