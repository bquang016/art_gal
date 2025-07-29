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
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useFocusEffect(
      useCallback(() => {
        const fetchCurrentUser = async () => {
            setLoading(true);
            try {
                const response = await apiService.get('/profile/me'); 
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch current user:", error);
                Alert.alert("Lỗi", "Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
      }, [navigation])
    );

    const handleUpdateInfo = async () => {
        if (!user || !user.name || !user.email) {
            Alert.alert("Lỗi", "Vui lòng không để trống Tên và Email.");
            return;
        }
        setIsUpdating(true);
        try {
            const payload = {
                name: user.name,
                email: user.email
            };
            const response = await apiService.put('/profile/me', payload);
            setUser(response.data); // Cập nhật lại state với dữ liệu mới nhất
            Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân.");
        } catch (error) {
            console.error("Failed to update profile:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Cập nhật thông tin thất bại.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        if (!password.current || !password.new || !password.confirm) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường mật khẩu.");
            return;
        }
        if (password.new.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }
        if (password.new !== password.confirm) {
            Alert.alert("Lỗi", "Mật khẩu mới và mật khẩu xác nhận không khớp.");
            return;
        }
        
        setIsChangingPassword(true);
        try {
            const payload = {
                currentPassword: password.current,
                newPassword: password.new
            };
            const response = await apiService.post('/profile/change-password', payload);
            Alert.alert("Thành công", response.data);
            setPassword({ current: '', new: '', confirm: '' }); // Xóa các trường sau khi thành công
        } catch (error) {
            console.error("Failed to change password:", error.response?.data || error.message);
            Alert.alert("Lỗi", error.response?.data?.message || "Đổi mật khẩu thất bại.");
        } finally {
            setIsChangingPassword(false);
        }
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
                    <Text style={styles.profileRole}>{user.roles.includes('ADMIN') ? 'Quản trị viên' : 'Nhân viên'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin chung</Text>
                    <Text style={styles.inputLabel}>Tên nhân viên</Text>
                    <TextInput style={styles.input} value={user.name} onChangeText={text => setUser({...user, name: text})}/>
                    
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput style={styles.input} value={user.email} onChangeText={text => setUser({...user, email: text})}/>
                    
                    <TouchableOpacity style={[styles.buttonPrimary, isUpdating && styles.buttonDisabled]} onPress={handleUpdateInfo} disabled={isUpdating}>
                        {isUpdating ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonTextPrimary}>Lưu thay đổi</Text>}
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
                    
                     <TouchableOpacity style={[styles.buttonPrimary, isChangingPassword && styles.buttonDisabled]} onPress={handleChangePassword} disabled={isChangingPassword}>
                        {isChangingPassword ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonTextPrimary}>Đổi mật khẩu</Text>}
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
        height: 50,
        justifyContent: 'center'
    },
    buttonDisabled: {
        backgroundColor: COLORS.textMuted,
    },
    buttonTextPrimary: {
        ...FONTS.h4,
        color: COLORS.white,
    }
});

export default ThongTinCaNhanScreen;