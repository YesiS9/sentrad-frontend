<template>
    <main>
      <div class="auth-container">
        <div class="auth-form">
          <h3>{{ mode === 'add' ? 'Tambah Registrasi Kelompok' : 'Edit Registrasi Kelompok' }}</h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label for="nama_seniman">Seniman</label>
                <Multiselect
                  v-model="formData.nama_seniman"
                  :options="senimans.map(s => s.nama_seniman)"
                  :searchable="true"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  placeholder="Pilih atau cari seniman"
                  class="custom-multiselect"
                ></Multiselect>
              </div>

              <div class="form-group">
                <label for="nama_kelompok">Nama Kelompok</label>
                <input type="text" id="nama_kelompok" v-model="formData.nama_kelompok" placeholder="Nama Kelompok" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="nama_kategori">Kategori Seni</label>
                <Multiselect
                  v-model="formData.nama_kategori"
                  :options="kategoris"
                  :searchable="true"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  placeholder="Pilih atau cari kategori seni"
                  label="nama_kategori"
                  track-by="nama_kategori"
                  class="custom-multiselect"
                ></Multiselect>
              </div>

              <div class="form-group">
                <label for="tgl_terbentuk">Tanggal Kelompok Terbentuk</label>
                <input type="date" id="tgl_terbentuk" v-model="formData.tgl_terbentuk" placeholder="Tanggal Terbentuk" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="alamat_kelompok">Alamat Kelompok</label>
                <input type="text" id="alamat_kelompok" v-model="formData.alamat_kelompok" placeholder="Alamat Kelompok" required>
              </div>
              <div class="form-group">
                <label for="email_kelompok">Email Kelompok</label>
                <input type="email" id="email_kelompok" v-model="formData.email_kelompok" placeholder="Email Kelompok" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="noTelp_kelompok">No. Telp Kelompok</label>
                <input type="text" id="noTelp_kelompok" v-model="formData.noTelp_kelompok" placeholder="No. Telp Kelompok" required>
              </div>
              <div class="form-group">
                <label for="jumlah_anggota">Jumlah Anggota</label>
                <input
                  type="number"
                  id="jumlah_anggota"
                  v-model="formData.jumlah_anggota"
                  :disabled="mode === 'edit'"
                  placeholder="Jumlah Anggota"
                  required
                >
              </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                <label for="deskripsi_kelompok">Deskripsi Kelompok</label>
                <textarea id="deskripsi_kelompok" v-model="formData.deskripsi_kelompok" placeholder="Deskripsi Kelompok" rows="3" required></textarea>
              </div>
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

const formData = reactive({
  id: '',
  seniman_id: '',
  nama_kategori: '',
  nama_kelompok: '',
  tgl_terbentuk: '',
  alamat_kelompok: '',
  deskripsi_kelompok: '',
  noTelp_kelompok: '',
  email_kelompok: '',
  jumlah_anggota: '',
  status_kelompok: 'Pengajuan Pendaftaran',
});

const senimans = ref([]);
const kategoris = ref([]);
const route = useRoute();
const router = useRouter();
const mode = ref('add');

const getSeniman = async () => {
  try {
    const response = await axios.get('/seniman');
    if (Array.isArray(response.data.data)) {
      senimans.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching seniman:', error.message);
  }
};

const getKategori = async () => {
  try {
    const response = await axios.get('/nama-kategori');
    if (Array.isArray(response.data.data)) {
      kategoris.value = response.data.data.map(k => k.nama_kategori);
    }
  } catch (error) {
    console.error('Error fetching kategori:', error.message);
  }
};

const getKelompok = async (id) => {
  try {
    const response = await axios.get(`/registerKelompok/showByAdmin/${id}`);
    if (response.status === 200 && response.data.status === 'success') {
      Object.assign(formData, response.data.data);
      formData.id = response.data.data.id;
      mode.value = 'edit';
    }
  } catch (error) {
    console.error('Error fetching kelompok:', error.message);
  }
};

onMounted(async () => {
  await getSeniman();
  await getKategori();

  const { id } = route.params;
  if (id) {
    await getKelompok(id);
  }
});

const formatDate = (date) => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const handleSubmit = async () => {
  const action = mode.value === 'add' ? 'menambahkan' : 'mengedit';

  const result = await Swal.fire({
    title: `Apakah Anda yakin ingin ${action} registrasi kelompok ini?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya',
    cancelButtonText: 'Tidak',
  });

  if (!result.isConfirmed) return;

  try {
    const selectedSeniman = senimans.value.find(s => s.nama_seniman === formData.nama_seniman);

    if (!selectedSeniman || !selectedSeniman.id) {
      await Swal.fire('Error', 'Seniman tidak ditemukan.', 'error');
      return;
    }

    const formattedData = {
      ...formData,
      tgl_terbentuk: formatDate(formData.tgl_terbentuk),
      seniman_id: selectedSeniman.id,
    };

    let response;
    if (mode.value === 'add') {
      response = await axios.post('/registerKelompok/storeByAdmin', formattedData);
    } else if (mode.value === 'edit' && formData.id) {
      response = await axios.put(`/registerKelompok/updateByAdmin/${formData.id}`, formattedData);
    } else {
      console.error('Invalid mode or missing formData.id for edit.');
      return;
    }

    if (response.status === 200 && response.data.status === 'success') {
      const kelompokData = response.data.data;

      await Swal.fire({
        icon: 'success',
        title: 'Registrasi kelompok berhasil',
        text: mode.value === 'add' ? 'Silakan isi data anggota kelompok.' : 'Data berhasil diperbarui.',
        confirmButtonText: 'Lanjutkan',
      });

      if (mode.value === 'add') {
        if (kelompokData?.id) localStorage.setItem('kelompok_id', kelompokData.id);
        if (kelompokData?.seniman_id) localStorage.setItem('seniman_id', kelompokData.seniman_id);
        if (kelompokData?.jumlah_anggota) localStorage.setItem('jumlah_anggota', kelompokData.jumlah_anggota);

        router.push({
          name: 'FormAnggota',
          params: { kelompok_id: kelompokData.id },
          query: { source: 'form' }
        });
      } else if (mode.value === 'edit') {
        router.push({ name: 'DataRegistrasi' });
      }
    }
  } catch (error) {
    console.log('Full error object:', error);
    console.log('Error response:', error.response); 
    
    if (error.response && error.response.status === 422) {
      const errorData = error.response.data;
      console.log('Error data:', errorData);
      
      let message = 'Terjadi kesalahan validasi:<br><ul>';

      if (errorData.message) {
        if (typeof errorData.message === 'object') {
          for (const field in errorData.message) {
            if (Array.isArray(errorData.message[field])) {
              errorData.message[field].forEach((msg) => {
                message += `<li>${msg}</li>`;
              });
            } else {
              message += `<li>${errorData.message[field]}</li>`;
            }
          }
        } 
        else if (typeof errorData.message === 'string') {
          message += `<li>${errorData.message}</li>`;
        }
      } 
      else if (errorData.errors) {
        for (const field in errorData.errors) {
          if (Array.isArray(errorData.errors[field])) {
            errorData.errors[field].forEach((msg) => {
              message += `<li>${msg}</li>`;
            });
          } else {
            message += `<li>${errorData.errors[field]}</li>`;
          }
        }
      }
      else {
        for (const field in errorData) {
          if (field !== 'status' && field !== 'message') {
            if (Array.isArray(errorData[field])) {
              errorData[field].forEach((msg) => {
                message += `<li>${msg}</li>`;
              });
            } else {
              message += `<li>${errorData[field]}</li>`;
            }
          }
        }
      }
      
      message += '</ul>';
      
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Validasi',
        html: message,
        confirmButtonText: 'OK'
      });
    } 
    else if (error.response && error.response.status === 500) {
      const errorMessage = error.response.data?.message || 'Terjadi kesalahan pada server.';
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    } 
    else if (error.response) {
      const errorMessage = error.response.data?.message || `HTTP Error ${error.response.status}`;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    } 
    else {
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Jaringan',
        text: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        confirmButtonText: 'OK'
      });
    }
  }
};


const closeForm = () => {
  Object.assign(formData, {
    id: '',
    seniman_id: '',
    nama_kategori: '',
    nama_kelompok: '',
    tgl_terbentuk: '',
    alamat_kelompok: '',
    deskripsi_kelompok: '',
    noTelp_kelompok: '',
    email_kelompok: '',
    jumlah_anggota: '',
    status_kelompok: 'Pengajuan Pendaftaran'
  });
  mode.value = 'add';
  router.push({ name: 'DataRegistrasi' });
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
  align-items: flex-start;
  height: 100vh;
  background-color: #f7941e;
}

.auth-form {
  background-color: #fff;
  width: 90vw;
  max-width: 650px;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  margin-top: 20px;

  h3 {
    margin-bottom: 1rem;
  }

  .form-row {
    display: flex;
    justify-content: space-between;
    width: 100%;

    .form-group {
      margin-bottom: 1rem;
      text-align: left;
      width: 48%;
    }
  }

  .custom-multiselect {
    width: 100%;
  }

  input[type='text'],
  input[type='date'],
  input[type='email'],
  input[type='number'],
  select, textarea {
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
    background-color: #f7941e;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 0.5rem;
  }

  button[type='submit'] {
    background-color: #45a049;
  }

  button[type='submit']:hover {
    background-color: #45a049;
  }

  button[type='button'] {
    background-color: #f44336;
  }

  button[type='button']:hover {
    background-color: #d32f2f;
  }
}
</style>
