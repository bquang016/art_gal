import React, { useState, useMemo, useCallback } from 'react';
import { 
    View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, 
    SafeAreaView, ScrollView, Alert, ActivityIndicator, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
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
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(''); // Thêm state cho tìm kiếm
    const [cart, setCart] = useState([]);
    const [isCartVisible, setCartVisible] = useState(false);

    useFocusEffect(
      useCallback(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const productsRes = await apiService.get('/paintings');
                setProducts(productsRes.data);
                setCart([]);
            } catch (error) {
                console.error("Failed to fetch products:", error.response?.data || error.message);
                Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
      }, [])
    );

    // Thêm logic để lọc sản phẩm dựa trên searchQuery
    const filteredProducts = useMemo(() => {
        if (!searchQuery) {
            return products;
        }
        return products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const handleAddToCart = (product) => {
        if (product.status !== 'Đang bán') {
            Alert.alert("Hết hàng", "Sản phẩm này đã được bán. Vui lòng chọn sản phẩm khác.");
            return;
        }
        if (cart.some(item => item.id === product.id)) {
             Alert.alert("Thông báo", "Sản phẩm đã có trong giỏ hàng.");
            return;
        };
        setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
    };
    
    const handleRemoveFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.sellingPrice, 0), [cart]);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    const handleGoToPayment = () => {
        if (cart.length === 0) {
            Alert.alert("Lỗi", "Giỏ hàng đang trống!");
            return;
        }
        setCartVisible(false);
        navigation.navigate('Payment', {
            cart: cart,
            total: total,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
                    <Ionicons name="menu" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bán hàng</Text>
                <View style={{width: 44}} />
            </View>
            
            {/* THÊM THANH TÌM KIẾM VÀO ĐÂY */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm tranh..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={filteredProducts} // Sử dụng danh sách đã được lọc
                    renderItem={({ item }) => <ProductCard item={item} onAddToCart={handleAddToCart} />}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không có sản phẩm nào.</Text>}
                />
            )}

            {cart.length > 0 && (
                <TouchableOpacity style={styles.cartFab} onPress={() => setCartVisible(true)}>
                    <Ionicons name="cart" size={24} color={COLORS.white} />
                    <Text style={styles.cartFabText}>{cart.length}</Text>
                </TouchableOpacity>
            )}

            <Modal visible={isCartVisible} onRequestClose={() => setCartVisible(false)} transparent={true} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                    <TouchableOpacity style={{flex: 1}} onPress={() => setCartVisible(false)} />
                    <View style={styles.cartView}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Đơn hàng của bạn ({cart.length})</Text>
                            <TouchableOpacity onPress={() => setCartVisible(false)}>
                                <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={cart}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({item}) => (
                                <View style={styles.cartItem}>
                                    <View style={{ flex: 1, marginRight: SIZES.base }}>
                                        <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.cartItemPrice}>{formatCurrency(item.sellingPrice)}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleRemoveFromCart(item.id)}>
                                        <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyText}>Giỏ hàng trống</Text>}
                            style={styles.cartItemsContainer}
                        />
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}><Text>Tạm tính</Text><Text>{formatCurrency(subtotal)}</Text></View>
                            <View style={styles.summaryRow}><Text>Thuế (8%)</Text><Text>{formatCurrency(tax)}</Text></View>
                            <View style={styles.totalRow}><Text style={styles.totalText}>Tổng cộng</Text><Text style={styles.totalText}>{formatCurrency(total)}</Text></View>
                            <TouchableOpacity style={styles.paymentButton} onPress={handleGoToPayment}>
                                <Text style={styles.paymentButtonText}>THANH TOÁN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base, backgroundColor: COLORS.white },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2, color: COLORS.textDark },
    searchContainer: { 
        paddingHorizontal: SIZES.padding, 
        paddingVertical: SIZES.base,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    searchWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: COLORS.background, 
        borderRadius: SIZES.radius, 
        height: 48 
    },
    searchIcon: { 
        marginHorizontal: SIZES.base * 1.5 
    },
    searchInput: { 
        flex: 1, 
        ...FONTS.body3 
    },
    listContainer: { padding: SIZES.base },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    cartFab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },
    cartFabText: { position: 'absolute', top: 5, right: 5, backgroundColor: COLORS.danger, color: COLORS.white, borderRadius: 10, paddingHorizontal: 5, fontSize: 12, fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    cartView: {
        maxHeight: '80%',
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.radius * 2,
        borderTopRightRadius: SIZES.radius * 2,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding },
    modalTitle: { ...FONTS.h2 },
    cartItemsContainer: { paddingHorizontal: SIZES.padding, maxHeight: 300 },
    cartItem: { flexDirection: 'row', paddingVertical: SIZES.padding, borderBottomWidth: 1, borderColor: COLORS.lightGray, alignItems: 'center' },
    cartItemName: { ...FONTS.h4 },
    cartItemPrice: { ...FONTS.body3, color: COLORS.textMuted },
    summaryContainer: { padding: SIZES.padding, borderTopWidth: 1, borderColor: COLORS.lightGray, backgroundColor: COLORS.white },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.base },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SIZES.base * 2 },
    totalText: { ...FONTS.h3 },
    paymentButton: { backgroundColor: COLORS.primary, padding: SIZES.padding, borderRadius: SIZES.radius, alignItems: 'center', marginTop: SIZES.padding },
    paymentButtonText: { color: COLORS.white, ...FONTS.h3 },
});

export default BanHangScreen;