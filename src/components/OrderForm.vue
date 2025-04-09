<template>
    <div class="order-form-container">
        <div class="order-form">
            <h2>Sipariş Ver</h2>
            
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

            <div class="menu-items">
                <div v-for="item in menuItems" :key="item.id" class="menu-item" @click="toggleItem(item)">
                    <div class="item-image" :style="{ backgroundImage: `url(${item.image})` }">
                        <div class="item-overlay" :class="{ 'selected': isSelected(item) }">
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

            <button 
                class="submit-button" 
                @click="submitOrder" 
                :disabled="!canSubmit"
                :class="{ 'disabled': !canSubmit }"
            >
                Siparişi Tamamla
            </button>
        </div>
    </div>
</template>

<script>
</script>

<style scoped>
.order-form-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.order-form {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

h2 {
    color: #2c3e50;
    margin-bottom: 2rem;
    text-align: center;
    font-size: 2rem;
}

.form-group {
    margin-bottom: 2rem;
}

.table-number-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #f9f9f9;
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.table-number-input::placeholder {
    color: transparent;
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

.table-number-input-wrapper:hover {
    border-color: #42b983;
    box-shadow: 0 4px 8px rgba(66, 185, 131, 0.1);
}

.menu-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.menu-item {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
}

.menu-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.item-image {
    height: 200px;
    background-size: cover;
    background-position: center;
    position: relative;
}

.item-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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

.item-details h3 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
}

.item-description {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-price {
    font-weight: bold;
    color: #42b983;
}

.item-quantity {
    background: #42b983;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
}

.order-summary {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.order-summary h3 {
    margin-top: 0;
    color: #2c3e50;
}

.selected-items {
    margin: 1rem 0;
}

.selected-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e0e0e0;
}

.selected-item:last-child {
    border-bottom: none;
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
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.3s ease;
}

.quantity-btn:hover {
    background: #3aa876;
}

.quantity {
    min-width: 24px;
    text-align: center;
}

.total-amount {
    text-align: right;
    font-weight: bold;
    font-size: 1.2rem;
    color: #2c3e50;
    margin-top: 1rem;
}

.submit-button {
    width: 100%;
    padding: 1rem;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.submit-button:hover:not(.disabled) {
    background: #3aa876;
    transform: translateY(-2px);
}

.submit-button.disabled {
    background: #ccc;
    cursor: not-allowed;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.menu-item {
    animation: fadeIn 0.5s ease forwards;
}

.menu-item:nth-child(1) { animation-delay: 0.1s; }
.menu-item:nth-child(2) { animation-delay: 0.2s; }
.menu-item:nth-child(3) { animation-delay: 0.3s; }
.menu-item:nth-child(4) { animation-delay: 0.4s; }
.menu-item:nth-child(5) { animation-delay: 0.5s; }
.menu-item:nth-child(6) { animation-delay: 0.6s; }
</style>