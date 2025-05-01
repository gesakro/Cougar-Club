<template>
    <div class="not-found">
      <div class="error-content">
        <h1>404</h1>
        <p>¡Ups! La página que buscas no existe.</p>
        <router-link to="/" class="home-link">Volver al inicio</router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound'
  }
  </script>
  
  <style scoped>
  .not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8f8f8;
    text-align: center;
  }
  
  .error-content {
    padding: 2rem;
  }
  
  h1 {
    font-size: 5rem;
    color: #b38b6d; /* Color Cougar Club */
    margin: 0;
  }
  
  p {
    font-size: 1.5rem;
    margin: 1rem 0;
  }
  
  .home-link {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #b38b6d;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.3s;
  }
  
  .home-link:hover {
    background-color: #9a735a;
  }
  </style>