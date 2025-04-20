import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon
import { sendOTPEmail, generateOTP } from '../otpService'; // Import từ otpService.js
import { auth, sendPasswordResetEmail } from '../firebase';

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Vui lòng nhập email hợp lệ');
      return;
    }
    const otp = generateOTP();
    setLoading(true);
    try {
      await sendOTPEmail(email, otp);
      setGeneratedOtp(otp);
      setIsOtpSent(true);
      Alert.alert('Mã OTP đã được gửi!');
    } catch (error) {
      Alert.alert('Lỗi khi gửi OTP', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (!otp || otp !== generatedOtp) {
      Alert.alert('Lỗi', 'Mã OTP không đúng!');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Đã gửi email đặt lại mật khẩu');
        navigation.navigate('Login');
      })
      .catch((error) => {
        Alert.alert('Gửi email thất bại', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên Mật Khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
        editable={!isOtpSent}  
      />
      {!isOtpSent ? (
        <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="envelope" size={20} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Gửi OTP</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Icon name="key" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
        <Icon name="arrow-left" size={20} color="#007BFF" />
        <Text style={styles.link}>Quay lại Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    fontSize: 16,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  link: {
    color: '#007BFF',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ForgetPasswordScreen;
