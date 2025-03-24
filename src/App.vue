<template>
  <div id="app">
    <div class="auth-container">
      <img class="logo" alt="Vue logo" src="./assets/image.png" />
      <h1>Welcome</h1>
      <p>Please sign up to continue</p>
      <SignUp />
    </div>
  </div>
</template>

<script>
import SignUp from './components/SignUp.vue';

export default {
  name: 'App',
  components: {
    SignUp
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
</style>