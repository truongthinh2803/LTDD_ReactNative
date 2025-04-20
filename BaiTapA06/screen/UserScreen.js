import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, signOut, updateUserData, getUserData } from '../firebase';
import { sendOTPEmail, generateOTP } from '../otpService';

const UserScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState(null);
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
        });
        setName(userData.name || '');
        setDob(userData.dob || '');
        setPhone(userData.phone || '');
        setAddress(userData.address || '');
        setAvatar(userData.avatar || null);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
      }
    };

    loadUserData();
  }, []);

  // Ràng buộc ký tự tên (chỉ cho phép chữ cái, khoảng trắng, và dấu tiếng Việt)
  const validateName = (text) => {
    const nameRegex = /^[A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂƠƯăâêôơư ]+$/;
    return nameRegex.test(text);
  };

  // Kiểm tra định dạng ngày sinh: DD/MM/YYYY
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

      // Nếu không có thay đổi nào, hiển thị thông báo
      if (!Object.values(changes).some((change) => change)) {
        Alert.alert('Thông báo', 'Không có thay đổi nào để cập nhật.');
        return;
      }

      // Nếu có thay đổi, hiển thị xác nhận
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn lưu các thay đổi?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => {
              // Khôi phục dữ liệu cũ khi hủy bỏ
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

      await updateUserData(userId, { name, dob, phone, address, avatar });
      Alert.alert('Thông báo', 'Cập nhật thông tin thành công!');
      setEditModalVisible(false);

      const userData = await getUserData(userId);
      setOldData({
        name: userData.name || '',
        dob: userData.dob || '',
        phone: userData.phone || '',
        address: userData.address || '',
        avatar: userData.avatar || null,
      });
      setName(userData.name || '');
      setDob(userData.dob || '');
      setPhone(userData.phone || '');
      setAddress(userData.address || '');
      setAvatar(userData.avatar || null);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin.');
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Thông báo', 'Đã đăng xuất.');
        navigation.navigate('Login');
      })
      .catch(error => {
        Alert.alert('Lỗi', 'Không thể đăng xuất.');
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Icon name="account-circle" size={100} color="#ddd" />
        )}
        <TouchableOpacity style={styles.changeAvatarButton} onPress={handlePickImage}>
          <Icon name="camera-alt" size={24} color="#007bff" />
          <Text style={styles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldWrapper}>
          <Icon name="person" size={20} color="#007bff" />
          <TextInput
            style={styles.input}
            placeholder="Tên người dùng"
            value={name}
            onChangeText={setName}
          />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldWrapper}>
          <Icon name="email" size={20} color="#007bff" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            editable={false}
          />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldWrapper}>
          <Icon name="calendar-today" size={20} color="#007bff" />
          <TextInput
            style={styles.input}
            placeholder="Ngày sinh (dd/mm/yyyy)"
            value={dob}
            onChangeText={setDob}
          />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldWrapper}>
          <Icon name="phone" size={20} color="#007bff" />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={phone}
            keyboardType="number-pad"
            onChangeText={setPhone}
          />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldWrapper}>
          <Icon name="home" size={20} color="#007bff" />
          <TextInput
            style={styles.input}
            placeholder="Địa chỉ"
            value={address}
            onChangeText={setAddress}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateInfo}>
        <Icon name="edit" size={20} color="#fff" />
        <Text style={styles.buttonText}>Cập nhật thông tin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleSignOut}>
        <Icon name="logout" size={20} color="#fff" />
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Modal visible={isEditModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Xác nhận cập nhật</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="Nhập mã OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType='numeric'
          />
          <TouchableOpacity style={styles.otpButton} onPress={handleConfirmUpdate}>
            <Icon name="verified" size={20} color="#fff" />
            <Text style={styles.buttonText}>Xác nhận OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditModalVisible(false)}>
            <Text style={styles.cancelButton}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#007bff',
    borderWidth: 2,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  changeAvatarText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007bff',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#33CC33',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#FF5252',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  otpInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  otpButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserScreen;
