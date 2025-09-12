<template>
  <main class="home-page">
    <div class="homepage-container">
      <div class="hero-section">
        <div class="logo-container">
          <div class="logo-backdrop">
            <img :src="logoURL" alt="Sentrad Logo" class="logo" />
          </div>
        </div>
        <h1 class="main-title">Sentrad</h1>
        <p class="subtitle">Platform Digital untuk Seniman Tradisional Indonesia</p>
        <div class="decorative-line"></div>
      </div>
      <div class="gallery-section">
        <h2 class="section-title">Seni Tradisional Nusantara</h2>
        <div class="gallery">
          <div 
            v-for="(image, index) in images" 
            :key="index" 
            class="gallery-item"
            :class="`gallery-item-${index + 1}`"
          >
            <div class="image-frame">
              <img
                :src="image.src"
                :alt="image.alt"
                class="gallery-image"
              />
              <div class="image-overlay">
                <span class="image-title">{{ image.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="cta-section">
        <div class="cta-content">
          <h3>Bergabunglah dengan Komunitas Seniman</h3>
          <p>Temukan, bagikan, dan lestarikan seni tradisional Indonesia</p>
          <div class="button-container">
            <button @click="navigateTo('/login')" class="btn btn-primary">
              <span class="btn-icon">👤</span>
              Masuk
            </button>
            <button @click="navigateTo('/register')" class="btn btn-secondary">
              <span class="btn-icon">✨</span>
              Daftar Sekarang
            </button>
          </div>
        </div>
      </div>
      <div class="map-section">
        <div class="map-header">
          <h2 class="section-title">Peta Sanggar Seniman</h2>
          <p class="section-description">Jelajahi lokasi sanggar-sanggar seni tradisional di seluruh Indonesia</p>
        </div>
        <div class="search-container">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari nama sanggar seniman..."
              @input="filterArtists"
              class="search-input"
            />
          </div>
        </div>
        <div class="map-wrapper">
          <div id="map"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import L from 'leaflet';
import axios from '../services/api.js';
import logo from '../assets/Sentradlogo.png';
import pahatImage from '../assets/pahat.jpg';
import rupaImage from '../assets/rupa.jpg';
import tariImage from '../assets/Tari.jpg';

export default {
  name: 'Home',
  data() {
    return {
      logoURL: logo,
      images: [
        { src: pahatImage, alt: 'Traditional Art 1', title: 'Seni Pahat' },
        { src: rupaImage, alt: 'Traditional Art 2', title: 'Seni Rupa' },
        { src: tariImage, alt: 'Traditional Art 3', title: 'Seni Tari' },
      ],
      map: null,
      artists: [],
      markers: [],
      searchQuery: '',
      filteredArtists: [],
    };
  },
  mounted() {
    this.fetchArtists();
    this.initializeMap();
    this.initializeAnimations();
  },
  methods: {
    async fetchArtists() {
      try {
        const response = await axios.get("/map");
        if (response.data && Array.isArray(response.data.data)) {
          this.artists = response.data.data;
          this.filteredArtists = this.artists;
          this.updateMarkers();
        } else {
          console.error('Unexpected API response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching artist data:', error.message);
      }
    },
    initializeMap() {
      this.map = L.map('map').setView([-7.797068, 110.370529], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);
    },
    updateMarkers() {
      if (!this.map) return;

      this.markers.forEach(marker => this.map.removeLayer(marker));
      this.markers = [];

      this.filteredArtists.forEach((artist) => {
        if (artist.latitude && artist.longitude) {
          const popupContent = `
            <div class="custom-popup">
              <h4>${artist.name}</h4>
              <p><i>${artist.description || 'Deskripsi tidak tersedia'}</i></p>
              <p><strong>Seniman:</strong> ${artist.seniman?.nama_seniman || 'Tidak diketahui'}</p>
            </div>
          `;
          const marker = L.marker([artist.latitude, artist.longitude])
            .addTo(this.map)
            .bindPopup(popupContent);
          this.markers.push(marker);
        }
      });

      if (this.filteredArtists.length === 1) {
        const artist = this.filteredArtists[0];
        if (artist.latitude && artist.longitude) {
          this.map.setView([artist.latitude, artist.longitude], 16);
          if (this.markers.length > 0) {
            this.markers[0].openPopup();
          }
        }
      }
    },
    filterArtists() {
      this.filteredArtists = this.artists.filter((artist) =>
        artist.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.updateMarkers();
    },
    navigateTo(route) {
      this.$router.push(route);
    },
    initializeAnimations() {
      this.$nextTick(() => {
        const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }
          });
        }, observerOptions);

        document.querySelectorAll('.gallery-item').forEach((item, index) => {
          item.style.opacity = '0';
          item.style.transform = 'translateY(30px)';
          item.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
          observer.observe(item);
        });
      });
    }
  },
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');

main {
  align-items: flex-start;
  font-family: 'Inter', sans-serif;
}

.home-page {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f7941e 0%, #f5a840 50%, #f7941e 100%);
  padding: 40px 20px;
}

.homepage-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(247, 148, 30, 0.2);
  width: 100%;
  max-width: 1400px;
  overflow: hidden;
}


.hero-section {
  text-align: center;
  padding: 60px 40px 40px;
  background: linear-gradient(135deg, rgba(247, 148, 30, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #f7941e, transparent);
  }
}

.logo-container {
  margin-bottom: 30px;
}

.logo-backdrop {
  display: inline-block;
  position: relative;
  padding: 20px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(247, 148, 30, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: scale(1.2);
  }
}

.logo {
  width: 180px;
  height: auto;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 12px rgba(247, 148, 30, 0.3));
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.main-title {
  font-family: 'Playfair Display', serif;
  font-size: 4rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
}

.subtitle {
  font-size: 1.2rem;
  color: #6b4423;
  font-weight: 300;
  margin: 0 0 30px;
  letter-spacing: 0.5px;
}

.decorative-line {
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, #f7941e, #df853b, #f7941e);
  margin: 0 auto;
  border-radius: 2px;
}


.gallery-section {
  padding: 60px 40px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(247, 148, 30, 0.02) 100%);
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c1810;
  text-align: center;
  margin: 0 0 15px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 2px;
    background: #f7941e;
  }
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 50px;
  padding: 0 20px;
}

.gallery-item {
  position: relative;
  
  &.gallery-item-2 {
    transform: translateY(-20px);
  }
}

.image-frame {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(247, 148, 30, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.2),
      0 8px 24px rgba(247, 148, 30, 0.3);
    
    .image-overlay {
      opacity: 1;
    }
    
    .gallery-image {
      transform: scale(1.1);
    }
  }
}

.gallery-image {
  width: 100%;
  height: 280px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg, 
    rgba(247, 148, 30, 0.9) 0%, 
    rgba(223, 133, 59, 0.8) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-title {
  color: white;
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}


.cta-section {
  padding: 60px 40px;
  background: linear-gradient(135deg, rgba(247, 148, 30, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-top: 1px solid rgba(247, 148, 30, 0.1);
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  
  h3 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: #2c1810;
    margin: 0 0 15px;
  }
  
  p {
    font-size: 1.1rem;
    color: #6b4423;
    margin: 0 0 40px;
    line-height: 1.6;
  }
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  min-width: 160px;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    &::before {
      left: 100%;
    }
  }
}

.btn-primary {
  background: linear-gradient(135deg, #f7941e 0%, #df853b 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(247, 148, 30, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(247, 148, 30, 0.5);
  }
}

.btn-secondary {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(247, 148, 30, 0.1) 100%);
  color: #f7941e;
  border: 2px solid #f7941e;
  box-shadow: 0 8px 24px rgba(247, 148, 30, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    background: #f7941e;
    color: white;
    box-shadow: 0 12px 32px rgba(247, 148, 30, 0.4);
  }
}

.btn-icon {
  font-size: 1.2rem;
}

.map-section {
  padding: 60px 40px 40px;
  background: rgba(255, 255, 255, 0.98);
}

.map-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-description {
  font-size: 1.1rem;
  color: #6b4423;
  margin: 15px 0 0;
  line-height: 1.6;
}

.search-container {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.search-wrapper {
  position: relative;
  max-width: 500px;
  width: 100%;
  transition: transform 0.3s ease;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #f7941e;
}

.search-input {
  width: 100%;
  padding: 16px 20px 16px 50px;
  border: 2px solid rgba(247, 148, 30, 0.2);
  border-radius: 50px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #f7941e;
    box-shadow: 0 0 0 4px rgba(247, 148, 30, 0.1);
    background: white;
    
    + .search-wrapper {
      transform: scale(1.02);
    }
  }
  
  &::placeholder {
    color: #a0a0a0;
  }
}

.map-wrapper {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(247, 148, 30, 0.1);
}

#map {
  height: 450px;
  border: none;
}


:global(.custom-popup) {
  h4 {
    margin: 0 0 8px;
    color: #2c1810;
    font-family: 'Playfair Display', serif;
  }
  
  p {
    margin: 4px 0;
    color: #6b4423;
    font-size: 0.9rem;
    line-height: 1.4;
  }
}


@media (max-width: 1024px) {
  .homepage-container {
    margin: 20px;
  }
  
  .hero-section,
  .gallery-section,
  .cta-section,
  .map-section {
    padding: 40px 30px;
  }
  
  .gallery {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .gallery-item.gallery-item-2 {
    transform: none;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 20px 10px;
  }
  
  .hero-section,
  .gallery-section,
  .cta-section,
  .map-section {
    padding: 30px 20px;
  }
  
  .button-container {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 280px;
  }
  
  .gallery {
    grid-template-columns: 1fr;
  }
  
  .gallery-item.gallery-item-2 {
    transform: none;
  }
  
  #map {
    height: 350px;
  }
}
</style>