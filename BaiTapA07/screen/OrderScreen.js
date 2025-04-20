import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, Image, Button, TouchableOpacity } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { auth, database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native'; 

const OrderScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('Tất cả đơn');

  const statuses = [
    { title: 'Tất cả đơn', icon: 'list', filterValue: null },
    { title: 'Đang xử lý', icon: 'pending', filterValue: 'Đang xử lý' },
    { title: 'Đã xác nhận', icon: 'check-circle-outline', filterValue: 'Đã xác nhận đơn hàng' },
    { title: 'Đang chuẩn bị', icon: 'store', filterValue: 'Shop đang chuẩn bị đơn hàng' },
    { title: 'Đang giao hàng', icon: 'local-shipping', filterValue: 'Đang giao hàng' },
    { title: 'Giao thành công', icon: 'done-all', filterValue: 'Đã giao thành công' },
    { title: 'Đã hủy đơn', icon: 'cancel', filterValue: 'Đã hủy' },
  ];

  useEffect(() => {
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    if (userId) {
      const ordersRef = ref(database, `users/${userId}/orders`);
      onValue(
        ordersRef,
        (snapshot) => {
          const ordersData = snapshot.val();
          if (ordersData) {
            const ordersList = Object.entries(ordersData).map(([key, value]) => ({
              id: key,
              ...value,
            }));
            setOrders(ordersList);
          } else {
            setOrders([]);
          }
          setLoading(false);
        },
        (error) => {
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const filterOrders = () => {
    if (selectedStatus === 'Tất cả đơn') {
      return orders;
    }
    const selectedStatusObj = statuses.find(status => status.title === selectedStatus);
    return orders.filter((order) => order.status === selectedStatusObj.filterValue);
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          onPress: () => {
            const userId = auth.currentUser ? auth.currentUser.uid : null;
            if (userId) {
              const orderRef = ref(database, `users/${userId}/orders/${orderId}`);
              update(orderRef, { status: 'Đã hủy' })
                .then(() => {
                  Alert.alert('Thành công', 'Đơn hàng đã được hủy.');
                  setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                      order.id === orderId ? { ...order, status: 'Đã hủy' } : order
                    )
                  );
                })
                .catch(() => {
                  Alert.alert('Lỗi', 'Không thể hủy đơn hàng.');
                });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderIcon = (status) => {
    const ordersCount = orders.filter((order) => status.filterValue ? order.status === status.filterValue : true).length; // Cập nhật để tính số lượng cho "Tất cả đơn hàng"
    return (
      <TouchableOpacity
        key={status.title}
        onPress={() => setSelectedStatus(status.title)}
        style={tw`flex items-center mx-2`}
      >
        <View style={tw`relative`}>
          <Icon name={status.icon} size={40} color={selectedStatus === status.title ? 'blue' : 'gray'} />
          {ordersCount > 0 && (
            <View style={tw`absolute -top-0 -right-2 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center`}>
              <Text style={tw`text-white text-xs`}>{ordersCount}</Text>
            </View>
          )}
        </View>
        <Text style={tw`text-center mt-1 text-sm`}>{status.title}</Text>
      </TouchableOpacity>
    );
  };

  const handleReviewProduct = (item, orderId) => {
    navigation.navigate('ProductReview', { product: item, orderId: orderId });
  };
  

  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={tw`h-24 mb-4`}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={tw`mt-4`} contentContainerStyle={tw`flex-row justify-between`}>
              {statuses.map((status) => renderIcon(status))}
            </ScrollView>
          </View>

          <ScrollView style={tw`flex-1`}>
            {filterOrders().length === 0 ? (
              <Text style={tw`text-lg text-center text-gray-600`}>Không có đơn hàng với trạng thái "{selectedStatus}".</Text>
            ) : (
              filterOrders().map((order) => (
                <View key={order.id} style={tw`bg-white rounded-lg shadow-md p-4 mb-4`}>
                  <Text style={tw`text-base font-bold text-blue-600`}>Đơn hàng ID: {order.id}</Text>
                  <Text style={tw`text-base font-bold`}>Thời gian: {order.orderTime}</Text>
                  <Text style={tw`text-base font-bold text-green-600`}>Tổng cộng: {formatPrice(order.totalAmount)}</Text>
                  <Text style={tw`text-base font-bold`}>Hình thức thanh toán: {order.paymentMethod}</Text>
                  <Text style={tw`text-base font-bold text-red-500`}>Trạng thái: {order.status}</Text>

                  <Text style={tw`text-lg font-bold mt-2`}>Sản phẩm:</Text>
                  {order.items.map((item, index) => (
                    <View key={index} style={tw`flex-row items-center mt-1 border-b border-gray-300 py-2`}>
                      {item.image && (
                        <Image source={{ uri: item.image }} style={tw`w-16 h-16 rounded-md mr-2`} />
                      )}
                      <View style={tw`flex-1`}>
                        <Text style={tw`text-base`}>{item.name} x {item.quantity}</Text>
                        <Text style={tw`text-base font-bold text-yellow-600`}>{formatPrice(item.totalPrice)}</Text>

                        {order.status === 'Đã giao thành công' && (
                          <TouchableOpacity
                            onPress={() => handleReviewProduct(item, order.id)}
                            style={tw`mt-2 bg-blue-500 rounded p-2 flex-row items-center justify-center`}
                          >
                            <Icon name="rate-review" size={20} color="white" />
                            <Text style={tw`text-white ml-1 font-bold`}>Đánh giá sản phẩm</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}

                  {order.status === 'Đang xử lý' && (
                    <View style={tw`mt-2`}>
                      <Button
                        title="Hủy đơn hàng"
                        color="red"
                        onPress={() => handleCancelOrder(order.id)}
                      />
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
};

export default OrderScreen;  
