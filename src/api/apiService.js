import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// export const SERVER_BASE_URL = 'http://192.168.1.242:8086'; 
// cmc-itest: 172.17.162.207
export const SERVER_BASE_URL = 'http://172.17.160.86:8086'; 

// URL cho các cuộc gọi API sẽ là SERVER_BASE_URL + /api
export const API_BASE_URL = `${SERVER_BASE_URL}/api`;

const apiService = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor để tự động đính kèm token vào mỗi request
apiService.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiService;