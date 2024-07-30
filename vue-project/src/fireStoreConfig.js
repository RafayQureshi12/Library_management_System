import { enableIndexedDbPersistence } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const initializeFirestore = () => {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.log('Persistence failed: Multiple tabs open');
      } else if (err.code == 'unimplemented') {
        console.log('Persistence is not valid: Browser not supported');
      }
    });
};