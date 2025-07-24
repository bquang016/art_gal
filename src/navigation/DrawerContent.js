import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';

// Dữ liệu cho các mục menu, dễ dàng quản lý và thêm bớt
const DRAWER_ITEMS = {
    main: [
        { name: 'TongQuan', title: 'Tổng quan', icon: 'home-outline' },
        { name: 'BanHang', title: 'Bán hàng', icon: 'cart-outline' },
    ],
    management: [
        { name: 'QuanLyDonHang', title: 'Đơn hàng', icon: 'cube-outline' },
        { name: 'QuanLyNhapHang', title: 'Nhập hàng', icon: 'arrow-down-circle-outline' },
        { name: 'QuanLyTranh', title: 'Tranh', icon: 'palette-outline' },
        { name: 'QuanLyHoaSi', title: 'Họa sĩ', icon: 'brush-outline' },
        { name: 'QuanLyDanhMuc', title: 'Danh mục', icon: 'pricetags-outline' },
        { name: 'QuanLyKhachHang', title: 'Khách hàng', icon: 'people-outline' },
    ],
    system: [
        { name: 'QuanLyTaiKhoan', title: 'Tài khoản', icon: 'people-circle-outline' },
        { name: 'QuanLyThanhToan', title: 'Thanh toán', icon: 'card-outline' },
    ]
};

// Component cho mỗi mục menu
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

// Component cho tiêu đề nhóm
const DrawerHeaderGroup = ({ title }) => (
    <Text style={styles.groupTitle}>{title}</Text>
);

const DrawerContent = ({ navigation, state }) => {
    const insets = useSafeAreaInsets();
    const activeRouteName = state.routes[state.index].name;

    return (
        <View style={styles.container}>
            {/* Header: Thông tin User */}
            <TouchableOpacity
                style={[styles.profileContainer, { paddingTop: insets.top + SIZES.base }]}
                onPress={() => navigation.navigate('ThongTinCaNhan')}
            >
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?u=admin' }}
                    style={styles.avatar}
                />
                <View>
                    <Text style={styles.userName}>Quang Đẹp Zai</Text>
                    <Text style={styles.userRole}>Quản trị viên</Text>
                </View>
            </TouchableOpacity>

            {/* Body: Danh sách menu */}
            <ScrollView style={styles.menuContainer}>
                {DRAWER_ITEMS.main.map(item => (
                    <DrawerItem
                        key={item.name}
                        label={item.title}
                        icon={item.icon}
                        isActive={activeRouteName === item.name}
                        onPress={() => navigation.navigate(item.name)}
                    />
                ))}
                
                <DrawerHeaderGroup title="QUẢN LÝ" />
                {DRAWER_ITEMS.management.map(item => (
                    <DrawerItem
                        key={item.name}
                        label={item.title}
                        icon={item.icon}
                        isActive={activeRouteName === item.name}
                        onPress={() => navigation.navigate(item.name)}
                    />
                ))}

                <DrawerHeaderGroup title="HỆ THỐNG" />
                 {DRAWER_ITEMS.system.map(item => (
                    <DrawerItem
                        key={item.name}
                        label={item.title}
                        icon={item.icon}
                        isActive={activeRouteName === item.name}
                        onPress={() => navigation.navigate(item.name)}
                    />
                ))}
            </ScrollView>

            {/* Footer: Nút Đăng xuất */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + SIZES.base }]}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.navigate('DangNhap')}
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