<template>
    <div class="product-pagination" v-if="totalPages > 1">
      <button 
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        &lt;
      </button>
      
      <button
        v-for="page in visiblePages"
        :key="page"
        class="pagination-btn"
        :class="{ active: page === currentPage }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
      
      <button 
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        &gt;
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductPagination',
    props: {
      currentPage: {
        type: Number,
        required: true
      },
      totalPages: {
        type: Number,
        required: true
      },
      maxVisibleButtons: {
        type: Number,
        default: 5
      }
    },
    computed: {
      visiblePages() {
        const half = Math.floor(this.maxVisibleButtons / 2);
        let start = Math.max(1, this.currentPage - half);
        const end = Math.min(start + this.maxVisibleButtons - 1, this.totalPages);
        
        // Ajustar el inicio si estamos cerca del final
        start = Math.max(1, end - this.maxVisibleButtons + 1);
        
        const pages = [];
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        return pages;
      }
    },
    methods: {
      changePage(page) {
        if (page >= 1 && page <= this.totalPages) {
          this.$emit('page-change', page);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .product-pagination {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 2rem;
    padding: 1rem 0;
  }
  
  .pagination-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .pagination-btn:hover:not(:disabled) {
    background-color: #f5f5f5;
    border-color: #b38b6d;
  }
  
  .pagination-btn.active {
    background-color: #b38b6d;
    color: white;
    border-color: #b38b6d;
  }
  
  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    .pagination-btn {
      width: 35px;
      height: 35px;
      font-size: 0.9rem;
    }
  }
  </style>