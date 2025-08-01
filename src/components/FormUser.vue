<template>
    <main>
        <div class="auth-container">
            <div class="auth-form">
                <h3>{{ mode === 'add' ? 'Tambah User' : 'Edit User' }}</h3>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" v-model="formData.username" placeholder="Username" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" v-model="formData.email" placeholder="Email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" v-model="formData.password" placeholder="Password" :required="mode === 'add'">
                        <small v-if="errors.password.length" class="error-text">{{ errors.password.join(', ') }}</small>
                    </div>
                    <div class="form-group">
                        <label for="role">Role</label>
                        <select id="role" v-model="formData.nama_role" required>
                            <option value="">Pilih Role</option>
                            <option v-for="role in roles" :key="role.id" :value="role.nama_role">{{ role.nama_role }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="foto">Foto (Optional)</label>
                        <input type="file" id="foto" @change="handleFileChange" accept="image/*">
                        <small v-if="errors.foto.length" class="error-text">{{ errors.foto.join(', ') }}</small>
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
    username: '',
    email: '',
    password: '',
    nama_role: '',
    foto: '',
});

const roles = ref([]);
const errors = reactive({
    foto: [],
    password: [],
});
const route = useRoute();
const router = useRouter();
const mode = ref('add');
const toast = useToast();

const getRoles = async () => {
    try {
        const response = await axios.get('/roles');
        roles.value = response.data;
    } catch (error) {
        console.error('Error fetching roles:', error.message);
    }
};

const getUser = async (id) => {
    try {
        const response = await axios.get(`/user/${id}`);
        if (response.status === 200 && response.data.status === 'success') {
            const userData = response.data.data;
            Object.assign(formData, userData);
            console.log('Formdata:', formData);
            mode.value = 'edit';
        } else {
            console.error('Failed to fetch user:', response.data.message);
        }
    } catch (error) {
        console.error('Error fetching user:', error.message);
    }
};

onMounted(async () => {
    await getRoles();
    const { id } = route.params;
    if (id) {
        await getUser(id);
    }
});

const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 800;
            const maxHeight = 800;
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
            canvas.toBlob((blob) => {
                formData.foto = blob;
            }, 'image/jpeg', 0.7); 
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};



const handleSubmit = async () => {
    errors.password = [];
    errors.foto = [];

    if (mode.value === 'add' && formData.password.length < 8) {
        errors.password.push('Password minimal 8 karakter.');
        return;
    }

    if (mode.value === 'edit' && formData.password && formData.password.length < 8) {
        errors.password.push('Jika ingin mengubah password, minimal 8 karakter.');
        return;
    }

    const action = mode.value === 'add' ? 'menambahkan' : 'mengedit';

    const result = await Swal.fire({
        title: `Apakah Anda yakin ingin ${action} user ini?`,
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
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('nama_role', formData.nama_role);

        if (formData.foto) {
            formDataToSend.append('foto', formData.foto);
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };

        if (mode.value === 'add') {
            response = await axios.post('/user/store-byAdmin', formDataToSend, config);
        } else if (mode.value === 'edit') {
            formDataToSend.append('_method', 'PUT');
            response = await axios.post(`/user/${formData.id}`, formDataToSend, config);
        }

        if (response.status === 200 && response.data.status === 'success') {
            const userId = response.data.data.id;
            localStorage.setItem('id_user', userId);
            toast.success(`Berhasil ${action} User!`);
            router.push({ name: 'DataUser' });
            closeForm();
        } else {
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
    formData.username = '';
    formData.email = '';
    formData.password = '';
    formData.nama_role = '';
    formData.foto = '';
    mode.value = 'add';
    router.push({ name: 'DataUser' });
};
</script>

<style lang="scss" scoped>
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

.error-text {
    color: red;
    font-size: 0.8rem;
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
    form{
        width: 100%;
    }

    .form-group {
        margin-bottom: 1rem;
        text-align: left;
        width: 100%;

        label {
            display: block;
            margin-bottom: 0.5rem;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"],
        select {
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
