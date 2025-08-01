<template>
    <main>
      <div class="auth-container">
        <div class="auth-form">
          <h3>{{ mode === 'add' ? 'Tambah Event' : 'Edit Event' }}</h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="kategori">Kategori</label>
              <Multiselect
                v-model="formData.nama_kategori"
                :options="kategoriOptions"
                :searchable="true"
                :close-on-select="true"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Pilih atau cari kategori Seni"
                label="nama_kategori"
                track-by="nama_kategori"
                class="custom-multiselect"
              ></Multiselect>
            </div>

            <div class="form-group">
              <label for="judul_proyek">Judul event</label>
              <input type="text" id="judul_proyek" v-model="formData.judul_proyek" placeholder="Judul Proyek" required/>
            </div>

            <div class="form-group">
              <label for="deskripsi_proyek">Deskripsi event</label>
              <textarea id="deskripsi_proyek" v-model="formData.deskripsi_proyek" placeholder="Deskripsi Proyek" required></textarea>
            </div>

            <div class="form-group">
              <label for="waktu_mulai">Waktu event Dimulai</label>
              <flat-pickr
                v-model="formData.waktu_mulai"
                :config="flatpickrConfig"
                placeholder="Pilih Waktu Mulai"
              />
            </div>

            <div class="form-group">
              <label for="waktu_selesai">Waktu event Selesai</label>
              <flat-pickr
                v-model="formData.waktu_selesai"
                :config="flatpickrConfig"
                placeholder="Pilih Waktu Selesai"
              />
            </div>

            <div class="form-group">
              <label for="lokasi_proyek">Lokasi event</label>
              <input type="text" id="lokasi_proyek" v-model="formData.lokasi_proyek" placeholder="Lokasi Proyek" required/>
            </div>

            <div class="form-group">
              <label for="tautan_proyek">Tautan event</label>
              <input type="text" id="tautan_proyek" v-model="formData.tautan_proyek" placeholder="Tautan Proyek" required />
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
import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';
import Swal from 'sweetalert2';
import FlatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { useToast } from 'vue-toastification';

const formData = reactive({
  seniman_id: '',
  nama_kategori: '',
  judul_proyek: '',
  deskripsi_proyek: '',
  waktu_mulai: '',
  waktu_selesai: '',
  lokasi_proyek: '',
  tautan_proyek: '',
  status_proyek: 1,
  jumlah_like: 0,
});

const kategoriOptions = ref([]);
const route = useRoute();
const router = useRouter();
const mode = ref('add');
const toast = useToast();

const flatpickrConfig = {
  enableTime: true,
  dateFormat: 'Y-m-d H:i',
};

const getKategori = async () => {
  try {
    const response = await axios.get('/nama-kategori');
    if (response.status === 200 && response.data.status === 'success') {
      kategoriOptions.value = response.data.data.map(kategori => kategori.nama_kategori);
    } else {
      console.error('Failed to fetch kategori seni options:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching kategori seni options:', error.message);
  }
};

const getProyek = async (id) => {
  try {
    const response = await axios.get(`/proyek/${id}`);
    if (response.status === 200 && response.data.status === 'success') {
      const proyekData = response.data.data;
      formData.id = proyekData.id;
      Object.assign(formData, proyekData);
      mode.value = 'edit';
    } else {
      console.error('Failed to fetch Proyek:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching Proyek:', error.message);
  }
};

onMounted(async () => {
  formData.seniman_id = localStorage.getItem('seniman_id');
  await getKategori();
  const { id } = route.params;
  if (id) {
    await getProyek(id);
  }
});

const handleSubmit = async () => {
  const action = mode.value === 'add' ? 'Tambah' : 'Edit';

  const result = await Swal.fire({
    title: `Apakah Data Proyek yang anda ${action} sudah benar?`,
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
      response = await axios.post('/proyek', formData);
    } else if (mode.value === 'edit' && formData.id) {
      response = await axios.put(`/proyek/${formData.id}`, formData);
    }
    if (response.status === 200 && response.data.status === 'success') {
      toast.success(`Berhasil ${mode.value === 'add' ? 'menambahkan' : 'mengedit'} Proyek!`);
      router.push({ name: 'Proyek' });
      closeForm();
    } else {
      toast.error(response.data.message || `Gagal ${action} Proyek!`);
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
  formData.seniman_id = '';
  formData.judul_forum = '';
  formData.nama_kategori = '';
  formData.deskripsi_proyek = '';
  formData.waktu_mulai = '';
  formData.waktu_selesai = '';
  formData.lokasi_proyek = '';
  formData.tautan_proyek = '';
  formData.status_proyek = 1;
  mode.value = 'add';
  router.push({ name: 'Proyek' });
};
</script>


<style lang="scss" scoped>
@import '@vueform/multiselect/themes/default.css';

main {
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
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  h3 {
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
    text-align: left;
    width: 100%;
  }

  .custom-multiselect {
    width: 100%;
  }

  input[type="text"],
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .form-actions {
    margin-top: 1rem;
    text-align: right;
    width: 100%;
  }

  button {
    background-color: #45a049;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 0.5rem;
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
</style>
