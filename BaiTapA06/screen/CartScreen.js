import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, database } from '../firebase'; // Import Firebase
import { ref, onValue, remove, update } from 'firebase/database';

// Hàm định dạng giá
const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
};

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItems, setSelectedItems] = useState({}); // Lưu trữ sản phẩm được chọn

  // Lấy userId từ Firebase Authentication
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (userId) {
      const cartRef = ref(database, `users/${userId}/cart`);

      // Theo dõi thay đổi trong giỏ hàng
      const unsubscribe = onValue(cartRef, (snapshot) => {
        const items = [];
        let total = 0;
        snapshot.forEach((childSnapshot) => {
          const item = childSnapshot.val();
          const price = parseFloat(item.totalPrice) || 0;

          // Tính tổng giá cho từng sản phẩm
          items.push({ id: childSnapshot.key, ...item });
          if (selectedItems[childSnapshot.key]) {
            total += price; // Cộng dồn nếu sản phẩm được chọn
          }
        });
        setCartItems(items);
        setTotalPrice(total);
      });

      // Dọn dẹp khi component bị tháo gỡ
      return () => unsubscribe();
    }
  }, [userId, selectedItems]);

  const handleRemoveItem = async (itemId) => {
    const itemRef = ref(database, `users/${userId}/cart/${itemId}`);
    await remove(itemRef);
    Alert.alert('Thông báo', 'Sản phẩm đã được xóa khỏi giỏ hàng.');
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Không cho phép số lượng nhỏ hơn 1
  
    // Tìm sản phẩm có itemId trong giỏ hàng
    const item = cartItems.find((product) => product.id === itemId);
    if (!item) return;
  
    // Tính giá ban đầu của sản phẩm (totalPrice hiện tại chia cho số lượng hiện tại)
    const originalPrice = item.totalPrice / item.quantity;
  
    // Tính lại tổng giá cho sản phẩm dựa trên giá ban đầu và số lượng mới
    const updatedTotalPrice = originalPrice * newQuantity;
  
    // Cập nhật số lượng và tổng giá vào Firebase
    const itemRef = ref(database, `users/${userId}/cart/${itemId}`);
    await update(itemRef, { quantity: newQuantity, totalPrice: updatedTotalPrice }); // Cập nhật số lượng và giá mới
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId], // Chuyển đổi trạng thái chọn
    }));
  };

  const handlePlaceOrder = () => {
    // Kiểm tra nếu không có sản phẩm nào được chọn
    const hasSelectedItems = Object.values(selectedItems).includes(true);
  
    if (!hasSelectedItems) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để đặt hàng.');
      return;
  }
  
    // Chuyển đổi selectedItems từ trạng thái thành một đối tượng để truyền qua navigation
    const itemsToOrder = cartItems.filter(item => selectedItems[item.id]);
  
    navigation.navigate('OrderConfirmation', {
      selectedItems: itemsToOrder, // Truyền thông tin sản phẩm đã chọn
      totalPrice,
    });
  };
  

  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      <ScrollView>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <View key={item.id} style={tw`bg-white p-4 mb-4 rounded-lg shadow`}>
              <View style={tw`flex-row items-center`}>
                {/* Nút tròn chọn sản phẩm */}
                <TouchableOpacity
                  onPress={() => handleSelectItem(item.id)}
                  style={[
                    tw`w-6 h-6 rounded-full border border-gray-400 items-center justify-center`,
                    { backgroundColor: selectedItems[item.id] ? 'green' : 'white' },
                  ]}
                >
                  <Icon name="check" size={16} color={selectedItems[item.id] ? 'white' : 'transparent'} />
                </TouchableOpacity>

                <Image source={{ uri: item.image }} style={tw`w-20 h-20 rounded`} resizeMode="contain" />
                <View style={tw`flex-1 ml-4`}>
                  <Text style={tw`text-sm font-bold`}>{item.name}</Text>
                  <Text style={tw`text-yellow-600 text-lg font-bold`}>
                    {formatPrice(item.totalPrice)}
                  </Text>
                  <View style={tw`flex-row items-center mt-2`}>
                    <TouchableOpacity onPress={() => handleQuantityChange(item.id, item.quantity - 1)}>
                      <Icon name="remove-circle-outline" size={24} color="red" />
                    </TouchableOpacity>
                    <Text style={tw`mx-2`}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleQuantityChange(item.id, item.quantity + 1)}>
                      <Icon name="add-circle-outline" size={24} color="green" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                  <Icon name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={tw`flex-1 justify-center items-center`}>
            <Icon name="shopping-cart" size={40} color="orange" />
            <Text style={tw`text-center text-lg font-bold text-blue-600 mt-2`}>
              Giỏ hàng chưa có sản phẩm nào! 
            </Text>
            <Text style={tw`text-center text-base text-gray-500`}>
              Mua sắm ngay để không bỏ lỡ!
            </Text>
          </View>
        )}
      </ScrollView>
      <View style={tw`bg-white p-4 rounded-lg shadow mt-4`}>
        <Text style={tw`text-xl text-blue-600 font-bold`}>Tổng cộng: {formatPrice(totalPrice)}</Text>
        <TouchableOpacity
          style={tw`bg-green-500 py-3 rounded-lg mt-2 flex-row items-center justify-center`}
          onPress={handlePlaceOrder} // Gọi hàm khi nhấn nút
        >
          <Icon name="assignment" size={24} color="white" />
          <Text style={tw`text-white text-center text-xl font-semibold ml-2`}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;
