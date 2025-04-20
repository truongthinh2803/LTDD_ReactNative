import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import UserScreen from './UserScreen';
import HomeContent from './HomeContent';
import ProductDetailsScreen from './ProductDetailsScreen';
import FavoritesScreen from './FavoritesScreen';
import CartScreen from './CartScreen';
import OrderScreen from './OrderScreen';
import OrderConfirmationScreen from './OrderConfirmationScreen';
import ProductReviewScreen from './ProductReviewScreen';
import { auth, database } from '../firebase'; // Firebase imports
import { ref, onValue } from 'firebase/database';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const UserStack = createStackNavigator();
const FavoriteStack = createStackNavigator();
const CartStack = createStackNavigator();
const OrderStack = createStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator
    screenOptions={{ headerLeft: () => null }}
  >
    <HomeStack.Screen
      name="HomeContent"
      component={HomeContent}
      options={{ title: 'Trang Chủ' }}
    />
    <HomeStack.Screen
      name="ProductDetails"
      component={ProductDetailsScreen}
      options={{ title: 'Chi Tiết Sản Phẩm' }}
    />
    <HomeStack.Screen
      name="OrderConfirmation"
      component={OrderConfirmationScreen}
      options={{ title: 'Xác Nhận Đơn Hàng' }}
    />
  </HomeStack.Navigator>
);

const UserStackScreen = () => (
  <UserStack.Navigator
    screenOptions={{ headerLeft: () => null }}
  >
    <UserStack.Screen
      name="UserScreen"
      component={UserScreen}
      options={{ title: 'Tài Khoản' }}
    />
  </UserStack.Navigator>
);

const FavoriteStackScreen = () => (
  <FavoriteStack.Navigator
    screenOptions={{ headerLeft: () => null }}
  >
    <FavoriteStack.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{ title: 'Yêu Thích' }}
    />
    <FavoriteStack.Screen
      name="ProductDetails"
      component={ProductDetailsScreen}
      options={{ title: 'Chi Tiết Sản Phẩm' }}
    />
  </FavoriteStack.Navigator>
);

const CartStackScreen = () => (
  <CartStack.Navigator
    screenOptions={{ headerLeft: () => null }}
  >
    <CartStack.Screen
      name="CartScreen"
      component={CartScreen}
      options={{ title: 'Giỏ Hàng' }}
    />
    <CartStack.Screen
      name="OrderConfirmation"
      component={OrderConfirmationScreen}
      options={{ title: 'Xác Nhận Đơn Hàng' }}
    />
  </CartStack.Navigator>
);

const OrderStackScreen = () => (
  <OrderStack.Navigator
    screenOptions={{ headerLeft: () => null }}
  >
    <OrderStack.Screen
      name="OrderScreen"
      component={OrderScreen}
      options={{ title: 'Đơn Hàng' }}
    />
    <OrderStack.Screen
      name="ProductReview"
      component={ProductReviewScreen}
      options={{ title: 'Đánh Giá Sản Phẩm' }}
    />
  </OrderStack.Navigator>
);

// Tab Navigator cho HomeScreen
const HomeScreen = () => {
  const [cartItemCount, setCartItemCount] = useState(0); // Trạng thái lưu số lượng sản phẩm trong giỏ hàng
  const [favoriteItemCount, setFavoriteItemCount] = useState(0); // Trạng thái lưu số lượng sản phẩm yêu thích

  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (userId) {
      // Lấy số lượng sản phẩm trong giỏ hàng
      const cartRef = ref(database, `users/${userId}/cart`);
      const unsubscribeCart = onValue(cartRef, (snapshot) => {
        let itemCount = 0;
        snapshot.forEach((childSnapshot) => {
          itemCount += 1; // Đếm từng item, không tính số lượng của từng sản phẩm
        });
        setCartItemCount(itemCount); // Cập nhật trạng thái số lượng giỏ hàng
      });

      // Lấy số lượng sản phẩm yêu thích
      const favoritesRef = ref(database, `users/${userId}/favorites`);
      const unsubscribeFavorites = onValue(favoritesRef, (snapshot) => {
        let favCount = 0;
        snapshot.forEach((childSnapshot) => {
          favCount += 1; // Đếm từng mục yêu thích
        });
        setFavoriteItemCount(favCount); // Cập nhật trạng thái số lượng yêu thích
      });

      return () => {
        unsubscribeCart();
        unsubscribeFavorites();
      };
    }
  }, [userId]);

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
            iconName = 'list';
          }

          return (
            <View>
              <FontAwesome name={iconName} size={size} color={color} />
              {route.name === 'Cart' && cartItemCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -10,
                    top: -5,
                    backgroundColor: 'red',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12 }}>{cartItemCount}</Text>
                </View>
              )}
            {route.name === 'FavoritesTab' && favoriteItemCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -10,
                    top: -5,
                    backgroundColor: 'red',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12 }}>{favoriteItemCount}</Text>
                </View>
              )}
            </View>
          );
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
        component={FavoriteStackScreen}
        options={{ title: 'Yêu Thích' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStackScreen}
        options={{ title: 'Giỏ Hàng' }}
      />
      <Tab.Screen
        name="Order"
        component={OrderStackScreen}
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
