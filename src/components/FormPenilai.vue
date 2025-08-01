<template>
    <main>
      <div class="auth-container">
        <div class="auth-form">
          <h3>{{ mode === 'add' ? 'Tambah Penilai' : 'Edit Penilai' }}</h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group" v-if="mode === 'add'">
                <label for="username">Username</label>
                <Multiselect
                  v-model="formData.username"
                  :options="users"
                  :searchable="true"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  placeholder="Pilih atau cari username"
                  label="username"
                  track-by="username"
                  class="custom-multiselect"
                  required
                />
              </div>
              <div v-else class="form-group">
                <label for="username">Username</label>
                <input
                  type="text"
                  id="username"
                  v-model="formData.username"
                  readonly
                  placeholder="Username"
                />
              </div>
              <div class="form-group">
                <label for="nama_kategori">Kategori Seni</label>
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
                <label for="nama_penilai">Nama Penilai</label>
                <input
                  type="text"
                  id="nama_penilai"
                  v-model="formData.nama_penilai"
                  placeholder="Nama Penilai"
                  required
                />
              </div>

              <div class="form-group">
                <label for="kuota">Kuota</label>
                <input
                  type="number"
                  id="kuota"
                  v-model="formData.kuota"
                  placeholder="Kuota"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="lembaga">Lembaga</label>
                <input
                  type="text"
                  id="lembaga"
                  v-model="formData.lembaga"
                  placeholder="Lembaga"
                  required
                />
              </div>

              <div class="form-group">
                <label for="nama_seni">Bidang Ahli</label>
                <Multiselect
                  v-model="formData.nama_seni"
                  :options="seniOptions"
                  :searchable="true"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  placeholder="Pilih atau cari Seni"
                  label="nama_seni"
                  track-by="nama_seni"
                  class="custom-multiselect"
                ></Multiselect>
              </div>

              <!-- <div class="form-group">
                <label for="nama_seni">Bidang Ahli</label>
                <input
                  type="text"
                  id="nama_seni"
                  v-model="formData.nama_seni"
                  placeholder="Bidang Ahli"
                  required
                />
              </div> -->

              <div class="form-group">
                <label for="alamat_penilai">Alamat Penilai</label>
                <input
                  type="text"
                  id="alamat_penilai"
                  v-model="formData.alamat_penilai"
                  placeholder="Alamat Penilai"
                  required
                />
              </div>

              <div class="form-group">
                <label for="tgl_lahir">Tanggal Lahir</label>
                <input
                  type="date"
                  id="tgl_lahir"
                  v-model="formData.tgl_lahir"
                  placeholder="Tanggal Lahir"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="noTelp_penilai">No. Telp</label>
                <input
                  type="text"
                  id="noTelp_penilai"
                  v-model="formData.noTelp_penilai"
                  placeholder="No. Telp"
                  required
                />
              </div>

              <div class="form-group">
                <label for="status_penilai">Status Penilai</label>
                <select id="status_penilai" v-model="formData.status_penilai" required>
                    <option disabled value="">Pilih Status Penilai</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                </select>
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
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '../services/api.js';
import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';
import Swal from 'sweetalert2';
import { useToast } from 'vue-toastification';

const formData = reactive({
  username: '',
  nama_kategori: '',
  nama_penilai: '',
  alamat_penilai: '',
  noTelp_penilai: '',
  nama_seni: '',
  lembaga: '',
  tgl_lahir: '',
  status_penilai: '',
  kuota: ''
});

const kategoriOptions = ref([]);
const seniOptions = ref([]);
const users = ref([]);
const route = useRoute();
const router = useRouter();
const mode = ref('add');
const toast = useToast();

const getUser = async () => {
  try {
    const response = await axios.get('/userbypenilai');
    if (response.data.status === 'success' && Array.isArray(response.data.data)) {
      users.value = response.data.data;
    } else {
      console.error('Unexpected response data format:', response.data);
    }
  } catch (error) {
    console.error('Error fetching user list:', error.message);
  }
};

const getKategoriOptions = async () => {
  try {
    const response = await axios.get('/nama-kategori');
    if (Array.isArray(response.data.data)) {
      kategoriOptions.value = response.data.data.map(kategori => kategori.nama_kategori);
    } else {
      console.error('Unexpected response data format:', response.data);
    }
  } catch (error) {
    console.error('Error fetching kategori:', error.message);
  }
};



const getSeniOptions = async (nama_kategori) => {
  try {
    const response = await axios.get(`/seni-by-kategori/${nama_kategori}`);
    if (Array.isArray(response.data.data)) {
      seniOptions.value = response.data.data.map((seni) => seni.nama_seni);
    } else {
      console.error('Unexpected response data format:', response.data);
    }
  } catch (error) {
    console.error('Error fetching seni:', error.message);
  }
};

watch(
  () => formData.nama_kategori,
  async (newValue) => {
    seniOptions.value = [];

    if (newValue) {
      await getSeniOptions(newValue);
    }
  }
);



const getPenilai = async (id) => {
  try {
    const response = await axios.get(`/penilai/${id}`);
    const penilaiData = response.data.data;
    Object.assign(formData, penilaiData);

    const userResponse = await axios.get(`/user/${penilaiData.user_id}`);
    formData.username = userResponse.data.data.username;

    mode.value = 'edit';
  } catch (error) {
    console.error('Error fetching penilai:', error.message);
  }
};

onMounted(async () => {
  await getUser();
  await getKategoriOptions();
  

  const { id } = route.params;
  if (id) {
    getPenilai(id);
  }
});

const formatDate = (date) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const handleSubmit = async () => {
  let action = mode.value === 'add' ? 'menambahkan' : 'mengedit';

  if (mode.value === 'edit') {
    const result = await Swal.fire({
      title: `Apakah Anda yakin ingin ${action} penilai ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    });

    if (!result.isConfirmed) return;
  }

  try {
    console.log('Submitting data:', formData);
    const formattedData = { ...formData, tgl_lahir: formatDate(formData.tgl_lahir) };

    let response;
    if (mode.value === 'add') {
      response = await axios.post('/penilai', formattedData);
    } else if (mode.value === 'edit' && formData.id) {
      response = await axios.put(`/penilai/${formData.id}`, formattedData);
    }

    if (response.status === 200 && response.data.status === 'success') {
      toast.success(`Berhasil ${action} penilai!`);
      router.push({ name: 'DataPenilai' });
      closeForm();
    } else{
      toast.error(response.data.message || `Gagal ${action} User!`);
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
    username: '',
    nama_kategori: '',
    nama_penilai: '',
    alamat_penilai: '',
    noTelp_penilai: '',
    nama_seni: '',
    lembaga: '',
    tgl_lahir: '',
    status_penilai: '',
    kuota: ''
  });
  mode.value = 'add';
  router.push({ name: 'DataPenilai' });
};
</script>

<style lang="scss" scoped>
  @import '@vueform/multiselect/themes/default.css';
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
        max-width: 650px;
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

        .form-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        width: 100%;
        }

        .form-group {
        margin-bottom: 1rem;
        text-align: left;
        width: calc(50% - 0.5rem);
        }

        input[type="text"],
        input[type="date"], input[type="number"],
        select {
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
</style>
