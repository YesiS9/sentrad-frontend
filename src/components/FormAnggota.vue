<template>
  <main>
    <div class="auth-container">
      <div class="auth-form">
        <h3>Input Anggota Kelompok</h3>
        <p>Jumlah anggota yang perlu diinput: {{ jumlahAnggota }}</p>
        <p class="warning-text">
          Pendaftar tidak akan secara otomatis terdaftar sebagai anggota kelompok. Semua anggota, termasuk pendaftar, harus dimasukkan secara manual pada form ini.
        </p>
        <form @submit.prevent="handleSubmit">
          <div class="anggota-group">
            <h4>Anggota {{ currentAnggotaIndex + 1 }}</h4>
            <div class="grid-form">
              <div class="form-group">
                <label for="nama_anggota">Nama Anggota</label>
                <input
                  type="text"
                  :id="'nama_anggota_' + currentAnggotaIndex"
                  v-model="anggotaData[currentAnggotaIndex].nama_anggota"
                  placeholder="Nama Anggota"
                  required
                />
              </div>

              <div class="form-group">
                <label for="tgl_lahir">Tanggal Lahir</label>
                <input
                  type="date"
                  :id="'tgl_lahir_' + currentAnggotaIndex"
                  v-model="anggotaData[currentAnggotaIndex].tgl_lahir"
                  required
                />
              </div>

              <div class="form-group">
                <label for="tgl_gabung">Tanggal Gabung</label>
                <input
                  type="date"
                  :id="'tgl_gabung_' + currentAnggotaIndex"
                  v-model="anggotaData[currentAnggotaIndex].tgl_gabung"
                  required
                />
              </div>

              <div class="form-group">
                <label for="alamat_anggota">Alamat</label>
                <input
                  type="text"
                  :id="'alamat_anggota_' + currentAnggotaIndex"
                  v-model="anggotaData[currentAnggotaIndex].alamat_anggota"
                  placeholder="Alamat"
                  required
                />
              </div>

              <div class="form-group">
                <label for="noTelp_anggota">No. Telp</label>
                <input
                  type="text"
                  :id="'noTelp_anggota_' + currentAnggotaIndex"
                  v-model="anggotaData[currentAnggotaIndex].noTelp_anggota"
                  placeholder="No. Telp"
                  required
                />
              </div>

              <div class="form-group">
                <label for="tingkat_skill">Tingkat Skill</label>
                <select
                  :id="'tingkat_skill_' + currentAnggotaIndex"
                  v-model="anggotaData[currentAnggotaIndex].tingkat_skill"
                  required
                >
                  <option disabled value="">Pilih Tingkat Skill</option>
                  <option value="Pemula">Pemula</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Profesional">Profesional</option>
                </select>
              </div>

              <div class="form-group">
                <label for="peran_anggota">Peran Anggota</label>
                <input
                  type="text"
                  :id="'peran_anggota_' + currentAnggotaIndex"
                  v-model="anggotaData[currentAnggotaIndex].peran_anggota"
                  placeholder="Peran Anggota"
                  required
                />
              </div>

              <div class="form-group">
                <label for="status_anggota">Status Anggota</label>
                <select
                  :id="'status_anggota_' + currentAnggotaIndex"
                  v-model="anggotaData[currentAnggotaIndex].status_anggota"
                  required
                >
                  <option disabled value="">Pilih Status Anggota</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button v-if="currentAnggotaIndex > 0" type="button" class="btn-back" @click="previousAnggota">Kembali</button>
            <button v-if="currentAnggotaIndex < jumlahAnggota - 1" type="button" class="btn-next" @click="nextAnggota">Selanjutnya</button>
            <button v-else type="submit">Tambah</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from '../services/api.js';
  import Swal from 'sweetalert2';

  const router = useRouter();
  const route = useRoute();
  const source = route.query.source;
  const jumlahAnggota = ref(parseInt(localStorage.getItem('jumlah_anggota')) || 1);

  const currentAnggotaIndex = ref(0);

  console.log(route.params.id);

  const anggotaData = reactive(
    Array.from({ length: jumlahAnggota.value }, () => ({
      nama_anggota: '',
      tgl_lahir: '',
      tgl_gabung: '',
      alamat_anggota: '',
      noTelp_anggota: '',
      tingkat_skill: '',
      peran_anggota: '',
      status_anggota: '',
    }))
  );

const formatDate = (date) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const nextAnggota = () => {
  const currentData = anggotaData[currentAnggotaIndex.value];
  const isValid = Object.values(currentData).every(val => val !== '');
  
  if (!isValid) {
    Swal.fire('Peringatan', 'Mohon lengkapi semua data anggota sebelum melanjutkan.', 'warning');
    return;
  }

  if (currentAnggotaIndex.value < jumlahAnggota.value - 1) {
    currentAnggotaIndex.value++;
  }
};

const previousAnggota = () => {
  if (currentAnggotaIndex.value > 0) {
    currentAnggotaIndex.value--;
  }
};

const handleSubmit = async () => {
  const result = await Swal.fire({
    title: `Apakah Anda yakin ingin menyimpan data anggota?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya',
    cancelButtonText: 'Tidak',
  });

  if (!result.isConfirmed) {
    return;
  }

  const formattedAnggotaData = anggotaData.map((anggota) => ({
    ...anggota,
    tgl_lahir: formatDate(anggota.tgl_lahir),
    tgl_gabung: formatDate(anggota.tgl_gabung),
  }));

  console.log('Data to be submitted:', {
    kelompok_id: localStorage.getItem('kelompok_id'),
    anggota: formattedAnggotaData,
  });

  try {
    const response = await axios.post('/anggota', {
      kelompok_id: localStorage.getItem('kelompok_id'),
      anggota: formattedAnggotaData,
    });

    const kelompokId = localStorage.getItem('kelompok_id');
    const senimanId = localStorage.getItem('seniman_id'); 
    if (response.status === 200 && response.data.status === 'success') {
      Swal.fire('Sukses', 'Data anggota berhasil disimpan!', 'success');
      router.push({ 
        name: 'FormPortofolioKelompok', 
        params: { kelompok_id: kelompokId },
        query: { 
          source, 
          seniman_id: senimanId 
        }
      });

    } else {
      console.error('Failed to save anggota:', response.data.message);
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
</script>

<style lang="scss" scoped>
main {
  background-color: #f7941e;
  min-height: 100vh;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #f7941e;
}

.auth-form {
  background-color: #fff;
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  text-align: left;

  h3 {
    text-align: center;
    margin-bottom: 1rem;
  }

  .warning-text {
    font-size: 0.9rem;
    color: #b30000;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .anggota-group {
    margin-bottom: 1rem;

    h4 {
      margin-bottom: 1rem;
      text-align: center;
    }

    .grid-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      font-weight: 500;
    }

    input,
    select {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 100%;
    }
  }

  .form-actions {
    margin-top: 1.5rem;
    text-align: right;

    button {
      background-color: #f7941e;
      color: #fff;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin-left: 0.5rem;
      transition: background-color 0.3s ease;
    }

    button[type="submit"] {
      background-color: #45a049;
    }

    button[type="submit"]:hover {
      background-color: #3c883b;
    }

    .btn-back {
      background-color: #f44336;
      color: #fff;
    }

    .btn-back:hover {
      background-color: #d32f2f;
    }

    .btn-next {
      background-color: #2196f3; 
      color: #fff;
    }

    .btn-next:hover {
      background-color: #1976d2;
    }

  }
}
</style>