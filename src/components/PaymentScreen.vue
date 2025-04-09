<template>
    <div class="payment-screen">
        <h2>Ödeme Ekranı</h2>
        <div class="order-summary">
            <h3>Sipariş Özeti</h3>
            <p>Masa: {{ order.table }}</p>
            <ul>
                <li v-for="(item, index) in order.items" :key="index">
                    {{ getProductInfo(item).name }} x{{ item.quantity }} - {{ item.price * item.quantity }}₺
                </li>
            </ul>
            <p class="total">Toplam: {{ order.total }}₺</p>
        </div>

        <div class="payment-methods">
            <h3>Ödeme Yöntemi Seçin</h3>
            <div class="payment-options">
                <button 
                    class="payment-btn" 
                    :class="{ active: selectedMethod === 'qr' }"
                    @click="selectPaymentMethod('qr')"
                >
                    <i class="fas fa-qrcode"></i> QR Kod ile Öde
                </button>
                <button 
                    class="payment-btn" 
                    :class="{ active: selectedMethod === 'cash' }"
                    @click="selectPaymentMethod('cash')"
                >
                    <i class="fas fa-money-bill-wave"></i> Nakit Öde
                </button>
                <button 
                    class="payment-btn" 
                    :class="{ active: selectedMethod === 'card' }"
                    @click="selectPaymentMethod('card')"
                >
                    <i class="fas fa-credit-card"></i> Kart ile Öde
                </button>
            </div>

            <!-- QR Kod Görüntüleme -->
            <div v-if="selectedMethod === 'qr' && qrCode" class="qr-container">
                <img :src="qrCode" alt="QR Code" class="qr-code" />
                <p>QR kodu okutarak ödeme yapabilirsiniz</p>
            </div>

            <!-- Nakit Ödeme -->
            <div v-if="selectedMethod === 'cash'" class="cash-payment">
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
                <p v-if="givenAmount > 0" class="change">
                    Para Üstü: {{ (givenAmount - order.total).toFixed(2) }}₺
                </p>
            </div>

            <!-- Kart Ödeme -->
            <div v-if="selectedMethod === 'card'" class="card-payment">
                <div class="input-group">
                    <label>Kart Numarası:</label>
                    <input 
                        type="text" 
                        v-model="cardNumber" 
                        placeholder="1234 5678 9012 3456"
                        maxlength="19"
                    />
                </div>
                <div class="card-details">
                    <div class="input-group">
                        <label>Son Kullanma:</label>
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
            </div>
        </div>

        <div class="payment-actions">
            <button class="cancel-btn" @click="$emit('cancel')">İptal</button>
            <button 
                class="complete-btn" 
                @click="completePayment"
                :disabled="!canCompletePayment"
            >
                Ödemeyi Tamamla
            </button>
        </div>
    </div>
</template>

<script>
import { generateQRCode } from '@/utils/qrGenerator';
import { createPayment } from '@/utils/api';

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
            qrCode: null,
            givenAmount: 0,
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            menu: []
        };
    },
    computed: {
        canCompletePayment() {
            if (this.selectedMethod === 'cash') {
                return this.givenAmount >= this.order.total;
            } else if (this.selectedMethod === 'card') {
                return this.cardNumber.length === 19 && 
                       this.expiryDate.length === 5 && 
                       this.cvv.length === 3;
            }
            return this.selectedMethod === 'qr';
        }
    },
    methods: {
        async selectPaymentMethod(method) {
            this.selectedMethod = method;
            if (method === 'qr') {
                // QR kod için ödeme bilgilerini oluştur
                const paymentData = {
                    orderId: this.order.id,
                    amount: this.order.total,
                    timestamp: new Date().toISOString()
                };
                this.qrCode = await generateQRCode(JSON.stringify(paymentData));
            }
        },
        async completePayment() {
            try {
                const paymentData = {
                    orderId: this.order.id,
                    amount: this.order.total,
                    method: this.selectedMethod,
                    status: 'completed',
                    timestamp: new Date().toISOString()
                };

                if (this.selectedMethod === 'cash') {
                    paymentData.givenAmount = this.givenAmount;
                    paymentData.change = this.givenAmount - this.order.total;
                } else if (this.selectedMethod === 'card') {
                    paymentData.cardLastFour = this.cardNumber.slice(-4);
                }

                await createPayment(paymentData);
                this.$emit('payment-completed');
            } catch (error) {
                console.error('Ödeme tamamlanırken hata:', error);
                alert('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
            }
        },
        getProductInfo(item) {
            if (typeof item === 'string') {
                const product = this.menu.find(product => product.id === item);
                return product || { name: 'Bilinmiyor', price: 0 };
            }
            return item;
        }
    },
    watch: {
        cardNumber(newVal) {
            // Kart numarasını formatla: 1234 5678 9012 3456
            this.cardNumber = newVal.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        },
        expiryDate(newVal) {
            // Son kullanma tarihini formatla: MM/YY
            this.expiryDate = newVal.replace(/\D/g, '')
                .replace(/^(\d{2})/, '$1/')
                .substr(0, 5);
        },
        cvv(newVal) {
            // CVV'yi sadece rakam olacak şekilde sınırla
            this.cvv = newVal.replace(/\D/g, '').substr(0, 3);
        }
    }
};
</script>

<style scoped>
.payment-screen {
    background: #1e1e1e;
    padding: 2rem;
    border-radius: 12px;
    color: white;
    max-width: 600px;
    margin: 0 auto;
}

.order-summary {
    background: #2c3e50;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.order-summary ul {
    list-style: none;
    padding-left: 0;
    margin: 0.5rem 0;
}

.total {
    font-weight: bold;
    font-size: 1.2rem;
    margin-top: 0.5rem;
}

.payment-methods {
    margin-bottom: 1.5rem;
}

.payment-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem 0;
}

.payment-btn {
    background: #34495e;
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.payment-btn:hover {
    background: #2c3e50;
}

.payment-btn.active {
    background: #42b983;
}

.payment-btn i {
    font-size: 1.5rem;
}

.qr-container {
    text-align: center;
    margin: 1rem 0;
}

.qr-code {
    max-width: 200px;
    margin: 1rem auto;
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
    border-radius: 4px;
    border: 1px solid #ddd;
    background: #2c3e50;
    color: white;
}

.card-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
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

.complete-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

.complete-btn:disabled {
    background: #34495e;
    cursor: not-allowed;
}

.change {
    color: #42b983;
    font-weight: bold;
}
</style> 