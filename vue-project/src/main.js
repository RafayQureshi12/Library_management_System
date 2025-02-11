import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from './firebaseConfig'
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  faChartLine, 
  faPaintBrush, 
  faBriefcase, 
  faDumbbell, 
  faBook, 
  faNewspaper, 
  faRocket,
  faMagnifyingGlass, 
  faPerson,
  faHourglass,
  faSearch,
  faHeart,
  faLandmark,
  faFlask
} from '@fortawesome/free-solid-svg-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app as firebaseApp } from './firebaseConfig';
import { initializeFirestore } from './fireStoreConfig';

initializeFirestore();

// Add FontAwesome icons
library.add(faLandmark, faFlask, faChartLine, faPaintBrush, faBriefcase, faDumbbell, faBook, faNewspaper, faRocket, faMagnifyingGlass, faPerson, faHourglass, faSearch, faHeart);

initializeApp(firebaseConfig)

const createMyApp = () => {
  const app = createApp(App);

  // Use Vue Router
  app.use(router);
  app.provide('router', router)

  // Register FontAwesome component
  app.component('font-awesome-icon', FontAwesomeIcon);

  return app;
};

// Check if user is authenticated before mounting the app
const auth = getAuth(firebaseApp);
onAuthStateChanged(auth, user => {
  const app = createMyApp();
  if (user) {
    app.mount('#app');
  } else {
    console.warn('No user is signed in');
    // Optionally, you could redirect to a login page here
    app.mount('#app');
  }
});

export { createMyApp };