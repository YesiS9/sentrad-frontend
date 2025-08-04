<template>
  <div class="proyek-page">
    <Sidebar />
    <main class="proyek-container">
      <div class="content">
        <div class="search-bar">
          <input type="text" v-model="searchQuery" class="search-input" placeholder="Cari proyek..." />
        </div>

        <section class="section">
          <h2>Event Saya</h2>
          <div class="proyek-list">
            <div class="proyek-card add-card" @click="goToAddProyek">
              <span class="add-icon">+</span>
            </div>
            <div
              class="proyek-card"
              v-for="proyek in filteredMyProyeks"
              :key="proyek.id"
              @click="goToProyekDetail(proyek.id)"
            >
              <div class="proyek-info">
                <h3>{{ proyek.judul_proyek }}</h3>
                <p>Mulai: {{ formatDate(proyek.waktu_mulai) }}</p>
                <p>Selesai: {{ formatDate(proyek.waktu_selesai) }}</p>
                <p><strong>Likes:</strong> {{ proyek.jumlah_like }}</p>
              </div>
              <div class="proyek-actions">
                <button class="edit-btn" @click.stop="editProyek(proyek.id)">Edit</button>
                <button class="delete-btn" @click.stop="deleteProyek(proyek.id)">Hapus</button>
              </div>
              <div class="social-actions">
                <button @click.stop="likeProyek(proyek.id)">
                  ❤️ Like ({{ proyek.jumlah_like }})
                </button>
                <button @click.stop="shareProyek(proyek.id)">
                  🔗 Share
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>Event Lainnya</h2>
          <div class="proyek-list">
            <div
              class="proyek-card"
              v-for="proyek in filteredProyeks"
              :key="proyek.id"
              @click="goToProyekDetail(proyek.id)"
            >
              <div class="proyek-info">
                <h3>{{ proyek.judul_proyek }}</h3>
                <p>Mulai: {{ formatDate(proyek.waktu_mulai) }}</p>
                <p>Selesai: {{ formatDate(proyek.waktu_selesai) }}</p>
                <p><strong>Likes:</strong> {{ proyek.jumlah_like }}</p>
              </div>
              <div class="social-actions">
                <button @click.stop="toggleLikeProyek(proyek)">
                  <span class="heart-icon" :class="{ liked: proyek.liked }">❤️</span> Like ({{ proyek.jumlah_like }})
                </button>
                <button @click.stop="shareProyek(proyek.id)">
                  <span class="share-icon">🔗</span> Share
                </button>
              </div>
            </div>
          </div>
        </section>
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

      const toggleLikeProyek = async (proyek) => {
        try {
          const token = localStorage.getItem("authToken");
          if (proyek.liked) {
            await axios.post(`/proyek/${proyek.id}/unlike`, {}, {
              headers: { Authorization: `Bearer ${token}` },
            });
            proyek.jumlah_like--;
          } else {
            await axios.post(`/proyek/${proyek.id}/like`, {}, {
              headers: { Authorization: `Bearer ${token}` },
            });
            proyek.jumlah_like++;
          }
          proyek.liked = !proyek.liked;
        } catch (error) {
          console.error("Failed to toggle like:", error);
          Swal.fire("Error", "Failed to toggle like. Please try again later.", "error");
        }
      };

      const shareProyek = (proyekId) => {
        // share proyek
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
  background-color: #f2d395;
  color: #333;
  min-height: 100vh;
}

.proyek-container {
  flex: 1;
  background-color: #f5d99d;
  padding: 40px;
  overflow-y: auto;
}

.content {
  position: relative;
}

.search-bar {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;

  .search-input {
    width: 100%;
    padding: 10px 15px;
    border-radius: 25px;
    border: 1px solid #ccc;
    font-size: 16px;
  }
}

.section {
  margin-top: 80px;

  h2 {
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: bold;
  }
}

.proyek-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.proyek-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  width: 220px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.add-card {
  justify-content: center;
  align-items: center;
  font-size: 48px;
  font-weight: bold;
  color: #888;
  background-color: #f0f0f0;
}

.proyek-info {
  margin-bottom: 12px;

  h3 {
    font-size: 18px;
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    margin-bottom: 4px;
  }
}

.proyek-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  .edit-btn,
  .delete-btn {
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
  }

  .edit-btn {
    background-color: #f7941e;

    &:hover {
      background-color: darkorange;
    }
  }

  .delete-btn {
    background-color: #f44336;

    &:hover {
      background-color: darkred;
    }
  }
}

.social-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;

  button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 14px;
    padding: 0;

    .heart-icon.liked {
      color: red;
    }

    .heart-icon,
    .share-icon {
      margin-right: 6px;
    }
  }
}
</style>
