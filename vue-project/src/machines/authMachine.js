import { createMachine, assign } from 'xstate';
import { auth, db } from '@/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const authMachine = createMachine({
  id: 'auth',
  initial: 'idle',
  context: {
    user: null,
    error: null,
  },
  states: {
    idle: {
      on: {
        LOGIN: 'loggingIn',
        SIGNUP: 'signingUp',
      },
    },
    loggingIn: {
      invoke: {
        src: (_, event) => login(event.email, event.password, event.role),
        onDone: {
          target: 'authenticated',
          actions: assign({ user: (_, event) => event.data, error: null }),
        },
        onError: {
          target: 'error',
          actions: assign({ error: (_, event) => event.data?.message || 'An error occurred' }),
        },
      },
    },
    signingUp: {
      invoke: {
        src: (_, event) => signup(event.username, event.email, event.password),
        onDone: {
          target: 'authenticated',
          actions: assign({ user: (_, event) => event.data, error: null }),
        },
        onError: {
          target: 'error',
          actions: assign({ error: (_, event) => event.data?.message || 'An error occurred' }),
        },
      },
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: 'idle',
          actions: assign({ user: null, error: null }),
        },
      },
    },
    error: {
      on: {
        LOGIN: 'loggingIn',
        SIGNUP: 'signingUp',
      },
    },
  },
});

async function login(email, password, role) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    if (userData) {
      if (role === 'admin' && !['21020@admin.com'].includes(email)) {
        throw new Error('Invalid admin email');
      } else if (userData.role === 'user' && role !== 'user') {
        throw new Error('Invalid role for this user');
      }
      return { ...userData, uid: user.uid };
    } else {
      throw new Error('User data not found');
    }
  } catch (error) {
    throw error;
  }
}

async function signup(username, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userData = { username, email, role: 'user' };
    await setDoc(doc(db, 'users', user.uid), userData);
    return { ...userData, uid: user.uid };
  } catch (error) {
    throw error;
  }
}