<template>
    <form @submit.prevent="addMenuItem" class="add-form">
        <input v-model="newItem.name" placeholder="Ürün adı" />
        <input v-model.number="newItem.price" type="number" placeholder="Fiyat (₺)" />
        <input v-model="newItem.image" placeholder="Resim URL (opsiyonel)" />

        <div class="file-section">
            <label>veya bilgisayardan seç:</label>
            <input type="file" @change="handleImageUpload" />
        </div>

        <div v-if="imagePreview" class="preview">
            <p>📸 Önizleme:</p>
            <img :src="imagePreview" alt="Seçilen görsel" />
        </div>

        <button type="submit" class="add-btn">➕ Ekle</button>
    </form>
</template>

<script>
import axios from 'axios';

export default {
    name: 'AddProductForm',
    data() {
        return {
            newItem: {
                name: '',
                price: '',
                image: ''
            },
            imagePreview: ''
        };
    },
    methods: {
        async addMenuItem() {
            // Ürün adı kontrolü
            const res = await axios.get('http://localhost:3000/menu');
            const exists = res.data.find(item =>
                item.name.trim().toLowerCase() === this.newItem.name.trim().toLowerCase()
            );

            if (exists) {
                alert('Bu isimde bir ürün zaten var!');
                return;
            }

            const itemToAdd = { ...this.newItem };

            // Görsel URL yoksa ama dosya yüklendiyse base64 koy
            if (!itemToAdd.image && this.imagePreview) {
                itemToAdd.image = this.imagePreview;
            }

            if (!itemToAdd.name || !itemToAdd.price) {
                alert('Ürün adı ve fiyat zorunlu.');
                return;
            }

            await axios.post('http://localhost:3000/menu', itemToAdd);
            alert('Ürün başarıyla eklendi.');

            this.newItem = { name: '', price: '', image: '' };
            this.imagePreview = '';
        },
        handleImageUpload(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
};
</script>

<style scoped>
.add-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 2rem;
}

.add-form input {
    padding: 10px;
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

.file-section {
    font-size: 13px;
    color: #555;
}

.preview {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
}

.preview img {
    max-width: 200px;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.add-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 15px;
}
</style>