<template>
    <main>
        <div class="auth-container">
            <div class="auth-form">
                <img :src="logoURL" alt="Sentrad Logo" class="logo" />
                <h2>Login Form</h2>
                <input 
                    v-model="email" 
                    type="email" 
                    placeholder="Email" 
                    autocomplete="email"
                    :disabled="isSubmitting"
                />
                <input 
                    v-model="password" 
                    type="password" 
                    placeholder="Password" 
                    autocomplete="current-password"
                    :disabled="isSubmitting"
                    @keyup.enter="login"
                />
                <button 
                    @click="login" 
                    :disabled="isSubmitting || !isFormValid"
                    :class="{ 'loading': isSubmitting }"
                >
                    {{ isSubmitting ? 'Masuk...' : 'Login' }}
                </button>
                <div class="links">
                    <a href="#" @click.prevent="goToHome" :class="{ disabled: isSubmitting }">Home</a>
                    <a href="#" @click.prevent="goToRegister" :class="{ disabled: isSubmitting }">Register</a>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import api from '../services/api.js'; 
import logo from '../assets/Sentradlogo.png';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';

const toast = useToast();

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      logoURL: logo,
      isSubmitting: false
    };
  },
  computed: {
    isFormValid() {
      return this.email.trim() !== '' && this.password.trim() !== '';
    }
  },
  methods: {
    validateForm() {
      if (!this.email.trim()) {
        toast.error('Email tidak boleh kosong');
        return false;
      }
      
      if (!this.password.trim()) {
        toast.error('Password tidak boleh kosong');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        toast.error('Format email tidak valid');
        return false;
      }

      if (this.password.length < 6) {
        toast.error('Password minimal 6 karakter');
        return false;
      }

      return true;
    },

    async login() {
      if (this.isSubmitting) return;

      if (!this.validateForm()) return;

      try {
        this.isSubmitting = true;

        console.log('Attempting login...');

        const response = await api.post('/login', {
          email: this.email.trim(),
          password: this.password.trim()
        });

        console.log('Login response:', response.data);

        const { data, status, message } = response.data;

        if (status === 'success') {
          const { user, role, token, seniman_id, penilai_id } = data;
          console.log('Login success data:', { user, role, token, seniman_id, penilai_id });

          localStorage.setItem('token', token);
          localStorage.setItem('user_id', user.id);
          localStorage.setItem('username', user.username);
          
          if (seniman_id !== null && seniman_id !== undefined) {
            localStorage.setItem('seniman_id', seniman_id);
          } else {
            localStorage.removeItem('seniman_id');
          }

          if (penilai_id !== null && penilai_id !== undefined) {
            localStorage.setItem('penilai_id', penilai_id);
          } else {
            localStorage.removeItem('penilai_id');
          }

          let roleName = '';
          if (role && typeof role === 'object' && role.nama_role) {
            roleName = role.nama_role.toLowerCase();
          } else {
            throw new Error('Invalid role object received from server');
          }

          await Swal.fire({
            icon: 'success',
            title: 'Login Berhasil!',
            text: message || `Selamat datang, ${user.username}!`,
            timer: 1500,
            showConfirmButton: false
          });

          switch (roleName) {
            case 'seniman':
              this.$router.push('/dashboardSeniman');
              break;
              
            case 'penilai':
              try {
                await this.cekAtauBuatKuota(penilai_id);
                this.$router.push('/dashboardPenilai');
              } catch (kuotaError) {
                console.error('Kuota error:', kuotaError);
                this.$router.push('/dashboardPenilai');
              }
              break;
              
            case 'admin':
              this.$router.push('/dashboardAdmin');
              break;
              
            default:
              throw new Error(`Invalid role: ${roleName}`);
          }

          this.clearForm();

        } else {
          throw new Error(message || 'Login gagal');
        }

      } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Terjadi kesalahan saat login';
        
        if (error.response) {
          const status = error.response.status;
          const serverMessage = error.response.data?.message;
          
          switch (status) {
            case 401:
              errorMessage = 'Email atau password salah';
              break;
            case 422:
              errorMessage = serverMessage || 'Data yang dimasukkan tidak valid';
              break;
            case 429:
              errorMessage = 'Terlalu banyak percobaan login. Coba lagi nanti.';
              break;
            case 500:
              errorMessage = 'Terjadi kesalahan pada server. Coba lagi nanti.';
              break;
            default:
              errorMessage = serverMessage || `Error ${status}: Terjadi kesalahan`;
          }
        } else if (error.request) {
          errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        } else {
          errorMessage = error.message || errorMessage;
        }

        await Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: errorMessage,
          confirmButtonText: 'Coba Lagi'
        });

      } finally {
        this.isSubmitting = false;
      }
    },

    async cekAtauBuatKuota(penilaiId) {
      try {
        console.log('Checking kuota for penilai:', penilaiId);
        const response = await api.get(`/penilai/kuota/${penilaiId}`);
        console.log('Kuota penilai:', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Gagal cek/buat kuota penilai:', error);
        throw error;
      }
    },

    goToRegister() {
      if (this.isSubmitting) return;
      this.$router.push('/register');
    },

    goToHome() {
      if (this.isSubmitting) return;
      this.$router.push('/');
    },

    clearForm() {
      this.email = '';
      this.password = '';
    }
  }
};
</script>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.loading {
  position: relative;
}

button.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s ease infinite;
  top: 0;
  bottom: 0;
  right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.links a.disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f5f5f5;
}
</style>