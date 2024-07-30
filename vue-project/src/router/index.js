import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import UserDashboard from '../views/UserDashboard.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import AdminSettings from '../views/AdminSettings.vue';
import UserSettings from '../views/UserSettings.vue';


import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/user-dashboard',
    component: UserDashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'UserDashboard',
        redirect: { name: 'Discover' },
      },
      {
        path: 'discover',
        name: 'Discover',
        component: UserDashboard,
      },
      {
        path: 'library',
        name: 'Library',
        component: UserDashboard,
      },
      {
        path: 'favorite',
        name: 'Favorite',
        component: UserDashboard,
      },
    ],
  },
  {
    path: '/usersettings',
    name: 'UserSettings',
    component: UserSettings,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/adminsettings',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (requiresAuth && !user) {
        next('/');
      } else if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (requiresAdmin && userData.role !== 'admin') {
          next('/user-dashboard');
        } else if (to.path === '/' && to.name !== 'Login') {
          // Only redirect if the user is not explicitly trying to access the login page
          if (userData.role === 'admin') {
            next('/admin-dashboard');
          } else {
            next('/user-dashboard');
          }
        } else {
          next();
        }
      } else {
        next();
      }
      resolve();
      unsubscribe();
    });
  });
});

export default router;