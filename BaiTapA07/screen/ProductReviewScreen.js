import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'tailwind-react-native-classnames';
import { database } from '../firebase';
import { get, ref, set, onValue } from 'firebase/database'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 

const ProductReviewScreen = ({ route, navigation }) => {
  const { product, orderId } = route.params;
  const [rating, setRating] = useState(0); 
  const [reviewText, setReviewText] = useState('');
  const [userId, setUserId] = useState(null); 
  const [userName, setUserName] = useState(''); 
  const [productDetails, setProductDetails] = useState(null);
  const [userReview, setUserReview] = useState(null); // Thêm trạng thái để lưu thông tin đánh giá

  // Lấy userId từ Firebase Authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); 
      } else {
        setUserId(null); 
      }
    });

    return () => unsubscribe(); 
  }, []);

  // Lấy thông tin người dùng từ Database
  useEffect(() => {
    if (userId) {
      const userRef = ref(database, `users/${userId}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserName(data.name);
        }
      });
    }
  }, [userId]);

  // Lấy thông tin sản phẩm từ Database
  useEffect(() => {
    const productRef = ref(database, `products/${product.id}`);
    onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductDetails(data); 
      }
    });
  }, [product.id]);

  // Lấy đánh giá của người dùng từ Database
  useEffect(() => {
    if (userId) {
      const reviewRef = ref(database, `products/${product.id}/orders/${orderId}/reviews/${userId}`);
      onValue(reviewRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserReview(data); // Lưu đánh giá của người dùng
          setRating(data.rating); // Cập nhật rating
          setReviewText(data.reviewText); // Cập nhật reviewText
        } else {
          setUserReview(null); // Nếu không có đánh giá, đặt lại thành null
        }
      });
    }
  }, [userId, product.id, orderId]);

  const handleSubmitReview = async () => {
    if (!userId) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để gửi đánh giá.');
      return;
    }

    if (rating === 0 || reviewText.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao và nhập đánh giá.');
      return;
    }

    const reviewItem = {
      rating,
      reviewText,
      userName,
      createdAt: new Date().toISOString(),
    };

    try {
      const reviewRef = ref(database, `products/${product.id}/orders/${orderId}/reviews/${userId}`); 
      await set(reviewRef, reviewItem);
      // Cập nhật điểm cho người dùng
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      const newPoints = (userData.points || 0) + 1000; // Thêm 1000 điểm
      
      // Cập nhật lại thông tin người dùng
      await set(userRef, { ...userData, points: newPoints });

      Alert.alert('Thông báo', 'Đánh giá của bạn đã được gửi thành công. Bạn nhận được 1000 điểm!');
      navigation.navigate('OrderScreen', { reviewSubmitted: true });
      setRating(0); 
      setReviewText('');
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá: ', error);
      Alert.alert('Thông báo', 'Đã xảy ra lỗi khi gửi đánh giá.');
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
  };

  const renderRatingDescription = () => {
    switch (rating) {
      case 1:
        return "Chưa hài lòng lắm";
      case 2:
        return "Không tốt như mong đợi";
      case 3:
        return "Chấp nhận được";
      case 4:
        return "Sản phẩm rất tốt";
      case 5:
        return "Sản phẩm xuất sắc";
      default:
        return "";
    }
  };

  return (
    <View style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`p-4 bg-gray-100 pb-20`}>
        <View style={tw`w-full h-60 bg-white rounded-xl mb-5 justify-center items-center`}>
          <Image source={{ uri: product.image }} style={tw`w-full h-full rounded-xl`} resizeMode="contain" />
        </View>
        <View style={tw`bg-white p-4 rounded-xl shadow-lg`}>
          <Text style={tw`text-2xl font-bold mb-2 text-gray-800`}>{product.name}</Text>
          <Text style={tw`text-2xl font-bold mb-2 text-yellow-600`}>{formatPrice(product.totalPrice)}</Text>
          
          {/* Hiển thị thông tin thương hiệu và danh mục */}
          {productDetails && (
            <>
              <Text style={tw`text-lg font-bold mb-2 text-gray-600`}>Hãng: {productDetails.brand}</Text>
              <Text style={tw`text-lg font-bold mb-4 text-gray-600`}>Danh mục: {productDetails.category}</Text>
            </>
          )}

          {/* Hiển thị đánh giá của người dùng hoặc nút gửi đánh giá */}
          {userReview ? (
            <View>
              <Text style={tw`text-xl font-semibold text-center mb-0`}>Đánh giá của bạn:</Text>
              <Text style={tw`text-xl font-medium text-blue-600 text-center mb-2`}>{renderRatingDescription()}</Text>
              <Text style={tw`text-lg mb-2`}>Đánh giá: {rating} sao</Text>
              <Text style={tw`text-lg mb-4`}>Nội dung: {reviewText}</Text>
              <TouchableOpacity 
                style={tw`bg-green-500 flex-row justify-center items-center p-3 rounded-md mt-4 shadow-lg`}
                onPress={() => navigation.goBack()}
              >
                <Text style={tw`text-xl text-white font-bold`}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={tw`text-xl font-semibold text-center mb-0`}>Đánh giá của bạn:</Text>
              <View style={tw`flex-row justify-center mt-2`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Icon name={star <= rating ? "star" : "star-border"} size={55} color={star <= rating ? "#FFD700" : "#ccc"} style={tw`mx-1`} />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={tw`text-xl font-medium text-blue-600 text-center mb-2`}>{renderRatingDescription()}</Text>
              <TextInput
                style={tw`border border-gray-300 rounded-md p-2 mt-2 h-24 bg-white shadow-md`}
                placeholder="Nhập đánh giá của bạn..."
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity 
                style={tw`bg-green-600 flex-row justify-center items-center p-3 rounded-md mt-4 shadow-lg`}
                onPress={handleSubmitReview}
              >
                <Icon name="send" size={20} color="#ffffff" />
                <Text style={tw`text-lg text-white font-bold ml-2`}>Gửi Đánh Giá</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductReviewScreen; 
