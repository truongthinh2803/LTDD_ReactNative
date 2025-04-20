import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons for better UX
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import tw from 'tailwind-react-native-classnames'; // Import Tailwind for styling

const AdminPage = ({ navigation }) => {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Thông báo', 'Đã đăng xuất.');
        navigation.replace('Login'); // Navigate back to Login after logging out
      })
      .catch(error => {
        console.error('Error logging out:', error);
      });
  };

  return (
    <View style={tw`flex-1 p-5 bg-gray-100`}>
      <Text style={tw`text-2xl font-bold text-center text-gray-800 my-5`}>Danh Mục Quản Lý</Text>

      {/* Section for Product Management */}
      <TouchableOpacity
        style={tw`flex-row items-center bg-white p-4 mb-3 rounded-lg shadow`}
        onPress={() => navigation.navigate('ProductManagementScreen')}
      >
        <Icon name="inventory" size={30} color="#4CAF50" />
        <Text style={tw`ml-4 text-lg text-gray-800`}>Quản lý sản phẩm</Text>
      </TouchableOpacity>

      {/* Section for User Management */}
      <TouchableOpacity style={tw`flex-row items-center bg-white p-4 mb-3 rounded-lg shadow`}>
        <Icon name="people" size={30} color="#FF9800" />
        <Text style={tw`ml-4 text-lg text-gray-800`}>Quản lý người dùng</Text>
      </TouchableOpacity>

      {/* Section for Order Management */}
      <TouchableOpacity
        style={tw`flex-row items-center bg-white p-4 mb-3 rounded-lg shadow`}
        onPress={() => navigation.navigate('OrderManagementScreen')} // Điều hướng đến màn hình Quản lý đơn hàng
      >
        <Icon name="assignment" size={30} color="#2196F3" />
        <Text style={tw`ml-4 text-lg text-gray-800`}>Quản lý đơn hàng</Text>
      </TouchableOpacity>


      {/* New Section for Sales Management */}
      <TouchableOpacity 
        style={tw`flex-row items-center bg-white p-4 mb-3 rounded-lg shadow`}
        onPress={() => navigation.navigate('SalesManagementScreen')}
      >
        <Icon name="bar-chart" size={30} color="#673AB7" />
        <Text style={tw`ml-4 text-lg text-gray-800`}>Quản lý doanh số</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={tw`flex-row justify-center items-center bg-red-500 p-4 rounded-lg mt-5`} onPress={handleLogout}>
        <Text style={tw`text-lg text-white font-bold mr-2`}>Đăng xuất</Text>
        <Icon name="exit-to-app" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default AdminPage;
