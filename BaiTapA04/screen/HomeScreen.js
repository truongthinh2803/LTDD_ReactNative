import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import UserScreen from './UserScreen';
import HomeContent from './HomeContent';
import FavoritesScreen from './FavoritesScreen';
import CartScreen from './CartScreen';
import OrderScreen from './OrderScreen'; // Import OrderScreen

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const UserStack = createStackNavigator();

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
  </HomeStack.Navigator>
);

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
          } else if (route.name === 'Favorites') {
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
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Yêu Thích' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Giỏ Hàng' }}
      />
      <Tab.Screen
        name="Order"
        component={OrderScreen} // Thêm OrderScreen vào Tab Navigator
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
