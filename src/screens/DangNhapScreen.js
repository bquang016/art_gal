// src/screens/DangNhapScreen.js
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, SafeAreaView, Image, KeyboardAvoidingView,
    Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../api/apiService';
import { COLORS, FONTS, SIZES } from '../theme/theme';

const DangNhapScreen = ({ navigation }) => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123');

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        try {
            const response = await apiService.post('/auth/login', {
                usernameOrEmail: username,
                password: password,
            });

            const { accessToken } = response.data;
            if (accessToken) {
                await AsyncStorage.setItem('jwt_token', accessToken);
                navigation.replace('Main');
            } else {
                throw new Error("Token không hợp lệ");
            }
        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
            Alert.alert('Đăng nhập thất bại', 'Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryHover }}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryHover]}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardAvoidingView}
                    >
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.logo}
                            />
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={22} color={COLORS.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tên đăng nhập"
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholderTextColor={COLORS.textMuted}
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={22} color={COLORS.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={() => Alert.alert('Thông báo', 'Liên hệ quản trị viên để lấy lại mật khẩu.')}
                            >
                                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
                                <Text style={styles.buttonText}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.padding * 2,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SIZES.padding * 3,
    },
    logo: {
        width: 200, // Tăng kích thước logo
        height: 200, // Tăng kích thước logo
        marginBottom: SIZES.padding,
    },
    formContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 2,
        padding: SIZES.padding * 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.itemSpacing,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    inputIcon: {
        paddingHorizontal: SIZES.padding,
    },
    input: {
        flex: 1,
        height: 55,
        ...FONTS.body3,
        color: COLORS.textDark,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SIZES.padding,
    },
    forgotPasswordText: {
        ...FONTS.body4,
        color: COLORS.primary,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        ...FONTS.h4,
        color: COLORS.white,
        fontWeight: 'bold',
    },
});

export default DangNhapScreen;