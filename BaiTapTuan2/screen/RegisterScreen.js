import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { sendOTPEmail, generateOTP } from '../otpService'; // Import từ otpService.js
import { auth, createUserWithEmailAndPassword } from '../firebase';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); // OTP từ người dùng
  const [generatedOtp, setGeneratedOtp] = useState(''); // OTP ngẫu nhiên được gửi
  const [isOtpSent, setIsOtpSent] = useState(false); // Trạng thái đã gửi OTP chưa
  const [loading, setLoading] = useState(false); // Trạng thái gửi OTP

  // Hàm gửi OTP qua email
  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Vui lòng nhập email hợp lệ');
      return;
    }
    const otp = generateOTP(); // Tạo mã OTP
    setLoading(true); // Hiển thị trạng thái loading
    try {
      await sendOTPEmail(email, otp); // Gửi OTP qua email bằng Mailjet
      setGeneratedOtp(otp); // Lưu mã OTP được tạo
      setIsOtpSent(true); // Hiển thị input nhập OTP
      Alert.alert('Mã OTP đã được gửi!');
    } catch (error) {
      Alert.alert('Lỗi khi gửi OTP', error.message);
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };

  // Hàm đăng ký sau khi người dùng nhập mã OTP
  const handleRegister = () => {
    if (!otp || otp !== generatedOtp) {
      Alert.alert('Mã OTP không hợp lệ');
      return;
    }
    if (!password) {
      Alert.alert('Vui lòng nhập mật khẩu');
      return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert('Đăng ký thành công!');
        navigation.navigate('Login');
      })
      .catch(error => {
        Alert.alert('Đăng ký thất bại', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Ký</Text>
      {!isOtpSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Đang gửi...' : 'Gửi OTP'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Đăng ký</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    color: '#007BFF',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default RegisterScreen;
