import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword
} from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
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

// Khởi tạo Firebase Realtime Database và Storage
const database = getDatabase(app);
const storage = getStorage(app);

// Hàm cập nhật thông tin người dùng vào Firebase Realtime Database
const updateUserData = async (userId, data) => {
  try {
    await set(ref(database, `users/${userId}`), data);
    console.log('Thông tin người dùng đã được cập nhật');
  } catch (error) {
    console.error('Lỗi cập nhật thông tin người dùng:', error);
    throw error;
  }
};

// Hàm lấy thông tin người dùng từ Firebase Realtime Database
const getUserData = async (userId) => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Trả về đối tượng người dùng mặc định nếu không có dữ liệu
      return {
        dob: '',
        phone: '',
        address: '',
        avatar: null
      };
    }
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    throw error;
  }
};

// Hàm upload avatar lên Firebase Storage và lấy URL ảnh
const uploadAvatar = async (userId, file) => {
  try {
    const avatarRef = storageRef(storage, `avatars/${userId}`);
    await uploadBytes(avatarRef, file); // Upload ảnh
    const downloadURL = await getDownloadURL(avatarRef); // Lấy URL của ảnh sau khi upload
    return downloadURL;
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    throw error;
  }
};

// Hàm lưu avatar vào Firebase Database
const saveAvatarToDatabase = async (userId, file) => {
  try {
    const avatarUrl = await uploadAvatar(userId, file);
    await updateUserData(userId, { avatar: avatarUrl }); // Cập nhật URL của avatar vào Database
    console.log('Avatar đã được lưu vào Database');
  } catch (error) {
    console.error('Lỗi lưu avatar vào Database:', error);
  }
};

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  updateUserData,
  getUserData,
  uploadAvatar,
  saveAvatarToDatabase
};
