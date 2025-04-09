<template>
    <div class="order-form-container">
      <div class="order-form">
        <h2>Sipariş Ver</h2>
  
        <!-- Masa Numarası -->
        <div class="form-group">
          <div class="table-number-input-wrapper">
            <input
              type="number"
              id="tableNumber"
              v-model="tableNumber"
              class="table-number-input"
              placeholder=" "
              min="1"
            />
            <label for="tableNumber" class="floating-label">Masa Numarası</label>
            <span class="table-number-icon">🍽️</span>
          </div>
        </div>
  
        <!-- Menüden Ürün Seçimi -->
        <div class="menu-items">
          <div
            v-for="item in menuItems"
            :key="item.id"
            class="menu-item"
            @click="toggleItem(item)"
          >
            <div class="item-image" :style="{ backgroundImage: `url(${item.image})` }">
              <div class="item-overlay" :class="{ selected: isSelected(item) }">
                <span class="check-icon" v-if="isSelected(item)">✓</span>
              </div>
            </div>
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-footer">
                <span class="item-price">{{ item.price }}₺</span>
                <span class="item-quantity" v-if="isSelected(item)">
                  {{ getItemQuantity(item) }} adet
                </span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Sipariş Özeti -->
        <div class="order-summary" v-if="selectedItems.length > 0">
          <h3>Sipariş Özeti</h3>
          <div class="selected-items">
            <div v-for="item in selectedItems" :key="item.id" class="selected-item">
              <span class="item-name">{{ item.name }}</span>
              <div class="quantity-controls">
                <button @click.stop="decreaseQuantity(item)" class="quantity-btn">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click.stop="increaseQuantity(item)" class="quantity-btn">+</button>
              </div>
              <span class="item-total">{{ (item.price * item.quantity).toFixed(2) }}₺</span>
            </div>
          </div>
          <div class="total-amount">
            Toplam: {{ calculateTotal().toFixed(2) }}₺
          </div>
        </div>
  
        <!-- Kart Bilgileri -->
        <div class="card-form" v-if="selectedItems.length > 0">
          <h3>Kart Bilgileri</h3>
          <input v-model="card.name" type="text" placeholder="Kart Sahibi Adı Soyadı" />
          <input v-model="card.number" type="text" placeholder="Kart Numarası" />
          <div class="card-row">
            <input v-model="card.expiry" type="text" placeholder="Son Kullanma (MM/YY)" />
            <input v-model="card.cvv" type="text" placeholder="CVV" />
          </div>
        </div>
  
        <!-- Siparişi Tamamla -->
        <button
          class="submit-button"
          @click="submitOrder"
          :disabled="!canSubmit"
          :class="{ disabled: !canSubmit }"
        >
          Siparişi Tamamla
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed } from 'vue'
  
  const tableNumber = ref('')
  const menuItems = reactive([
    {
      id: 1,
      name: 'Çay',
      description: 'Demleme Rize çayı',
      price: 7.5,
      image: 'https://via.placeholder.com/300x200?text=Çay'
    },
    {
      id: 2,
      name: 'Kahve',
      description: 'Türk kahvesi',
      price: 12,
      image: 'https://via.placeholder.com/300x200?text=Kahve'
    },
    {
      id: 3,
      name: 'Tost',
      description: 'Kaşarlı Tost',
      price: 25,
      image: 'https://via.placeholder.com/300x200?text=Tost'
    }
  ])
  const selectedItems = reactive([])
  
  const card = reactive({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  })
  
  const isSelected = (item) => selectedItems.find((i) => i.id === item.id)
  
  const getItemQuantity = (item) => {
    const found = selectedItems.find((i) => i.id === item.id)
    return found ? found.quantity : 0
  }
  
  const toggleItem = (item) => {
    const existing = selectedItems.find((i) => i.id === item.id)
    if (existing) {
      existing.quantity++
    } else {
      selectedItems.push({ ...item, quantity: 1 })
    }
  }
  
  const increaseQuantity = (item) => {
    item.quantity++
  }
  
  const decreaseQuantity = (item) => {
    item.quantity--
    if (item.quantity <= 0) {
      const index = selectedItems.findIndex((i) => i.id === item.id)
      selectedItems.splice(index, 1)
    }
  }
  
  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }
  
  const canSubmit = computed(() =>
    tableNumber.value &&
    selectedItems.length > 0 &&
    card.name &&
    card.number &&
    card.expiry &&
    card.cvv
  )
  
  const submitOrder = () => {
    if (canSubmit.value) {
      alert(`Masa ${tableNumber.value} için sipariş alındı. Ödeme tamamlandı! 🎉`)
      tableNumber.value = ''
      selectedItems.splice(0)
      card.name = ''
      card.number = ''
      card.expiry = ''
      card.cvv = ''
    }
  }
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
  
  .order-form-container {
    background: #f5f7fa;
    padding: 2rem;
    min-height: 100vh;
    font-family: 'Poppins', sans-serif;
  }
  
  .order-form {
    max-width: 900px;
    margin: auto;
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 2rem;
  }
  
  .table-number-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #f0f0f0;
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
  }
  
  .table-number-input-wrapper:focus-within {
    border-color: #42b983;
    box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
  }
  
  .table-number-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: #333;
    outline: none;
    z-index: 1;
  }
  
  .floating-label {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
    font-size: 1rem;
    pointer-events: none;
    transition: 0.2s ease all;
  }
  
  .table-number-input:focus + .floating-label,
  .table-number-input:not(:placeholder-shown) + .floating-label {
    top: 0.3rem;
    font-size: 0.75rem;
    color: #42b983;
  }
  
  .table-number-icon {
    margin-left: 0.5rem;
    font-size: 1.5rem;
    color: #42b983;
  }
  
  .menu-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .menu-item {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  
  .menu-item:hover {
    transform: translateY(-5px);
  }
  
  .item-image {
    height: 180px;
    background-size: cover;
    background-position: center;
    position: relative;
  }
  
  .item-overlay {
    position: absolute;
    inset: 0;
    background: rgba(66, 185, 131, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .item-overlay.selected {
    opacity: 1;
  }
  
  .check-icon {
    color: white;
    font-size: 2rem;
    font-weight: bold;
  }
  
  .item-details {
    padding: 1rem;
  }
  
  .item-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }
  
  .item-price {
    color: #42b983;
    font-weight: bold;
  }
  
  .item-quantity {
    background: #42b983;
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 8px;
    font-size: 0.9rem;
  }
  
  .order-summary {
    margin-top: 2rem;
    background: #f9f9f9;
    border-radius: 12px;
    padding: 1.5rem;
  }
  
  .selected-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #ddd;
    align-items: center;
  }
  
  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .quantity-btn {
    background: #42b983;
    color: white;
    border: none;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .total-amount {
    text-align: right;
    margin-top: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c3e50;
  }
  
  .card-form {
    margin-top: 2rem;
  }
  
  .card-form input {
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 10px;
    width: 100%;
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  
  .card-row {
    display: flex;
    gap: 1rem;
  }
  
  .submit-button {
    width: 100%;
    margin-top: 1rem;
    padding: 1rem;
    background: #42b983;
    color: white;
    font-size: 1.1rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s;
  }
  
  .submit-button:hover:not(.disabled) {
    background: #36986d;
    transform: translateY(-2px);
  }
  
  .submit-button.disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  </style>