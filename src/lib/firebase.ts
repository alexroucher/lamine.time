import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  setDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  type User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDd1Rj4hCNaPz04FXGVNPjq-wff6xeN6ME",
  authDomain: "lamine-time.firebaseapp.com",
  projectId: "lamine-time",
  storageBucket: "lamine-time.firebasestorage.app",
  messagingSenderId: "2004704224",
  appId: "1:2004704224:web:cf7aafcf537ccce04b2985",
  clientId: "2004704224-86q21s72ke7g0gsbmg1vvl282m0s5hv5.apps.googleusercontent.com"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const COLLECTIONS = {
  USERS: 'users',
  EMPLOYEES: 'employees',
  CLIENTS: 'clients',
  TIME_ENTRIES: 'timeEntries'
} as const;

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: 'lamine-rh.fr'
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    if (!user.email?.endsWith('@lamine-rh.fr')) {
      await signOut(auth);
      throw new Error('Seuls les utilisateurs @lamine-rh.fr sont autorisés');
    }

    // Create or update employee record
    const employeeData = {
      name: user.displayName || 'Sans nom',
      email: user.email,
      photoURL: user.photoURL,
      title: 'Consultant RH', // Default title
      lastLogin: new Date().toISOString()
    };

    // Check if employee already exists
    const employeesRef = collection(db, COLLECTIONS.EMPLOYEES);
    const q = query(employeesRef, where("email", "==", user.email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new employee
      await addDoc(employeesRef, employeeData);
    } else {
      // Update existing employee
      const employeeDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, COLLECTIONS.EMPLOYEES, employeeDoc.id), {
        lastLogin: employeeData.lastLogin,
        photoURL: employeeData.photoURL,
        name: employeeData.name
      });
    }

    return user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Le popup de connexion a été bloqué. Veuillez autoriser les popups pour ce site.');
    }
    throw error;
  }
};

export const signOutUser = () => signOut(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCollection = (collectionName: string) => collection(db, collectionName);

export const addDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error: any) {
    console.error("Error adding document:", error);
    throw new Error(error.message || "Erreur lors de l'ajout du document");
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { id, ...data };
  } catch (error: any) {
    console.error("Error updating document:", error);
    throw new Error(error.message || "Erreur lors de la mise à jour du document");
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return id;
  } catch (error: any) {
    console.error("Error deleting document:", error);
    throw new Error(error.message || "Erreur lors de la suppression du document");
  }
};

export const getAllDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error("Error getting documents:", error);
    throw new Error(error.message || "Erreur lors de la récupération des documents");
  }
};