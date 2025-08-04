<template>
    <div class="dashboard-layout">
        <Sidebar />
        <main class="dashboard-page">
            <section class="artist-profile">
                <h1>Profil Seniman</h1>
                <div class="profile-container">
                    <div class="profile-card">
                        <div class="avatar-section" v-if="seniman">
                            <img :src="getAvatarUrl()" :alt="seniman.user.username" class="avatar" @error="handleImageError" />
                        </div>
                        <div class="profile-details" v-if="seniman">
                            <div class="info">
                                <h2>{{ seniman.user.username }}</h2>
                                <div v-if="editMode">
                                    <p><strong>Nama Lengkap:</strong> <input v-model="editedSeniman.nama_seniman" /></p>
                                    <p><strong>Email:</strong> <input v-model="editedSeniman.user.email" /></p>
                                    <p><strong>Telepon:</strong> <input v-model="editedSeniman.noTelp_seniman" /></p>
                                    <p><strong>Tanggal Lahir:</strong> <input type="date" v-model="editedSeniman.tgl_lahir" /></p>
                                    <p><strong>Alamat:</strong> <input v-model="editedSeniman.alamat_seniman" /></p>
                                    <p><strong>Lama Pengalaman:</strong> <input type="number" v-model="editedSeniman.lama_pengalaman" /> tahun</p>
                                    <p><strong>Deskripsi:</strong> <textarea v-model="editedSeniman.deskripsi_seniman"></textarea></p>
                                    <button class="save-btn" @click="saveChanges">Simpan Perubahan</button>
                                    <button class="cancel-btn" @click="cancelEdit">Batal</button>
                                </div>
                                <div v-else>
                                    <p><strong>Nama Lengkap:</strong> {{ seniman.nama_seniman }}</p>
                                    <p><strong>Email:</strong> {{ seniman.user.email }}</p>
                                    <p><strong>Telepon:</strong> {{ seniman.noTelp_seniman }}</p>
                                    <p><strong>Tanggal Lahir:</strong> {{ formatDate(seniman.tgl_lahir) }}</p>
                                    <p><strong>Alamat:</strong> {{ seniman.alamat_seniman }}</p>
                                    <p><strong>Lama Pengalaman:</strong> {{ seniman.lama_pengalaman }} tahun</p>
                                    <p><strong>Tingkatan:</strong> {{ seniman.tingkatan ? seniman.tingkatan.nama_tingkatan : 'Belum ada Tingkatan' }}</p>
                                    <p><strong>Deskripsi:</strong> {{ seniman.deskripsi_seniman }}</p>
                                    <button class="edit-btn" @click="enterEditMode">Edit Profil</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="location-container">
                    <div class="location-card">
                        <h3>Lokasi Sanggar</h3>
                        <div v-if="!mapData || mapData.length === 0">
                            <p class="no-location">Lokasi tidak tersedia</p>
                        </div>
                        <div id="map" ref="map" class="map-view" v-else></div>
                        <router-link :to="{ name: 'AddMap' }" class="add-location-btn">Tambah Lokasi</router-link>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script>
import Sidebar from '../components/SidebarSeniman.vue';
import axios from '../services/api.js';
import Swal from 'sweetalert2';
import L from 'leaflet';

export default {
    components: { Sidebar },
    data() {
        return {
            seniman: null,
            editMode: false,
            editedSeniman: {},
            map: null,
            mapData: null,
            avatarError: false,
            defaultAvatar: '/default-avatar.jpg'
        };
    },
    mounted() {
        const senimanId = localStorage.getItem("seniman_id");
        if (senimanId) {
            this.fetchArtistData(senimanId);
        }
    },
    methods: {
        async fetchArtistData(senimanId) {
            try {
                const response = await axios.get(`/seniman/${senimanId}`);
                this.seniman = response.data.data;
                this.editedSeniman = { ...this.seniman };
                this.avatarError = false;
                
                console.log("Seniman data:", this.seniman);
                console.log("User foto path:", this.seniman.user?.foto);

                try {
                    const mapResponse = await axios.get(`/map?seniman_id=${senimanId}`);
                    this.mapData = mapResponse.data.data;
                    console.log("Map response", mapResponse);
                } catch (mapError) {
                    console.log("Map data not found or error fetching map:", mapError);
                }

                this.initializeMap();
            } catch (error) {
                console.error('Error fetching artist data:', error);
                if (error.response && error.response.status !== 404) {
                    Swal.fire("Error", "Gagal memuat data seniman.", "error");
                }
            }
        },

        getAvatarUrl() {
            if (this.avatarError || !this.seniman?.user?.foto) {
                return this.defaultAvatar;
            }

            const photoPath = this.seniman.user.foto;
            
            if (photoPath.startsWith('http')) {
                return photoPath;
            }
            
            const cleanPath = photoPath.replace(/^storage\//, '');
          
            const fullUrl = `https://sentrad-backend-production.up.railway.app/storage/${cleanPath}`;
            
            console.log("Avatar URL:", fullUrl);
            return fullUrl;
        },

        handleImageError(event) {
            console.log("Image not found, using default avatar:", event.target.src);
            this.avatarError = true;
            event.target.src = this.defaultAvatar;
        },

        formatDate(dateString) {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        },

        enterEditMode() {
            this.editMode = true;
            this.editedSeniman = { ...this.seniman };
        },

        saveChanges() {
            const formattedTglLahir = this.formatDateToDMY(this.editedSeniman.tgl_lahir);
            this.editedSeniman.tgl_lahir = formattedTglLahir;

            axios.put(`/seniman/${this.seniman.id}`, this.editedSeniman)
                .then(response => {
                    Swal.fire("Berhasil", "Perubahan telah disimpan.", "success");
                    this.seniman = response.data.data;
                    this.editedSeniman = { ...this.seniman };
                    this.editMode = false;
                    this.avatarError = false; 
                })
                .catch(error => {
                    console.error('Error saving changes:', error);
                    Swal.fire("Error", "Gagal menyimpan perubahan.", "error");
                });
        },

        formatDateToDMY(date) {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        },

        cancelEdit() {
            this.editMode = false;
            this.editedSeniman = { ...this.seniman };
        },

        initializeMap() {
            this.$nextTick(() => {
                if (!this.$refs.map) {
                    console.log("Map container not found - no map data available");
                    return;
                }

                if (!this.mapData || !Array.isArray(this.mapData) || this.mapData.length === 0) {
                    console.log("No map data available");
                    return;
                }

                if (!this.map) {
                    this.map = L.map(this.$refs.map).setView([-7.7956, 110.3695], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(this.map);
                }

                this.map.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        this.map.removeLayer(layer);
                    }
                });

                this.mapData.forEach(location => {
                    if (location.latitude && location.longitude) {
                        const marker = L.marker([location.latitude, location.longitude]).addTo(this.map);

                        const { name, description, id } = location;
                        const deleteBtn = document.createElement("button");
                        deleteBtn.innerText = "Hapus Lokasi";
                        deleteBtn.className = "leaflet-delete-btn";
                        deleteBtn.addEventListener("click", () => this.deleteLocation(id));

                        const popupContent = document.createElement("div");
                        popupContent.innerHTML = `
                            <strong>Nama Sanggar:</strong> ${name || 'Tidak tersedia'}<br/>
                            <strong>Deskripsi:</strong> ${description || 'Tidak tersedia'}<br/>
                        `;
                        popupContent.appendChild(deleteBtn);

                        marker.bindPopup(popupContent).openPopup();
                    }
                });

                const bounds = L.latLngBounds(this.mapData.map(location => [location.latitude, location.longitude]));
                this.map.fitBounds(bounds);
            });
        },

        deleteLocation(id) {
            Swal.fire({
                title: 'Apakah Anda yakin?',
                text: "Data lokasi akan dihapus secara permanen!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, hapus!',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    axios.delete(`/map/${id}`)
                        .then(response => {
                            Swal.fire("Berhasil", "Lokasi telah dihapus.", "success");
                            this.fetchArtistData(this.seniman.id);
                        })
                        .catch(error => {
                            console.error('Error deleting location:', error);
                            Swal.fire("Error", "Gagal menghapus lokasi.", "error");
                        });
                }
            });
        },
    },
};
</script>

<style scoped lang="scss">

.dashboard-layout {
    display: flex;
    min-height: 100vh;
    min-width: 100%;
    background-color: #f5d99d;
}

.dashboard-page {
    flex-grow: 1;
    background-color: #f5d99d;
}

.artist-profile {
    margin-top: 2rem;
}

.profile-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.profile-card {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar-section {
    flex-shrink: 0;
    margin-right: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ccc;
}

.profile-details {
    flex-grow: 1;
}

.profile-details h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    color: #333;
}

.info {
    h2 {
        margin: 0;
        font-size: 1.5rem;
    }
    p {
        margin: 0.5rem 0;
    }
    input,
    textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 0.3rem;
        margin-top: 0.2rem;
    }
}
.no-location{
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.edit-btn,
.save-btn,
.cancel-btn {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 1rem;
    margin-right: 0.5rem;
}

.edit-btn {
    background-color: #f7941e;
    color: #fff;
}
.save-btn {
    background-color: #45a049;
    color: #fff;
}

.cancel-btn {
    background-color: #f44336;
    color: #fff;
}


.location-container {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.location-card {
    width: 100%;
    height: auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.map-view {
    width: 100%;
    height: 400px;
    border-radius: 12px;
    margin-top: 1rem;
    margin-bottom: 2rem;
}

.leaflet-popup-content .leaflet-delete-btn {
  background-color: #e53935;
  color: #fff;
  border: none;
  padding: 8px 12px;
  margin-top: 8px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.leaflet-popup-content .leaflet-delete-btn:hover {
  background-color: #c62828;
}


.add-location-btn {
    margin-top: 2rem;
    padding: 0.5rem 1rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
}

.add-location-btn:hover {
    background-color: #45a049;
}


.delete-btn {
    margin-top: 0.5rem;
    margin-right: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
}

.delete-btn:hover {
    background-color: #e53935;
}

</style>