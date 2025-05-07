<template>
    <div class="comercio-grid">
      <div v-if="loading" class="loading">Cargando comercios...</div>
      <div v-else class="grid-container">
        <div v-for="company in companies" :key="company._id" class="card">
          <router-link :to="`/comercio/${company._id}`">
            <img v-if="company.imagenBanner" :src="company.imagenBanner" alt="Banner" class="banner" />
            <img v-if="company.imagenPerfil" :src="company.imagenPerfil" alt="Perfil" class="profile" />
            <h3>{{ company.nombre }}</h3>
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    name: 'ComercioLista',
    data() {
      return {
        companies: [],
        loading: false,
        error: null,
      };
    },
    created() {
      this.fetchCompanies();
    },
    methods: {
      async fetchCompanies() {
        this.loading = true;
        try {
          const response = await axios.get('http://localhost:5000/api/companies');
          this.companies = response.data;
        } catch (error) {
          console.error("Error fetching companies:", error);
          this.error = error.message;
        } finally {
          this.loading = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: 20px;
  }
  .card {
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    background-color: #fff;
    transition: box-shadow 0.2s;
  }
  .card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  .banner {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  .profile {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-top: -40px;
    border: 3px solid white;
  }
  .loading {
    text-align: center;
    font-size: 1.2em;
    padding: 20px;
  }
  </style>
  