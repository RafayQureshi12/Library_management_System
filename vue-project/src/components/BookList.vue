<template>
  <section class="book-list">
    <h2>Manage Books</h2>
    <ul>
      <li v-for="book in books" :key="book.id" class="book-item">
        <div class="book-info">
          <span class="book-title">{{ book.title }}</span>
          <span class="book-author">by {{ book.author }}</span>
          <span class="book-genre">{{ book.genre }}</span>
        </div>
        <div class="book-actions">
          <a :href="book.pdfUrl" target="_blank" class="btn btn-primary">View PDF</a>
          <button @click="$emit('remove-book', book.id)" class="btn btn-danger">Remove</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  name: 'BookList',
  props: {
    books: {
      type: Array,
      required: true
    }
  },
  emits: ['remove-book']
};
</script>

<style scoped>
.book-list {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

ul {
  list-style-type: none;
  padding: 0;
}

.book-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ecf0f1;
  transition: background-color 0.3s ease;
}

.book-item:last-child {
  border-bottom: none;
}

.book-item:hover {
  background-color: #f7f9fc;
}

.book-info {
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: 500;
  color: #2c3e50;
}

.book-author, .book-genre {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  text-decoration: none;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}
</style>
