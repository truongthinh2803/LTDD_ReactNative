import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, signInWithEmailAndPassword, getUserData } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from './LoadingScreen'; // Đảm bảo rằng bạn đã tạo và nhập component này

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Đảm bảo rằng useState được sử dụng đúng
  const navigation = useNavigation();

  const handleLogin = () => {
    setLoading(true); // Hiển thị màn hình loading
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const userId = userCredential.user.uid;
        getUserData(userId)
          .then((userData) => {
            if (userData && userData.role === 'Admin') {
              setTimeout(() => {
                setLoading(false); // Ẩn màn hình loading
                navigation.navigate('AdminPage'); // Chuyển đến AdminPage
              }, 1000); // Thay đổi thời gian nếu cần
            } else {
              setTimeout(() => {
                setLoading(false); // Ẩn màn hình loading
                navigation.navigate('Home'); // Chuyển đến Home
              }, 1000); // Thay đổi thời gian nếu cần
            }
          })
          .catch((error) => {
            console.error('Lỗi lấy dữ liệu người dùng:', error);
            setLoading(false); // Ẩn màn hình loading
            Alert.alert('Lỗi', 'Không thể xác định vai trò người dùng.');
          });
      })
      .catch(() => {
        setLoading(false); // Ẩn màn hình loading
        Alert.alert('Đăng nhập thất bại!', 'Email hoặc mật khẩu không đúng!');
      });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/phone-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Đăng Nhập</Text>

      <View style={styles.inputContainer}>
        <Icon name="email" size={24} color="#333" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="#333" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
          secureTextEntry={!showPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
        <Text style={styles.link}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
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
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#4A90E2',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderColor: '#DDD',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  link: {
    color: '#4A90E2',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 18,
    fontWeight: 'bold'
  },
});

export default LoginScreen;
