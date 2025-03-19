<template>
  <div id="app">
    <div class="auth-container">
      <img class="logo" alt="Vue logo" src="./assets/image.png">
      <h1>Welcome</h1>
      <p>Please sign up to continue</p>
      <form class="auth-form">
        <input type="text" placeholder="Name" class="input-field">
        <input type="email" placeholder="Email" class="input-field">
        <input type="password" placeholder="Password" class="input-field">
        <button class="submit-button">Sign Up</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {

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
</style>
