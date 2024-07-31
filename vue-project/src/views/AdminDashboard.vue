<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <img :src="logo" alt="Logo" />
      </div>

      <div class="bottom-menu">
        <nav>
          <ul>
            <li class="nav-item">
              <router-link to="/adminsettings">
                <i class="fas fa-cog"></i>
                Settings
              </router-link>
            </li>
          </ul>
        </nav>
        <router-link to="/" class="logout-link">
          <i class="fas fa-sign-out-alt"></i>
          Log out
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="header">
        <h1 class="admin-heading">Admin Dashboard</h1>
      </header>
      <div class="dashboard-content">
        <BookForm v-if="isAdmin" @book-added="addBook" />
        <BookList :books="books" @remove-book="removeBook" />
        <BorrowLogs :logs="borrowLogs" />
      </div>
    </main>
    <SuccessModal 
      :show="showSuccessModal" 
      :message="successMessage"
      @close="showSuccessModal = false"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { collection, addDoc, deleteDoc, doc, getDocs, getDoc, onSnapshot  } from 'firebase/firestore';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import logo from '@/assets/logo.png';
import BookForm from '@/components/BookForm.vue';
import BookList from '@/components/BookList.vue';
import BorrowLogs from '@/components/BorrowLogs.vue';
import SuccessModal from '@/components/Successmodal.vue';

export default {
  name: 'AdminDashboard',
  components: {
    BookForm,
    BookList,
    BorrowLogs,
    SuccessModal
  },
  setup(_, { router }) {
    const isAdmin = ref(false);
    const books = ref([]);
    const borrowLogs = ref([]);
    const showSuccessModal = ref(false);
    const successMessage = ref('');
    const auth = getAuth();
    
    onMounted(() => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          isAdmin.value = userData && userData.role === 'admin';
          if (isAdmin.value) {
            router.push({ name: 'AdminDashboard' });
          }
        } else {
          isAdmin.value = false;
        }
      });
    });

  const fetchBooks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'books'));
      books.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
      books.value = []; // Ensure it's an empty array if there's an error
    }
  };

    const fetchLogs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'borrowLogs'));
      borrowLogs.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching borrow logs:', error);
      alert('Failed to fetch borrow logs');
    }
  };

    const addBook = async (newBook) => {
      try {
        const pdfPath = `books/${newBook.title}.pdf`;
        const fileRef = storageRef(storage, pdfPath);
        await uploadBytes(fileRef, newBook.pdfFile);

        let coverPath = '';
        if (newBook.coverFile) {
          coverPath = `covers/${newBook.title}.jpg`;
          const coverFileRef = storageRef(storage, coverPath);
          await uploadBytes(coverFileRef, newBook.coverFile);
        }

        
        const docRef = await addDoc(collection(db, 'books'), {
          title: newBook.title,
          author: newBook.author,
          genre: newBook.genre,
          pdfPath: pdfPath,
          available: true,
          coverPath: coverPath
        });

        const newBookWithId = {
          id: docRef.id,
          ...newBook,
          pdfPath: pdfPath,
          available: true,
          coverPath: coverPath
        };

        if (!Array.isArray(books.value)) {
            books.value = [];
          }
          books.value.push(newBookWithId);
        successMessage.value = 'Book added successfully!';
        showSuccessModal.value = true;
      } catch (error) {
        console.error('Error adding book:', error);
        alert('Failed to add book: ' + error.message);
      }
    };

    const removeBook = async (id) => {
      try {
        await deleteDoc(doc(db, 'books', id));
        books.value = books.value.filter(book => book.id !== id);
        alert('Book removed successfully');
      } catch (error) {
        console.error('Error removing book:', error);
        alert('Failed to remove book');
      }
    };

    const returnBook = async (logId) => {
  try {
    await updateDoc(doc(db, 'borrowLogs', logId), {
      status: 'returned',
      actualReturnDate: new Date().toISOString()
    });
    // Also update the book's availability
    const bookId = borrowLogs.value.find(log => log.id === logId).bookId;
    await updateDoc(doc(db, 'books', bookId), { available: true });
  } catch (error) {
    console.error('Error returning book:', error);
    alert('Failed to return book');
  }
};

    const checkOverdueBooks = async () => {
      const now = new Date();
      borrowLogs.value.forEach(async (log) => {
        if (log.status === 'active' && isBefore(parseISO(log.endDate), now)) {
          await updateDoc(doc(db, 'borrowLogs', log.id), { status: 'overdue' });
        }
      });
    };

    // Call this function periodically or when the component mounts
    onMounted(() => {
      checkOverdueBooks();
      // Set up an interval to check periodically (e.g., every hour)
      const intervalId = setInterval(checkOverdueBooks, 3600000);
      
      // Clear the interval when the component is unmounted
      onUnmounted(() => clearInterval(intervalId));
    });


const fetchborrowLogs = async () => {
  try {
    const logsSnapshot = await getDocs(collection(db, 'borrowLogs'));
    borrowLogs.value = logsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        bookTitle: data.bookTitle || 'Unknown Book',
        userName: data.userName || 'Unknown User',
        borrowDate: data.borrowDate?.toDate().toISOString() || null,
        returnDate: data.returnDate?.toDate().toISOString() || null
      };
    });
    console.log('Fetched borrow logs:', borrowLogs.value);
  } catch (error) {
    console.error('Error fetching borrow logs:', error);
    borrowLogs.value = []; // Ensure it's an empty array if there's an error
  }
};

    onMounted(fetchborrowLogs);
  
    const unsubscribe = onSnapshot(collection(db, 'borrowLogs'), (snapshot) => {
    borrowLogs.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });

  // Don't forget to unsubscribe when the component is unmounted
    onUnmounted(() => unsubscribe());

    onMounted(() => {
      fetchBooks();
      fetchLogs();
    });

    return {
      isAdmin,
      books,
      borrowLogs,
      logo,
      addBook,
      removeBook,
      showSuccessModal,
      successMessage
    };
  }
};
</script>


<style scoped>
.app-container {
  display: flex;
  min-height: 120vh;
  min-width: 200vh;
  font-family: 'Poppins', sans-serif;
  background-color: whitesmoke;
  margin-left: 7vh;
  top: 0;
  bottom: 0;
  position: absolute ;
}

.sidebar {
  width: 280px;
  background-color: #2c3e50;
  padding: 25px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0; /* Ensure the sidebar covers the full height */
  color: #ecf0f1;
  overflow-y: auto;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #3498db;
  
}

.logo img {
  max-width: 100%;
}

nav ul {
  list-style-type: none;
  padding: 0;
  flex-grow: 1;
}

.nav-item {
  margin-bottom: 1rem;
}

nav a, .logout-link {
  text-decoration: none;
  color: #ecf0f1;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

nav a:hover, .logout-link:hover {
  background-color: #34495e;
}

.bottom-menu {
  margin-top: 500PX; /* Push the bottom menu to the bottom */
  display: flex;
  flex-direction: column;
  justify-content: center;

}

.main-content {
  flex-grow: 1;
  margin-left: 280px; /* Width of the sidebar */
  padding: 2rem;
}
.header {
  margin-bottom: 2rem;
}

.admin-heading {
  font-size: 2.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
</style>
