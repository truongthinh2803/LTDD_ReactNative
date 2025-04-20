import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  fetchSignInMethodsForEmail,
  deleteUser // Thêm deleteUser vào đây
} from 'firebase/auth';
import { getDatabase, ref, set, get, remove, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
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

// Các hàm liên quan đến người dùng
const updateUserData = async (userId, data) => {
  try {
    await set(ref(database, `users/${userId}`), data);
    console.log('Thông tin người dùng đã được cập nhật');
  } catch (error) {
    console.error('Lỗi cập nhật thông tin người dùng:', error);
    throw error;
  }
};

const getUserData = async (userId) => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {
        username: '',
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
    await uploadBytes(avatarRef, file);
    const downloadURL = await getDownloadURL(avatarRef);
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
    await updateUserData(userId, { avatar: avatarUrl });
    console.log('Avatar đã được lưu vào Database');
  } catch (error) {
    console.error('Lỗi lưu avatar vào Database:', error);
  }
};

// Các hàm liên quan đến sản phẩm
const addProduct = async (productId, productData) => {
  try {
    await set(ref(database, `products/${productId}`), productData);
    console.log('Sản phẩm đã được thêm vào Database');
  } catch (error) {
    console.error('Lỗi thêm sản phẩm vào Database:', error);
    throw error;
  }
};

const getProducts = async () => {
  try {
    const snapshot = await get(ref(database, 'products'));
    const products = [];
    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val();
      products.push({ id: childSnapshot.key, ...product });
    });
    return products;
  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    throw error;
  }
};

const deleteProduct = async (productId) => {
  try {
    await remove(ref(database, `products/${productId}`));
    console.log('Sản phẩm đã được xóa khỏi Database');
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    throw error;
  }
};

const updateProduct = async (productId, updatedProduct) => {
  try {
    await update(ref(database, `products/${productId}`), updatedProduct);
    console.log('Sản phẩm đã được cập nhật');
  } catch (error) {
    console.error('Lỗi sửa sản phẩm:', error);
    throw error;
  }
};

const updateProductSales = async (productId, newSales) => {
  try {
    // Cập nhật doanh số của sản phẩm trong Realtime Database
    await update(ref(database, `products/${productId}`), {
      sales: newSales
    });
    console.log('Doanh số của sản phẩm đã được cập nhật');
  } catch (error) {
    console.error('Lỗi cập nhật doanh số sản phẩm:', error);
    throw error;
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
  saveAvatarToDatabase,
  addProduct,
  database,
  getProducts,
  deleteProduct,
  updateProduct,
  fetchSignInMethodsForEmail,
  updateProductSales,
  deleteUser // Export deleteUser để sử dụng trong các phần khác của ứng dụng
};
