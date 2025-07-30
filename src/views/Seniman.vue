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

        <button @click="createSeniman">Input</button>
      </div>
    </div>
  </main>
</template>


  <script>
  import axios from 'axios';
  import { useToast } from 'vue-toastification';
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
      };
    },
    methods: {
      formatDate(date) {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
      },
      async createSeniman() {
        const toast = useToast();
        try {
          const user_id = localStorage.getItem('user_id');
          if (!user_id) {
            toast.error('User ID is missing.');
            return;
          }

          if (!this.nama_seniman || !this.tgl_lahir || !this.deskripsi_seniman || !this.alamat_seniman || !this.noTelp_seniman || !this.lama_pengalaman) {
            toast.error('Please fill in all required fields.');
            return;
          }

          const formattedDate = this.formatDate(this.tgl_lahir);

          const response = await axios.post('https://sentrad-backend-production.up.railway.app/api/seniman', {
            user_id: user_id,
            nama_seniman: this.nama_seniman,
            tgl_lahir: formattedDate,
            deskripsi_seniman: this.deskripsi_seniman,
            alamat_seniman: this.alamat_seniman,
            noTelp_seniman: this.noTelp_seniman,
            lama_pengalaman: this.lama_pengalaman,
            status_seniman: this.status_seniman,
          });


          if (response.status === 200 || response.status === 201) {
            toast.success(response.data.message);
            const senimanId = response.data.data.id || response.data.data.seniman_id;
            localStorage.setItem('seniman_id', senimanId);
            this.$router.push('/login');
          } else {
            toast.error('Failed to create Seniman: ' + response.data.message);
          }
        } catch (error) {
          if (error.response) {
            toast.error('Server responded with: ' + error.response.status + ' ' + (error.response.data.message || 'Unknown error'));
          } else if (error.request) {
            toast.error('No response received: ' + error.request);
          } else {
            toast.error('Error: ' + error.message);
          }
        }
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
