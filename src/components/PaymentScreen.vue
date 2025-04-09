<template>
    <div class="payment-screen">
        <h2>Ödeme Ekranı</h2>
        <div class="order-details">
            <h3>Masa {{ order.table }}</h3>
            <ul>
                <li v-for="(item, index) in order.items" :key="index">
                    {{ item.name }} x{{ item.quantity }} - {{ item.price * item.quantity }}₺
                </li>
            </ul>
            <p class="total">Toplam: {{ order.total }}₺</p>
        </div>

        <div v-if="!showQRCode" class="payment-form">
            <h3>Kart Bilgileri</h3>
            <div class="card-preview">
                <div class="card-front">
                    <div class="card-logo">VISA</div>
                    <div class="card-number">{{ cardNumber || '•••• •••• •••• ••••' }}</div>
                    <div class="card-details">
                        <div class="card-holder">
                            <span>Kart Sahibi</span>
                            <div>AD SOYAD</div>
                        </div>
                        <div class="card-expiry">
                            <span>Son Kullanma</span>
                            <div>{{ expiryDate || 'MM/YY' }}</div>
                        </div>
                    </div>
                </div>
                <div class="card-back">
                    <div class="card-strip"></div>
                    <div class="card-cvv">
                        <span>CVV</span>
                        <div>{{ cvv || '•••' }}</div>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label>Kart Numarası</label>
                <input 
                    type="text" 
                    v-model="cardNumber" 
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    @input="formatCardNumber"
                    class="card-input"
                />
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Son Kullanma Tarihi</label>
                    <input 
                        type="text" 
                        v-model="expiryDate" 
                        placeholder="MM/YY"
                        maxlength="5"
                        @input="formatExpiryDate"
                        class="card-input"
                    />
                </div>
                <div class="form-group">
                    <label>CVV</label>
                    <input 
                        type="password" 
                        v-model="cvv" 
                        placeholder="123"
                        maxlength="3"
                        class="card-input"
                    />
                </div>
            </div>
            <button class="pay-btn" @click="processPayment" :disabled="isProcessing">
                {{ isProcessing ? 'İşleniyor...' : 'Öde' }}
            </button>
        </div>

        <div v-if="showQRCode" class="qr-container">
            <h3>Fatura QR Kodu</h3>
            <div class="qr-code">
                <canvas ref="qrCanvas"></canvas>
            </div>
            <p>Müşteri bu QR kodu okutarak faturasını görüntüleyebilir</p>
            <div class="action-buttons">
                <button class="complete-btn" @click="completeOrder">Siparişi Tamamla</button>
                <button class="close-btn" @click="closePayment">Kapat</button>
            </div>
        </div>
    </div>
</template>

<script>
import QRCode from 'qrcode';
import { updateOrderStatus } from '@/utils/api';

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
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            showQRCode: false,
            isProcessing: false
        };
    },
    methods: {
        formatCardNumber() {
            this.cardNumber = this.cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        },
        formatExpiryDate() {
            this.expiryDate = this.expiryDate.replace(/\D/g, '')
                .replace(/^(\d{2})/, '$1/')
                .substr(0, 5);
        },
        async processPayment() {
            if (!this.cardNumber || !this.expiryDate || !this.cvv) {
                alert('Lütfen tüm alanları doldurun');
                return;
            }

            if (this.cardNumber.replace(/\s/g, '').length !== 16) {
                alert('Geçerli bir kart numarası girin');
                return;
            }

            if (this.expiryDate.length !== 5) {
                alert('Geçerli bir son kullanma tarihi girin');
                return;
            }

            if (this.cvv.length !== 3) {
                alert('Geçerli bir CVV girin');
                return;
            }

            this.isProcessing = true;

            try {
                // Ödeme işlemi simülasyonu
                await new Promise(resolve => setTimeout(resolve, 1500));

                // QR kodu oluştur
                const qrData = {
                    type: 'invoice',
                    orderId: this.order.id,
                    table: this.order.table,
                    total: this.order.total,
                    timestamp: new Date().toISOString(),
                    items: this.order.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };

                await QRCode.toCanvas(this.$refs.qrCanvas, JSON.stringify(qrData), {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#42b983',
                        light: '#1e1e1e'
                    }
                });

                this.showQRCode = true;
                this.$emit('payment-completed');
            } catch (error) {
                console.error('QR kod oluşturulurken hata:', error);
                alert('QR kod oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                this.isProcessing = false;
            }
        },
        async completeOrder() {
            try {
                await updateOrderStatus(this.order.id, 'ödendi');
                this.$emit('order-completed');
                this.closePayment();
            } catch (error) {
                console.error('Sipariş tamamlanırken hata:', error);
                alert('Sipariş tamamlanırken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        },
        closePayment() {
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
.payment-screen {
    background: #f5f5f5;
    padding: 2rem;
    border-radius: 12px;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-family: 'Roboto', sans-serif; /* Modern font */
}

.order-details {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.order-details ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
}

.total {
    font-size: 1.4rem;
    font-weight: bold;
    margin-top: 1rem;
    color: #27ae60;
}

.payment-form {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-preview {
    perspective: 1000px;
    margin-bottom: 2rem;
}

.card-front, .card-back {
    background: linear-gradient(135deg, #3498db, #2980b9);
    border-radius: 12px;
    padding: 1.5rem;
    color: white;
    margin-bottom: 1rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

.card-number {
    font-size: 1.2rem;
    letter-spacing: 2px;
    margin-bottom: 1.5rem;
}

.card-details {
    display: flex;
    justify-content: space-between;
}

.card-holder, .card-expiry {
    font-size: 0.8rem;
}

.card-holder span, .card-expiry span {
    display: block;
    opacity: 0.7;
    margin-bottom: 0.3rem;
}

.card-back {
    background: linear-gradient(135deg, #2c3e50, #34495e);
}

.card-strip {
    height: 40px;
    background: #1a1a1a;
    margin: 1rem 0;
}

.card-cvv {
    text-align: right;
    font-size: 0.8rem;
}

.card-cvv span {
    display: block;
    opacity: 0.7;
    margin-bottom: 0.3rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #bdc3c7;
}

.card-input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    color: #333;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.card-input:focus {
    border-color: #27ae60;
    box-shadow: 0 0 5px rgba(39, 174, 96, 0.5);
    outline: none;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.form-row .form-group {
    flex: 1;
    max-width: 48%; /* Reduce width for smaller input fields */
}

.pay-btn {
    width: 100%;
    padding: 1rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: background 0.3s, transform 0.3s;
}

.pay-btn:hover:not(:disabled) {
    background: #219150;
    transform: translateY(-2px);
}

.pay-btn:disabled {
    background: #34495e;
    cursor: not-allowed;
}

.qr-container {
    text-align: center;
    padding: 1.5rem;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.qr-code {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
}

.qr-code canvas {
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
}

.complete-btn, .close-btn {
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s, transform 0.3s;
}

.complete-btn {
    background: #27ae60;
    color: white;
    border: none;
}

.complete-btn:hover {
    background: #219150;
    transform: translateY(-2px);
}

.close-btn {
    background: #e74c3c;
    color: white;
    border: none;
}

.close-btn:hover {
    background: #c0392b;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .payment-screen {
        padding: 1rem;
        max-width: 100%;
    }

    .order-details, .payment-form, .qr-container {
        padding: 1rem;
    }

    .form-row {
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-row .form-group {
        max-width: 100%; /* Full width on smaller screens */
    }

    .pay-btn, .complete-btn, .close-btn {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .card-input {
        font-size: 0.9rem;
    }

    .card-logo {
        font-size: 1.2rem;
    }

    .card-number {
        font-size: 1rem;
    }
}
</style> 