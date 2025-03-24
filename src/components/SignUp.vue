<template>
  <div class="signup-container">
    <h2>Kayıt Ol</h2>
    <form @submit.prevent="signUp">
      <input type="text" placeholder="Adınız" v-model="name" />
      <input type="email" placeholder="Email" v-model="email" />
      <input type="password" placeholder="Şifre" v-model="password" />
      <button type="submit">Sign Up</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "SignUp",
  data() {
    return {
      name: "",
      email: "",
      password: ""
    };
  },
  methods: {
    async signUp() {
      console.log("Kayıt ol butonuna basıldı.");
      if (this.name && this.email && this.password) {
        const user = {
          name: this.name,
          email: this.email,
          password: this.password
        };
        try {
          await axios.post("http://localhost:3000/users", user);
          alert("Kayıt başarılı!");
          this.name = "";
          this.email = "";
          this.password = "";
        } catch (error) {
          console.error("Kayıt hatası:", error);
          alert("Kayıt başarısız.");
        }
      } else {
        alert("Lütfen tüm alanları doldurun.");
      }
    }
  }
};
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

input {
  display: block;
  width: 100%;
  margin: 1rem 0;
  padding: 0.5rem;
}

button {
  width: 100%;
  padding: 0.7rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>