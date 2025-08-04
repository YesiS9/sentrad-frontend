<template>
    <main>
      <div class="auth-container">
        <div class="auth-form">
          <h3>{{ mode === 'add' ? 'Tambah Forum' : 'Edit Forum' }}</h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="kategori" data-icon="🎭">Kategori</label>
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
              <label for="judul_forum" data-icon="📝">Judul Forum</label>
              <input
                type="text"
                id="judul_forum"
                v-model="formData.judul_forum"
                placeholder="Judul Forum"
                required
              />
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
    seniman_id: '',
    nama_kategori: '',
    judul_forum: '',
    status_forum: 1,
  });


  const kategoriOptions = ref([]);
  const route = useRoute();
  const router = useRouter();
  const mode = ref('add');


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

  const getForum = async (id) => {
    try {
      const response = await axios.get(`/forum/${id}`);
      if (response.status === 200 && response.data.status === 'success') {
        const forumData = response.data.data;
        formData.id = forumData.id;
        Object.assign(formData, forumData);
        mode.value = 'edit';
      } else {
        console.error('Failed to fetch forum:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching forum:', error.message);
    }
  };

  onMounted(async () => {
    formData.seniman_id = localStorage.getItem('seniman_id');
    await getKategori();
    const { id } = route.params;
    if (id) {
      await getForum(id);
    }
  });


  const handleSubmit = async () => {
    const action = mode.value === 'add' ? 'Tambah' : 'Edit';

    const result = await Swal.fire({
      title: `Apakah Data Forum yang anda ${action} sudah benar?`,
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
        response = await axios.post('/forum', formData);
      } else if (mode.value === 'edit' && formData.id) {
        response = await axios.put(`/forum/${formData.id}`, formData);
      }
      console.log('Server response:', response);
      if (response.status === 200 && response.data.status === 'success') {
        router.push({ name: 'Forum' });
        closeForm();
      } else {
        console.error('Error:', response.data.message);
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
    formData.status_forum = 1;
    mode.value = 'add';
    router.push({ name: 'Forum' });
  };
  </script>

<style lang="scss" scoped>
@import '@vueform/multiselect/themes/default.css';

main {
  background-color: #f7941e;
  font-family: 'Georgia', serif;
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
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  form {
    width: 100%;
  }

  h3 {
    margin-bottom: 1.5rem;
    font-weight: bold;
    font-size: 1.6rem;
    color: #f7941e;
  }

  .form-group {
    margin-bottom: 1.2rem;
    text-align: left;
    width: 100%;

    label {
      font-weight: bold;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      font-size: 1rem;
      color: #f7941e;

      &::before {
        content: attr(data-icon);
        display: inline-block;
        margin-right: 0.5rem;
        font-size: 1.2rem;
      }
    }
  }

  input[type="text"],
  .custom-multiselect {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #fff;
    color: #333;
    font-size: 1rem;
    transition: box-shadow 0.3s, border-color 0.3s;

    &::placeholder {
      color: #888;
      opacity: 1;
    }

    &:focus {
      outline: none;
      border-color: #f7941e;
      box-shadow: 0 0 0 3px rgba(247, 148, 30, 0.2);
    }
  }

  .form-actions {
    margin-top: 1.5rem;
    text-align: right;
    width: 100%;
  }

  button {
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.95rem;
    transition: background-color 0.3s;
    color: white;
  }

  button[type="submit"] {
    background-color: #45a049;

    &:hover {
      background-color: #388e3c;
    }
  }

  button[type="button"] {
    background-color: #f44336;

    &:hover {
      background-color: #d32f2f;
    }
  }
}
</style>
