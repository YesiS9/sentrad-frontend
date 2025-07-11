<template>
    <main>
        <div class="auth-container">
            <div class="auth-form">
                <h3>{{ mode === 'add' ? 'Tambah Tingkatan' : 'Edit Tingkatan' }}</h3>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="nama_tingkatan">Nama Tingkatan</label>
                        <input type="text" id="nama_tingkatan" v-model="formData.nama_tingkatan" placeholder="Nama Tingkatan" required>
                    </div>
                    <div class="form-group">
                        <label for="deskripsi_tingkatan">Deskripsi Tingkatan</label>
                        <textarea id="deskripsi_tingkatan" v-model="formData.deskripsi_tingkatan" placeholder="Deskripsi Tingkatan" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="nilai_max">Nilai Max</label>
                        <input type="number" id="nilai_max" v-model.number="formData.nilai_max" placeholder="Nilai Max" required>
                    </div>
                    <div class="form-group">
                        <label for="nilai_min">Nilai Min</label>
                        <input type="number" id="nilai_min" v-model.number="formData.nilai_min" placeholder="Nilai Min" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit">{{ mode === 'add' ? 'Tambah' : 'Simpan' }}</button>
                        <button type="button" @click="closeForm">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    </main>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import axios from '../services/api.js';
    import Swal from 'sweetalert2';
    import { useToast } from 'vue-toastification';

    const formData = reactive({
        nama_tingkatan: '',
        deskripsi_tingkatan: '',
        nilai_max: null,
        nilai_min: null,
    });

    const route = useRoute();
    const router = useRouter();
    const mode = ref('add');
    const toast = useToast();

    const getTingkatan = async (id) => {
        try {
            console.log('Fetching tingkatan with id:', id); // Log the id being used
            const response = await axios.get(`/tingkatan/${id}`);
            if (response.status === 200 && response.data.status === 'success') {
                const tingkatanData = response.data.data;
                Object.assign(formData, tingkatanData);
                console.log('Fetched tingkatan data:', tingkatanData); // Log the fetched data
                mode.value = 'edit';
            } else {
                console.error('Failed to fetch tingkatan:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching tingkatan:', error.message);
        }
    };

    onMounted(() => {
        const { id } = route.params;
        if (id) {
            getTingkatan(id);
        }
    });

    const handleSubmit = async () => {
        const action = mode.value === 'add' ? 'menambahkan' : 'mengedit';

        const result = await Swal.fire({
            title: `Apakah Anda yakin ingin ${action} tingkatan ini?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Tidak',
        });

        if (!result.isConfirmed) {
            return;
        }
        try {
            let response;
            if (mode.value === 'add') {
                response = await axios.post('/tingkatan', formData);
            } else if (mode.value === 'edit') {
                response = await axios.put(`/tingkatan/${formData.id}`, formData);
            } else {
                console.error('Invalid mode:', mode.value);
                return;
            }

            if (response.status === 200 && response.data.status === 'success') {
                if (response.status === 200 && response.data.status === 'success') {
                    toast.success(`Berhasil ${action} Tingkatan!`);
                    router.push({ name: 'DataTingkatan' });
                    closeForm();
                } else {
                    toast.error(response.data.message || `Gagal ${action} Tingkatan!`);
                }
                
            } else {
                console.error(mode.value === 'add' ? 'Failed to add tingkatan:' : 'Failed to edit tingkatan:', response.data.message);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const messages = error.response.data.message || {};
                let message = 'Terjadi kesalahan:<br><ul>';
                for (const field in messages) {
                if (Array.isArray(messages[field])) {
                    messages[field].forEach((msg) => {
                    message += `<li>${msg}</li>`;
                    });
                } else {
                    message += `<li>${messages[field]}</li>`;
                }
                }
                message += '</ul>';
                Swal.fire({
                icon: 'error',
                html: message,
                });
            } else if (error.response && error.response.status === 500) {
                Swal.fire('Error', 'Terjadi kesalahan pada server.', 'error');
            } else {
                Swal.fire('Error', 'Terjadi kesalahan yang tidak diketahui.', 'error');
            }
        }
    };

    const closeForm = () => {
        formData.nama_tingkatan = '';
        formData.deskripsi_tingkatan = '';
        formData.nilai_max = null;
        formData.nilai_min = null;
        mode.value = 'add';
        router.push({ name: 'DataTingkatan' });
    };
</script>

<style lang="scss" scoped>
  main{
        background-color: #f7941e;
        padding: 0;
    }
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f7941e;
  }

  .auth-form {
    background-color: #fff;
    width: 90vw;
    max-width: 600px;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h3 {
      margin-bottom: 1rem;
    }

    form{
        width: 100%;
    }

    .form-group {
      width: 100%;
      margin-bottom: 1rem;
      text-align: left;

      label {
        display: block;
        margin-bottom: 0.5rem;
      }

      input[type="text"],input[type="number"],textarea{
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
    }

    .form-actions {
      margin-top: 1rem;
      text-align: right;
      width: 100%;

      button {
        margin-left: 0.5rem;
        background-color: #f7941e;
        color: #fff;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }

      button[type="submit"] {
        background-color: #45a049;
      }

      button[type="submit"]:hover {
        background-color: #45a049;
      }

      button[type="button"] {
        background-color: #f44336;
      }

      button[type="button"]:hover {
        background-color: #d32f2f;
      }
    }
  }
  </style>
