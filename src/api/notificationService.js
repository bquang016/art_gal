import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import apiService from './apiService';

// Cấu hình cách thông báo hiển thị khi ứng dụng đang chạy
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Hiển thị thông báo dạng banner
    shouldPlaySound: false, // Không phát ra âm thanh
    shouldSetBadge: false, // Không thay đổi số trên icon ứng dụng
  }),
});

// Hàm chính để đăng ký nhận thông báo
export async function registerForPushNotificationsAsync() {
  let token;

  // Đối với Android, cần phải tạo một "kênh" thông báo
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250], // Rung theo chu kỳ
      lightColor: '#FF231F7C',
    });
  }

  // Chỉ thực hiện trên thiết bị thật
  if (Device.isDevice) {
    // Xin quyền từ người dùng
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Lỗi', 'Không thể nhận thông báo đẩy nếu không được cấp quyền!');
      return;
    }
    
    // Lấy Expo Push Token định danh cho thiết bị này
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        Alert.alert(
          'Lỗi cấu hình', 
          'Không tìm thấy Project ID trong file app.json. Vui lòng chạy lệnh `npx eas project:init` hoặc `npx expo login`.'
        );
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.error("Lỗi khi lấy push token:", e);
      Alert.alert("Lỗi", "Không thể lấy push token. Vui lòng kiểm tra cấu hình Firebase và Expo.");
    }
  } else {
    Alert.alert('Thông báo', 'Phải sử dụng thiết bị thật để nhận thông báo đẩy.');
  }

  return token;
}

// Hàm gửi token lên backend (sẽ được dùng sau)
export async function sendTokenToBackend(token) {
    if (!token) return;
    try {
        // Chúng ta sẽ tạo endpoint này ở backend sau
        await apiService.post('/notifications/register-token', { token });
        console.log("Gửi token lên backend thành công!");
    } catch (error) {
        console.error("Lỗi khi gửi token lên backend:", error);
    }
}