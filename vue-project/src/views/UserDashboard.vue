<template>
  <div class="app-container" v-if="('userDashboard')">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <img :src="logo" alt="Logo" />
      </div>
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
          <input
            type="text"
            v-model="searchQuery"
            @input="search"
            placeholder="Find the book you like..."
          />
          <button @click="search">Search</button>
        </div>

        <!-- User Profile -->
        <div class="user-profile">
          <span>{{ username }}</span>
          <font-awesome-icon icon="bell" class="icon-notification" />
        </div>
      </header>

      <!-- Dynamic Content based on route -->
      <div v-if="$route.name === 'Discover'">
        <!-- Book Categories -->
        <section class="book-categories">
          <h2>Book Categories</h2>
          <div class="category-list">
            <div
              v-for="category in bookCategories"
              :key="category.name"
              class="category"
              @click="sortBooksByCategory(category.name)"
            >
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
                <button
                  v-if="book.available"
                  @click="borrowBook(book)"
                  class="borrow-btn"
                >
                  Borrow
                </button>
                <button class="borrow-btn" disabled v-else>
                  Not Available
                </button>
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
                  Remove from Favorites
                </button>
              </div>
              <h3>{{ book.title }}</h3>
              <p>{{ book.author }}</p>
              <div class="book-actions">
                <button
                  v-if="book.available"
                  @click="borrowBook(book)"
                  class="borrow-btn"
                >
                  Borrow
                </button>
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
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  runTransaction
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  getDownloadURL
} from 'firebase/storage';
import {
  ref as vueRef,
  onMounted,
  computed
} from 'vue';
import {
  useRouter
} from 'vue-router';
import logo from '@/assets/logo.png';
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome';
import {
  library
} from '@fortawesome/fontawesome-svg-core';
import {
  faSearch,
  faBook,
  faBell,
  faCog,
  faSignOutAlt,
  faChartLine,
  faPaintBrush,
  faBriefcase,
  faDumbbell,
  faNewspaper,
  faRocket,
  faHourglass,
  faUser,
  faSearch as faSearchIcon
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faSearch,
  faBook,
  faBell,
  faCog,
  faSignOutAlt,
  faChartLine,
  faPaintBrush,
  faBriefcase,
  faDumbbell,
  faNewspaper,
  faRocket,
  faHourglass,
  faUser,
  faSearchIcon
);

export default {
  name: 'UserDashboard',
  components: {
    FontAwesomeIcon,
  },
  setup() {
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();
    const router = useRouter();
    
    const username = vueRef('');
    const user = vueRef(null);
    const recommendedBooks = vueRef([]);
    const borrowedBooks = vueRef([]);
    const favoriteBooks = vueRef([]);
    const searchQuery = vueRef('');
    const selectedCategory = vueRef('');

    const menuItems = [{
        label: 'Discover',
        icon: ['fas', 'search'],
        route: 'Discover'
      },
      {
        label: 'My Library',
        icon: ['fas', 'book'],
        route: 'Library'
      },
      {
        label: 'Favorite',
        icon: ['fas', 'heart'],
        route: 'Favorite'
      },
    ];

    const bookCategories = [{
        name: 'Money/Investing',
        icon: 'chart-line'
      },
      {
        name: 'Design',
        icon: 'paint-brush'
      },
      {
        name: 'Business',
        icon: 'briefcase'
      },
      {
        name: 'Self Improvement',
        icon: 'dumbbell'
      },
      {
        name: 'Fiction',
        icon: 'book'
      },
      {
        name: 'Non-Fiction',
        icon: 'newspaper'
      },
      {
        name: 'Sci-fi',
        icon: 'rocket'
      },
      {
        name: 'History',
        icon: 'hourglass'
      },
      {
        name: 'Biography',
        icon: 'user'
      },
      {
        name: 'Mystery',
        icon: 'search'
      }
    ];

    onMounted(() => {
      onAuthStateChanged(auth, (userData) => {
        if (userData) {
          user.value = userData;
          fetchUserData();
          fetchBooks();
        } else {
          router.push({
            name: 'Login'
          });
        }
      });
    });

    const fetchUserData = async () => {
      const userRef = doc(db, 'users', user.value.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        username.value = userDoc.data().username || user.value.email;
      }
    };

    const fetchBooks = async () => {
      try {
        const bookCollection = collection(db, 'books');
        const bookQuerySnapshot = await getDocs(bookCollection);

        recommendedBooks.value = await Promise.all(
          bookQuerySnapshot.docs.map(async (docSnapshot) => {
            const bookData = docSnapshot.data();
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
              }
            }

            return {
              id: docSnapshot.id,
              ...bookData,
              coverUrl,
              pdfUrl,
              isFavorite: false,
            };
          })
        );
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    const filteredBooks = computed(() => {
      return recommendedBooks.value.filter((book) => {
        return (
          (!selectedCategory.value ||
            book.category === selectedCategory.value) &&
          (searchQuery.value === '' ||
            book.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
        );
      });
    });

    const search = () => {
      filteredBooks.value;
    };

    const logout = async () => {
      try {
        await signOut(auth);
        router.push({
          name: 'Login'
        });
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

    const borrowBook = async (book) => {
      try {
        send('BORROW_BOOK');
        const bookRef = doc(db, 'books', book.id);
        const userRef = doc(db, 'users', user.value.uid);

        await runTransaction(db, async (transaction) => {
          const bookDoc = await transaction.get(bookRef);
          const userDoc = await transaction.get(userRef);

          if (!bookDoc.exists) {
            throw 'Book does not exist!';
          }

          if (!userDoc.exists) {
            throw 'User does not exist!';
          }

          const borrowedBooksCount = userDoc.data().borrowedBooksCount || 0;

          if (borrowedBooksCount >= 5) {
            throw 'You cannot borrow more than 5 books at a time.';
          }

          const bookData = bookDoc.data();

          if (!bookData.available) {
            throw 'This book is currently not available.';
          }

          transaction.update(bookRef, {
            available: false
          });

          const borrowedBookRef = doc(collection(db, 'borrowedBooks'));
          transaction.set(borrowedBookRef, {
            userId: user.value.uid,
            bookId: book.id,
            borrowDate: new Date().toISOString(),
            returnDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
            title: book.title,
            author: book.author,
            coverPath: book.coverPath,
            pdfPath: book.pdfPath,
          });
          transaction.update(userRef, {
            borrowedBooksCount: borrowedBooksCount + 1
          });

          // Add a borrow log
          const borrowLogRef = doc(collection(db, 'borrowLogs'));
          transaction.set(borrowLogRef, {
            userId: user.value.uid,
            bookId: book.id,
            action: 'borrowed',
            timestamp: new Date().toISOString(),
          });
        });

        console.log('Book borrowed successfully');

        // Update local state
        recommendedBooks.value = recommendedBooks.value.map((b) =>
          b.id === book.id ? {
            ...b,
            available: false
          } : b
        );
        borrowedBooks.value.push({
          id: book.id,
          ...book,
          borrowDate: new Date().toISOString(),
          returnDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
        });

        send({
          type: 'SUCCESS'
        });
      } catch (error) {
        console.error('Error borrowing book:', error);
        send({
          type: 'FAILURE'
        });

        // You might want to show an error message to the user here
        alert(`Error borrowing book: ${error.message}`);
      }
    };

    const renewBook = async (book) => {
      try {
        send('RENEW_BOOK');
        const borrowedBookRef = doc(db, 'borrowedBooks', book.id);
        const bookRef = doc(db, 'books', book.id);
        const newReturnDate = new Date(
          new Date(book.returnDate).setDate(new Date(book.returnDate).getDate() + 14)
        ).toISOString();

        await updateDoc(borrowedBookRef, {
          returnDate: newReturnDate
        });

        await updateDoc(bookRef, {
          available: false
        });

        // Update local state
        borrowedBooks.value = borrowedBooks.value.map((b) =>
          b.id === book.id ? {
            ...b,
            returnDate: newReturnDate
          } : b
        );

        send({
          type: 'SUCCESS'
        });
      } catch (error) {
        console.error('Error renewing book:', error);
        send({
          type: 'FAILURE'
        });

        // You might want to show an error message to the user here
        alert(`Error renewing book: ${error.message}`);
      }
    };

    const returnBook = async (book) => {
      try {
        send('RETURN_BOOK');
        const bookRef = doc(db, 'books', book.id);
        const borrowedBookRef = doc(db, 'borrowedBooks', book.id);
        const userRef = doc(db, 'users', user.value.uid);

        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);

          if (!userDoc.exists) {
            throw 'User does not exist!';
          }

          const borrowedBooksCount = userDoc.data().borrowedBooksCount || 0;

          transaction.update(bookRef, {
            available: true
          });

          transaction.delete(borrowedBookRef);
          transaction.update(userRef, {
            borrowedBooksCount: borrowedBooksCount - 1
          });

          // Add a return log
          const returnLogRef = doc(collection(db, 'borrowLogs'));
          transaction.set(returnLogRef, {
            userId: user.value.uid,
            bookId: book.id,
            action: 'returned',
            timestamp: new Date().toISOString(),
          });
        });

        console.log('Book returned successfully');

        // Update local state
        borrowedBooks.value = borrowedBooks.value.filter((b) => b.id !== book.id);
        recommendedBooks.value = recommendedBooks.value.map((b) =>
          b.id === book.id ? {
            ...b,
            available: true
          } : b
        );

        send({
          type: 'SUCCESS'
        });
      } catch (error) {
        console.error('Error returning book:', error);
        send({
          type: 'FAILURE'
        });

        // You might want to show an error message to the user here
        alert(`Error returning book: ${error.message}`);
      }
    };

    const toggleFavorite = async (book) => {
      try {
        send('TOGGLE_FAVORITE');
        const userRef = doc(db, 'users', user.value.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          throw new Error('User document does not exist');
        }

        const favoriteBooks = userDoc.data().favoriteBooks || [];
        let updatedFavorites;

        if (book.isFavorite) {
          // Remove from favorites
          updatedFavorites = favoriteBooks.filter((id) => id !== book.id);
        } else {
          // Add to favorites
          updatedFavorites = [...favoriteBooks, book.id];
        }

        await updateDoc(userRef, {
          favoriteBooks: updatedFavorites
        });

        // Update local state
        favoriteBooks.value = await Promise.all(
          updatedFavorites.map(async (bookId) => {
            const bookRef = await getDoc(doc(db, 'books', bookId));
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
                console.error('Error fetching PDF for favorite book:', error);
                pdfUrl = 'PDF not available';
              }
            }

            return {
              id: bookRef.id,
              ...bookDetails,
              coverUrl,
              pdfUrl,
              isFavorite: true,
            };
          })
        );

        send({
          type: 'SUCCESS'
        });
      } catch (error) {
        console.error('Error toggling favorite book:', error);
        send({
          type: 'FAILURE'
        });

        // Show an error message to the user here
        alert(`Error toggling favorite book: ${error.message}`);
      }
    };

    const openPdf = (book) => {
      if (book.pdfUrl) {
        window.open(book.pdfUrl, '_blank');
      } else {
        alert('PDF is not available for this book.');
      }
    };

    const sortBooksByCategory = (category) => {
      selectedCategory.value = category;
    };

    const formatDate = (dateString) => {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return {
      username,
      menuItems,
      bookCategories,
      filteredBooks,
      borrowedBooks,
      favoriteBooks,
      searchQuery,
      selectedCategory,
      search,
      logout,
      borrowBook,
      renewBook,
      returnBook,
      toggleFavorite,
      openPdf,
      sortBooksByCategory,
      formatDate,
      logo,
    };
  },
};
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

.app-container {
  display: flex;
  min-height: 160vh;
  min-width: 250vh;
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
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #3498db;
  
}

.logo img {
  max-width: 100%;
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
  margin-top: 400px;
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
  gap: 10px;
}

.user-profile span {
  font-weight: bolder;
  font-size: 18px;
  
}

.icon-notification {
  font-size: 1.2em;
  color: #34495e;
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

