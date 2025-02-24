import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const PersonalInfoScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setInterval(() => {
      navigation.navigate('HomePage');
    }, 10000);

    return () => clearInterval(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Họ và tên: Nguyên Trường Thịnh</Text>
      <Text style={styles.text}>Mã số sinh viên: 21110311</Text>
      <Text style={styles.text}>Khoa: Công Nghệ Thông Tin</Text>
    </View>
  );
};

const HomePageScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setInterval(() => {
      navigation.navigate('PersonalInfo');
    }, 10000);

    return () => clearInterval(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Đây là trang HomePage</Text>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PersonalInfo">
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HomePage" component={HomePageScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});
