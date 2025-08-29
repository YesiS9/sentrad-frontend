<template>
    <main>
      <div class="auth-container">
        <div class="auth-form">
          <h3>{{ mode === 'add' ? 'Tambah Portofolio' : 'Edit Portofolio' }}</h3>
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
              <label for="judul_portofolio">Judul Portofolio</label>
              <input type="text" id="judul_portofolio" v-model="formData.judul_portofolio" placeholder="Judul Portofolio" required>
            </div>
            <div class="form-group">
              <label for="deskripsi_portofolio">Deskripsi Portofolio</label>
              <textarea id="deskripsi_portofolio" v-model="formData.deskripsi_portofolio" placeholder="Deskripsi Portofolio" rows="3" required></textarea>
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
  import Multiselect from '@vueform/multiselect';
  import '@vueform/multiselect/themes/default.css';
  import { useToast } from 'vue-toastification';

  const formData = reactive({
    id: '',
    kelompok_id: '',
    seniman_id: '',
    nama_kategori: '',
    judul_portofolio: '',
    deskripsi_portofolio: '',
    jumlah_karya: 0,
  });

  const kategoriOptions = ref([]);
  const route = useRoute();
  const router = useRouter();
  const mode = ref('add');
  const toast = useToast();


  const getKategoriOptions = async () => {
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

  const getPortofolio = async (id) => {
  try {
    const response = await axios.get(`/portofolio/data/${id}`);
    if (response.status === 200 && response.data.status === 'success') {
      const portofolioData = response.data.data;
      
      formData.id = portofolioData.id;

      formData.nama_kategori = portofolioData.nama_kategori || '';
      formData.judul_portofolio = portofolioData.judul_portofolio || '';
      formData.deskripsi_portofolio = portofolioData.deskripsi_portofolio || '';
      formData.jumlah_karya = portofolioData.jumlah_karya || 0;
      
      formData.kelompok_id = null;
      
      mode.value = 'edit';
    } else {
      console.error('Failed to fetch portofolio:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching portofolio:', error.message);
  }
};


  onMounted(async () => {
    formData.seniman_id = localStorage.getItem('seniman_id');
    formData.kelompok_id = null;

    await getKategoriOptions();

    const { id } = route.params;
    if (id) {
      await getPortofolio(id);
    }
  });


  const handleSubmit = async () => {
    const action = mode.value === 'add' ? 'menambahkan' : 'mengedit';

    const result = await Swal.fire({
      title: `Apakah Anda yakin ingin ${action} portofolio ini?`,
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
        response = await axios.post('/portofolio', formData);
      } else if (mode.value === 'edit' && formData.id) {
        response = await axios.put(`/portofolio/${formData.id}`, formData);
      } else {
        console.error('Invalid mode or missing formData.id for edit.');
        return;
      }

      console.log('Server response:', response);

      if (response.status === 200 && response.data.status === 'success') {
        const source = route.query.source;

        if (source === 'formRegisIndividu') {
          toast.success(`Berhasil ${mode.value === 'add' ? 'menambahkan' : 'mengedit'} Portofolio!`);
          router.push({ name: 'DataRegistrasi' });
        } else {
          toast.success(`Berhasil ${mode.value === 'add' ? 'menambahkan' : 'mengedit'} Portofolio!`);
          router.push({ name: 'Portofolio' });
        }
      } else {
        let errorMessage = response.data.message;
        if (typeof errorMessage === 'object') {
          errorMessage = Object.values(errorMessage).join(', ');
        }
        Swal.fire('Error', errorMessage || 'Failed to save portofolio', 'error');
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
    const source = route.query.source;

    if (source === 'formRegisIndividu') {
      router.push({ name: 'DataRegistrasi' });
    } else {
      router.push({ name: 'Portofolio' });
    }
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
    justify-content: center;
    align-items: center;
    min-width:600px;

    @media (max-width: 1024px) {
      width: 90%;
      min-width:90%;
    }

    form{
    width: 100%;
    }

    h3 {
      margin-bottom: 1rem;
    }

    .form-group {
      width: 100%;
      margin-bottom: 1rem;
      text-align: left;

      label {
        display: block;
        margin-bottom: 0.5rem;
      }

      input[type="text"],
      input[type="date"],
      input[type="number"],
      select,
      textarea {
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
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.95rem;
        transition: background-color 0.3s;
        color: white;
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
  }
  </style>
