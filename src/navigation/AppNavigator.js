import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Import Screens
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import DangNhapScreen from '../screens/DangNhapScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BanHangScreen from '../screens/BanHangScreen';
import QuanLyDonHangScreen from '../screens/QuanLyDonHangScreen';
import QuanLyNhapHangScreen from '../screens/QuanLyNhapHangScreen';
import TaoPhieuNhapScreen from '../screens/TaoPhieuNhapScreen';
import QuanLyTranhScreen from '../screens/QuanLyTranhScreen';
import QuanLyHoaSiScreen from '../screens/QuanLyHoaSiScreen';
import QuanLyDanhMucScreen from '../screens/QuanLyDanhMucScreen';
import QuanLyKhachHangScreen from '../screens/QuanLyKhachHangScreen';
import QuanLyTaiKhoanScreen from '../screens/QuanLyTaiKhoanScreen';
import QuanLyThanhToanScreen from '../screens/QuanLyThanhToanScreen';
import ThongTinCaNhanScreen from '../screens/ThongTinCaNhanScreen';
import PaymentScreen from '../screens/PaymentScreen'; // Import màn hình thanh toán mới
import NotificationScreen from '../screens/NotificationScreen'; // ✅ THÊM DÒNG NÀY


import DrawerContent from './DrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={props => <DrawerContent {...props} />}
            screenOptions={{
                headerShown: false, 
            }}
        >
            <Drawer.Screen name="TongQuan" component={DashboardScreen} />
            <Drawer.Screen name="BanHang" component={BanHangScreen} />
            <Drawer.Screen name="QuanLyDonHang" component={QuanLyDonHangScreen} />
            <Drawer.Screen name="QuanLyNhapHang" component={QuanLyNhapHangScreen} />
            <Drawer.Screen name="QuanLyTranh" component={QuanLyTranhScreen} />
            <Drawer.Screen name="QuanLyHoaSi" component={QuanLyHoaSiScreen} />
            <Drawer.Screen name="QuanLyDanhMuc" component={QuanLyDanhMucScreen} />
            <Drawer.Screen name="QuanLyKhachHang" component={QuanLyKhachHangScreen} />
            <Drawer.Screen name="QuanLyTaiKhoan" component={QuanLyTaiKhoanScreen} />
            <Drawer.Screen name="QuanLyThanhToan" component={QuanLyThanhToanScreen} />
        </Drawer.Navigator>
    );
}

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="AuthLoading" // Bắt đầu bằng màn hình chờ
            screenOptions={{
                headerShown: false,
            }}
        >
            {/* Các màn hình không nằm trong Drawer */}
            <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
            <Stack.Screen name="DangNhap" component={DangNhapScreen} />
            <Stack.Screen name="Main" component={MainDrawerNavigator} />
            <Stack.Screen name="TaoPhieuNhap" component={TaoPhieuNhapScreen} />
            <Stack.Screen name="ThongTinCaNhan" component={ThongTinCaNhanScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;