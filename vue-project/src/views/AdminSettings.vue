<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="logo">
        <img :src="logo" alt="THE BOOKS Logo" />
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
    <div class="settings-container">
      <div class="settings">
        <header class="header">
          <h1>Settings</h1>
        </header>
        <div class="settings-content">
          <section class="admin-management">
            <h2>Admin Management</h2>
            <form @submit.prevent="addAdmin">
              <div class="form-group">
                <input v-model="newAdmin.username" placeholder="Username" required />
              </div>
              <div class="form-group">
                <input v-model="newAdmin.password" type="password" placeholder="Password" required />
              </div>
              <button type="submit" class="btn btn-primary">Add Admin</button>
            </form>
          </section>
          <section class="password-change">
            <h2>Change Password</h2>
            <form @submit.prevent="changePassword">
              <div class="form-group">
                <input v-model="currentPassword" type="password" placeholder="Current Password" required />
              </div>
              <div class="form-group">
                <input v-model="newPassword" type="password" placeholder="New Password" required />
              </div>
              <button type="submit" class="btn btn-primary">Change Password</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { db } from '@/firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import logo from '@/assets/logo.png';

export default {
  name: 'Settings',
  setup() {
    const newAdmin = ref({ username: '', password: '' });
    const currentPassword = ref('');
    const newPassword = ref('');

    const hashPassword = async (password) => {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    };

    const addAdmin = async () => {
      try {
        const hashedPassword = await hashPassword(newAdmin.value.password);
        await addDoc(collection(db, 'admins'), {
          username: newAdmin.value.username,
          password: hashedPassword
        });
        alert('Admin added: ' + newAdmin.value.username);
        newAdmin.value = { username: '', password: '' };
      } catch (error) {
        console.error('Error adding admin: ', error);
        alert('Failed to add admin');
      }
    };

    const changePassword = async () => {
      try {
        // Assume currentAdminUsername is stored in your app state
        const currentAdminUsername = 'currentAdminUsername';
        
        const adminQuery = query(collection(db, 'admins'), where('username', '==', currentAdminUsername));
        const querySnapshot = await getDocs(adminQuery);
        
        if (!querySnapshot.empty) {
          const adminDoc = querySnapshot.docs[0];
          const storedHash = adminDoc.data().password;
          
          const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword.value, storedHash);
          
          if (isCurrentPasswordCorrect) {
            const newHashedPassword = await hashPassword(newPassword.value);
            await updateDoc(adminDoc.ref, {
              password: newHashedPassword
            });
            alert('Password changed successfully');
            currentPassword.value = '';
            newPassword.value = '';
          } else {
            alert('Current password is incorrect');
          }
        } else {
          alert('Admin not found');
        }
      } catch (error) {
        console.error('Error changing password: ', error);
        alert('Failed to change password');
      }
    };

    return {
      newAdmin,
      currentPassword,
      newPassword,
      logo,
      addAdmin,
      changePassword
    };
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  min-width: 200vh;
  font-family: 'Poppins', sans-serif;
  background-color: whitesmoke;
  margin-left: 300px;
  top: 0;
  bottom: 0;
  position: fixed;
}

.sidebar {
  width: 280px;
  background-color: #2c3e50;
  padding: 25px;
  color: #ecf0f1;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
}

.logo img {
  max-width: 100%;
}

nav ul {
  list-style-type: none;
  padding: 0;
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
  margin-top: 500px;
  display: flex;
  flex-direction: column;
}

.settings-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.settings {
  max-width: 100vh;
  margin: 2rem;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 300;
}

.settings-content {
  display: flex;
  grid-template-columns: 1fr;
  gap: 3rem;
}

section {
  background-color: #f0f4f8;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  width: 450px;
  height: 350px;
}

section:hover {
  transform: translateY(-5px);
}

h2 {
  color: #3498db;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.form-group {
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

button {
  width: 80%;
  padding: 0.75rem;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-top: 30px;
  background-color: #3498db;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
}

@media (max-width: 600px) {
  .settings-content {
    grid-template-columns: 1fr;
  }
}
</style>@/assets/firebaseConfig