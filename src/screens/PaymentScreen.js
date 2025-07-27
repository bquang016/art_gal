import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, Modal, 
    SafeAreaView, ScrollView, Alert, TextInput, Keyboard, 
    TouchableWithoutFeedback, ActivityIndicator, Image 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService, { SERVER_BASE_URL } from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import CustomPicker from '../components/CustomPicker';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatNumberWithDots = (value) => {
    if (!value) return '';
    const numberValue = value.replace(/\D/g, '');
    return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormattedNumber = (value) => {
    if (!value) return 0;
    return parseInt(value.replace(/\./g, ''), 10);
};

const PaymentScreen = ({ route, navigation }) => {
    const { cart, total } = route.params;

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    
    const [cashReceived, setCashReceived] = useState(0); 
    const [formattedCashReceived, setFormattedCashReceived] = useState('');

    const [activeQrMethods, setActiveQrMethods] = useState([]);
    const [isQrModalVisible, setQrModalVisible] = useState(false);
    const [selectedQrImage, setSelectedQrImage] = useState(null);
    const [selectedQrMethodName, setSelectedQrMethodName] = useState('');

    // SỬA LẠI: Dùng useFocusEffect để luôn lấy dữ liệu mới nhất
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [customersRes, qrMethodsRes] = await Promise.all([
                        apiService.get('/customers'),
                        apiService.get('/payment-methods/active-qr') 
                    ]);
                    setCustomers(customersRes.data.filter(c => c.status === 'Hoạt động'));
                    setActiveQrMethods(qrMethodsRes.data);
                } catch (error) {
                    console.error("Failed to fetch data:", error.response?.data || error.message);
                    Alert.alert("Lỗi", "Không thể tải dữ liệu thanh toán.");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, [])
    );

    const change = cashReceived - total;

    const handleCashReceivedChange = (text) => {
        const parsedValue = parseFormattedNumber(text);
        setCashReceived(parsedValue);
        setFormattedCashReceived(formatNumberWithDots(text));
    };

    const handleConfirmPayment = async () => {
        if (!selectedCustomer) {
            Alert.alert("Lỗi", "Vui lòng chọn khách hàng.");
            return;
        }

        if (paymentMethod === 'cash' && cashReceived < total) {
            Alert.alert("Lỗi", "Số tiền khách đưa không đủ để thanh toán.");
            return;
        }

        const orderPayload = {
            customerId: selectedCustomer,
            userId: 2,
            orderDetails: cart.map(item => ({
                paintingId: item.id,
                quantity: item.quantity,
                price: item.sellingPrice
            }))
        };
        
        try {
            await apiService.post('/orders', orderPayload);
            Alert.alert("Thành công", "Đã tạo hóa đơn thành công!", [
                { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'BanHang' }) }
            ]);
        } catch (error) {
            console.error("Failed to create order:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Tạo đơn hàng thất bại.");
        }
    };
    
    const handleOpenQrModal = (qrMethod) => {
        if (!qrMethod.qrCodeImageUrl) {
            Alert.alert("Thông báo", "Phương thức thanh toán này chưa được cấu hình ảnh QR.");
            return;
        }
        const imageUrl = `${SERVER_BASE_URL}/api/files/${qrMethod.qrCodeImageUrl}`;
        setSelectedQrImage(imageUrl);
        setSelectedQrMethodName(qrMethod.name);
        setQrModalVisible(true);
    };

    const handleQrPaymentSuccess = () => {
        setQrModalVisible(false);
        handleConfirmPayment();
    };

    const renderQrCodeModal = () => (
        <Modal visible={isQrModalVisible} transparent={true} animationType="fade">
            <View style={styles.centeredView}>
                <View style={styles.paymentModalView}>
                    <Text style={styles.paymentModalTitle}>{selectedQrMethodName}</Text>
                    <Text style={{...FONTS.body3, color: COLORS.textMuted}}>Khách hàng quét mã để thanh toán</Text>
                    {selectedQrImage && <Image source={{ uri: selectedQrImage }} style={styles.qrImage} />}
                    <Text style={styles.paymentTotalAmount}>{formatCurrency(total)}</Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setQrModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmPaymentButton} onPress={handleQrPaymentSuccess}>
                            <Text style={styles.confirmPaymentButtonText}>Đã thanh toán</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
    
    if (loading) {
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={COLORS.primary} /></SafeAreaView>
    }

    const customerDataForPicker = customers.map(c => ({ label: `${c.name} - ${c.phone}`, value: c.id }));

    return (
        <SafeAreaView style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back-outline" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <CustomPicker
                        label="Khách hàng *"
                        data={customerDataForPicker}
                        selectedValue={selectedCustomer}
                        onValueChange={(value) => setSelectedCustomer(value)}
                        placeholder="-- Chọn khách hàng --"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.paymentTotalLabel}>Tổng tiền cần thanh toán</Text>
                    <Text style={styles.paymentTotalAmount}>{formatCurrency(total)}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.paymentMethodLabel}>Chọn phương thức</Text>
                    <View style={styles.paymentMethodContainer}>
                        <TouchableOpacity onPress={() => setPaymentMethod('cash')} style={[styles.paymentMethodButton, paymentMethod === 'cash' && styles.paymentMethodActive]}>
                            <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cash' ? COLORS.primary : COLORS.textMuted} />
                            <Text style={[styles.paymentMethodText, paymentMethod === 'cash' && {color: COLORS.primary}]}>Tiền mặt</Text>
                        </TouchableOpacity>
                        
                        {/* SỬA LẠI LOGIC HIỂN THỊ CÁC NÚT QR */}
                        {activeQrMethods.map(method => (
                            <TouchableOpacity key={method.id} onPress={() => { setPaymentMethod('qr'); handleOpenQrModal(method); }} style={styles.paymentMethodButton}>
                                <Ionicons name="qr-code-outline" size={24} color={COLORS.primary} />
                                <Text style={[styles.paymentMethodText, {color: COLORS.primary}]}>{method.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    
                    {paymentMethod === 'cash' && (
                        <View style={{width: '100%', marginTop: SIZES.padding}}>
                            <Text style={styles.inputLabel}>Tiền khách đưa</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="0"
                                keyboardType="numeric"
                                value={formattedCashReceived}
                                onChangeText={handleCashReceivedChange}
                            />
                            <View style={styles.summaryRow}>
                                <Text>Tiền thừa trả khách:</Text>
                                <Text style={styles.changeText}>{change >= 0 ? formatCurrency(change) : '0 ₫'}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
            
            {paymentMethod === 'cash' && (
                <View style={styles.footer}>
                     <TouchableOpacity style={styles.confirmPaymentButtonFull} onPress={handleConfirmPayment}>
                        <Text style={styles.confirmPaymentButtonText}>Xác nhận thanh toán</Text>
                    </TouchableOpacity>
                </View>
            )}

            {renderQrCodeModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2 },
    scrollContent: { padding: SIZES.padding },
    section: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding, marginBottom: SIZES.itemSpacing },
    footer: { padding: SIZES.padding, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
    paymentTotalLabel: { ...FONTS.body3, color: COLORS.textMuted, textAlign: 'center' },
    paymentTotalAmount: { ...FONTS.largeTitle, color: COLORS.primary, marginVertical: SIZES.base, textAlign: 'center' },
    paymentMethodLabel: { ...FONTS.h4, color: COLORS.textMuted, marginBottom: SIZES.padding },
    paymentMethodContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    paymentMethodButton: { flexBasis: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SIZES.padding, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, marginVertical: SIZES.base / 2 },
    paymentMethodActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}15` },
    paymentMethodText: { marginLeft: SIZES.base, ...FONTS.h4 },
    inputLabel: { ...FONTS.h4, color: COLORS.textMuted, marginTop: SIZES.padding },
    input: { height: 50, width: '100%', backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.h3, marginTop: SIZES.base, marginBottom: SIZES.base, textAlign: 'right' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    changeText: { ...FONTS.h3, fontWeight: 'bold' },
    confirmPaymentButtonFull: { padding: SIZES.padding, borderRadius: SIZES.radius, alignItems: 'center', backgroundColor: COLORS.success },
    confirmPaymentButtonText: { ...FONTS.h4, color: COLORS.white },
    centeredView: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    paymentModalView: { width: '90%', backgroundColor: 'white', borderRadius: SIZES.radius * 2, padding: SIZES.padding, alignItems: 'center', marginVertical: SIZES.padding },
    paymentModalTitle: { ...FONTS.h2, marginBottom: SIZES.base },
    qrImage: { width: 250, height: 250, resizeMode: 'contain', marginVertical: SIZES.padding, backgroundColor: COLORS.lightGray },
    modalButtonContainer: { flexDirection: 'row', width: '100%', marginTop: SIZES.padding * 2 },
    closeButton: { flex: 1, padding: SIZES.padding, borderRadius: SIZES.radius, alignItems: 'center', backgroundColor: COLORS.lightGray, marginRight: SIZES.base },
    closeButtonText: { ...FONTS.h4, color: COLORS.textDark },
    confirmPaymentButton: { flex: 2, padding: SIZES.padding, borderRadius: SIZES.radius, alignItems: 'center', backgroundColor: COLORS.success, marginLeft: SIZES.base },
});

export default PaymentScreen;