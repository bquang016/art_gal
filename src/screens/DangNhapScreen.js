// src/screens/DangNhapScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme/theme';
import { api } from '../api/mockApi';

const DangNhapScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        api.login(username, password)
            .then(response => {
                Alert.alert('Thành công', 'Đăng nhập thành công! Đang chuyển hướng...');
                navigation.replace('Main'); // Dùng replace để người dùng không back lại được trang login
            })
            .catch(error => {
                Alert.alert('Thất bại', error.message);
            });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>ArtGallery POS</Text>
                <Text style={styles.subtitle}>Chào mừng trở lại!</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor={COLORS.textMuted}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        padding: SIZES.padding,
    },
    formContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        ...FONTS.h1,
        color: COLORS.primary,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    subtitle: {
        ...FONTS.body3,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SIZES.padding,
    },
    input: {
        height: 50,
        borderColor: COLORS.lightGray,
        borderWidth: 1,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.base * 2,
        marginBottom: SIZES.base * 2,
        ...FONTS.body3,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SIZES.base * 2,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    buttonText: {
        ...FONTS.h3,
        color: COLORS.white,
        fontWeight: 'bold',
    },
});

export default DangNhapScreen;