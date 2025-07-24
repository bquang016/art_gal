import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Import Screens
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

// Import Custom Drawer
import DrawerContent from './DrawerContent';
import { COLORS } from '../theme/theme';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Nhóm các màn hình sẽ được hiển thị trong menu
const MainDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            // Sử dụng DrawerContent tùy chỉnh
            drawerContent={props => <DrawerContent {...props} />}
            screenOptions={{
                // Ẩn header mặc định của Drawer để các màn hình trong Stack tự quản lý
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

// Bộ điều hướng chính của ứng dụng
const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="DangNhap"
            screenOptions={{
                // Áp dụng chung cho tất cả các màn hình trong Stack
                headerShown: false, // Ẩn header ở cấp cao nhất
            }}
        >
            {/* Màn hình không cần menu (drawer) */}
            <Stack.Screen name="DangNhap" component={DangNhapScreen} />
            
            {/* Drawer Navigator được lồng vào như một màn hình của Stack */}
            <Stack.Screen name="Main" component={MainDrawerNavigator} />

            {/* Các màn hình được điều hướng tới từ nơi khác, không nằm trong Drawer */}
            <Stack.Screen name="TaoPhieuNhap" component={TaoPhieuNhapScreen} />
            <Stack.Screen name="ThongTinCaNhan" component={ThongTinCaNhanScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;