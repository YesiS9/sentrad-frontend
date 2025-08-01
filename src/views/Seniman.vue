<template>
  <main>
    <div class="auth-container">
      <div class="auth-form">
        <img :src="logoURL" alt="Sentrad Logo" class="logo" />
        <h2>Profil Seniman</h2>

        <label for="nama_seniman">Nama Seniman</label>
        <input id="nama_seniman" v-model="nama_seniman" type="text" placeholder="Nama Seniman" required />

        <label for="tgl_lahir">Tanggal Lahir</label>
        <input id="tgl_lahir" v-model="tgl_lahir" type="date" required />

        <label for="deskripsi_seniman">Deskripsi Seniman</label>
        <textarea id="deskripsi_seniman" v-model="deskripsi_seniman" placeholder="Deskripsi Seniman" required></textarea>

        <label for="alamat_seniman">Alamat Seniman</label>
        <input id="alamat_seniman" v-model="alamat_seniman" type="text" placeholder="Alamat Seniman" required />

        <label for="noTelp_seniman">No. Telepon</label>
        <input id="noTelp_seniman" v-model="noTelp_seniman" type="text" placeholder="No. Telepon" required />

        <label for="lama_pengalaman">Lama Pengalaman (tahun)</label>
        <input id="lama_pengalaman" v-model="lama_pengalaman" type="number" placeholder="Lama Pengalaman (tahun)" required />

        <button @click="createSeniman" :disabled="isSubmitting">
          {{ isSubmitting ? 'Menyimpan...' : 'Input' }}
        </button>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import logo from '../assets/Sentradlogo.png';

export default {
  name: 'CreateSeniman',
  data() {
    return {
      nama_seniman: '',
      tgl_lahir: '',
      deskripsi_seniman: '',
      alamat_seniman: '',
      noTelp_seniman: '',
      lama_pengalaman: '',
      status_seniman: 1,
      logoURL: logo,
      isSubmitting: false
    };
  },
  methods: {
    formatDate(date) {
      try {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('Error formatting date:', error);
        return date;
      }
    },

    validateForm() {
      const requiredFields = [
        { field: 'nama_seniman', label: 'Nama Seniman' },
        { field: 'tgl_lahir', label: 'Tanggal Lahir' },
        { field: 'deskripsi_seniman', label: 'Deskripsi Seniman' },
        { field: 'alamat_seniman', label: 'Alamat Seniman' },
        { field: 'noTelp_seniman', label: 'No. Telepon' },
        { field: 'lama_pengalaman', label: 'Lama Pengalaman' }
      ];

      const emptyFields = requiredFields.filter(item => !this[item.field] || this[item.field].toString().trim() === '');
      
      if (emptyFields.length > 0) {
        const fieldNames = emptyFields.map(item => item.label).join(', ');
        return `Field berikut harus diisi: ${fieldNames}`;
      }

      if (this.noTelp_seniman && !this.noTelp_seniman.startsWith('08')) {
        return 'Nomor telepon harus dimulai dengan 08';
      }

      if (this.lama_pengalaman && (this.lama_pengalaman < 0 || this.lama_pengalaman > 100)) {
        return 'Lama pengalaman harus antara 0-100 tahun';
      }

      return null;
    },

    async createSeniman() {
      if (this.isSubmitting) return;

      const toast = useToast();

      try {
        this.isSubmitting = true;

    
        const validationError = this.validateForm();
        if (validationError) {
          toast.error(validationError);
          return;
        }

        const user_id = localStorage.getItem('user_id');
        if (!user_id) {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'User ID tidak ditemukan. Silakan login kembali.',
            confirmButtonText: 'OK'
          });
          this.$router.push('/login');
          return;
        }


        const formattedDate = this.formatDate(this.tgl_lahir);

        const payload = {
          user_id: user_id,
          nama_seniman: this.nama_seniman.trim(),
          tgl_lahir: formattedDate,
          deskripsi_seniman: this.deskripsi_seniman.trim(),
          alamat_seniman: this.alamat_seniman.trim(),
          noTelp_seniman: this.noTelp_seniman.trim(),
          lama_pengalaman: parseInt(this.lama_pengalaman),
          status_seniman: this.status_seniman,
        };

        console.log('Sending payload:', payload);
        const response = await axios.post(
          'https://sentrad-backend-production.up.railway.app/api/seniman', 
          payload,
          {
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Response:', response);
        if (response.status === 200 || response.status === 201) {
          const senimanId = response.data.data?.id || response.data.data?.seniman_id;
          
          if (senimanId) {
            localStorage.setItem('seniman_id', senimanId);
          }

          await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: response.data.message || 'Data seniman berhasil disimpan.',
            confirmButtonText: 'OK'
          });

          this.resetForm();
          
          this.$router.push('/login');
          
        } else {
          throw new Error(response.data.message || 'Unexpected response format');
        }

      } catch (error) {
        console.log('Full error object:', error);
        console.log('Error response:', error.response);
        
        if (error.code === 'ECONNABORTED') {
          Swal.fire({
            icon: 'error',
            title: 'Timeout',
            text: 'Koneksi timeout. Silakan coba lagi.',
            confirmButtonText: 'OK'
          });
          return;
        }
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

      } finally {
        this.isSubmitting = false;
      }
    },

   
    resetForm() {
      this.nama_seniman = '';
      this.tgl_lahir = '';
      this.deskripsi_seniman = '';
      this.alamat_seniman = '';
      this.noTelp_seniman = '';
      this.lama_pengalaman = '';
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
    align-items: flex-start;
    height: 100vh;
    background-color: #f7941e;
  }
  .auth-form {
    background-color: #fff;
    width: 100vw;
    max-width: 650px;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  label {
    display: block;
    text-align: left;
    width: 100%;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }


  .logo {
    width: 100px;
    margin-bottom: 1rem;
  }

  select, input, textarea {
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
  </style>
