import React, { useState, useEffect, useMemo } from 'react';
// SỬA LỖI 1: Import thêm Keyboard và TouchableWithoutFeedback
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, SafeAreaView, ScrollView, Alert, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/mockApi';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import ProductCard from '../components/ProductCard';

const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0);
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};
const TAX_RATE = 0.08;

const BanHangScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [isCartVisible, setCartVisible] = useState(false);
    
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');

    useEffect(() => {
        api.getPaintings().then(p => setProducts(p.filter(item => item.status === 'Đang bán')));
    }, []);

    const handleAddToCart = (product) => {
        if (cart.some(item => item.id === product.id)) return;
        setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
    };
    
    const handleRemoveFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.sellingPrice, 0), [cart]);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    const change = parseFloat(cashReceived) - total;

    const handleOpenPaymentModal = () => {
        if (cart.length === 0) {
            Alert.alert("Lỗi", "Giỏ hàng đang trống!");
            return;
        }
        setCartVisible(false);
        setPaymentMethod('cash');
        setCashReceived('');
        setPaymentModalVisible(true);
    };
    
    const handleConfirmPayment = () => {
        Alert.alert("Thành công", "Đã thanh toán và tạo hóa đơn thành công!");
        setPaymentModalVisible(false);
        setCart([]);
    };
    
    const renderPaymentModal = () => (
        <Modal visible={isPaymentModalVisible} transparent={true} animationType="fade">
            {/* SỬA LỖI 2: Bọc toàn bộ View bằng TouchableWithoutFeedback */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.centeredView}>
                    <View style={styles.paymentModalView}>
                        <Text style={styles.paymentModalTitle}>Xác nhận thanh toán</Text>
                        <Text style={styles.paymentTotalLabel}>Tổng tiền cần thanh toán</Text>
                        <Text style={styles.paymentTotalAmount}>{formatCurrency(total)}</Text>

                        <Text style={styles.paymentMethodLabel}>Chọn phương thức</Text>
                        <View style={styles.paymentMethodContainer}>
                            <TouchableOpacity onPress={() => setPaymentMethod('cash')} style={[styles.paymentMethodButton, paymentMethod === 'cash' && styles.paymentMethodActive]}>
                                <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cash' ? COLORS.primary : COLORS.textMuted} />
                                <Text style={[styles.paymentMethodText, paymentMethod === 'cash' && {color: COLORS.primary}]}>Tiền mặt</Text>
                            </TouchableOpacity>
                             <TouchableOpacity onPress={() => setPaymentMethod('qr')} style={[styles.paymentMethodButton, paymentMethod === 'qr' && styles.paymentMethodActive]}>
                                <Ionicons name="qr-code-outline" size={24} color={paymentMethod === 'qr' ? COLORS.primary : COLORS.textMuted} />
                                 <Text style={[styles.paymentMethodText, paymentMethod === 'qr' && {color: COLORS.primary}]}>QR Code</Text>
                            </TouchableOpacity>
                        </View>

                        {paymentMethod === 'cash' && (
                            <View style={{width: '100%'}}>
                                <Text style={styles.inputLabel}>Tiền khách đưa</Text>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={cashReceived}
                                    onChangeText={setCashReceived}
                                />
                                <View style={styles.summaryRow}>
                                    <Text>Tiền thừa trả khách:</Text>
                                    <Text style={styles.changeText}>{change >= 0 ? formatCurrency(change) : '0 ₫'}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.modalButtonContainer}>
                             <TouchableOpacity style={styles.closeButton} onPress={() => setPaymentModalVisible(false)}>
                                <Text style={styles.closeButtonText}>Đóng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmPaymentButton} onPress={handleConfirmPayment}>
                                <Text style={styles.confirmPaymentButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
                    <Ionicons name="menu" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bán hàng</Text>
                <View style={{width: 44}} />
            </View>

            <FlatList
                data={products}
                renderItem={({ item }) => <ProductCard item={item} onAddToCart={handleAddToCart} />}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
            />

            {cart.length > 0 && (
                <TouchableOpacity style={styles.cartFab} onPress={() => setCartVisible(true)}>
                    <Ionicons name="cart" size={24} color={COLORS.white} />
                    <Text style={styles.cartFabText}>{cart.length}</Text>
                </TouchableOpacity>
            )}

            <Modal visible={isCartVisible} onRequestClose={() => setCartVisible(false)}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Đơn hàng của bạn</Text>
                        <TouchableOpacity onPress={() => setCartVisible(false)}>
                            <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.cartItemsContainer}>
                        {cart.map(item => (
                            <View key={item.id} style={styles.cartItem}>
                                <View style={{ flex: 1, marginRight: SIZES.base }}>
                                    <Text style={styles.cartItemName}>{item.name}</Text>
                                    <Text style={styles.cartItemPrice}>{formatCurrency(item.sellingPrice)}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemoveFromCart(item.id)}>
                                    <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}><Text>Tạm tính</Text><Text>{formatCurrency(subtotal)}</Text></View>
                        <View style={styles.summaryRow}><Text>Thuế (8%)</Text><Text>{formatCurrency(tax)}</Text></View>
                        <View style={styles.totalRow}><Text style={styles.totalText}>Tổng cộng</Text><Text style={styles.totalText}>{formatCurrency(total)}</Text></View>
                        <TouchableOpacity style={styles.paymentButton} onPress={handleOpenPaymentModal}>
                            <Text style={styles.paymentButtonText}>THANH TOÁN</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
            
            {renderPaymentModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base, backgroundColor: COLORS.white },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2, color: COLORS.textDark },
    listContainer: { padding: SIZES.base },
    cartFab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },
    cartFabText: { position: 'absolute', top: 5, right: 5, backgroundColor: COLORS.danger, color: COLORS.white, borderRadius: 10, paddingHorizontal: 5, fontSize: 12, fontWeight: 'bold' },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding },
    modalTitle: { ...FONTS.h1 },
    cartItemsContainer: { paddingHorizontal: SIZES.padding },
    cartItem: { flexDirection: 'row', paddingVertical: SIZES.padding, borderBottomWidth: 1, borderColor: COLORS.lightGray },
    cartItemName: { ...FONTS.h4 },
    cartItemPrice: { ...FONTS.body3, color: COLORS.textMuted },
    summaryContainer: { padding: SIZES.padding, borderTopWidth: 1, borderColor: COLORS.lightGray, backgroundColor: COLORS.white },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.base },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SIZES.base * 2 },
    totalText: { ...FONTS.h3 },
    paymentButton: { backgroundColor: COLORS.primary, padding: SIZES.padding, borderRadius: SIZES.radius, alignItems: 'center', marginTop: SIZES.padding },
    paymentButtonText: { color: COLORS.white, ...FONTS.h3 },
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    paymentModalView: { width: '90%', backgroundColor: 'white', borderRadius: SIZES.radius * 2, padding: SIZES.padding, alignItems: 'center' },
    paymentModalTitle: { ...FONTS.h2, marginBottom: SIZES.base },
    paymentTotalLabel: { ...FONTS.body3, color: COLORS.textMuted },
    paymentTotalAmount: { ...FONTS.largeTitle, color: COLORS.primary, marginVertical: SIZES.padding },
    paymentMethodLabel: { ...FONTS.h4, color: COLORS.textMuted, alignSelf: 'flex-start', marginVertical: SIZES.base },
    paymentMethodContainer: { flexDirection: 'row', width: '100%', marginBottom: SIZES.padding },
    paymentMethodButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SIZES.padding, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, marginHorizontal: SIZES.base / 2 },
    paymentMethodActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}15` },
    paymentMethodText: { marginLeft: SIZES.base, ...FONTS.h4 },
    inputLabel: { ...FONTS.h4, color: COLORS.textMuted, alignSelf: 'flex-start' },
    input: { height: 50, width: '100%', backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.h3, marginTop: SIZES.base, marginBottom: SIZES.base, textAlign: 'right' },
    changeText: { ...FONTS.h3, fontWeight: 'bold' },
    modalButtonContainer: { flexDirection: 'row', width: '100%', marginTop: SIZES.padding * 2 },
    closeButton: { flex: 1, padding: SIZES.padding, borderRadius: SIZES.radius, alignItems: 'center', backgroundColor: COLORS.lightGray, marginRight: SIZES.base },
    closeButtonText: { ...FONTS.h4, color: COLORS.textDark },
    confirmPaymentButton: { flex: 2, padding: SIZES.padding, borderRadius: SIZES.radius, alignItems: 'center', backgroundColor: COLORS.success, marginLeft: SIZES.base },
    confirmPaymentButtonText: { ...FONTS.h4, color: COLORS.white },
});

export default BanHangScreen;