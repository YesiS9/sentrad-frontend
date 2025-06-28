<template>
    <div class="page">
        <Sidebar />
        <main class="info-karya">
        <div class="card karya-detail" v-if="karya">
            <div class="card-header">
            <h2>Detail Karya</h2>
            <button @click="goBack" class="back-button">
                <i class="material-icons">arrow_back_ios</i>
            </button>
            </div>
            <div class="karya-info">
              <p><strong>Judul Portofolio:</strong> {{ karya.judul_portofolio }}</p>
              <p><strong>Judul Karya:</strong> {{ karya.judul_karya }}</p>
              <p><strong>Tanggal Pembuatan:</strong> {{ formatDate(karya.tgl_pembuatan) }}</p>
              <p><strong>Deskripsi Karya:</strong> {{ karya.deskripsi_karya }}</p>
              <p><strong>Bentuk Karya:</strong> {{ karya.bentuk_karya }}</p>
              <p><strong>Status Karya:</strong> {{ karya.status_karya == 1 ? 'Aktif' : 'Tidak Aktif' }}</p>
              <div class="media-karya" v-if="mediaUrls.length">
                <div v-for="(media, index) in mediaUrls" :key="index">
                  <img v-if="media.match(/\.(jpg|jpeg|png|gif)$/)" :src="media" alt="Karya Image" />
                  <video v-else-if="media.match(/\.(mp4|webm|ogg)$/)" controls>
                    <source :src="media" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
        </div>
        </main>
    </div>

  </template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from '../services/api.js';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from '../components/SidebarSeniman.vue';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const karya = ref(null);
const mediaUrls = ref([]); // <--- Untuk list media
const mediaType = ref('');  // <--- Untuk jenis media utama (optional kalau mau dipakai)

const getKaryaDetail = async (id) => {
  try {
    const response = await axios.get(`/karya/${id}`);
    if (response.status === 200 && response.data.status === 'success') {
      karya.value = { ...response.data.data };

      // media_karya diasumsikan sudah array URL dari backend
      const mediaArray = Array.isArray(karya.value.media_karya) 
        ? karya.value.media_karya 
        : JSON.parse(karya.value.media_karya || '[]');

      mediaUrls.value = mediaArray;

      if (mediaArray.length > 0) {
        mediaType.value = mediaArray[0].endsWith('.mp4') ? 'video' : 'image';
      }

    } else {
      console.error('Failed to fetch karya detail:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching karya detail:', error.message);
  }
};

const formatDate = (date) => {
  if (!date) return 'Tanggal tidak tersedia';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const goBack = () => {
  router.push('/InfoPortofolioSeniman');
};

onMounted(() => {
  if (id) getKaryaDetail(id);
});
</script>

  <style lang="scss" scoped>
  .page {
  display: flex;
  flex: 1;
  background-color: #f2d395;
  color: #333;
}
  .info-karya {
    padding: 2rem;
    background-color: #f5d99d;
  }

  .card {
    padding: 1.5rem;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }

  .back-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: #333;
  }

  h2, p {
    color: #333;
    margin: 0;
  }

  .karya-info p {
    margin: 0.5rem 0;
    color: #333;
  }

  .media-karya {
    margin-top: 1rem;
  }

  .media-karya img, .media-karya video {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .media-karya video {
    max-height: 400px;
  }

  .media-karya img {
    max-height: 500px;
    object-fit: contain;
  }
  </style>
