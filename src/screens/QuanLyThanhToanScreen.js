import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet,
    TouchableOpacity, Modal, SafeAreaView, Button, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import { SERVER_BASE_URL } from '../api/apiService';
import apiService from '../api/apiService';
import PaymentMethodCard from '../components/PaymentMethodCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QuanLyThanhToanScreen = ({ navigation }) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useFocusEffect(
      useCallback(() => {
        const fetchPaymentMethods = async () => {
            setLoading(true);
            try {
                const response = await apiService.get('/payment-methods');
                setPaymentMethods(response.data);
            } catch (error) {
                console.error("Failed to fetch payment methods:", error);
                Alert.alert("Lỗi", "Không thể tải dữ liệu phương thức thanh toán.");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentMethods();
      }, [])
    );

    const handleToggleSwitch = async (method, newValue) => {
        if (method.methodKey === 'cash') {
            Alert.alert("Thông báo", "Không thể thay đổi trạng thái của phương thức Tiền mặt.");
            return;
        }

        const originalMethods = [...paymentMethods];
        setPaymentMethods(prev => prev.map(m => m.id === method.id ? { ...m, enabled: newValue } : m));
        try {
            const payload = { ...method, enabled: newValue };
            await apiService.put(`/payment-methods/${method.id}`, payload);
        } catch (error) {
            console.error("Failed to update status:", error.response?.data?.message || error);
            Alert.alert("Lỗi", error.response?.data?.message || "Cập nhật trạng thái thất bại.");
            setPaymentMethods(originalMethods);
        }
    };

    const handleConfigure = (method) => {
        if (!method.configurable) {
            Alert.alert("Thông báo", "Phương thức này không yêu cầu cấu hình.");
            return;
        }
        setSelectedMethod({ ...method });
        setModalVisible(true);
    };
    
    const handleUploadImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Cần cấp quyền", "Bạn cần cấp quyền truy cập thư viện ảnh.");
            return;
        }
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            // ✅ SỬA LỖI: Sử dụng thuộc tính đúng cho phiên bản của bạn
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (pickerResult.canceled) return;
        
        const uri = pickerResult.assets[0].uri;
        const filename = uri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;

        const formData = new FormData();
        formData.append('file', { uri, name: filename, type });
        
        setIsUploading(true);
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            const response = await apiService.post('/files/upload', formData, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const uploadedFilename = response.data;
            setSelectedMethod({...selectedMethod, qrCodeImageUrl: uploadedFilename});
            Alert.alert("Thành công", "Tải ảnh lên thành công! Nhấn 'Lưu' để xác nhận thay đổi.");
        } catch (error) {
            console.error("Upload error:", error.response?.data || error);
            Alert.alert("Lỗi", "Tải ảnh lên thất bại.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveConfig = async () => {
         try {
            await apiService.put(`/payment-methods/${selectedMethod.id}`, selectedMethod);
            Alert.alert("Thành công", "Đã lưu cấu hình.");
            setModalVisible(false);
            const response = await apiService.get('/payment-methods');
            setPaymentMethods(response.data);
        } catch (error) {
            console.error("Failed to save config:", error);
            Alert.alert("Lỗi", "Lưu cấu hình thất bại.");
        }
    };

    const renderConfigModal = () => (
        <Modal visible={isModalVisible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Cấu hình: {selectedMethod?.name}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                    <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage} disabled={isUploading}>
                        {isUploading ? (
                            <ActivityIndicator color={COLORS.primary} />
                        ) : (
                           <>
                             <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
                             <Text style={styles.uploadButtonText}>Chọn & Tải ảnh QR</Text>
                           </>
                        )}
                    </TouchableOpacity>
                    {selectedMethod?.qrCodeImageUrl ? (
                        <View style={styles.previewContainer}>
                            <Text style={styles.hintText}>Ảnh QR hiện tại:</Text>
                            <Image 
                                source={{ uri: `${SERVER_BASE_URL}/api/files/${selectedMethod.qrCodeImageUrl}` }} 
                                style={styles.previewImage} 
                            />
                        </View>
                    ) : (
                        <Text style={styles.hintText}>Chưa có ảnh QR nào được tải lên.</Text>
                    )}
                </ScrollView>
                 <View style={styles.modalFooter}>
                    <Button title="Lưu cấu hình" onPress={handleSaveConfig} color={COLORS.primary} />
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
                    <Ionicons name="menu" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 44 }} />
            </View>
            
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={paymentMethods}
                    renderItem={({ item }) => (
                        <PaymentMethodCard 
                            method={item} 
                            onConfigure={handleConfigure} 
                            onToggleSwitch={handleToggleSwitch} 
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                />
            )}
            {renderConfigModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: SIZES.padding, 
        paddingVertical: SIZES.base,
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.lightGray 
    },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2 },
    listContainer: { 
        padding: SIZES.padding,
        backgroundColor: COLORS.background,
    },
    modalContainer: { flex: 1 },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: SIZES.padding, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.lightGray 
    },
    // ✅ SỬA LẠI: Cho phép tiêu đề co dãn và tự xuống dòng
    modalTitle: { 
        ...FONTS.h2,
        flex: 1, // Cho phép co dãn
        marginRight: SIZES.base, // Thêm khoảng cách với nút X
    },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
    hintText: { ...FONTS.body4, color: COLORS.textMuted, fontStyle: 'italic', marginTop: SIZES.base, textAlign: 'center' },
    uploadButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 150, 
        borderWidth: 2, 
        borderColor: COLORS.border, 
        borderStyle: 'dashed', 
        borderRadius: SIZES.radius, 
        backgroundColor: COLORS.background 
    },
    uploadButtonText: { 
        ...FONTS.h4, 
        color: COLORS.primary, 
        marginLeft: SIZES.base 
    },
    previewContainer: {
        alignItems: 'center',
        marginTop: SIZES.padding
    },
    previewImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        marginTop: SIZES.base,
        borderWidth: 1,
        borderColor: COLORS.lightGray
    }
});

export default QuanLyThanhToanScreen;