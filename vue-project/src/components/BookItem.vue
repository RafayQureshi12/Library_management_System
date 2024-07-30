<template>
  <div class="book-item">
    <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
    <div class="book-details">
      <h3>{{ book.title }}</h3>
      <p>{{ book.author }}</p>
      <div class="book-actions">
        <button @click="readBook">Read</button>
        <button @click="borrowBook">Borrow</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookItem',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  methods: {
    readBook() {
      this.$emit('read', this.book);
    },
    borrowBook() {
      this.$emit('borrow', this.book);
    }
  }
};
</script>

<style scoped>
.book-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.book-cover {
  width: 100%;
  height: auto;
  max-width: 150px;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.book-details {
  text-align: center;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
}

.book-actions button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.book-actions button:hover {
  background-color: #2980b9;
}
</style>
