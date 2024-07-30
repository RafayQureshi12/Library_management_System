    // src/firebaseConfig.js
    import { initializeApp } from 'firebase/app';
    import { getAuth } from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore';
    import { getStorage } from 'firebase/storage';

    const firebaseConfig = {
        apiKey: "AIzaSyAB2I16_4EMIFTiJrlhCJyvumJOl-ynids",
        authDomain: "library-management-c04b4.firebaseapp.com",
        projectId: "library-management-c04b4",
        storageBucket: "library-management-c04b4.appspot.com",
        messagingSenderId: "1013884053879",
        appId: "1:1013884053879:web:a00bfe42a919e71f129972",
        measurementId: "G-NTJW2QT8KJ"
      };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    export { app, auth, db, storage, firebaseConfig, getFirestore  };