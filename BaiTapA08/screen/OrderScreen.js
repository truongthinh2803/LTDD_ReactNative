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
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  const statuses = [
    { title: 'Tất cả', icon: 'list', filterValue: null },
    { title: 'Xử lý', icon: 'pending', filterValue: 'Đang xử lý' },
    { title: 'Xác nhận', icon: 'check-circle-outline', filterValue: 'Đã xác nhận đơn hàng' },
    { title: 'Chuẩn bị', icon: 'store', filterValue: 'Shop đang chuẩn bị đơn hàng' },
    { title: 'Đang giao', icon: 'local-shipping', filterValue: 'Đang giao hàng' },
    { title: 'Đánh giá', icon: 'rate-review', filterValue: 'Đã giao thành công' },
    { title: 'Đã hủy', icon: 'cancel', filterValue: 'Đã hủy' },
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
  
            const parseOrderTime = (orderTime) => {
              const [time, date] = orderTime.split(', ');
              const [hours, minutes, seconds] = time.split(':');
              const [day, month, year] = date.split('/');
              return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
            };
  
            ordersList.sort((a, b) => parseOrderTime(b.orderTime) - parseOrderTime(a.orderTime));
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
    if (selectedStatus === 'Tất cả') {
      return orders;
    }
    const selectedStatusObj = statuses.find(status => status.title === selectedStatus);
    return orders.filter((order) => order.status === selectedStatusObj.filterValue);
  };

  const calculateTotalAmount = () => {
    return filterOrders().reduce((total, order) => total + order.totalAmount, 0);
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
    const isDisplayCount = status.title !== 'Tất cả' && status.title !== 'Đánh giá' && status.title !== 'Đã hủy';
    const ordersCount = isDisplayCount ? orders.filter((order) => status.filterValue ? order.status === status.filterValue : true).length : 0;

    return (
      <TouchableOpacity
        key={status.title}
        onPress={() => setSelectedStatus(status.title)}
        style={tw`flex items-center mx-2`}
      >
        <View style={tw`relative`}>
          <Icon name={status.icon} size={40} color={selectedStatus === status.title ? 'blue' : 'gray'} />
          {isDisplayCount && ordersCount > 0 && (
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

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
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
                  <Text style={tw`text-base font-bold`}>Địa chỉ nhận hàng: {order.shippingAddress}</Text>

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
                    <TouchableOpacity
                      onPress={() => handleCancelOrder(order.id)}
                      style={tw`mt-4 bg-red-500 p-2 rounded`}
                    >
                      <Text style={tw`text-white text-center font-bold`}>Hủy đơn hàng</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Hiển thị tổng số tiền ở cuối màn hình */}
          <View style={[tw`p-4 bg-green-500 rounded-tl-lg rounded-tr-lg`, { position: 'relative', bottom: 0, left: 0, right: 0 }]}>
            <Text style={tw`text-xl text-white font-bold`}>Tổng cộng: {formatPrice(calculateTotalAmount())}</Text>
          </View>
        </>
      )}
    </View>
  );
};

export default OrderScreen;