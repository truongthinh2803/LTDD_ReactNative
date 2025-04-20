import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import UserScreen from './UserScreen';
import HomeContent from './HomeContent';
import ProductDetailsScreen from './ProductDetailsScreen'; // Import ProductDetailsScreen
import FavoritesScreen from './FavoritesScreen';
import CartScreen from './CartScreen';
import OrderScreen from './OrderScreen'; // Import OrderScreen
import OrderConfirmationScreen from './OrderConfirmationScreen'; // Import OrderConfirmationScreen

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const UserStack = createStackNavigator();
const FavoriteStack = createStackNavigator(); // Tạo Stack cho Favorites
const CartStack = createStackNavigator(); // Tạo Stack cho Cart
const OrderStack = createStackNavigator(); // Tạo Stack cho Order

// HomeStackScreen
const HomeStackScreen = () => (
  <HomeStack.Navigator
    screenOptions={{
      headerLeft: () => null, // Bỏ nút quay lại
    }}
  >
    <HomeStack.Screen
      name="HomeContent"
      component={HomeContent}
      options={{ title: 'Trang Chủ' }}
    />
    <HomeStack.Screen
      name="ProductDetails" // Thêm route cho ProductDetailsScreen
      component={ProductDetailsScreen}
      options={{ title: 'Chi Tiết Sản Phẩm' }} // Tiêu đề cho màn hình chi tiết sản phẩm
    />
  </HomeStack.Navigator>
);

// UserStackScreen
const UserStackScreen = () => (
  <UserStack.Navigator
    screenOptions={{
      headerLeft: () => null, // Bỏ nút quay lại
    }}
  >
    <UserStack.Screen
      name="UserScreen"
      component={UserScreen}
      options={{ title: 'Tài Khoản' }}
    />
  </UserStack.Navigator>
);

// FavoriteStackScreen
const FavoriteStackScreen = () => (
  <FavoriteStack.Navigator
    screenOptions={{
      headerLeft: () => null, // Bỏ nút quay lại
    }}
  >
    <FavoriteStack.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{ title: 'Yêu Thích' }}
    />
  </FavoriteStack.Navigator>
);

// CartStackScreen
const CartStackScreen = () => (
  <CartStack.Navigator
    screenOptions={{
      headerLeft: () => null, // Bỏ nút quay lại
    }}
  >
    <CartStack.Screen
      name="CartScreen"
      component={CartScreen}
      options={{ title: 'Giỏ Hàng' }}
    />
    <CartStack.Screen
      name="OrderConfirmation" // Định nghĩa route cho OrderConfirmationScreen
      component={OrderConfirmationScreen}
      options={{ title: 'Xác Nhận Đơn Hàng' }} // Tiêu đề cho màn hình xác nhận
    />
  </CartStack.Navigator>
);

// OrderStackScreen
const OrderStackScreen = () => (
  <OrderStack.Navigator
    screenOptions={{
      headerLeft: () => null, // Bỏ nút quay lại
    }}
  >
    <OrderStack.Screen
      name="OrderScreen"
      component={OrderScreen}
      options={{ title: 'Đơn Hàng' }} // Tiêu đề cho OrderScreen
    />
  </OrderStack.Navigator>
);

// Tab Navigator cho HomeScreen
const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'Account') {
            iconName = 'user';
          } else if (route.name === 'FavoritesTab') {
            iconName = 'star';
          } else if (route.name === 'Cart') {
            iconName = 'shopping-cart';
          } else if (route.name === 'Order') {
            iconName = 'list'; // Thay đổi biểu tượng nếu cần
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ title: 'Trang Chủ' }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoriteStackScreen} // Thêm FavoriteStackScreen
        options={{ title: 'Yêu Thích' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStackScreen} // Thay đổi thành CartStackScreen
        options={{ title: 'Giỏ Hàng' }}
      />
      <Tab.Screen
        name="Order"
        component={OrderStackScreen} // Sử dụng OrderStackScreen cho Order
        options={{ title: 'Đơn Hàng' }}
      />
      <Tab.Screen
        name="Account"
        component={UserStackScreen}
        options={{ title: 'Tài Khoản' }}
      />
    </Tab.Navigator>
  );
};

export default HomeScreen;
