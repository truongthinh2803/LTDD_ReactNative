import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, TextInput, Switch } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, database } from '../firebase';
import { ref, onValue, set, push } from 'firebase/database';

const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
};

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { selectedItems, totalPrice } = route.params;
  const [userInfo, setUserInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingAddress, setShippingAddress] = useState('');
  const [userPoints, setUserPoints] = useState(0); // Điểm tích lũy
  const [useAllPoints, setUseAllPoints] = useState(false); // Nút gạt sử dụng toàn bộ điểm
  const [pointsUsed, setPointsUsed] = useState(0); // Số điểm sẽ dùng
  const [finalPrice, setFinalPrice] = useState(totalPrice); // Tổng tiền sau khi trừ điểm

  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (userId) {
      const userRef = ref(database, `users/${userId}`);
      onValue(userRef, (snapshot) => {
        const user = snapshot.val();
        setUserInfo(user);
        setShippingAddress(user ? user.address : '');
        setUserPoints(user ? user.points || 0 : 0); // Lấy điểm tích lũy
      });
    }
  }, [userId]);

  useEffect(() => {
    if (useAllPoints) {
      // Nếu chọn gạt để sử dụng toàn bộ điểm
      setPointsUsed(userPoints);
    } else {
      // Nếu hủy gạt, đặt pointsUsed về 0
      setPointsUsed(0);
    }
  }, [useAllPoints, userPoints]);
  
  useEffect(() => {
    // Tính tổng tiền sau khi trừ điểm
    const priceAfterPoints = totalPrice - pointsUsed;
    setFinalPrice(priceAfterPoints < 0 ? 0 : priceAfterPoints);
  }, [pointsUsed, totalPrice]);

  const handleConfirmOrder = () => {
    Alert.alert(
      'Xác nhận đặt hàng',
      'Bạn muốn đặt đơn hàng này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt hàng',
          onPress: () => {
            if (userId) {
              const userRef = ref(database, `users/${userId}/orders`);
              const newOrderRef = push(userRef);

              const orderData = {
                items: selectedItems,
                totalAmount: finalPrice, // Sử dụng tổng tiền đã trừ điểm
                paymentMethod: paymentMethod,
                shippingAddress: shippingAddress,
                status: 'Đang xử lý',
                orderTime: new Date().toLocaleString(),
              };

              set(newOrderRef, orderData)
                .then(() => {
                  // Cập nhật lại điểm tích lũy của người dùng
                  const remainingPoints = userPoints - pointsUsed;
                  set(ref(database, `users/${userId}/points`), remainingPoints);

                  Alert.alert(
                    'Đặt hàng thành công!',
                    'Đơn hàng của bạn đã được đặt thành công. Vui lòng theo dõi đơn hàng tại mục Đơn hàng.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                  );
                })
                .catch((error) => {
                  Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
                });
            }
          },
        },
      ]
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {userInfo && (
          <View style={tw`mb-4 p-6 bg-white rounded-lg shadow-md border border-gray-300`}>
            <Text style={tw`text-base`}>{`Họ tên: `}<Text style={tw`font-semibold`}>{userInfo.name}</Text></Text>
            <Text style={tw`text-base`}>{`Email: `}<Text style={tw`font-semibold`}>{auth.currentUser ? auth.currentUser.email : 'Không có'}</Text></Text>
            <Text style={tw`text-base`}>{`Số điện thoại: `}<Text style={tw`font-semibold`}>{userInfo.phone}</Text></Text>
          </View>
        )}

        <Text style={tw`text-lg font-bold mb-2`}>Địa chỉ nhận hàng:</Text>
        <TextInput
          style={tw`bg-white border border-gray-300 p-2 rounded mb-4`}
          value={shippingAddress}
          onChangeText={setShippingAddress}
          placeholder="Nhập địa chỉ nhận hàng"
        />

        <View style={tw`mb-4 p-4 bg-white rounded-lg shadow`}>
          <Text style={tw`text-lg font-bold`}>Sản phẩm đã chọn</Text>
          {selectedItems.map((item) => (
            <View key={item.id} style={tw`flex-row items-center mt-2`}>
              <Image source={{ uri: item.image }} style={tw`w-16 h-16 rounded`} resizeMode="contain" />
              <View style={tw`flex-1 ml-4`}>
                <Text style={tw`text-base font-bold`}>{item.name}</Text>
                <Text style={tw`text-base text-yellow-600 font-bold`}>{formatPrice(item.totalPrice)}</Text>
                <Text style={tw`text-base text-gray-600 font-bold`}>Số lượng: {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Hiển thị điểm tích lũy */}
        <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
          <Text style={tw`text-lg font-bold`}>Điểm tích lũy của bạn: {userPoints}</Text>
          <View style={tw`flex-row items-center justify-between mt-2`}>
            <Text style={tw`text-base`}>Sử dụng toàn bộ điểm</Text>
            <Switch
              value={useAllPoints}
              onValueChange={setUseAllPoints}
            />
          </View>
          <TextInput
            style={tw`bg-white border border-gray-300 p-2 rounded mt-2`}
            value={pointsUsed.toString()}
            onChangeText={(value) => setPointsUsed(Number(value))}
            keyboardType="numeric"
            placeholder="Nhập số điểm bạn muốn dùng"
            editable={!useAllPoints} // Vô hiệu hóa ô nhập nếu chọn sử dụng toàn bộ điểm
          />
        </View>

        <View style={tw`bg-white p-4 rounded-lg shadow mb-20`}>
          <Text style={tw`text-lg font-bold`}>Phương thức thanh toán</Text>
          <TouchableOpacity
            style={tw`mt-2 border border-gray-400 rounded p-2 flex-row items-center`}
            onPress={() => setPaymentMethod('COD')}
          >
            <Icon name="attach-money" size={24} color={paymentMethod === 'COD' ? 'black' : 'gray'} />
            <Text style={tw`text-center flex-1 ${paymentMethod === 'COD' ? 'font-bold' : ''}`}>Thanh toán khi nhận hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`mt-2 border border-gray-400 rounded p-2 flex-row items-center`}
            onPress={() => setPaymentMethod('Ví điện tử')}
          >
            <Icon name="account-balance-wallet" size={24} color={paymentMethod === 'Ví điện tử' ? 'black' : 'gray'} />
            <Text style={tw`text-center flex-1 ${paymentMethod === 'Ví điện tử' ? 'font-bold' : ''}`}>Ví điện tử</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`mt-2 border border-gray-400 rounded p-2 flex-row items-center`}
            onPress={() => setPaymentMethod('Chuyển khoản')}
          >
            <Icon name="account-balance" size={24} color={paymentMethod === 'Chuyển khoản' ? 'black' : 'gray'} />
            <Text style={tw`text-center flex-1 ${paymentMethod === 'Chuyển khoản' ? 'font-bold' : ''}`}>Chuyển khoản</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`mt-2 border border-gray-400 rounded p-2 flex-row items-center`}
            onPress={() => setPaymentMethod('Thẻ tín dụng')}
          >
            <Icon name="credit-card" size={24} color={paymentMethod === 'Thẻ tín dụng' ? 'black' : 'gray'} />
            <Text style={tw`text-center flex-1 ${paymentMethod === 'Thẻ tín dụng' ? 'font-bold' : ''}`}>Thẻ tín dụng</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={tw`absolute bottom-0 left-0 right-0 p-4 bg-white rounded-t-lg shadow`}>
        <Text style={tw`text-xl text-blue-600 font-bold`}>Tổng cộng: {formatPrice(finalPrice)}</Text>
        <TouchableOpacity
          style={tw`bg-green-500 py-3 rounded-lg mt-2 flex-row items-center justify-center`}
          onPress={handleConfirmOrder}
        >
          <Icon name="check-circle" size={24} color="white" />
          <Text style={tw`text-white text-center text-xl font-semibold ml-2`}>Xác nhận đặt hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`bg-red-500 py-3 rounded-lg mt-2 flex-row items-center justify-center`}
          onPress={() => navigation.goBack()}
        >
          <Icon name="cancel" size={24} color="white" />
          <Text style={tw`text-white text-center text-xl font-semibold ml-2`}>Hủy bỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderConfirmationScreen;
