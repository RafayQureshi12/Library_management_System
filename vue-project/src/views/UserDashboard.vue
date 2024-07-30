<template>
  <div class="app-container" v-if="user">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">THE BOOKS</div>
      <nav>
        <ul>
          <li v-for="item in menuItems" :key="item.label">
            <router-link :to="{ name: item.route }" active-class="active">
              <font-awesome-icon :icon="item.icon" />
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="bottom-menu">
        <router-link :to="{ name: 'UserSettings' }">
          <font-awesome-icon icon="cog" /> Settings
        </router-link>
        <a href="#" @click="logout">
          <font-awesome-icon icon="sign-out-alt" /> Log out
        </a>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="header">
        <h1>{{ $route.name }}</h1>
        
        <!-- Search Bar -->
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="Find the book you like..." />
          <button @click="search">Search</button>
        </div>
        
        <!-- User Profile -->
        <div class="user-profile">
          <span>{{ firstName }}</span>
          <font-awesome-icon icon="bell" class="icon-notification" />
        </div>
      </header>

      <!-- Dynamic Content based on route -->
      <div v-if="$route.name === 'Discover'">
        <!-- Book Categories -->
        <section class="book-categories">
          <h2>Book Categories</h2>
          <div class="category-list">
            <div v-for="category in bookCategories" :key="category.name" class="category" @click="sortBooksByCategory(category.name)">
              <font-awesome-icon :icon="category.icon" />
              <h3>{{ category.name }}</h3>
            </div>
          </div>
        </section>

        <!-- Book Recommendations -->
        <section class="book-recommendations">
          <h2>{{ selectedCategory ? selectedCategory + ' Books' : 'Book Recommendations' }}</h2>
          <div class="book-list">
            <div v-for="book in filteredBooks" :key="book.id" class="book">
              <div class="book-cover">
                <img :src="book.coverUrl" :alt="book.title" />
               
              </div>
              <h3>{{ book.title }}</h3>
              <p>{{ book.author }}</p>
              <div class="book-actions">
                <button v-if="book.available" @click="borrowBook(book)" class="borrow-btn">Borrow</button>
                <button v-else class="borrow-btn" disabled>Not Available</button>
                <button @click="toggleFavorite(book)" class="favorite-btn">
                  {{ book.isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-else-if="$route.name === 'Library'">
        <div v-if="loading">Loading borrowed books...</div>
        <div v-else-if="error">Error: {{ error }}</div>
        <div class="my-library-container">
          <h2>My Library</h2>
          <div class="borrowed-books">
            <div v-for="book in borrowedBooks" :key="book.id" class="book-card">
              <div class="book-cover">
              <img :src="book.coverUrl" :alt="book.title" />
            </div>
              <h3>{{ book.title }}</h3>
              <p>{{ book.author }}</p>
              <p>Borrowed on: {{ formatDate(book.borrowDate) }}</p>
              <p>Return by: {{ formatDate(book.returnDate) }}</p>
              <div class="book-actions">

                <button @click="openPdf(book)" class="read-btn">Read</button>
                <button @click="renewBook(book)" class="renew-btn">Renew</button>
                <button @click="returnBook(book)" class="return-btn">Return</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="$route.name === 'Favorite'">
        <div v-if="loading">Loading favorite books...</div>
        <div v-else-if="error">Error: {{ error }}</div>
        <div class="favorites-container">
          <h2>My Favorites</h2>
          <div class="favorite-books">
            <div v-for="book in favoriteBooks" :key="book.id" class="book-card">
              <div class="book-cover">
                <img :src="book.coverUrl" :alt="book.title" />
                <button @click="toggleFavorite(book)" class="favorite-btn">
                   {{ book.isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
                </button>
              </div>
              <h3>{{ book.title }}</h3>
              <p>{{ book.author }}</p>
              <div class="book-actions">
                <button v-if="book.available" @click="borrowBook(book)" class="borrow-btn">Borrow</button>
                <p v-else>Not Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { ref as vueRef, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faBook, faBell, faCog, faSignOutAlt, faChartLine, faPaintBrush, faBriefcase, faDumbbell, faNewspaper, faRocket, faHourglass, faUser, faSearch as faSearchIcon } from '@fortawesome/free-solid-svg-icons';

library.add(faSearch, faBook, faBell, faCog, faSignOutAlt, faChartLine, faPaintBrush, faBriefcase, faDumbbell, faNewspaper, faRocket, faHourglass, faUser, faSearchIcon);

export default {
  
  name: 'UserDashboard',
  
  components: {
    FontAwesomeIcon,
    books: {
      type: Array,
      required: true
    }
    
  },
  setup() {
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();
    const router = useRouter();
    const firstName = vueRef('');

    const user = vueRef(null);
    const recommendedBooks = vueRef([]);
    const borrowedBooks = vueRef([]);
    const favoriteBooks = ref([]);
    const searchQuery = vueRef('');
    const selectedCategory = vueRef('');

    const menuItems = [
      { label: 'Discover', icon: ['fas', 'search'], route: 'Discover' },
      { label: 'My Library', icon: ['fas', 'book'], route: 'Library' },
      { label: 'Favorite', icon: ['fas', 'heart'], route: 'Favorite' },
    ];

    const bookCategories = [
      { name: 'Money/Investing', icon: 'chart-line' },
      { name: 'Design', icon: 'paint-brush' },
      { name: 'Business', icon: 'briefcase' },
      { name: 'Self Improvement', icon: 'dumbbell' },
      { name: 'Fiction', icon: 'book' },
      { name: 'Non-Fiction', icon: 'newspaper' },
      { name: 'Sci-fi', icon: 'rocket' },
      { name: 'History', icon: 'hourglass' },
      { name: 'Biography', icon: 'user' },
      { name: 'Mystery', icon: 'search' }
    ];

    onMounted(() => {
      onAuthStateChanged(auth, (userData) => {
        if (userData) {
          user.value = userData;
          fetchUserData();
          fetchBooks();
          console.log('Fetching books...');

        } else {
          router.push({ name: 'Login' });
        }
      });
    });

    const fetchUserData = async () => {
      if (user.value) {
        const userDocRef = doc(db, 'users', user.value.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          user.value = { ...user.value, ...userData };
          firstName.value = userData.firstName || '';
        }
      }
    };

  const fetchBooks = async () => {
  console.log("Starting fetchBooks function");
  const booksQuery = query(collection(db, 'books'));
  console.log("Query created:", booksQuery);
  const querySnapshot = await getDocs(booksQuery);
  console.log("QuerySnapshot received:", querySnapshot);

  recommendedBooks.value = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
    console.log("Processing document:", docSnapshot.id);
    const bookData = docSnapshot.data();
    console.log("Book data:", bookData);

    let coverUrl = '';
    let pdfUrl = '';
    
    if (bookData.coverPath) {
      try {
        const coverRef = ref(storage, bookData.coverPath);
        coverUrl = await getDownloadURL(coverRef);
      } catch (error) {
        console.error('Error fetching cover image:', error);
      }
    }
    
    if (bookData.pdfPath) {
      try {
        const pdfRef = ref(storage, bookData.pdfPath);
        pdfUrl = await getDownloadURL(pdfRef);
      } catch (error) {
        console.error('Error fetching PDF:', error);
        pdfUrl = 'PDF not available';
      }
    }

    return {
      id: docSnapshot.id,
      ...bookData,
      coverUrl,
      pdfUrl
    };
  }));




      //fetch borrowed books
    const borrowedQuery = query(collection(db, 'borrowedBooks'), where('userId', '==', user.value.uid));
    const borrowedSnapshot = await getDocs(borrowedQuery);
    borrowedBooks.value = await Promise.all(borrowedSnapshot.docs.map(async (borrowedDoc) => {
      const bookData = borrowedDoc.data();
      const bookRef = doc(db, 'books', bookData.bookId);
      const bookSnapshot = await getDoc(bookRef);
      const bookDetails = bookSnapshot.exists() ? bookSnapshot.data() : {};
      
      let coverUrl = '';
      let pdfUrl = '';
      
      if (bookDetails.coverPath) {
        try {
          const coverRef = ref(storage, bookDetails.coverPath);
          coverUrl = await getDownloadURL(coverRef);
        } catch (error) {
          console.error('Error fetching cover image for borrowed book:', error);
        }
      }
      
      if (bookDetails.pdfPath) {
        try {
          const pdfRef = ref(storage, bookDetails.pdfPath);
          pdfUrl = await getDownloadURL(pdfRef);
        } catch (error) {
          console.error('Error fetching PDF for borrowed book:', error);
          pdfUrl = 'PDF not available';
        }
      }
      
      return {
        id: borrowedDoc.id,
        ...bookData,
        ...bookDetails,
        coverUrl,
        pdfUrl
      };
    }));
      if (!favoriteBooks.value) favoriteBooks.value = [];

          // Inside fetchBooks function
    const favoriteQuery = query(collection(db, 'favoriteBooks'), where('userId', '==', user.value.uid));
    const favoriteSnapshot = await getDocs(favoriteQuery);
    favoriteBooks.value = await Promise.all(favoriteSnapshot.docs.map(async (doc) => {
      const bookData = doc.data();
      const bookRef = await getDoc(doc(db, 'books', bookData.bookId));
      const bookDetails = bookRef.data();
      let coverUrl = '';
      let pdfUrl = '';
      
      if (bookDetails.coverPath) {
        try {
          const coverRef = ref(storage, bookDetails.coverPath);
          coverUrl = await getDownloadURL(coverRef);
        } catch (error) {
          console.error('Error fetching cover image for favorite book:', error);
        }
      }
      
      if (bookDetails.pdfPath) {
        try {
          const pdfRef = ref(storage, bookDetails.pdfPath);
          pdfUrl = await getDownloadURL(pdfRef);
        } catch (error) {
          console.error('Error fetching PDF:', error);
          pdfUrl = 'PDF not available';
        }
      }
      
      return {
        id: doc.id,
        ...bookDetails,
        coverUrl,
        pdfUrl,
        isFavorite: true
      };
    }));
    };

    const filteredBooks = computed(() => {
      if (!selectedCategory.value) {
        return recommendedBooks.value;
      }
      return recommendedBooks.value.filter(book => book.genre === selectedCategory.value);
    });

    const logout = async () => {
      try {
        await signOut(auth);
        router.push({ name: 'Login' });
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    const search = () => {
      // Implement search logic here
      console.log('Searching for:', searchQuery.value);
    };

    const renewBook = async (book) => {
      try {
        const borrowedBookRef = doc(db, 'borrowedBooks', book.id);
        const newReturnDate = new Date(book.returnDate);
        newReturnDate.setDate(newReturnDate.getDate() + 14); // Extend by 14 days

        await updateDoc(borrowedBookRef, {
          returnDate: newReturnDate.toISOString()
        });

        // Update local state
        borrowedBooks.value = borrowedBooks.value.map(b => 
          b.id === book.id ? { ...b, returnDate: newReturnDate.toISOString() } : b
        );

        console.log('Book renewed successfully');
      } catch (error) {
        console.error('Error renewing book:', error);
      }
    };

    const returnBook = async (book) => {
      try {
        console.log('Starting return process for book:', book);
        await runTransaction(db, async (transaction) => {
          const bookRef = doc(db, 'books', book.bookId);
          const userRef = doc(db, 'users', user.value.uid);
          const borrowedBookRef = doc(db, 'borrowedBooks', book.id);

          console.log('Fetching documents...');
          const bookDoc = await transaction.get(bookRef);
          const userDoc = await transaction.get(userRef);
          const borrowedBookDoc = await transaction.get(borrowedBookRef);

          if (!bookDoc.exists()) {
            throw new Error(`Book document not found: ${book.bookId}`);
          }
          if (!userDoc.exists()) {
            throw new Error(`User document not found: ${user.value.uid}`);
          }
          if (!borrowedBookDoc.exists()) {
            throw new Error(`Borrowed book document not found: ${book.id}`);
          }

          console.log('Updating documents...');
          // Update book availability
          transaction.update(bookRef, { available: true });

          // Remove from borrowedBooks
          transaction.delete(borrowedBookRef);

      // Update user's borrowed books count
      const borrowedBooksCount = Math.max((userDoc.data().borrowedBooksCount || 1) - 1, 0);
      transaction.update(userRef, { borrowedBooksCount: borrowedBooksCount });

      // Add a return log
      const returnLogRef = doc(collection(db, 'borrowLogs'));
      transaction.set(returnLogRef, {
        userId: user.value.uid,
        bookId: book.bookId,
        action: 'returned',
        timestamp: new Date().toISOString()
      });
    });

    console.log('Transaction completed successfully');

    // Update local state
    borrowedBooks.value = borrowedBooks.value.filter(b => b.id !== book.id);
    recommendedBooks.value = recommendedBooks.value.map(b => 
      b.id === book.bookId ? { ...b, available: true } : b
    );

    console.log('Local state updated');
    console.log('Book returned successfully');
  } catch (error) {
    console.error('Error returning book:', error);
    console.error('Error details:', error.stack);
    // You might want to show an error message to the user here
    alert(`Error returning book: ${error.message}`);
  }
};

const borrowBook = async (book) => {
  try {
    await runTransaction(db, async (transaction) => {
      // Perform all reads first
      const bookRef = doc(db, 'books', book.id);
      const userRef = doc(db, 'users', user.value.uid);
      const borrowedBookRef = doc(collection(db, 'borrowedBooks'));

      const bookDoc = await transaction.get(bookRef);
      const userDoc = await transaction.get(userRef);

      // Check if the book is available
      if (!bookDoc.exists() || !bookDoc.data().available) {
        throw new Error('Book is not available');
      }

      const borrowDate = new Date();
          const returnDate = new Date(borrowDate);
          returnDate.setDate(returnDate.getDate() + 14);

      const borrowedBooksCount = (userDoc.data().borrowedBooksCount || 0) + 1;

     // Perform all writes
          transaction.update(bookRef, { available: false });
          transaction.set(borrowedBookRef, {
            userId: user.value.uid,
            bookId: book.id,
            borrowDate: borrowDate.toISOString(),
            returnDate: returnDate.toISOString(),
            title: book.title,
            author: book.author,
            genre: book.genre,
            coverUrl: book.coverUrl,
            pdfUrl: book.pdfUrl
          });
          transaction.update(userRef, { borrowedBooksCount: borrowedBooksCount });

      

      // Add a borrow log
      const borrowLogRef = doc(collection(db, 'borrowLogs'));
      transaction.set(borrowLogRef, {
        userId: user.value.uid,
        bookId: book.id,
        action: 'borrowed',
        timestamp: borrowDate.toISOString()
      });
    });
 // Update the UI
        const borrowedBook = {
          ...book,
          id: doc(collection(db, 'borrowedBooks')).id,
          borrowDate: new Date().toISOString(),
          returnDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString()
        };
        borrowedBooks.value.push(borrowedBook);
        recommendedBooks.value = recommendedBooks.value.map(b => 
          b.id === book.id ? { ...b, available: false } : b
        );

        console.log('Book borrowed successfully');
      } catch (error) {
        console.error('Error borrowing book:', error);
      }
    };

    const openPdf = (book) => {
    console.log('Book object:', book);
    if (book.pdfUrl && book.pdfUrl !== 'PDF not available') {
      console.log('Opening PDF URL:', book.pdfUrl);
      window.open(book.pdfUrl, '_blank');
    } else {
      console.error('PDF URL not available for this book');
      // Show an error message to the user
      alert('Sorry, the PDF for this book is not available.');
    }
  };

const toggleFavorite = async (book) => {
  try {
    const favoriteId = `${user.value.uid}_${book.id}`;
    const favoriteRef = doc(db, 'favoriteBooks', favoriteId);
    const favoriteDoc = await getDoc(favoriteRef);

    if (favoriteDoc.exists()) {
      // If the book is already a favorite, remove it
      await deleteDoc(favoriteRef);
      favoriteBooks.value = favoriteBooks.value.filter(b => b.id !== book.id);
      console.log('Book removed from favorites');
    } else {
      // If the book is not a favorite, add it
      await setDoc(favoriteRef, {
        userId: user.value.uid,
        bookId: book.id,
        addedAt: new Date().toISOString()
      });
      favoriteBooks.value.push({ ...book, isFavorite: true });
      console.log('Book added to favorites');
    }

    // Update the local recommendedBooks state
    recommendedBooks.value = recommendedBooks.value.map(b => 
      b.id === book.id ? { ...b, isFavorite: !b.isFavorite } : b
    );

  } catch (error) {
    console.error('Error toggling favorite:', error);
    if (error.code) console.error('Error code:', error.code);
    if (error.message) console.error('Error message:', error.message);
  }
};



    const sortBooksByCategory = (category) => {
      selectedCategory.value = category;
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString();
    };

    return {
      user,
      firstName,
      menuItems,
      searchQuery,
      bookCategories,
      recommendedBooks,
      borrowedBooks,
      favoriteBooks,
      filteredBooks,
      selectedCategory,
      logout,
      search,
      renewBook,
      returnBook,
      borrowBook,
      toggleFavorite,
      sortBooksByCategory,
      formatDate,
      openPdf
      
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

.app-container {
  display: flex;
  min-height: 150vh;
  min-width: 203vh;
  font-family: 'Poppins', sans-serif;
  background-color: whitesmoke;
  margin-left: 4vh;
  top: 0;
  bottom: 0;
  position: absolute;
}

.sidebar {
  width: 280px;
  background-color: #2c3e50;
  color: white;
  padding: 25px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
}

nav ul li a svg {
  width: 24px;
  height: 24px;
  margin-right: 15px;
}

.logo {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 40px;
}

nav ul {
  list-style-type: none;
  padding: 0;
}

nav ul li {
  margin-bottom: 20px;
}

nav ul li a {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: 18px;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

nav ul li a:hover {
  background-color: #34495e;
}

nav ul li a i {
  margin-right: 15px;
  font-size: 20px;
}

.bottom-menu {
  margin-top: 550px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.bottom-menu a {
  color: white;
  text-decoration: none;
  display: block;
  font-size: 18px;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  margin-bottom: 10px;
}

.bottom-menu a:last-child {
  margin-bottom: 0;
}

.bottom-menu a:hover {
  background-color: #34495e;
}

.bottom-menu a i {
  margin-right: 15px;
  font-size: 20px;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 30px;
  background-color: #ecf0f1;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 32px;
}

.search-bar {
  display: flex;
  align-items: center;
}

.search-bar input,
.search-bar button {
  margin-right: 15px;
  padding: 12px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 16px;
}

.search-bar button {
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-bar button:hover {
  background-color: #2980b9;
}

.user-profile {
  display: flex;
  align-items: center;
}

.user-profile .name {
  margin-right: 15px;
  font-size: 18px;
}

.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
}

.category .fa-icon {
  font-size: 2em;
  margin-bottom: 10px;
}

.book-list,
.category-list,
.borrowed-books,
.favorite-books {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;

}

.book,
.category,
.book-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.book:hover,
.category:hover,
.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.book-cover {
  position: relative;
  width: 100%;
  height: 300px;
  margin-bottom: 15px;
}

.book-cover img {
  width: 100%;
  height: 120%;
  object-fit: cover;
  border-radius: 8px;
}

.favorite-btn {
  display: inline-block;
  padding: 10px 15px;
  margin-top: 10px;
  background-color: #f39c12;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  text-align: center;
  width: 100%;
}

.favorite-btn:hover {
  background-color: #e67e22;
}

.book h3,
.category h3,
.book-card h3 {
  font-size: 20px;
  margin-top: 15px;
}

.book p,
.book-card p {
  font-size: 16px;
  margin-top: 10px;
}

.renew-btn,
.return-btn,
.borrow-btn {
  display: inline-block;
}

.view-books-btn {
  display: inline-block;
  padding: 12px 20px;
  margin-top: 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 16px;
  margin-left: 20px;
}

.renew-btn,
.return-btn,
.borrow-btn {
  display: inline-block;
  padding: 10px 15px;
  margin-top: 15px;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  text-align: center;
  width: calc(50% - 5px);
}

.renew-btn {
  background-color: #3498db;
  display: inline-block;
  padding: 10px 15px;
  margin-top: 15px;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  text-align: center;
  width: 100%;
}

.return-btn {
  background-color: #e74c3c;
  display: inline-block;
  padding: 10px 15px;
  margin-top: 15px;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  text-align: center;
  width: 100%;
}

.borrow-btn {
  background-color: #3498db;
  width: 100%;
}

.renew-btn:hover {
  background-color: #2980b9;
}

.return-btn:hover {
  background-color: #c0392b;
}

.borrow-btn:hover {
  background-color: #2980b9;
}

.read-btn {
  display: inline-block;
  padding: 10px 15px;
  margin-top: 15px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  text-align: center;
  width: 100%;
}

.read-btn:hover {
  background-color: #2ecc71;
}

.close-btn {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close-btn:hover,
.close-btn:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.book-actions {
  display: flex;
  flex-direction: column;
  margin-top: auto;
  width: 60%;
  margin-left: 20%;
}


.book-actions button,
.book-actions a {
  width: 100%;
  margin: 5px 0;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  transition: background-color 0.3s ease;
}


.book-actions .btn-primary,
.book-actions .renew-btn,
.book-actions .return-btn,
.book-actions .read-btn {
  min-width: 100px; /* Set a minimum width for the buttons */
  padding: 10px 0; /* Adjust padding to ensure consistent height */
}

.book-actions .btn-primary {
  margin-left: 0;
}

.book-actions .return-btn {
  margin-right: 0;
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    margin-bottom: 20px;
  }

  .main-content {
    margin-left: 0;
    padding: 20px;
  }

  .bottom-menu {
    margin-top: 80px;
  }
}



</style>

