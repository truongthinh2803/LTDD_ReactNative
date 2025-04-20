import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, Image, TouchableOpacity, Button } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { auth, database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchOrders = () => {
      const ordersRef = ref(database, 'users');
      onValue(ordersRef, (snapshot) => {
        const usersData = snapshot.val();
        const ordersList = [];

        if (usersData) {
          Object.entries(usersData).forEach(([userId, userInfo]) => {
            if (userInfo.orders) {
              Object.entries(userInfo.orders).forEach(([orderId, order]) => {
                ordersList.push({ ...order, userId, userInfo, orderId });
              });
            }
          });
        }
        setOrders(ordersList);
        setLoading(false);
      }, (error) => {
        //Alert.alert('Lỗi', 'Không thể tải đơn hàng.');
        setLoading(false);
      });
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = (orderId, userId) => {
    const updates = {};
    updates[`users/${userId}/orders/${orderId}/status`] = status;
    update(ref(database), updates)
      .then(() => {
        Alert.alert('Thành công', 'Trạng thái đơn hàng đã được cập nhật.');
        setStatus('');
      })
      .catch((error) => {
        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng.');
      });
  };

  const pendingOrders = orders.filter(order => order.status !== 'Đã hủy');
  const canceledOrders = orders.filter(order => order.status === 'Đã hủy');

  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={tw`flex-1`}>
          {/* Tab Navigation */}
          <View style={tw`flex-row justify-around mb-4`}>
            <TouchableOpacity
              style={tw`flex-1 p-2 rounded-lg ${activeTab === 'pending' ? 'bg-green-500' : 'bg-blue-500'} mx-1`} // Thêm mx-1
              onPress={() => setActiveTab('pending')}
            >
              <Text style={tw`text-xl font-bold text-center text-white`}>
                Đơn Hàng Cần Theo Dõi ({pendingOrders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 p-2 rounded-lg ${activeTab === 'canceled' ? 'bg-green-500' : 'bg-blue-500'} mx-1`} // Thêm mx-1
              onPress={() => setActiveTab('canceled')}
            >
              <Text style={tw`text-xl font-bold text-center text-white`}>
                Đơn Hàng Đã Bị Hủy ({canceledOrders.length})
              </Text>
            </TouchableOpacity>
        </View>

          <ScrollView contentContainerStyle={tw`flex-grow`} showsVerticalScrollIndicator={false}>
            {activeTab === 'pending' ? (
              pendingOrders.length === 0 ? (
                <Text style={tw`text-lg text-center text-gray-600`}>Không có đơn hàng nào cần theo dõi.</Text>
              ) : (
                pendingOrders.map((order) => (
                  <View key={order.orderId} style={tw`bg-white rounded-lg shadow-md p-4 mb-4`}>
                    <Text style={tw`text-base font-bold text-blue-600`}>Đơn hàng ID: {order.orderId}</Text>
                    <Text style={tw`text-base font-bold`}>Tên người dùng: {order.userInfo.name}</Text>
                    <Text style={tw`text-base font-bold`}>Địa chỉ: {order.userInfo.address}</Text>
                    <Text style={tw`text-base font-bold`}>Số điện thoại: {order.userInfo.phone}</Text>
                    <Text style={tw`text-base font-bold`}>Thời gian: {order.orderTime}</Text>
                    <Text style={tw`text-base font-bold text-green-600`}>Tổng cộng: {formatPrice(order.totalAmount)}</Text>
                    <Text style={tw`text-base font-bold`}>Hình thức thanh toán: {order.paymentMethod}</Text>
                    <Text style={tw`text-base font-bold text-red-500`}>Trạng thái: {order.status}</Text>

                    <Text style={tw`text-lg font-bold mt-2`}>Sản phẩm:</Text>
                    {order.items.map((item, index) => (
                      <View key={index} style={tw`flex-row items-center mt-1 border-b border-gray-300 py-2`}>
                        {item.image && (
                          <Image
                            source={{ uri: item.image }}
                            style={tw`w-16 h-16 rounded-md mr-2`}
                          />
                        )}
                        <View style={tw`flex-1`}>
                          <Text style={tw`text-base`}>{item.name} x {item.quantity}</Text>
                          <Text style={tw`text-base font-bold text-yellow-600`}>
                            {formatPrice(item.totalPrice)}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Chỉnh sửa trạng thái đơn hàng */}
                    <View style={tw`mt-4`}>
                      <Text style={tw`font-bold mb-2`}>Cập nhật trạng thái đơn hàng:</Text>
                      <Picker
                        selectedValue={status}
                        style={tw`bg-white border border-gray-300 rounded p-2`}
                        onValueChange={(itemValue) => setStatus(itemValue)}
                      >
                        <Picker.Item label="Chọn trạng thái" value="" />
                        <Picker.Item label="Đang xử lý" value="Đang xử lý" />
                        <Picker.Item label="Đã xác nhận đơn hàng" value="Đã xác nhận đơn hàng" />
                        <Picker.Item label="Shop đang chuẩn bị đơn hàng" value="Shop đang chuẩn bị đơn hàng" />
                        <Picker.Item label="Đang giao hàng" value="Đang giao hàng" />
                        <Picker.Item label="Đã giao thành công" value="Đã giao thành công" />
                      </Picker>
                      <Button
                        title="Cập nhật"
                        onPress={() => handleStatusUpdate(order.orderId, order.userId)}
                        disabled={!status}
                        color="#4CAF50"
                      />
                    </View>
                  </View>
                ))
              )
            ) : (
              canceledOrders.length === 0 ? (
                <Text style={tw`text-lg text-center text-gray-600`}>Không có đơn hàng đã hủy nào.</Text>
              ) : (
                canceledOrders.map((order) => (
                  <View key={order.orderId} style={tw`bg-white rounded-lg shadow-md p-4 mb-4`}>
                    <Text style={tw`text-base font-bold text-blue-600`}>Đơn hàng ID: {order.orderId}</Text>
                    <Text style={tw`text-base font-bold`}>Tên người dùng: {order.userInfo.name}</Text>
                    <Text style={tw`text-base font-bold`}>Địa chỉ: {order.userInfo.address}</Text>
                    <Text style={tw`text-base font-bold`}>Số điện thoại: {order.userInfo.phone}</Text>
                    <Text style={tw`text-base font-bold`}>Thời gian: {order.orderTime}</Text>
                    <Text style={tw`text-base font-bold text-green-600`}>Tổng cộng: {formatPrice(order.totalAmount)}</Text>
                    <Text style={tw`text-base font-bold`}>Hình thức thanh toán: {order.paymentMethod}</Text>
                    <Text style={tw`text-base font-bold text-red-500`}>Trạng thái: {order.status}</Text>

                    <Text style={tw`text-lg font-bold mt-2`}>Sản phẩm:</Text>
                    {order.items.map((item, index) => (
                      <View key={index} style={tw`flex-row items-center mt-1 border-b border-gray-300 py-2`}>
                        {item.image && (
                          <Image
                            source={{ uri: item.image }}
                            style={tw`w-16 h-16 rounded-md mr-2`}
                          />
                        )}
                        <View style={tw`flex-1`}>
                          <Text style={tw`text-base`}>{item.name} x {item.quantity}</Text>
                          <Text style={tw`text-base font-bold text-yellow-600`}>
                            {formatPrice(item.totalPrice)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
              )
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
};

export default OrderManagementScreen;
