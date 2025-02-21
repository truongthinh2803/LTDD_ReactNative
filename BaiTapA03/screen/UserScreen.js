import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, updateUserData, getUserData } from '../firebase';
import { sendOTPEmail, generateOTP } from '../otpService';
import { FontAwesome } from '@expo/vector-icons';

const UserScreen = ({ navigation }) => {
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Người dùng chưa đăng nhập');

        const userData = await getUserData(userId);
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
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    getUserData(userId).then(userData => {
      const changes = {
        dob: dob !== userData.dob,
        phone: phone !== userData.phone,
        address: address !== userData.address,
        avatar: avatar !== userData.avatar,
      };

      if (Object.values(changes).some(change => change)) {
        Alert.alert(
          'Xác nhận thay đổi',
          'Các thông tin sẽ thay đổi, bạn chắc chưa?',
          [
            {
              text: 'Hủy',
              style: 'cancel',
            },
            {
              text: 'Xác nhận',
              onPress: () => {
                handleSendOtp();
                setEditModalVisible(true);
              },
            },
          ]
        );
      }
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

      await updateUserData(userId, { dob, phone, address, avatar });
      Alert.alert('Thông báo', 'Cập nhật thông tin thành công!');
      setEditModalVisible(false);

      const userData = await getUserData(userId);
      setDob(userData.dob || '');
      setPhone(userData.phone || '');
      setAddress(userData.address || '');
      setAvatar(userData.avatar || null);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <FontAwesome name="user" size={100} color="gray" />
        )}
        <TouchableOpacity style={styles.changeAvatarButton} onPress={handlePickImage}>
          <Text style={styles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Ngày sinh</Text>
        <TextInput
          style={styles.input}
          placeholder="Ngày sinh (dd/mm/yyyy)"
          value={dob}
          onChangeText={setDob}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ"
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateInfo}>
        <Text style={styles.buttonText}>Cập nhật thông tin</Text>
      </TouchableOpacity>

      <Modal visible={isEditModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Xác nhận cập nhật</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType='numeric'
          />
          <TouchableOpacity style={styles.button} onPress={handleConfirmUpdate}>
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
    backgroundColor: '#f5f5f5',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50, // Hình tròn
    backgroundColor: '#ddd',
  },
  changeAvatarButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12, // Bo góc mềm mại
    backgroundColor: '#007bff',
  },
  changeAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12, // Bo góc mềm mại
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 12, // Bo góc mềm mại
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cancelButton: {
    color: '#007bff',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default UserScreen;
