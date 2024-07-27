import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {

    apiKey: "AIzaSyAhRKPnNDQYMyFSBolYqDOdtUKyl8tqrl8",
  
    authDomain: "react-task6.firebaseapp.com",
  
    projectId: "react-task6",
  
    storageBucket: "react-task6.appspot.com",
  
    messagingSenderId: "968322612960",
  
    appId: "1:968322612960:web:61a1f660fb7d13d796da85",
  
    measurementId: "G-3Z6B13Y9CC"
  
  };
  

  const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };