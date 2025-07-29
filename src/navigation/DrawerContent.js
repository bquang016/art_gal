import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES } from '../theme/theme';

const DRAWER_ITEMS = {
    main: [
        { name: 'TongQuan', title: 'Tổng quan', icon: 'home-outline', roles: ['ROLE_ADMIN'] },
        { name: 'BanHang', title: 'Bán hàng', icon: 'cart-outline', roles: ['ROLE_ADMIN', 'ROLE_NHANVIEN'] },
    ],
    management: [
        { name: 'QuanLyDonHang', title: 'Đơn hàng', icon: 'cube-outline', roles: ['ROLE_ADMIN', 'ROLE_NHANVIEN'] },
        { name: 'QuanLyNhapHang', title: 'Nhập hàng', icon: 'arrow-down-circle-outline', roles: ['ROLE_ADMIN', 'ROLE_NHANVIEN'] },
        { name: 'QuanLyTranh', title: 'Tranh', icon: 'palette-outline', roles: ['ROLE_ADMIN', 'ROLE_NHANVIEN'] },
        { name: 'QuanLyHoaSi', title: 'Họa sĩ', icon: 'brush-outline', roles: ['ROLE_ADMIN', 'ROLE_NHANVIEN'] },
        { name: 'QuanLyDanhMuc', title: 'Danh mục', icon: 'pricetags-outline', roles: ['ROLE_ADMIN', 'ROLE_NHANVIEN'] },
        { name: 'QuanLyKhachHang', title: 'Khách hàng', icon: 'people-outline', roles: ['ROLE_ADMIN', 'ROLE_NHANVIEN'] },
    ],
    system: [
        { name: 'QuanLyTaiKhoan', title: 'Tài khoản', icon: 'people-circle-outline', roles: ['ROLE_ADMIN'] },
        { name: 'QuanLyThanhToan', title: 'Thanh toán', icon: 'card-outline', roles: ['ROLE_ADMIN'] },
    ]
};

const DrawerItem = ({ label, icon, onPress, isActive }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.drawerItem, isActive && styles.drawerItemActive]}
    >
        <View style={styles.drawerItemIcon}>
            <Ionicons name={icon} size={22} color={isActive ? COLORS.white : COLORS.textMuted} />
        </View>
        <Text style={[styles.drawerItemLabel, isActive && styles.drawerItemLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

const DrawerHeaderGroup = ({ title }) => (
    <Text style={styles.groupTitle}>{title}</Text>
);

const DrawerContent = ({ navigation, state }) => {
    const insets = useSafeAreaInsets();
    const activeRouteName = state.routes[state.index].name;

    const [userName, setUserName] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                const name = await AsyncStorage.getItem('user_name');
                const role = await AsyncStorage.getItem('user_role');
                setUserName(name || 'Người dùng');
                setUserRole(role);
            };
            fetchUserData();
        }, [])
    );

    // ✅ SỬA LẠI: Hoàn thiện chức năng đăng xuất
    const handleLogout = async () => {
        // Xóa toàn bộ dữ liệu đã lưu
        await AsyncStorage.clear();
        
        // Reset state để tránh hiển thị thông tin cũ
        setUserName(null);
        setUserRole(null);
        
        // Điều hướng về màn hình đăng nhập
        navigation.navigate('DangNhap');
    };

    const renderItems = (items) => {
        if (!items) {
            return null;
        }
        return items
            .filter(item => item.roles && item.roles.includes(userRole))
            .map(item => (
                <DrawerItem
                    key={item.name}
                    label={item.title}
                    icon={item.icon}
                    isActive={activeRouteName === item.name}
                    onPress={() => navigation.navigate(item.name)}
                />
            ));
    };
    
    if (!userName || !userRole) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.profileContainer, { paddingTop: insets.top + SIZES.base }]}
                onPress={() => navigation.navigate('ThongTinCaNhan')}
            >
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?u=admin' }}
                    style={styles.avatar}
                />
                <View>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userRole}>
                        {userRole === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                    </Text>
                </View>
            </TouchableOpacity>

            <ScrollView style={styles.menuContainer}>
                {renderItems(DRAWER_ITEMS.main)}
                
                <DrawerHeaderGroup title="QUẢN LÝ" />
                {renderItems(DRAWER_ITEMS.management)}

                {DRAWER_ITEMS.system.some(item => item.roles && item.roles.includes(userRole)) && (
                    <>
                        <DrawerHeaderGroup title="HỆ THỐNG" />
                        {renderItems(DRAWER_ITEMS.system)}
                    </>
                )}
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + SIZES.base }]}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: SIZES.base * 2,
    },
    userName: {
        ...FONTS.h3,
        color: COLORS.textDark,
    },
    userRole: {
        ...FONTS.body4,
        color: COLORS.textMuted,
    },
    menuContainer: {
        padding: SIZES.base,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base * 1.5,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.base / 2,
    },
    drawerItemActive: {
        backgroundColor: COLORS.primary,
    },
    drawerItemIcon: {
        width: 30,
        alignItems: 'center',
    },
    drawerItemLabel: {
        ...FONTS.h4,
        fontWeight: '500',
        color: COLORS.textDark,
        marginLeft: SIZES.padding,
    },
    drawerItemLabelActive: {
        color: COLORS.white,
    },
    groupTitle: {
        ...FONTS.body4,
        color: COLORS.textMuted,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        paddingHorizontal: SIZES.padding,
        paddingTop: SIZES.padding * 2,
        paddingBottom: SIZES.base,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        paddingHorizontal: SIZES.padding,
        paddingTop: SIZES.padding,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.base,
    },
    logoutText: {
        ...FONTS.h4,
        color: COLORS.danger,
        fontWeight: 'bold',
        marginLeft: SIZES.padding,
    },
});

export default DrawerContent;