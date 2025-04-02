<template>
    <form @submit.prevent="addMenuItem" class="add-form">
        <input v-model="newItem.name" placeholder="Ürün adı" />
        <input v-model.number="newItem.price" type="number" placeholder="Fiyat (₺)" />
        <textarea v-model="newItem.description" placeholder="Açıklama (opsiyonel)" rows="3"></textarea>
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
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'AddProductForm',
    data() {
        return {
            newItem: {
                name: '',
                price: '',
                description: '', // Yeni alan
                image: ''
            },
            imagePreview: ''
        };
    },
    methods: {
        async addMenuItem() {
            const itemToAdd = { ...this.newItem, id: uuidv4() }; // UUID ekle
            if (!itemToAdd.image && this.imagePreview) {
                itemToAdd.image = this.imagePreview;
            }

            if (!itemToAdd.name || !itemToAdd.price) {
                alert('Ürün adı ve fiyat zorunlu.');
                return;
            }

            try {
                await axios.post('http://localhost:3000/menu', itemToAdd);
                alert('Ürün başarıyla eklendi.');
                this.newItem = { name: '', price: '', description: '', image: '' };
                this.imagePreview = '';
            } catch (error) {
                console.error('Ürün eklenirken hata oluştu:', error);
            }
        },
        handleImageUpload(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Görsel boyutlarını küçült
                    const maxWidth = 800; // Maksimum genişlik
                    const maxHeight = 800; // Maksimum yükseklik
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    // Görseli base64 formatında kaydet
                    this.imagePreview = canvas.toDataURL('image/jpeg', 0.8); // Kaliteyi %80'e düşür
                };
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

.add-form input,
.add-form textarea {
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