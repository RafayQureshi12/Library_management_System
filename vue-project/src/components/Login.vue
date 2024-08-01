<template>
  <div class="container">
    <ErrorPopup :show="showError" :message="errorMessage" />
    <div id="background" class="full-screen"></div>
    <transition name="slide-fade" mode="out-in">
      <div :key="currentView" class="card-container">
        <!-- User Login Side -->
        <div v-if="currentView === 'user'" class="card-face">
          <img :src="logo" alt="Logo" class="logo" />
          <h2>User Login</h2>
          <form @submit.prevent="login('user')">
            <div>
              <label for="email">Email:</label>
              <input type="email" id="email" v-model="email" required />
            </div>
            <div>
              <label for="password">Password:</label>
              <input
                type="password"
                id="password"
                v-model="password"
                @keydown="checkCapsLock"
                @keyup="checkCapsLock"
                required
              />
              <p v-if="capsLockOn" class="caps-lock-warning">Caps Lock is ON</p>
            </div>
            <button type="submit">Login</button>
          </form>
          <button @click="changeView('admin')">Admin Portal</button>
          <button @click="changeView('signup')">Sign Up</button>
        </div>
        <!-- Admin Login Side -->
        <div v-if="currentView === 'admin'" class="card-face">
          <img :src="logo" alt="Logo" class="logo" />
          <h2>Admin Login</h2>
          <form @submit.prevent="login('admin')">
            <div>
              <label for="admin-email">Email:</label>
              <input type="email" id="admin-email" v-model="email" required />
            </div>
            <div>
              <label for="admin-password">Password:</label>
              <input
                type="password"
                id="admin-password"
                v-model="password"
                @keydown="checkCapsLock"
                @keyup="checkCapsLock"
                required
              />
              <p v-if="capsLockOn" class="caps-lock-warning">Caps Lock is ON</p>
            </div>
            <button type="submit">Login</button>
          </form>
          <button @click="changeView('user')">User Portal</button>
          <button @click="changeView('signup')">Sign Up</button>
        </div>
        <!-- Sign-Up Side -->
        <div v-if="currentView === 'signup'" class="card-face">
          <img :src="logo" alt="Logo" class="logo" />
          <h2>Sign Up</h2>
          <form @submit.prevent="signup">
            <div>
              <label for="signup-username">Username:</label>
              <input type="username" id="signup-username" v-model="username" required />
            </div>
            <div>
              <label for="signup-email">Email:</label>
              <input type="email" id="signup-email" v-model="email" required />
            </div>
            <div>
              <label for="signup-password">Password:</label>
              <input
                type="password"
                id="signup-password"
                v-model="password"
                @keydown="checkCapsLock"
                @keyup="checkCapsLock"
                required
              />
              <p v-if="capsLockOn" class="caps-lock-warning">Caps Lock is ON</p>
            </div>
            <div>
              <label for="confirm-password">Confirm Password:</label>
              <input
                type="password"
                id="confirm-password"
                v-model="confirmPassword"
                @keydown="checkCapsLock"
                @keyup="checkCapsLock"
                required
              />
              <p v-if="capsLockOn" class="caps-lock-warning">Caps Lock is ON</p>
            </div>
            <button type="submit">Sign Up</button>
          </form>
          <button @click="changeView('user')">User Portal</button>
          <button @click="changeView('admin')">Admin Portal</button>
        </div>
      </div>
    </transition>
  </div>
</template>




<script>
import lottie from 'lottie-web';
import adminAnimation from '@/assets/background.json';
import userAnimation from '@/assets/mainbg.json';
import signupAnimation from '@/assets/mainbg.json';
import ErrorPopup from './Errorpopup.vue';
import logo from '@/assets/logo.png';
import { auth, db } from '@/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default {
  name: 'Login',
  components: {
    ErrorPopup,
  },
  data() {
    return {
      username:'',
      email: '',
      password: '',
      confirmPassword: '',
      currentAnimation: null,
      showError: false,
      errorMessage: '',
      logo,
      currentView: 'user',
      capsLockOn: false,
      validAdminEmails: ['21020@admin.com'], // Add valid admin emails here
    };
  },
  methods: {
    changeView(to) {
      this.currentView = to;
      if (to === 'admin') {
        this.setBackground(adminAnimation);
      } else if (to === 'user') {
        this.setBackground(userAnimation);
      } else if (to === 'signup') {
        this.setBackground(signupAnimation);
      }
    },
    setBackground(animationData) {
      if (this.currentAnimation) {
        this.currentAnimation.destroy();
      }
      this.currentAnimation = lottie.loadAnimation({
        container: document.getElementById('background'),
        animationData: animationData,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      });
    },
    async login(role) {
      try {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        // Check user role in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData) {
          if (role === 'admin') {
            // Check if email is in the list of valid admin emails
            if (!this.validAdminEmails.includes(this.email)) {
              throw new Error('Invalid admin email');
            }
            this.$router.push({ name: 'AdminDashboard' });
          } else if (userData.role === 'user') {
            this.$router.push({ name: 'UserDashboard' });
          } else {
            throw new Error('Invalid role for this user');
          }
        } else {
          throw new Error('User data not found');
        }
      } catch (error) {
        this.showError = true;
        this.errorMessage = error.message;
        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    },
    async signup() {
      if (this.password !== this.confirmPassword) {
        this.showError = true;
        this.errorMessage = 'Passwords do not match';
        setTimeout(() => {
          this.showError = false;
        }, 3000);
        return;
      }

      try {
        // Create user with Firebase Auth
        console.log('Starting signup process');

        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        console.log('User created:', user.uid);

        

        // Store additional user info in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          username: this.username,
          email: this.email,
          role: 'user', // Default role
        });

        alert('Sign-up successful!');
        this.changeView('user');
      } catch (error) {
        this.showError = true;
        this.errorMessage = error.message;
        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    },
    checkCapsLock(event) {
      if (event.getModifierState) {
        this.capsLockOn = event.getModifierState('CapsLock');
      }
    },
  },
  mounted() {
    this.setBackground(userAnimation); // Default background
  },
};
</script>



<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
  flex: 1;
}

#background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  flex: 1;
}

.card-container {
  width: 550px;
  position: relative;
  z-index: 1;
}

.card-face {
  width: 100%;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade
-enter-from, .slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

button {
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 25px;
  margin-left: 10px;
  cursor: pointer;
  border: none;
  background-color: #4a5568;
  color: white;
  transition: background-color 0.3s, transform 0.3s;
}

button:hover {
  background-color: #2d3748;
  transform: translateY(-2px);
}

input {
  width: 90%;
  padding: 12px;
  margin: 10px 0;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 18px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.caps-lock-warning {
  color: #ff6b6b;
  font-size: 0.9em, bold;
  margin-top: 8px;
  margin-bottom: 8px;
  font-weight: bold;
}

input:focus {
  outline: none;
  border-color: #4a5568;
  box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.2);
}

form {
  width: 100%;
}

h2 {
  margin-bottom: 20px;
  font-size: 28px;
  color: #2d3748;
}

.logo {
  width: 100px;
  margin-bottom: 20px;
  border-radius: 50px;
}
</style>
@/assets/firebaseConfig