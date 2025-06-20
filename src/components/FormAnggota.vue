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
            <button v-if="currentAnggotaIndex > 0" type="button" @click="previousAnggota">Kembali</button>
            <button v-if="currentAnggotaIndex < jumlahAnggota - 1" type="button" @click="nextAnggota">Selanjutnya</button>
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
    if (response.status === 200 && response.data.status === 'success') {
      Swal.fire('Sukses', 'Data anggota berhasil disimpan!', 'success');
      router.push({ 
        name: 'FormPortofolioKelompok', 
        params: { kelompok_id: kelompokId },
        query: { source }
      });

    } else {
      console.error('Failed to save anggota:', response.data.message);
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

    button[type="button"] {
      background-color: #f44336;
    }

    button[type="button"]:hover {
      background-color: #d32f2f;
    }
  }
}
</style>