import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, Image, TouchableOpacity, Button } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { auth, database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusByOrder, setStatusByOrder] = useState({}); // Lưu trạng thái riêng cho từng đơn hàng
  const [activeTab, setActiveTab] = useState('newOrders');

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
  
          // Hàm parse thời gian đơn hàng từ chuỗi thành đối tượng Date
          const parseOrderTime = (orderTime) => {
            const [time, date] = orderTime.split(', ');
            const [hours, minutes, seconds] = time.split(':');
            const [day, month, year] = date.split('/');
            return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
          };
  
          // Sắp xếp danh sách đơn hàng theo thời gian mới nhất
          ordersList.sort((a, b) => parseOrderTime(b.orderTime) - parseOrderTime(a.orderTime));
        }
        setOrders(ordersList);
        setLoading(false);
      }, (error) => {
        setLoading(false);
      });
    };
  
    fetchOrders();
  }, []);
  
  const handleStatusUpdate = (orderId, userId) => {
    const updates = {};
    const newStatus = statusByOrder[orderId]; // Lấy trạng thái của đơn hàng cụ thể

    updates[`users/${userId}/orders/${orderId}/status`] = newStatus;
    update(ref(database), updates)
      .then(() => {
        Alert.alert('Thành công', 'Trạng thái đơn hàng đã được cập nhật.');
        setStatusByOrder(prevState => ({ ...prevState, [orderId]: '' })); // Reset trạng thái của đơn hàng sau khi cập nhật
      })
      .catch(() => {
        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng.');
      });
  };

  const newOrders = orders.filter(order => order.status === 'Đang xử lý');
  const processingOrders = orders.filter(order => ['Đã xác nhận đơn hàng', 'Shop đang chuẩn bị đơn hàng', 'Đang giao hàng'].includes(order.status));
  const deliveredOrders = orders.filter(order => order.status === 'Đã giao thành công');
  const canceledOrders = orders.filter(order => order.status === 'Đã hủy');

  // Hàm render icon với số lượng đơn hàng
  const renderIconWithBadge = (iconName, badgeCount) => {
    return (
      <View style={tw`relative`}>
        <Icon name={iconName} size={30} color="white" style={tw`text-center`} />
        {badgeCount > 0 && (
          <View style={tw`absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 justify-center items-center`}>
            <Text style={tw`text-white text-xs font-bold`}>{badgeCount}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderOrder = (order) => (
    <View key={order.orderId} style={tw`bg-white rounded-lg shadow-md p-4 mb-4`}>
      <Text style={tw`text-base font-bold text-blue-600`}>Đơn hàng ID: {order.orderId}</Text>
      <Text style={tw`text-base font-bold`}>Tên người dùng: {order.userInfo.name}</Text>
      <Text style={tw`text-base font-bold`}>Địa chỉ giao hàng: {order.shippingAddress}</Text>
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

      {/* Chỉ cho phép cập nhật trạng thái nếu đơn chưa giao hoặc chưa bị hủy */}
      {order.status !== 'Đã giao thành công' && order.status !== 'Đã hủy' && (
        <View style={tw`mt-4`}>
          <Text style={tw`font-bold mb-2`}>Cập nhật trạng thái đơn hàng:</Text>
          <Picker
            selectedValue={statusByOrder[order.orderId] || ''} // Trạng thái riêng của từng đơn hàng
            style={tw`bg-white border border-gray-300 rounded p-2`}
            onValueChange={(itemValue) => setStatusByOrder(prevState => ({ ...prevState, [order.orderId]: itemValue }))} // Cập nhật trạng thái riêng cho từng đơn hàng
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
            disabled={!statusByOrder[order.orderId]} // Vô hiệu hoá nếu không có trạng thái mới
            color="#4CAF50"
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={tw`flex-1`}>
          {/* Tab Navigation with Icons and Badges */}
          <View style={tw`flex-row justify-around mb-4`}>
            <TouchableOpacity style={tw`flex-1 p-2 mx-1 rounded-lg ${activeTab === 'newOrders' ? 'bg-green-500' : 'bg-blue-500'}`} onPress={() => setActiveTab('newOrders')}>
              {renderIconWithBadge('fiber-new', newOrders.length)}
              <Text style={tw`text-lg font-bold text-center text-white`}>Mới</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`flex-1 p-2 mx-1 rounded-lg ${activeTab === 'processingOrders' ? 'bg-green-500' : 'bg-blue-500'}`} onPress={() => setActiveTab('processingOrders')}>
              {renderIconWithBadge('pending', processingOrders.length)}
              <Text style={tw`text-lg font-bold text-center text-white`}>Xử lý</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`flex-1 p-2 mx-1 rounded-lg ${activeTab === 'deliveredOrders' ? 'bg-green-500' : 'bg-blue-500'}`} onPress={() => setActiveTab('deliveredOrders')}>
              {renderIconWithBadge('done-all', deliveredOrders.length)}
              <Text style={tw`text-lg font-bold text-center text-white`}>Đã giao</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`flex-1 p-2 mx-1 rounded-lg ${activeTab === 'canceledOrders' ? 'bg-green-500' : 'bg-blue-500'}`} onPress={() => setActiveTab('canceledOrders')}>
              {renderIconWithBadge('cancel', canceledOrders.length)}
              <Text style={tw`text-lg font-bold text-center text-white`}>Bị Hủy</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={tw`flex-1`}>
            {activeTab === 'newOrders' && (newOrders.length === 0 ? (
              <Text style={tw`text-lg text-center text-gray-600`}>Không có đơn hàng mới.</Text>
            ) : (
              newOrders.map(renderOrder)
            ))}
            {activeTab === 'processingOrders' && (processingOrders.length === 0 ? (
              <Text style={tw`text-lg text-center text-gray-600`}>Không có đơn hàng đang xử lý.</Text>
            ) : (
              processingOrders.map(renderOrder)
            ))}
            {activeTab === 'deliveredOrders' && (deliveredOrders.length === 0 ? (
              <Text style={tw`text-lg text-center text-gray-600`}>Không có đơn hàng đã giao.</Text>
            ) : (
              deliveredOrders.map(renderOrder)
            ))}
            {activeTab === 'canceledOrders' && (canceledOrders.length === 0 ? (
              <Text style={tw`text-lg text-center text-gray-600`}>Không có đơn hàng bị hủy.</Text>
            ) : (
              canceledOrders.map(renderOrder)
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default OrderManagementScreen;

const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
};
