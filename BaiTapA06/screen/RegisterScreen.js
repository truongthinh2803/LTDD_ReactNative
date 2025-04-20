import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Sử dụng MaterialIcons
import { sendOTPEmail, generateOTP } from '../otpService';
import { auth, createUserWithEmailAndPassword, deleteUser } from '../firebase';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [otpAttempts, setOtpAttempts] = useState(0);

  // Gửi OTP sau khi kiểm tra email và mật khẩu
  const handleSendOTP = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Vui lòng nhập email hợp lệ.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setCurrentUser(user);

      const otp = generateOTP();
      await sendOTPEmail(email, otp);
      setGeneratedOtp(otp);
      setIsOtpSent(true);
      Alert.alert('Mã OTP đã được gửi!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Email đã được sử dụng, vui lòng nhập email khác.');
      } else {
        Alert.alert('Lỗi khi gửi OTP', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận OTP sau khi người dùng nhập mã
  const handleRegister = async () => {
    if (!otp || otp !== generatedOtp) {
      setOtpAttempts(otpAttempts + 1);
      if (otpAttempts < 2) {
        Alert.alert(`Mã OTP không hợp lệ. Bạn còn ${2 - otpAttempts} lần thử.`);
      } else {
        // Nếu sai 3 lần
        await handleDeleteUser(); // Xóa tài khoản
        Alert.alert('Đăng ký không thành công. Bạn đã nhập sai OTP 3 lần.');
        navigation.navigate('Login'); // Quay lại trang đăng nhập
      }
      return;
    }

    Alert.alert('Đăng ký thành công!');
    navigation.navigate('Login');
  };

  // Xóa tài khoản khi thất bại hoặc hủy
  const handleDeleteUser = async () => {
    if (currentUser) {
      try {
        await deleteUser(currentUser);
      } catch (error) {
        Alert.alert('Lỗi khi xóa người dùng', error.message);
      }
    }
  };

  // Hủy quá trình đăng ký và xóa tài khoản
  const handleCancel = async () => {
    await handleDeleteUser();
    Alert.alert('Đăng ký không thành công!');
    setIsOtpSent(false);
    setGeneratedOtp('');
    setOtp('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtpAttempts(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{!isOtpSent ? 'Đăng Ký' : 'Xác Thực OTP'}</Text>
      {!isOtpSent ? (
        <>
          <View style={styles.inputGroup}>
            <Icon name="email" size={24} color="#007BFF" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <Icon name="lock" size={24} color="#28a745" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputGroup}>
            <Icon name="lock-outline" size={24} color="#dc3545" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
            <Icon name="send" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{loading ? 'Đang gửi OTP...' : 'Đăng Ký'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
            <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Icon name="lock" size={24} color="#007BFF" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleRegister}>
              <Icon name="check" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Xác Nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Icon name="cancel" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007BFF',
    marginBottom: 30,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 17,
    borderRadius: 5,
    marginLeft: -13,
  },
  icon: {
    marginRight: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    flex: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#007BFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
