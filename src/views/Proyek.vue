<template>
    <div class="proyek-page">
        <Sidebar />
        <main class="proyek-data">
            <div class="content">
                <div class="search-bar">
                    <input type="text" v-model="searchQuery" placeholder="🔍 Cari proyek seni..." />
                </div>

                <div class="page-header">
                    <h1 class="main-title">
                        <span class="title-text">Event Seni</span>
                        <span class="title-icon">🎨</span>
                    </h1>
                    <p class="subtitle">Halaman ini memuat informasi dan pengumuman terkait acara-acara yang diselenggarakan oleh para seniman.</p>
                </div>

                <div class="section" style="margin-top:64px;">
                    <h2 class="section-title">
                        <span class="section-icon">🎭</span>
                        Event Saya
                    </h2>
                    <div class="proyek-list">
                        <div class="proyek-card add-proyek artistic-card" @click="goToAddProyek">
                            <div class="proyek-icon create-icon">
                                <span class="add-icon">+</span>
                            </div>
                            <div class="proyek-info">
                                <h3>Buat Event Baru</h3>
                                <p>Mulai event seni Anda</p>
                            </div>
                            <div class="decorative-element">✨</div>
                        </div>
                        <div class="proyek-card artistic-card my-proyek-card" v-for="proyek in filteredMyProyeks" :key="proyek.id">
                            <div class="proyek-icon my-proyek-icon">🎨</div>
                            <div class="proyek-info" @click="goToProyekDetail(proyek.id)">
                                <h3>{{ proyek.judul_proyek }}</h3>
                                <p class="event-time">⏰ {{ formatDate(proyek.waktu_mulai) }}</p>
                                <p class="event-end">🏁 {{ formatDate(proyek.waktu_selesai) }}</p>
                                <p class="likes-info">❤️ {{ proyek.jumlah_like }} likes</p>
                            </div>
                            <div class="proyek-actions">
                                <button class="edit-btn artistic-btn" @click.stop="editProyek(proyek.id)">
                                    <span>✏️</span> Edit
                                </button>
                                <button class="delete-btn artistic-btn" @click.stop="deleteProyek(proyek.id)">
                                    <span>🗑️</span> Hapus
                                </button>
                            </div>
                            <div class="social-actions">
                                <button class="like-btn artistic-btn" @click.stop="likeProyek(proyek.id)">
                                    <span class="heart-icon">❤️</span> Like ({{ proyek.jumlah_like }})
                                </button>
                                <button class="share-btn artistic-btn" @click.stop="shareProyek(proyek.id)">
                                    <span class="share-icon">🔗</span> Share
                                </button>
                            </div>
                            <div class="decorative-element">🌟</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">
                        <span class="section-icon">🌟</span>
                        Event Lainnya
                    </h2>
                    <div class="proyek-list">
                        <div class="proyek-card artistic-card other-proyek-card" v-for="proyek in filteredProyeks" :key="proyek.id">
                            <div class="proyek-icon other-proyek-icon">🎪</div>
                            <div class="proyek-info" @click="goToProyekDetail(proyek.id)">
                                <h3>{{ proyek.judul_proyek }}</h3>
                                <p class="event-time">⏰ {{ formatDate(proyek.waktu_mulai) }}</p>
                                <p class="event-end">🏁 {{ formatDate(proyek.waktu_selesai) }}</p>
                                <p class="likes-info">❤️ {{ proyek.jumlah_like }} likes</p>
                            </div>
                            <div class="social-actions">
                                <button class="like-btn artistic-btn" @click.stop="toggleLikeMyProyek(proyek)">
                                    <span class="heart-icon" :class="{ liked: proyek.liked }">❤️</span> Like ({{ proyek.jumlah_like }})
                                </button>
                                <button class="share-btn artistic-btn" @click.stop="shareProyek(proyek.id)">
                                    <span class="share-icon">🔗</span> Share
                                </button>
                            </div>
                            <div class="decorative-element">🎭</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../services/api.js";
import Sidebar from "../components/SidebarSeniman.vue";
import Swal from "sweetalert2";

export default {
  name: "ProyekPage",
  components: {
    Sidebar,
  },
  setup() {
    const searchQuery = ref("");
    const myProyeks = ref([]);
    const proyek = ref([]);
    const router = useRouter();

    const formatDate = (dateString) => {
      const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta', hour12: false };
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', options).replace(',', '').replace( ',  ');
    };

    const fetchMyProyeks = async () => {
          try {
              const token = localStorage.getItem("authToken");
              const senimanId = localStorage.getItem("seniman_id");
              const response = await axios.get(
              `/index-proyek?seniman_id=${senimanId}`,
              {
                  headers: { Authorization: `Bearer ${token}` },
              }
              );
              if (response.data && response.data.data) {
              myProyeks.value = response.data.data.map((p) => ({
                  ...p,
                  liked: p.is_liked || false,
              }));
              } else {
              myProyeks.value = [];
              }
          } catch (error) {
              console.error("Failed to fetch your projects:", error);
              myProyeks.value = [];
          }
      };

      const fetchProyeks = async () => {
      try {
          const token = localStorage.getItem("authToken");
          const response = await axios.get("/proyek", {
          headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data && response.data.data) {
          proyek.value = response.data.data.map((p) => ({
              ...p,
              liked: p.is_liked,
          }));
          } else {
          proyek.value = [];
          }
      } catch (error) {
          console.error("Failed to fetch projects:", error);
          proyek.value = [];
      }
      };

    onMounted(() => {
      fetchMyProyeks();
      fetchProyeks();
    });

    const goToAddProyek = () => {
      router.push("/form-proyek");
    };

    const goToProyekDetail = (id) => {
      router.push(`/detail-proyek/${id}`);
    };

    const editProyek = (id) => {
      router.push({ name: 'FormProyekEdit', params: { id } });
    };

    const deleteProyek = async (proyekId) => {
      Swal.fire({
        title: "Apakah Anda yakin ingin menghapus portofolio ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const token = localStorage.getItem("authToken");
            await axios.delete(`/proyek/${proyekId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire("Hapus!", "Proyek berhasil dihapus.", "Berhasil");
            fetchMyProyeks();
          } catch (error) {
            console.error("Failed to delete project:", error);
            Swal.fire(
              "Error",
              "There was a problem deleting the project. Please try again later.",
              "error"
            );
          }
        }
      });
    };

    const toggleLikeMyProyek = async (targetProyek) => {
      try {
        const token = localStorage.getItem("authToken");
        if (targetProyek.liked) {
          await axios.post(`/proyek/${targetProyek.id}/unlike`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          targetProyek.jumlah_like--;
        } else {
          await axios.post(`/proyek/${targetProyek.id}/like`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          targetProyek.jumlah_like++;
        }
        targetProyek.liked = !targetProyek.liked;
      } catch (error) {
        console.error("Failed to toggle like:", error);
        Swal.fire("Error", "Gagal mengubah like. Silakan coba lagi nanti.", "error");
      }
    };

    const toggleLikeProyek = async (targetProyek) => {
      try {
        const token = localStorage.getItem("authToken");
        if (targetProyek.liked) {
          await axios.post(`/proyek/${targetProyek.id}/unlike`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          targetProyek.jumlah_like--;
        } else {
          await axios.post(`/proyek/${targetProyek.id}/like`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          targetProyek.jumlah_like++;
        }
        targetProyek.liked = !targetProyek.liked;
      } catch (error) {
        console.error("Failed to toggle like:", error);
        Swal.fire("Error", "Gagal mengubah like. Silakan coba lagi nanti.", "error");
      }
    };

    const shareProyek = (proyekId) => {
      const shareUrl = `${window.location.origin}/detail-proyek/${proyekId}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Event Seni',
          text: 'Lihat event seni menarik ini!',
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Link berhasil disalin!',
            text: 'Link event telah disalin ke clipboard.',
            timer: 2000,
            showConfirmButton: false
          });
        }).catch(() => {
          Swal.fire('Info', `Link event: ${shareUrl}`, 'info');
        });
      }
    };

    const filteredMyProyeks = computed(() =>
      myProyeks.value.filter((proyek) =>
        proyek.judul_proyek.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );

    const filteredProyeks = computed(() =>
      proyek.value.filter((proyek) =>
        proyek.judul_proyek.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );

    return {
      searchQuery,
      filteredMyProyeks,
      filteredProyeks,
      myProyeks,
      proyek,
      goToAddProyek,
      goToProyekDetail,
      editProyek,
      deleteProyek,
      toggleLikeMyProyek,
      toggleLikeProyek,
      shareProyek,
      formatDate,
    };
  },
};
</script>

<style lang="scss" scoped>
.proyek-page {
  display: flex;
  flex: 1;
  min-height: 100vh;
  font-family: 'Georgia', serif;
  position: relative;
}

.proyek-data {
  display: flex;
  flex: 1;
  background: linear-gradient(135deg, #f2d395 0%, #e8d5c4 100%);
  position: relative;
}

.proyek-data::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 177, 153, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(142, 202, 230, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.content {
  flex: 1;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
}

.main-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #5d4037;
  font-size: 2.8rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.title-icon {
  font-size: 2.2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.subtitle {
  color: #8d6e63;
  font-style: italic;
  font-size: 1.2rem;
}

.search-bar {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 300px;
  z-index: 10;
}

.search-bar input {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 25px;
  border: 2px solid #d4a574;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-family: 'Georgia', serif;
  transition: all 0.3s ease;

  &::placeholder {
    color: #8b7355;
    font-style: italic;
  }

  &:focus {
    outline: none;
    border-color: #ff8a65;
    box-shadow: 0 6px 20px rgba(255, 138, 101, 0.2);
  }
}

.section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4e342e;
  font-size: 1.8rem;
  margin-bottom: 25px;
  padding-left: 15px;
  border-left: 4px solid #ff8a65;
}

.section-icon {
  font-size: 1.5rem;
}

.proyek-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.artistic-card {
  border: none;
  border-radius: 15px;
  padding: 20px;
  width: 280px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 17px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 0.7;
  }
}

.my-proyek-card::before {
  background: linear-gradient(45deg, #7986cb, #9fa8da, #bcaaa4, #d7ccc8);
}

.other-proyek-card::before {
  background: linear-gradient(45deg, #ffb74d, #ffcc02, #fff176, #f9fbe7);
}

.add-proyek {
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  border: 2px dashed #ccc;

  &:hover {
    border-color: #ff8a65;
    background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
  }
}

.proyek-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  margin: 0 auto 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.create-icon {
  background: linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%);
}

.my-proyek-icon {
  background: linear-gradient(135deg, #7986cb 0%, #9fa8da 100%);
}

.other-proyek-icon {
  background: linear-gradient(135deg, #ffb74d 0%, #ffcc02 100%);
}

.add-icon {
  font-size: 2rem;
  color: #888;
}

.proyek-info {
  flex: 1;
  margin-bottom: 15px;
  text-align: center;

  h3 {
    color: #5d4037;
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  p {
    color: #8d6e63;
    font-size: 0.9rem;
    margin-bottom: 5px;
    font-style: italic;
  }

  .event-time, .event-end, .likes-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
}

.proyek-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.social-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.artistic-btn {
  padding: 8px 16px;
  cursor: pointer;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-family: 'Georgia', serif;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
}

.edit-btn {
  background: linear-gradient(135deg, #f7941e 0%, #ff9800 100%);
  color: white;

  &:hover {
    background: linear-gradient(135deg, #e68900 0%, #f57c00 100%);
  }
}

.delete-btn {
  background: linear-gradient(135deg, #f44336 0%, #e53935 100%);
  color: white;

  &:hover {
    background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  }
}

.like-btn {
  background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
  color: white;

  &:hover {
    background: linear-gradient(135deg, #c2185b 0%, #e91e63 100%);
  }
}

.share-btn {
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
  color: white;

  &:hover {
    background: linear-gradient(135deg, #1976d2 0%, #2196f3 100%);
  }
}

.heart-icon {
  margin-right: 5px;
  
  &.liked {
    color: #ff1744;
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.share-icon {
  margin-right: 5px;
}

.decorative-element {
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 1.2rem;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.artistic-card:hover .decorative-element {
  opacity: 0.8;
  transform: rotate(15deg) scale(1.2);
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2.2rem;
    flex-direction: column;
    gap: 10px;
  }

  .search-bar {
    position: relative;
    right: auto;
    top: auto;
    width: 100%;
    margin-bottom: 20px;
  }

  .proyek-list {
    justify-content: center;
  }

  .artistic-card {
    width: 100%;
    max-width: 350px;
  }

  .section-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 15px;
  }

  .artistic-card {
    width: 100%;
    max-width: none;
  }

  .proyek-actions,
  .social-actions {
    flex-direction: column;
    gap: 8px;
  }

  .artistic-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>