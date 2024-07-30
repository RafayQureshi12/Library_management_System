<template>
  <section class="book-form">
    <h2>Add New Book</h2>
    <form @submit.prevent="submitBook">
      <div class="form-group">
        <input v-model="newBook.title" placeholder="Title" required />
      </div>
      <div class="form-group">
        <input v-model="newBook.author" placeholder="Author" required />
      </div>
      <div class="form-group">
        <input v-model="newBook.genre" placeholder="Genre" required />
      </div>
      <div class="form-group">
        <label for="pdf-upload" class="file-upload-label">
          <span>{{ pdfFileName || 'Choose PDF file' }}</span>
          <input
            type="file"
            id="pdf-upload"
            @change="handlePdfUpload"
            accept=".pdf"
            required
          />
        </label>
      </div>
      <div class="form-group">
        <label for="cover-upload" class="file-upload-label">
          <span>{{ coverFileName || 'Choose Cover Image (optional)' }}</span>
          <input
            type="file"
            id="cover-upload"
            @change="handleCoverUpload"
            accept="image/*"
          />
        </label>
      </div>
      <button type="submit" class="btn btn-primary">Add Book</button>
    </form>
  </section>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'BookForm',
  emits: ['book-added'],
  setup(props, { emit }) {
    const newBook = ref({ title: '', author: '', genre: '', pdfFile: null, coverFile: null });
    const pdfFileName = ref('');
    const coverFileName = ref('');

    const handlePdfUpload = (event) => {
      const file = event.target.files[0];
      if (file && file.type === 'application/pdf') {
        newBook.value.pdfFile = file;
        pdfFileName.value = file.name;
      } else {
        alert('Please upload a PDF file');
        event.target.value = '';
        pdfFileName.value = '';
      }
    };

    const handleCoverUpload = (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        newBook.value.coverFile = file;
        coverFileName.value = file.name;
      } else {
        alert('Please upload an image file');
        event.target.value = '';
        coverFileName.value = '';
      }
    };

    const submitBook = () => {
      if (!newBook.value.pdfFile) {
        alert('Please upload a PDF file');
        return;
      }
      emit('book-added', { ...newBook.value });
      newBook.value = { title: '', author: '', genre: '', pdfFile: null, coverFile: null };
      pdfFileName.value = '';
      coverFileName.value = '';
      document.getElementById('pdf-upload').value = '';
      document.getElementById('cover-upload').value = '';
    };

    return {
      newBook,
      pdfFileName,
      coverFileName,
      handlePdfUpload,
      handleCoverUpload,
      submitBook
    };
  }
};
</script>

<style scoped>
.book-form {
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

.form-group {
  margin-bottom: 1rem;
}

input, .file-upload-label {
  width: 80%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 50px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

.file-upload-label {
  display: inline-block;
  cursor: pointer;
  background-color: #f7f7f7;
  text-align: center;
}

.file-upload-label input[type="file"] {
  display: none;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background-color: #3498db;
  color: white;
  width: 40%;
}

.btn-primary:hover {
  background-color: #2980b9;
}
</style>
