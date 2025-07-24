import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput,
    TouchableOpacity, SafeAreaView, ScrollView, Button, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/mockApi';
import { COLORS, SIZES, FONTS } from '../theme/theme';

const ThongTinCaNhanScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [password, setPassword] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        api.getCurrentUser().then(setUser);
    }, []);

    const handleUpdateInfo = () => {
        // Logic lưu thông tin (mô phỏng)
        Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân.");
    };

    const handleChangePassword = () => {
        if (!password.current || !password.new || !password.confirm) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường mật khẩu.");
            return;
        }
        if (password.new.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }
        if (password.new !== password.confirm) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
            return;
        }
        // Logic đổi mật khẩu (mô phỏng)
        Alert.alert("Thành công", "Đã đổi mật khẩu thành công.");
        setPassword({ current: '', new: '', confirm: '' }); // Reset form
    };

    if (!user) {
        return <SafeAreaView style={styles.container}><Text>Đang tải...</Text></SafeAreaView>;
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
                    <Text style={styles.profileName}>{user.employeeName}</Text>
                    <Text style={styles.profileRole}>{user.role}</Text>
                </View>

                {/* Phần thông tin chung */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin chung</Text>
                    <Text style={styles.inputLabel}>Tên nhân viên</Text>
                    <TextInput style={styles.input} value={user.employeeName} onChangeText={text => setUser({...user, employeeName: text})}/>
                    
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput style={styles.input} value={user.email} onChangeText={text => setUser({...user, email: text})}/>

                    <Text style={styles.inputLabel}>Số điện thoại</Text>
                    <TextInput style={styles.input} value={user.phone} onChangeText={text => setUser({...user, phone: text})}/>
                    
                    <TouchableOpacity style={styles.buttonPrimary} onPress={handleUpdateInfo}>
                        <Text style={styles.buttonTextPrimary}>Lưu thay đổi</Text>
                    </TouchableOpacity>
                </View>

                {/* Phần đổi mật khẩu */}
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