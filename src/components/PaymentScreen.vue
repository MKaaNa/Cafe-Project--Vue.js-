<template>
    <div class="payment-screen">
        <h2>💳 Ödeme Ekranı</h2>
        
        <div class="order-summary">
            <h3>Sipariş Özeti</h3>
            <p>Masa No: {{ order.table }}</p>
            <ul>
                <li v-for="(item, index) in order.items" :key="index">
                    {{ item.name }} x{{ item.quantity }} - {{ item.price * item.quantity }}₺
                </li>
            </ul>
            <p class="total">Toplam: {{ order.total }}₺</p>
        </div>

        <div class="payment-methods">
            <h3>Ödeme Yöntemi Seçin</h3>
            <div class="method-options">
                <button 
                    class="payment-method" 
                    :class="{ active: selectedMethod === 'cash' }"
                    @click="selectPaymentMethod('cash')"
                >
                    💵 Nakit Ödeme
                </button>
                <button 
                    class="payment-method" 
                    :class="{ active: selectedMethod === 'card' }"
                    @click="selectPaymentMethod('card')"
                >
                    💳 Kredi Kartı
                </button>
                <button 
                    class="payment-method" 
                    :class="{ active: selectedMethod === 'qr' }"
                    @click="selectPaymentMethod('qr')"
                >
                    📱 QR Kod ile Ödeme
                </button>
            </div>
        </div>

        <!-- Nakit Ödeme Formu -->
        <div v-if="selectedMethod === 'cash'" class="payment-form">
            <div class="input-group">
                <label>Verilen Tutar:</label>
                <input 
                    type="number" 
                    v-model="givenAmount" 
                    placeholder="Verilen tutarı girin"
                    min="0"
                    step="0.01"
                />
            </div>
            <p class="change" v-if="givenAmount > 0">
                Para Üstü: {{ (givenAmount - order.total).toFixed(2) }}₺
            </p>
        </div>

        <!-- Kredi Kartı Formu -->
        <div v-if="selectedMethod === 'card'" class="payment-form">
            <div class="input-group">
                <label>Kart Numarası:</label>
                <input 
                    type="text" 
                    v-model="cardNumber" 
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                />
            </div>
            <div class="input-group">
                <label>Son Kullanma Tarihi:</label>
                <input 
                    type="text" 
                    v-model="expiryDate" 
                    placeholder="MM/YY"
                    maxlength="5"
                />
            </div>
            <div class="input-group">
                <label>CVV:</label>
                <input 
                    type="text" 
                    v-model="cvv" 
                    placeholder="123"
                    maxlength="3"
                />
            </div>
        </div>

        <!-- QR Kod Ödeme -->
        <div v-if="selectedMethod === 'qr'" class="qr-payment">
            <div class="qr-code">
                <img v-if="qrCode" :src="qrCode" alt="QR Code" />
                <div v-else class="qr-placeholder">
                    <span>QR Kod Yükleniyor...</span>
                </div>
            </div>
            <p>QR kodu okutarak ödeme yapabilirsiniz</p>
        </div>

        <div class="payment-actions">
            <button class="cancel-btn" @click="$emit('cancel')">İptal</button>
            <button 
                class="confirm-btn" 
                @click="processPayment"
                :disabled="!isPaymentValid"
            >
                Ödemeyi Tamamla
            </button>
        </div>
    </div>
</template>

<script>
import { generateQRCode } from '@/utils/qrGenerator';
import { createPayment, updateOrderStatus } from '@/utils/api';

export default {
    name: 'PaymentScreen',
    props: {
        order: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            selectedMethod: null,
            givenAmount: 0,
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            qrCode: null
        };
    },
    async created() {
        // Sipariş için QR kod oluştur
        this.qrCode = await generateQRCode(this.order);
    },
    computed: {
        isPaymentValid() {
            if (this.selectedMethod === 'cash') {
                return this.givenAmount >= this.order.total;
            } else if (this.selectedMethod === 'card') {
                return this.cardNumber.length === 19 && 
                       this.expiryDate.length === 5 && 
                       this.cvv.length === 3;
            } else if (this.selectedMethod === 'qr') {
                return true;
            }
            return false;
        }
    },
    methods: {
        selectPaymentMethod(method) {
            this.selectedMethod = method;
        },
        async processPayment() {
            try {
                const paymentData = {
                    orderId: this.order.id,
                    amount: this.order.total,
                    method: this.selectedMethod,
                    status: 'completed',
                    timestamp: new Date().toISOString()
                };

                // API'ye ödeme bilgilerini gönder
                await createPayment(paymentData);
                
                // Sipariş durumunu güncelle
                await updateOrderStatus(this.order.id, 'teslim edildi');

                this.$emit('payment-completed', paymentData);
            } catch (error) {
                console.error('Ödeme işlemi sırasında hata oluştu:', error);
                alert('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.');
            }
        }
    }
};
</script>

<style scoped>
.payment-screen {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    background: #1e1e1e;
    border-radius: 12px;
    color: #ffffff;
}

.order-summary {
    background: #2c3e50;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.order-summary ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
}

.total {
    font-size: 1.2rem;
    font-weight: bold;
    color: #42b983;
}

.payment-methods {
    margin-bottom: 2rem;
}

.method-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.payment-method {
    background: #2c3e50;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.payment-method:hover {
    background: #34495e;
}

.payment-method.active {
    background: #42b983;
}

.payment-form {
    background: #2c3e50;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.input-group {
    margin-bottom: 1rem;
}

.input-group label {
    display: block;
    margin-bottom: 0.5rem;
}

.input-group input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #1e1e1e;
    color: white;
}

.change {
    color: #42b983;
    font-weight: bold;
}

.qr-payment {
    text-align: center;
    background: #2c3e50;
    padding: 2rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.qr-code {
    max-width: 200px;
    margin: 0 auto 1rem;
}

.qr-code img {
    width: 200px;
    height: 200px;
    object-fit: contain;
    border-radius: 8px;
    background: white;
    padding: 10px;
}

.qr-placeholder {
    width: 200px;
    height: 200px;
    background: #34495e;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    margin: 0 auto;
}

.qr-placeholder span {
    color: #42b983;
    font-size: 24px;
    font-weight: bold;
}

.payment-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.cancel-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

.confirm-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

.confirm-btn:disabled {
    background: #34495e;
    cursor: not-allowed;
}
</style> 