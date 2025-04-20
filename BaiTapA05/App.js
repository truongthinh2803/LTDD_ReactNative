import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from './screen/RegisterScreen';
import LoginScreen from './screen/LoginScreen';
import HomeScreen from './screen/HomeScreen';
import ForgetPasswordScreen from './screen/ForgetPasswordScreen';
import UserScreen from './screen/UserScreen'; // Import UserScreen
import AdminPage from './Admin/AdminPage';   // Import AdminPage
import ProductManagementScreen from './Admin/ProductManagementScreen'; // Import ProductManagementScreen
import AddProductScreen from './Admin/AddProductScreen'; // Import AddProductScreen
import AdminProductDetailsScreen from './Admin/AdminProductDetailsScreen';
import ProductDetailsScreen from './screen/ProductDetailsScreen'; // Dành cho người dùng
import FavoritesScreen from './screen/FavoritesScreen'; // Import FavoritesScreen
import EditProductScreen from './Admin/EditProductScreen'; // Import EditProductScreen
import SalesManagementScreen from './Admin/SalesManagementScreen';


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
          name="UserScreen"
          component={UserScreen}
          options={{ headerShown: false }}  
        />
        <Stack.Screen
          name="AdminPage"
          component={AdminPage}
          options={{ title: 'Trang Quản Trị' }} // Bạn có thể thay đổi title tùy ý
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
          name="ProductDetailsScreen"
          component={ProductDetailsScreen}
          options={{ title: 'Chi Tiết Sản Phẩm' }}  
        />
        <Stack.Screen
          name="AddProductScreen"
          component={AddProductScreen}
          options={{ title: 'Thêm Sản Phẩm' }} // Bạn có thể thay đổi title tùy ý
        />
        <Stack.Screen
          name="FavoritesScreen"
          component={FavoritesScreen}
          options={{ title: 'Danh Sách Yêu Thích' }} // Bạn có thể thay đổi title tùy ý
        />
        <Stack.Screen
          name="EditProductScreen"
          component={EditProductScreen}
          options={{ title: 'Chỉnh Sửa Sản Phẩm' }} // Bạn có thể thay đổi title tùy ý
        />
        <Stack.Screen
          name="SalesManagementScreen"
          component={SalesManagementScreen}
          options={{ title: 'Quản Lý Doanh Số' }} // Bạn có thể thay đổi title tùy ý
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
