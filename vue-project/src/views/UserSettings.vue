<template>

  <div class="settings-container">
    <div class="settings-card">
      <h1 class="settings-title">Change Password</h1>
     <form @submit.prevent="changePassword" class="password-form">
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <div class="input-group">
            <input 
              :type="showCurrentPassword ? 'text' : 'password'" 
              id="currentPassword" 
              v-model="currentPassword" 
              required
            >
            <button type="button" @click="showCurrentPassword = !showCurrentPassword" class="toggle-password">
              <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <div class="input-group">
            <input 
              :type="showNewPassword ? 'text' : 'password'" 
              id="newPassword" 
              v-model="newPassword" 
              required
            >
            <button type="button" @click="showNewPassword = !showNewPassword" class="toggle-password">
              <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <button type="submit" class="submit-btn">Update Password</button>
      </form>      
    </div>

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
          <i class="fas fa-cog"></i> Settings
        </router-link>
        <a href="#" @click="logout">
          <i class="fas fa-sign-out-alt"></i> Log out
        </a>
      </div>
    </aside>
  </div>
  
</template>

<script>
import { ref } from 'vue';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'UserSettings',
  setup() {
    const auth = getAuth();
    const router = useRouter();

    const currentPassword = ref('');
    const newPassword = ref('');
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');

    const menuItems = [
      { label: 'Discover', icon: ['fas', 'search'], route: 'Discover' },
      { label: 'My Library', icon: ['fas', 'book'], route: 'Library' },
      { label: 'Favorite', icon: ['fas', 'heart'], route: 'Favorite' },
    ];

    const changePassword = async () => {
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user is currently signed in');
        }

        // Re-authenticate the user
        const credential = EmailAuthProvider.credential(user.email, currentPassword.value);
        await reauthenticateWithCredential(user, credential);

        // Update the password
        await updatePassword(user, newPassword.value);

        successMessage.value = 'Password changed successfully!';
        currentPassword.value = '';
        newPassword.value = '';
      } catch (error) {
        console.error('Error changing password:', error);
        errorMessage.value = error.message;
      }
    };

    const logout = async () => {
      try {
        await auth.signOut();
        router.push({ name: 'Login' }); // Adjust the route name as needed
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    return {
      currentPassword,
      newPassword,
      showCurrentPassword,
      showNewPassword,
      menuItems,
      changePassword,
      logout,
      errorMessage,
      successMessage
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

.settings-container {
  display: flex;
  justify-content: center; /* Changed from flex-end to flex-start */
  align-items: center;
  min-width: 208vh;
  min-height: 100vh;
  background-color: whitesmoke;
  font-family: 'Poppins', sans-serif;
  position: fixed;
  top: 0;
  bottom: 0;
  
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
}

.bottom-menu a {
  color: white;
  text-decoration: none;
  display: block;
  font-size: 18px;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  
}

.bottom-menu a:last-child {
  margin-bottom: 20;
}

.bottom-menu a:hover {
  background-color: #34495e;
}

.bottom-menu a i {
  margin-right: 15px;
  font-size: 20px;
}

.settings-card {
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  transition: transform 0.3s ease;
  margin-left: 320px; /* Changed from margin-right to margin-left */
  margin-top: 50px;
}

.settings-card:hover {
  transform: translateY(-5px);
}

.settings-title {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
}

.password-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 500;
}

.input-group {
  position: relative;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #7f8c8d;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #3498db;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.error-message {
  color: #e74c3c;
  margin-top: 1rem;
}

.success-message {
  color: #2ecc71;
  margin-top: 1rem;
}

@media (max-width: 750px) {
  .settings-container {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    margin-bottom: 20px;
  }

  .settings-card {
    margin-left: 0;
    margin-top: 20px;
  }

  .bottom-menu {
    margin-top: 20px;
  }
}
</style>
