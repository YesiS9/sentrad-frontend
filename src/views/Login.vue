<template>
    <main>
        <div class="auth-container">
            <div class="auth-form">
                <img :src="logoURL" alt="Sentrad Logo" class="logo" />
                <h2>Login Form</h2>
                <input v-model="email" type="email" placeholder="Email" autocomplete="email"/>
                <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" />
                <button @click="login">Login</button>
                <div class="links">
                    <a href="#" @click.prevent="goToHome">Home</a>
                    <a href="#" @click.prevent="goToRegister">Register</a>
                </div>
            </div>
        </div>
    </main>
</template>
<script>
import api from '../services/api.js'; 
import logo from '../assets/Sentradlogo.png';
import { useToast } from 'vue-toastification';

const toast = useToast();

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      logoURL: logo
    };
  },
  methods: {
    async login() {
      try {
        const response = await api.post('/login', {
          email: this.email,
          password: this.password
        });

        const { data, status, message } = response.data;

        if (status === 'success') {
          const { user, role, token, seniman_id, penilai_id } = data;
          console.log('Login response:', user, role, token, seniman_id, penilai_id);

          localStorage.setItem('token', token);
          localStorage.setItem('user_id', user.id);
          localStorage.setItem('username', user.username);
          toast.success(message);

          if (seniman_id !== null) {
            localStorage.setItem('seniman_id', seniman_id);
          } else {
            localStorage.removeItem('seniman_id');
          }

          if (penilai_id !== null) {
            localStorage.setItem('penilai_id', penilai_id);
          } else {
            localStorage.removeItem('penilai_id');
          }

          let roleName = '';
          if (role && typeof role === 'object' && role.nama_role) {
            roleName = role.nama_role.toLowerCase();
          } else {
            console.error('Error logging in:', 'Invalid role object');
            toast.error(message);
            return;
          }

          switch (roleName) {
            case 'seniman':
              this.$router.push('/dashboardSeniman');
              break;
            case 'penilai':
              await this.cekAtauBuatKuota(penilai_id);
              this.$router.push('/dashboardPenilai');
              break;
            case 'admin':
              this.$router.push('/dashboardAdmin');
              break;
            default:
              console.error('Error logging in:', 'Invalid role:', roleName);
              toast.error('Peran pengguna tidak valid');
          }

        } else {
          console.error('Error logging in:', message);
          toast.error(message);
        }
      } catch (error) {
        console.error('Error logging in:', error.message);
        const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat login';
        toast.error(errorMessage);
      }
    },
    async cekAtauBuatKuota(penilaiId) {
      try {
        const response = await api.get(`/penilai/kuota/${penilaiId}`);
        console.log('Kuota penilai:', response.data.data);
      } catch (error) {
        console.error('Gagal cek/buat kuota penilai:', error);
        toast.error('Gagal mengatur kuota penilai');
      }
    },
    goToRegister() {
      this.$router.push('/register');
    },
    goToHome() {
      this.$router.push('/');
    }
  }
};
</script>
<style lang="scss" scoped>
main {
    background-color: #f7941e;
}

.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f7941e;
}

@media screen and (max-width:  1000px){
    .auth-form{
        width: 90%;
        max-width: 90%;
        max-height: 90%;
        height: auto;
    }
    .app main{
        padding: 0;
    }
}

.auth-form {
    background-color: #fff;
    width: 400px;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .logo {
        width: 100px;
        margin-bottom: 1rem;
    }

    input {
        display: block;
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    button {
        background-color: #f7941e;
        color: #fff;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #e6830d;
    }

    .links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;

        a {
            color: #f7941e;
            text-decoration: none;
            cursor: pointer;
        }

        a:hover {
            text-decoration: underline;
        }
    }
}
</style>
