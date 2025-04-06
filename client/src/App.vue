<template>
  <router-view /> <!-- Solo esto -->
</template>

<script>
export default {
  name: 'App'
};
</script>

<style>
/* Estilos GLOBALES (aquí sí van) */
a {
  color: inherit;
  text-decoration: none;
  font-weight: normal;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>