<template>
    <main>
      <div class="auth-container">
        <div class="auth-form">
          <h3>{{ mode === 'add' ? 'Tambah Registrasi Individu' : 'Edit Registrasi Individu' }}</h3>
          <form @submit.prevent="handleSubmit">
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
              <label for="nama">Nama</label>
              <input type="text" id="nama" v-model="formData.nama" placeholder="Nama" required>
            </div>

            <div class="form-group">
              <label for="tgl_lahir">Tanggal Lahir</label>
              <input type="date" id="tgl_lahir" v-model="formData.tgl_lahir" placeholder="Tanggal Lahir" required>
            </div>

            <div class="form-group">
              <label for="tgl_mulai">Tanggal Mulai Berkarya</label>
              <input type="date" id="tgl_mulai" v-model="formData.tgl_mulai" placeholder="Tanggal Mulai" required>
            </div>

            <div class="form-group">
              <label for="alamat">Alamat</label>
              <input type="text" id="alamat" v-model="formData.alamat" placeholder="Alamat" required>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="formData.email" placeholder="Email" required>
            </div>

            <div class="form-group">
              <label for="noTelp">No. Telepon</label>
              <input type="text" id="noTelp" v-model="formData.noTelp" placeholder="No. Telepon" required>
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
    nama_seniman: '',
    nama: '',
    tgl_lahir: '',
    tgl_mulai: '',
    alamat: '',
    email: '',
    noTelp: '',
    status_individu: 'Pengajuan Pendaftaran',
    seniman_id: ''
  });

  const kategoriOptions = ref([]);
  const senimans = ref([]);
  const route = useRoute();
  const router = useRouter();
  const mode = ref('add');

  const getSeniman = async () => {
    try {
      const response = await axios.get('/seniman');
      if (Array.isArray(response.data.data)) {
        senimans.value = response.data.data;
      } else {
        console.error('Unexpected response data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching senimans:', error.message);
    }
  };

  const getKategori = async () => {
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

  
  const getIndividu = async (id) => {
    try {
      const response = await axios.get(`/registerIndividu/showByAdmin/${id}`);
      if (response.status === 200 && response.data.status === 'success') {
        Object.assign(formData, response.data.data);
        formData.id = response.data.data.id;
        mode.value = 'edit';
      }
    } catch (error) {
      console.error('Error fetching individu:', error.message);
    }
  };

  onMounted(async () => {
    await getSeniman();
    await getKategori();

    const { id } = route.params;
    if (id) {
      await getIndividu(id);
    }
  });

  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    const action = mode.value === 'add' ? 'Tambahkan' : 'Edit';

    const result = await Swal.fire({
      title: `Apakah Data Registrasi individu yang anda ${action} sudah benar?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const selectedSeniman = senimans.value.find(s => s.nama_seniman === formData.nama_seniman);

      if (!selectedSeniman || !selectedSeniman.id) {
        await Swal.fire('Error', 'Seniman tidak ditemukan.', 'error');
        return;
      }

      localStorage.setItem('seniman_id', selectedSeniman.id);

      const formattedData = {
        ...formData,
        tgl_lahir: formatDate(formData.tgl_lahir),
        tgl_mulai: formatDate(formData.tgl_mulai)
      };

      let response;
      if (mode.value === 'add') {
        response = await axios.post('/registerIndividu/storeByAdmin', formattedData);
      } else if (mode.value === 'edit' && formData.id) {
        response = await axios.put(`/registerIndividu/updateByAdmin/${formData.id}`, formattedData);
      } else {
        console.error('Invalid mode or missing formData.id for edit.');
        return;
      }

      if (response.status === 200 && response.data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Registrasi individu berhasil',
          text: mode.value === 'add' ? 'Silakan isi data portofolio.' : 'Data berhasil diperbarui.',
          confirmButtonText: 'Lanjutkan',
        });


        if (mode.value === 'add') {
          router.push({
            name: 'FormPortofolio',
            params: { seniman_id: response.data.data.seniman_id },
            query: { source: 'formRegisIndividu' }
          });
        } else if (mode.value === 'edit') {
          router.push({ name: 'DataRegistrasi' });
        }

      } else {
        console.error('Failed to submit individu:', response.data.message);
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
    formData.id = '';
    formData.nama_kategori = '';
    formData.nama_seniman = '';
    formData.nama = '';
    formData.tgl_lahir = '';
    formData.tgl_mulai = '';
    formData.alamat = '';
    formData.email = '';
    formData.noTelp = '';
    formData.status_individu = 'Pengajuan Pendaftaran';
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

      margin-top: 30px;

      h3 {
          margin-bottom: 1rem;
      }

      form{
        width: 100%;
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
          width: 100%;
      }

      input[type="text"],
      input[type="date"],
      input[type="email"],
      input[type="number"],
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
          background-color: #da190b;
      }
  }
  </style>
