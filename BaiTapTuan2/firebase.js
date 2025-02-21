import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updatePassword } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyA4i0WYni-8SsrFLnoCfFhGXpcoZ0q7t8M",
  authDomain: "thongtincanhan-f7228.firebaseapp.com",
  projectId: "thongtincanhan-f7228",
  storageBucket: "thongtincanhan-f7228.appspot.com",
  messagingSenderId: "1020968904866",
  appId: "1:1020968904866:web:93cd8f3a8880e98f904ffb"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Auth với AsyncStorage để lưu trữ trạng thái xác thực
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updatePassword };
