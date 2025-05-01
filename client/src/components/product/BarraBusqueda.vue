<template>
  <div class="search-bar">
    <input 
      type="text" 
      placeholder="Search for men shoes" 
      v-model="query" 
      @input="handleSearch"
    />
    <button 
      class="clear-btn" 
      @click="clearSearch"
      :disabled="!query"
    >
      ✕
    </button>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      query: ''
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.query)
    },
    clearSearch() {
      this.query = ''
      this.$emit('search', '')
    }
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}
input {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 25px;
  border: 1px solid #ddd;
  font-size: 1rem;
  outline: none;
  transition: border 0.3s;
}
input:focus {
  border-color: #b38b6d;
}
.clear-btn {
  position: absolute;
  right: 15px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #999;
  padding: 0.5rem;
}
.clear-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>