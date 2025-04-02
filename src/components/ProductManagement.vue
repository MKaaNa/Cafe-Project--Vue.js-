<template>
    <div class="product-management">
        <h2>📋 Ürün Yönetimi</h2>

        <table class="product-table">
            <thead>
                <tr>
                    <th>Ürün Adı</th>
                    <th>Fiyat (₺)</th>
                    <th>Açıklama</th>
                    <th>İşlemler</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <td>
                        <input
                            type="text"
                            v-model="product.name"
                            @change="updateProduct(product)"
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            v-model.number="product.price"
                            @change="updateProduct(product)"
                        />
                    </td>
                    <td>
                        <textarea
                            v-model="product.description"
                            @change="updateProduct(product)"
                            rows="2"
                        ></textarea>
                    </td>
                    <td>
                        <button @click="deleteProduct(product.id)" class="delete-btn">❌ Sil</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ProductManagement',
    data() {
        return {
            products: []
        };
    },
    async created() {
        await this.fetchProducts();
    },
    methods: {
        async fetchProducts() {
            try {
                const res = await axios.get('http://localhost:3000/menu');
                this.products = res.data;
            } catch (error) {
                console.error('Ürünler alınırken hata oluştu:', error);
            }
        },
        async updateProduct(product) {
            try {
                await axios.put(`http://localhost:3000/menu/${product.id}`, {
                    name: product.name,
                    price: product.price,
                    description: product.description
                });
                alert('Ürün başarıyla güncellendi.');
            } catch (error) {
                console.error('Ürün güncellenirken hata oluştu:', error);
                alert('Ürün güncellenemedi.');
            }
        },
        async deleteProduct(id) {
            console.log('Silinecek ürün ID:', id); // ID'yi kontrol edin
            if (!id) {
                console.error('Silinecek ürün için geçerli bir ID bulunamadı.');
                return;
            }

            if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

            try {
                await axios.delete(`http://localhost:3000/menu/${id}`);
                alert('Ürün başarıyla silindi.');
                await this.fetchProducts();
            } catch (error) {
                console.error('Ürün silinirken hata oluştu:', error);
            }
        }
    }
};
</script>

<style scoped>
.product-management {
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem;
    background: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.product-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.product-table th,
.product-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #eee;
    font-size: 14px;
}

.product-table th {
    background-color: #f3f3f3;
    font-weight: 600;
}

.delete-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
}

.delete-btn:hover {
    background: #c0392b;
}
</style>