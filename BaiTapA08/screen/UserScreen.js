import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, signOut, updateUserData, getUserData, database} from '../firebase';
import { sendOTPEmail, generateOTP } from '../otpService';
import tw from 'tailwind-react-native-classnames';
import { ref, onValue } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [points, setPoints] = useState(0);
  const [favorites, setFavorites] = useState([]); // Khai báo state cho favorites
  const [cart, setCart] = useState([]); // Khai báo state cho cart
  const [orders, setOrders] = useState([]); // Khai báo state cho orders
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [oldData, setOldData] = useState({});

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Người dùng chưa đăng nhập');

        const userData = await getUserData(userId);
        setOldData({
          name: userData.name || '',
          dob: userData.dob || '',
          phone: userData.phone || '',
          address: userData.address || '',
          avatar: userData.avatar || null,
          //points: userData.points || 0,
          favorites: userData.favorites || [], // Lấy giá trị favorites từ userData
          cart: userData.cart || [], // Lấy giá trị cart từ userData
          orders: userData.orders || [], // Lấy giá trị orders từ userData
        });
        setName(userData.name || '');
        setDob(userData.dob || '');
        setPhone(userData.phone || '');
        setAddress(userData.address || '');
        setAvatar(userData.avatar || null);
        //setPoints(userData.points || 0);
        setFavorites(userData.favorites || []); // Cập nhật state favorites
        setCart(userData.cart || []); // Cập nhật state cart
        setOrders(userData.orders || []); // Cập nhật state orders
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
      }
    };

    loadUserData();

     // Theo dõi và cập nhật điểm số theo thời gian thực
     const userId = auth.currentUser?.uid;
     if (userId) {
       const pointsRef = ref(database, `users/${userId}/points`);
       const unsubscribe = onValue(pointsRef, (snapshot) => {
         const updatedPoints = snapshot.val();
         setPoints(updatedPoints || 0); // Cập nhật điểm số nếu thay đổi
       });
 
       // Cleanup listener khi component bị unmount
       return () => unsubscribe();
     }
  }, []);

  const validateName = (text) => {
    const nameRegex = /^[A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂƠƯăâêôơư ả ẳ ã ạ ẩ ậ ẻ ề ệ ể ệ ỉ ị ỏ ỏ ố ồ ộ ỗ ổ ớ ờ ợ ụ ủ ũ ư ứ ừ ự ử]+$/;
    return nameRegex.test(text);
};


  const validateDob = (date) => {
    const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/\d{4}$/;
    return dateRegex.test(date);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSendOtp = async () => {
    const otp = generateOTP();
    setGeneratedOtp(otp);
    try {
      await sendOTPEmail(email, otp);
      Alert.alert('Thông báo', 'Mã OTP đã được gửi đến email của bạn.');
    } catch (error) {
      Alert.alert('Lỗi gửi OTP', error.message);
    }
  };

  const handleUpdateInfo = () => {
    if (!validateName(name)) {
      Alert.alert('Lỗi', 'Tên không hợp lệ. Vui lòng chỉ nhập ký tự chữ và khoảng trắng.');
      return;
    }

    if (!validateDob(dob)) {
      Alert.alert('Lỗi', 'Ngày sinh không đúng định dạng (DD/MM/YYYY).');
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    getUserData(userId).then((userData) => {
      const changes = {
        name: name !== userData.name,
        dob: dob !== userData.dob,
        phone: phone !== userData.phone,
        address: address !== userData.address,
        avatar: avatar !== userData.avatar,
      };

      if (!Object.values(changes).some((change) => change)) {
        Alert.alert('Thông báo', 'Không có thay đổi nào để cập nhật.');
        return;
      }

      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn lưu các thay đổi?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => {
              setName(oldData.name);
              setDob(oldData.dob);
              setPhone(oldData.phone);
              setAddress(oldData.address);
              setAvatar(oldData.avatar);
              setEditModalVisible(false);
            },
          },
          {
            text: 'Lưu',
            onPress: () => {
              handleSendOtp();
              setEditModalVisible(true);
            },
          },
        ]
      );
    });
  };

  const handleConfirmUpdate = async () => {
    if (otp !== generatedOtp) {
      Alert.alert('Lỗi', 'Mã OTP không đúng!');
      return;
    }

    const userId = auth.currentUser?.uid;
    try {
      if (!userId) throw new Error('Người dùng chưa đăng nhập');

      await updateUserData(userId, { name, dob, phone, address, avatar, points, favorites, cart, orders });
      Alert.alert('Thông báo', 'Cập nhật thông tin thành công!');
      setEditModalVisible(false);

      const userData = await getUserData(userId);
      setOldData({
        name: userData.name || '',
        dob: userData.dob || '',
        phone: userData.phone || '',
        address: userData.address || '',
        avatar: userData.avatar || null,
        favorites: userData.favorites || [], // Update favorites
        cart: userData.cart || [], // Update cart
        orders: userData.orders || [], // Update orders
        //points: userData.points || 0, // Cập nhật lại điểm tích lũy
      });
      setName(userData.name || '');
      setDob(userData.dob || '');
      setPhone(userData.phone || '');
      setAddress(userData.address || '');
      setAvatar(userData.avatar || null);
      setFavorites(userData.favorites || []); // Update favorites state
      setCart(userData.cart || []); // Update cart state
      setOrders(userData.orders || []); // Update orders state
      //setPoints(userData.points || 0); // Cập nhật lại state points
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin.');
    }
  };

  const handleSignOut = async () => {
    try {
      // Đăng xuất khỏi Firebase
      await signOut(auth);
  
      // Xóa token khỏi AsyncStorage
      await AsyncStorage.removeItem('userToken');
  
      Alert.alert('Thông báo', 'Đã đăng xuất.');
  
      // Reset ngăn xếp điều hướng về màn hình đăng nhập
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng xuất.');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={tw`p-5`}>
      <View style={tw`items-center mb-5`}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={tw`w-24 h-24 rounded-full border-2 border-blue-500`} />
        ) : (
          <Icon name="account-circle" size={100} color="#ddd" />
        )}
        <TouchableOpacity style={tw`flex-row items-center mt-2`} onPress={handlePickImage}>
          <Icon name="camera-alt" size={24} color="#007bff" />
          <Text style={tw`ml-2 text-blue-500 text-lg`}>Thay đổi ảnh đại diện</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="person" size={20} color="#007bff" />
          <TextInput
            style={tw`flex-1 ml-2 text-lg font-bold text-gray-800 py-3`}
            placeholder="Tên người dùng"
            value={name}
            onChangeText={setName}
          />
        </View>
      </View>

      <View style={tw`mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="email" size={20} color="#007bff" />
          <TextInput
            style={tw`flex-1 ml-2 text-lg font-bold text-gray-800 py-3`}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            editable={false}
          />
        </View>
      </View>

      <View style={tw`mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="calendar-today" size={20} color="#007bff" />
          <TextInput
            style={tw`flex-1 ml-2 text-lg font-bold text-gray-800 py-3`}
            placeholder="Ngày sinh (dd/mm/yyyy)"
            value={dob}
            onChangeText={setDob}
          />
        </View>
      </View>

      <View style={tw`mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="phone" size={20} color="#007bff" />
          <TextInput
            style={tw`flex-1 ml-2 text-lg font-bold text-gray-800 py-3`}
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </View>

      <View style={tw`mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="home" size={20} color="#007bff" />
          <TextInput
            style={tw`flex-1 ml-2 text-lg font-bold text-gray-800 py-3`}
            placeholder="Địa chỉ"
            value={address}
            onChangeText={setAddress}
          />
        </View>
      </View>

      <View style={tw`mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="star" size={20} color="#007bff" />
          <TextInput
            style={tw`flex-1 ml-2 text-lg font-bold text-gray-800 py-3`}
            placeholder="Điểm tích lũy"
            value={points.toString()} // Hiển thị điểm tích lũy
            editable={false} // Không cho phép chỉnh sửa
          />
        </View>
      </View>

      <TouchableOpacity
        style={tw`bg-blue-500 py-3 rounded-lg items-center flex-row justify-center`}
        onPress={handleUpdateInfo}
      >
        <Icon name="edit" size={20} color="#fff" />
        <Text style={tw`text-white text-lg font-bold ml-2`}>Cập nhật thông tin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={tw`mt-5 bg-red-500 py-3 rounded-lg items-center flex-row justify-center`}
        onPress={handleSignOut}
      >
        <Icon name="logout" size={20} color="#fff" />
        <Text style={tw`text-white text-lg font-bold ml-2`}>Đăng xuất</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-5 rounded-lg w-80`}>
            <Text style={tw`text-xl font-bold mb-3`}>Xác nhận OTP</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity
              style={tw`bg-blue-500 py-2 rounded-lg items-center`}
              onPress={handleConfirmUpdate}
            >
              <Text style={tw`text-white font-bold text-lg`}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`mt-2`}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={tw`text-red-500 text-center text-lg font-bold`}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default UserScreen;
