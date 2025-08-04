<template>
    <div class="forum-page">
        <Sidebar />
        <main class="forum-data">
            <div class="content">
                <div class="search-bar">
                    <input type="text" v-model="searchQuery" placeholder="🔍 Cari forum seni..." />
                </div>

                <div class="page-header">
                    <h1 class="main-title">
                        <span class="title-text">Forum Seni</span>
                        <span class="title-icon">🎨</span>
                    </h1>
                    <p class="subtitle">Tempat berkumpulnya para seniman dan pencinta seni Indonesia</p>
                </div>

                <div class="section" style="margin-top:64px;">
                    <h2 class="section-title">
                        <span class="section-icon">🎭</span>
                        Forum Saya
                    </h2>
                    <div class="forum-list">
                        <div class="forum-card add-forum artistic-card" @click="goToAddForum">
                            <div class="forum-icon create-icon">
                                <span class="add-icon">+</span>
                            </div>
                            <div class="forum-info">
                                <h3>Buat Forum Baru</h3>
                                <p>Mulai komunitas seni Anda</p>
                            </div>
                            <div class="decorative-element">✨</div>
                        </div>
                        <div class="forum-card artistic-card my-forum-card" v-for="forum in filteredMyForums" :key="forum.id">
                            <div class="forum-icon my-forum-icon">🎨</div>
                            <div class="forum-info" @click="goToForumDetail(forum.id)">
                                <h3>{{ forum.judul_forum }}</h3>
                                <p class="member-count">👥 {{ forum.anggota_forums_count }} anggota</p>
                            </div>
                            <div class="forum-actions">
                                <button class="edit-btn artistic-btn" @click.stop="editForum(forum.id)">
                                    <span>✏️</span> Edit
                                </button>
                                <button class="delete-btn artistic-btn" @click.stop="deleteForum(forum.id)">
                                    <span>🗑️</span> Hapus
                                </button>
                            </div>
                            <div class="decorative-element">🌟</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">
                        <span class="section-icon">👥</span>
                        Forum Yang Diikuti
                    </h2>
                    <div class="forum-list">
                        <div class="forum-card artistic-card followed-forum-card" v-for="forum in followedForums" :key="forum.id">
                            <div class="forum-icon followed-forum-icon">🖌️</div>
                            <div class="forum-info" @click="goToForumDetail(forum.id)">
                                <h3>{{ forum.judul_forum }}</h3>
                                <p class="creator">🎨 {{ forum.nama_seniman }}</p>
                                <p class="member-count">👥 {{ forum.anggota_forums_count }} anggota</p>
                            </div>
                            <div class="forum-actions">
                                <button class="leave-btn artistic-btn" @click.stop="leaveForum(forum.id)">
                                    <span>🚪</span> Keluar
                                </button>
                            </div>
                            <div class="decorative-element">🎪</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">
                        <span class="section-icon">🌟</span>
                        Forum Lainnya
                    </h2>
                    <div class="forum-list">
                        <div class="forum-card artistic-card other-forum-card" v-for="forum in otherForums" :key="forum.id">
                            <div class="forum-icon other-forum-icon">🎪</div>
                            <div class="forum-info">
                                <h3>{{ forum.judul_forum }}</h3>
                                <p class="creator">🎨 {{ forum.nama_seniman }}</p>
                                <p class="member-count">👥 {{ forum.anggota_forums_count }} anggota</p>
                            </div>
                            <div class="forum-actions">
                                <button class="join-btn artistic-btn" @click.stop="joinForum(forum.id)">
                                    <span>➕</span> Gabung
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
    name: "ForumPage",
    components: { Sidebar },
    setup() {
        const searchQuery = ref("");
        const myForums = ref([]);
        const followedForums = ref([]);
        const otherForums = ref([]);
        const router = useRouter();

        const fetchMyForums = async () => {
            const token = localStorage.getItem("authToken");
            const senimanId = localStorage.getItem("seniman_id");
            try {
                const response = await axios.get(`/myForum?seniman_id=${senimanId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                myForums.value = response.data.data;
            } catch (error) {
                console.error("Failed to fetch your forums:", error);
                myForums.value = [];
            }
        };

        const fetchFollowedForums = async () => {
            const token = localStorage.getItem("authToken");
            try {
                const response = await axios.get("/followForum", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                followedForums.value = response.data.data;
                await Promise.all(followedForums.value.map(forum => getSenimanName(forum.seniman_id, forum)));
            } catch (error) {
                console.error("Failed to fetch followed forums:", error);
                followedForums.value = [];
            }
        };

        const fetchOtherForums = async () => {
            const token = localStorage.getItem("authToken");
            try {
                const response = await axios.get("/forum", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                otherForums.value = response.data.data;
                await Promise.all(otherForums.value.map(forum => getSenimanName(forum.seniman_id, forum)));
            } catch (error) {
                console.error("Failed to fetch other forums:", error);
                otherForums.value = [];
            }
        };

        const getSenimanName = async (senimanId, forum) => {
            try {
                const response = await axios.get(`/seniman/${senimanId}`);
                if (response.status === 200 && response.data.status === "success") {
                    forum.nama_seniman = response.data.data.nama_seniman;
                } else {
                    forum.nama_seniman = "Unknown Artist";
                }
            } catch (error) {
                console.error("Error fetching artist name:", error.message);
                forum.nama_seniman = "Unknown Artist";
            }
        };

        onMounted(() => {
            fetchMyForums();
            fetchFollowedForums();
            fetchOtherForums();
        });

        const goToAddForum = () => {
            router.push("/form-forum");
        };

        const goToForumDetail = (id) => {
            router.push(`/detail-forum/${id}`);
        };

        const editForum = (id) => {
            router.push({ name: 'FormForumEdit', params: { id } });
        };

        const deleteForum = async (forumId) => {
            Swal.fire({
                title: "Apakah Anda yakin ingin menghapus forum ini?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ya",
                cancelButtonText: "Tidak",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const token = localStorage.getItem("authToken");
                    try {
                        await axios.delete(`/forum/${forumId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        Swal.fire("Hapus!", "Forum berhasil dihapus.", "Berhasil");
                        fetchMyForums();
                    } catch (error) {
                        console.error("Failed to delete forum:", error);
                        Swal.fire("Error", "Terjadi kesalahan. Coba lagi.", "error");
                    }
                }
            });
        };

        const leaveForum = async (forumId) => {
            Swal.fire({
                title: "Apakah Anda yakin ingin keluar dari forum ini?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ya",
                cancelButtonText: "Tidak",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const token = localStorage.getItem("authToken");
                    const anggotaId = localStorage.getItem("seniman_id");
                    console.log('senimanId:', anggotaId);
                    try {
                        await axios.delete(`/out-forum/${forumId}/anggota/${anggotaId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        Swal.fire("Berhasil!", "Anda telah keluar dari forum.", "success");
                        fetchFollowedForums();
                    } catch (error) {
                        console.error("Failed to leave forum:", error);
                        Swal.fire("Error", "Terjadi kesalahan. Coba lagi.", "error");
                    }
                }
            });
        };

        const joinForum = async (forumId) => {
            const token = localStorage.getItem("authToken");
            const senimanId = localStorage.getItem("seniman_id");
            try {
                const response = await axios.post("/join-forum", {
                    forum_id: forumId, seniman_id: senimanId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire("Berhasil!", response.data.message, "success");
                fetchFollowedForums();
                fetchOtherForums();
            } catch (error) {
                if (error.response?.status === 409) {
                    Swal.fire("Info", "Anda sudah menjadi anggota forum ini.", "info");
                } else {
                    console.error("Failed to join the forum:", error);
                    Swal.fire("Error", "Gagal bergabung. Coba lagi.", "error");
                }
            }
        };

        const filteredMyForums = computed(() => {
            return myForums.value?.filter(forum =>
                forum.judul_forum.toLowerCase().includes(searchQuery.value.toLowerCase())
            ) || [];
        });

        return {
            searchQuery,
            filteredMyForums,
            followedForums,
            otherForums,
            goToAddForum,
            goToForumDetail,
            editForum,
            deleteForum,
            leaveForum,
            joinForum,
        };
    },
};
</script>

<style lang="scss" scoped>
.forum-page {
  display: flex;
  flex: 1;
  min-height: 100vh;
  font-family: 'Georgia', serif;
  position: relative;
}

.forum-data {
  display: flex;
  flex: 1;
  background: linear-gradient(135deg, #f2d395 0%, #e8d5c4 100%);
  position: relative;
}

.forum-data::before {
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

.forum-list {
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

.my-forum-card::before {
  background: linear-gradient(45deg, #7986cb, #9fa8da, #bcaaa4, #d7ccc8);
}

.followed-forum-card::before {
  background: linear-gradient(45deg, #81c784, #a5d6a7, #c8e6c9, #dcedc8);
}

.other-forum-card::before {
  background: linear-gradient(45deg, #ffb74d, #ffcc02, #fff176, #f9fbe7);
}

.add-forum {
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

.forum-icon {
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

.my-forum-icon {
  background: linear-gradient(135deg, #7986cb 0%, #9fa8da 100%);
}

.followed-forum-icon {
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 100%);
}

.other-forum-icon {
  background: linear-gradient(135deg, #ffb74d 0%, #ffcc02 100%);
}

.add-icon {
  font-size: 2rem;
  color: #888;
}

.forum-info {
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

  .member-count, .creator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
}

.forum-actions {
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

.join-btn {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;

  &:hover {
    background: linear-gradient(135deg, #388e3c 0%, #43a047 100%);
  }
}

.leave-btn {
  background: linear-gradient(135deg, #ffc107 0%, #ffca28 100%);
  color: #5d4037;

  &:hover {
    background: linear-gradient(135deg, #ffa000 0%, #ff8f00 100%);
  }
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

// Responsive design
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

  .forum-list {
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

  .forum-actions {
    flex-direction: column;
    gap: 8px;
  }

  .artistic-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>