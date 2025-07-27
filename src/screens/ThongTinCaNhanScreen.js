import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TextInput,
    TouchableOpacity, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';

const ThongTinCaNhanScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState({ current: '', new: '', confirm: '' });

    useFocusEffect(
      useCallback(() => {
        const fetchCurrentUser = async () => {
            setLoading(true);
            try {
                // Backend API này chưa tồn tại, chúng ta cần tạo nó.
                // Tạm thời sẽ dùng dữ liệu giả lập.
                // const response = await apiService.get('/profile/me'); 
                const mockUser = {
                    name: 'Quang Đẹp Trai',
                    email: 'admin@artgallery.com',
                    phone: '0987654321',
                    role: 'Admin'
                };
                setUser(mockUser);
            } catch (error) {
                console.error("Failed to fetch current user:", error);
                Alert.alert("Lỗi", "Không thể tải thông tin cá nhân.");
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
      }, [])
    );

    const handleUpdateInfo = () => {
        Alert.alert("Tính năng đang phát triển", "Chức năng cập nhật thông tin sẽ được bổ sung sau.");
    };

    const handleChangePassword = () => {
        Alert.alert("Tính năng đang phát triển", "Chức năng đổi mật khẩu sẽ được bổ sung sau.");
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }
    
    if (!user) {
         return (
             <SafeAreaView style={styles.container}>
                <Text style={{textAlign: 'center'}}>Không thể tải dữ liệu người dùng.</Text>
            </SafeAreaView>
         );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back-outline" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileCard}>
                    <Ionicons name="person-circle" size={100} color={COLORS.primary} />
                    <Text style={styles.profileName}>{user.name}</Text>
                    <Text style={styles.profileRole}>{user.role}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin chung</Text>
                    <Text style={styles.inputLabel}>Tên nhân viên</Text>
                    <TextInput style={styles.input} value={user.name} onChangeText={text => setUser({...user, name: text})}/>
                    
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput style={styles.input} value={user.email} onChangeText={text => setUser({...user, email: text})}/>

                    <Text style={styles.inputLabel}>Số điện thoại</Text>
                    <TextInput style={styles.input} value={user.phone} onChangeText={text => setUser({...user, phone: text})}/>
                    
                    <TouchableOpacity style={styles.buttonPrimary} onPress={handleUpdateInfo}>
                        <Text style={styles.buttonTextPrimary}>Lưu thay đổi</Text>
                    </TouchableOpacity>
                </View>

                 <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
                    <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
                    <TextInput style={styles.input} secureTextEntry value={password.current} onChangeText={text => setPassword({...password, current: text})}/>

                    <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                    <TextInput style={styles.input} secureTextEntry value={password.new} onChangeText={text => setPassword({...password, new: text})}/>

                    <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                    <TextInput style={styles.input} secureTextEntry value={password.confirm} onChangeText={text => setPassword({...password, confirm: text})}/>
                    
                     <TouchableOpacity style={styles.buttonPrimary} onPress={handleChangePassword}>
                        <Text style={styles.buttonTextPrimary}>Đổi mật khẩu</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2 },
    scrollContainer: { padding: SIZES.padding },
    profileCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        alignItems: 'center',
        marginBottom: SIZES.padding * 2,
    },
    profileName: {
        ...FONTS.h2,
        marginTop: SIZES.base,
    },
    profileRole: {
        ...FONTS.body3,
        color: COLORS.textMuted,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.itemSpacing,
    },
    sectionTitle: {
        ...FONTS.h3,
        marginBottom: SIZES.padding,
    },
    inputLabel: {
        ...FONTS.body3,
        color: COLORS.textMuted,
        marginBottom: SIZES.base,
    },
    input: {
        height: 50,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        ...FONTS.body3,
        marginBottom: SIZES.itemSpacing,
    },
    buttonPrimary: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: SIZES.base,
    },
    buttonTextPrimary: {
        ...FONTS.h4,
        color: COLORS.white,
    }
});

export default ThongTinCaNhanScreen;