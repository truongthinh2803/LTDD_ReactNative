import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from './screen/RegisterScreen';
import LoginScreen from './screen/LoginScreen';
import HomeScreen from './screen/HomeScreen';
import ForgetPasswordScreen from './screen/ForgetPasswordScreen';
import AdminPage from './Admin/AdminPage';   
import ProductManagementScreen from './Admin/ProductManagementScreen';
import AddProductScreen from './Admin/AddProductScreen'; 
import AdminProductDetailsScreen from './Admin/AdminProductDetailsScreen';
import EditProductScreen from './Admin/EditProductScreen';
import SalesManagementScreen from './Admin/SalesManagementScreen';
import OrderManagementScreen from './Admin/OrderManagementScreen'; // Import OrderManagementScreen

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerLeft: () => null, // Bỏ nút mũi tên quay lại cho tất cả màn hình
        }}
      >
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Đăng Ký' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Đăng Nhập' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}  
        />
        <Stack.Screen
          name="ForgetPassword"
          component={ForgetPasswordScreen}
          options={{ title: 'Quên Mật Khẩu' }}
        />
        <Stack.Screen
          name="AdminPage"
          component={AdminPage}
          options={{ title: 'Trang Quản Trị' }} 
        />
        <Stack.Screen
          name="ProductManagementScreen"
          component={ProductManagementScreen}
          options={{ title: 'Quản Lý Sản Phẩm' }}  
        />
        <Stack.Screen
          name="AdminProductDetailsScreen"
          component={AdminProductDetailsScreen}
          options={{ title: 'Chi Tiết Sản Phẩm' }}  
        />
        <Stack.Screen
          name="AddProductScreen"
          component={AddProductScreen}
          options={{ title: 'Thêm Sản Phẩm' }} 
        />
        <Stack.Screen
          name="EditProductScreen"
          component={EditProductScreen}
          options={{ title: 'Chỉnh Sửa Sản Phẩm' }} 
        />
        <Stack.Screen
          name="SalesManagementScreen"
          component={SalesManagementScreen}
          options={{ title: 'Quản Lý Doanh Số' }} 
        />
        <Stack.Screen
          name="OrderManagementScreen"
          component={OrderManagementScreen}
          options={{ title: 'Quản Lý Đơn Hàng' }} // Đăng ký OrderManagementScreen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
