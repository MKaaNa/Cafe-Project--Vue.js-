<template>
    <div class="staff-management">
        <h2>👥 Personel Yönetimi</h2>

        <!-- Personel Ekleme Formu -->
        <form @submit.prevent="addStaff" class="add-staff-form">
            <input v-model="newStaff.name" placeholder="Ad Soyad" />
            <input v-model="newStaff.email" type="email" placeholder="Email" />
            <input v-model="newStaff.password" type="password" placeholder="Şifre" />
            <button type="submit" class="add-btn">➕ Personel Ekle</button>
        </form>

        <!-- Personel Listesi -->
        <table class="staff-table" v-if="staff.length > 0">
            <thead>
                <tr>
                    <th>Ad Soyad</th>
                    <th>Email</th>
                    <th>İşlem</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="person in staff" :key="person.id">
                    <td>{{ person.name }}</td>
                    <td>{{ person.email }}</td>
                    <td>
                        <button @click="removeStaff(person.id)" class="delete-btn">❌ Sil</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-else class="empty">Personel bulunamadı.</div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'StaffManagement',
    data() {
        return {
            staff: [],
            newStaff: {
                name: '',
                email: '',
                password: ''
            }
        };
    },
    async created() {
        await this.fetchStaff();
    },
    methods: {
        async fetchStaff() {
            try {
                const res = await axios.get('http://localhost:3000/users');
                this.staff = res.data.filter(user => user.role !== 'admin'); // Adminleri hariç tut
            } catch (error) {
                console.error('Personel verisi alınırken hata oluştu:', error);
            }
        },
        async addStaff() {
            if (!this.newStaff.name || !this.newStaff.email || !this.newStaff.password) {
                alert('Tüm alanları doldurun.');
                return;
            }

            try {
                const exists = this.staff.find(
                    person => person.email.trim().toLowerCase() === this.newStaff.email.trim().toLowerCase()
                );
                if (exists) {
                    alert('Bu email ile kayıtlı bir personel zaten var.');
                    return;
                }

                const newPerson = { ...this.newStaff, role: 'user' };
                await axios.post('http://localhost:3000/users', newPerson);
                alert('Personel başarıyla eklendi.');
                this.newStaff = { name: '', email: '', password: '' };
                await this.fetchStaff();
            } catch (error) {
                console.error('Personel eklenirken hata oluştu:', error);
            }
        },
        async removeStaff(id) {
            if (!confirm('Bu personeli silmek istediğinize emin misiniz?')) return;

            try {
                await axios.delete(`http://localhost:3000/users/${id}`);
                alert('Personel başarıyla silindi.');
                await this.fetchStaff();
            } catch (error) {
                console.error('Personel silinirken hata oluştu:', error);
            }
        }
    }
};
</script>

<style scoped>
.staff-management {
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem;
    background: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.add-staff-form {
    display: flex;
    gap: 10px;
    margin-bottom: 1.5rem;
}

.add-staff-form input {
    padding: 10px;
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #ccc;
    flex: 1;
}

.add-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
}

.add-btn:hover {
    background: #369f6e;
}

.staff-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.staff-table th,
.staff-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #eee;
    font-size: 14px;
}

.staff-table th {
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

.empty {
    text-align: center;
    padding: 2rem;
    color: #777;
}
</style>