import React, { useState } from 'react';
import {
    View, Text, FlatList, StyleSheet,
    TouchableOpacity, Modal, SafeAreaView, Button, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import PaymentMethodCard from '../components/PaymentMethodCard';

const PAYMENT_METHODS = [
    { id: 'cash', name: 'Tiền mặt', icon: 'cash-outline', iconColor: COLORS.success, description: 'Chấp nhận thanh toán bằng tiền mặt trực tiếp tại quầy.', enabled: true, configurable: false },
    { id: 'qr_bank', name: 'QR Ngân hàng', icon: 'qr-code-outline', description: 'Tạo mã VietQR động từ thông tin tài khoản ngân hàng của bạn.', enabled: true, configurable: true },
    { id: 'momo', name: 'Ví Momo', image: require('../../assets/images/momo-logo.png'), description: 'Cho phép khách hàng thanh toán bằng cách quét mã QR từ ví Momo.', enabled: true, configurable: true },
    { id: 'zalopay', name: 'Ví ZaloPay', image: require('../../assets/images/zalopay-logo.png'), description: 'Cho phép khách hàng thanh toán bằng cách quét mã QR từ ví ZaloPay.', enabled: false, configurable: true },
];

const QuanLyThanhToanScreen = ({ navigation }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);

    const handleConfigure = (method) => {
        setSelectedMethod(method);
        setModalVisible(true);
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
                <View style={styles.modalContent}>
                    {selectedMethod?.id === 'qr_bank' && (
                        <>
                            <Text style={styles.inputLabel}>Tên chủ tài khoản</Text>
                            <TextInput style={styles.input} defaultValue="TRAN MINH ADMIN" />
                            <Text style={styles.inputLabel}>Số tài khoản</Text>
                            <TextInput style={styles.input} defaultValue="0987654321" keyboardType="numeric"/>
                        </>
                    )}
                     {(selectedMethod?.id === 'momo' || selectedMethod?.id === 'zalopay') && (
                        <>
                            <Text style={styles.inputLabel}>Số điện thoại/Tên người nhận</Text>
                            <TextInput style={styles.input} defaultValue="TRAN MINH ADMIN" />
                             <TouchableOpacity style={styles.uploadButton}>
                                <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
                                <Text style={styles.uploadButtonText}>Tải lên ảnh mã QR</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
                 <View style={styles.modalFooter}>
                    <Button title="Lưu cấu hình" onPress={() => setModalVisible(false)} color={COLORS.primary} />
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        // SỬA LỖI: Bọc bằng SafeAreaView
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
                    <Ionicons name="menu" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 44 }} />
            </View>
            
            <FlatList
                data={PAYMENT_METHODS}
                renderItem={({ item }) => <PaymentMethodCard method={item} onConfigure={handleConfigure} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
            />

            {renderConfigModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // SỬA LỖI: container là SafeAreaView
    container: { flex: 1, backgroundColor: COLORS.white },
    // SỬA LỖI: Bỏ padding top
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
        backgroundColor: COLORS.background, // Thêm màu nền cho list
    },
    // Modal Styles
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
    inputLabel: { ...FONTS.h4, color: COLORS.textMuted, marginBottom: SIZES.base },
    input: { height: 50, backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.body3, marginBottom: SIZES.itemSpacing },
    uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 150, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: SIZES.radius, backgroundColor: COLORS.background },
    uploadButtonText: { ...FONTS.h4, color: COLORS.primary, marginLeft: SIZES.base },
});

export default QuanLyThanhToanScreen;