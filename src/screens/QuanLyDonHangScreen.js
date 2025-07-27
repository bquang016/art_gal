import React, { useState, useMemo, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, Modal, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import OrderItem from '../components/OrderItem';

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const QuanLyDonHangScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // SỬA LẠI PHẦN NÀY
    useFocusEffect(
      useCallback(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await apiService.get('/orders');
                const formattedOrders = response.data.map(order => ({
                    ...order,
                    // Ánh xạ lại các trường cho khớp với component OrderItem
                    id: order.id.toString(),
                    date: new Date(order.orderDate).toLocaleDateString('vi-VN'),
                    customer: order.customerName,
                    total: order.totalAmount
                }));
                setOrders(formattedOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error.response?.data || error.message);
                Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
      }, [])
    );

    const filteredOrders = useMemo(() => {
        return orders.filter(order =>
            (order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
             order.customer.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (statusFilter === 'all' || order.status === statusFilter)
        );
    }, [orders, searchQuery, statusFilter]);
    
    const handleSelectOrder = (order) => {
        setSelectedOrder({ ...order });
        setModalVisible(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !selectedOrder.status) return;
        
        try {
            await apiService.patch(`/orders/${selectedOrder.id}/status`, { status: selectedOrder.status });
            Alert.alert("Thành công", `Đã cập nhật trạng thái đơn hàng #${selectedOrder.id}`);
            setModalVisible(false);
            
            // Tải lại danh sách sau khi cập nhật
            const response = await apiService.get('/orders');
            const formattedOrders = response.data.map(order => ({
                ...order,
                id: order.id.toString(),
                date: new Date(order.orderDate).toLocaleDateString('vi-VN'),
                customer: order.customerName,
                total: order.totalAmount
            }));
            setOrders(formattedOrders);

        } catch (error) {
            console.error("Failed to update order status:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Cập nhật trạng thái thất bại.");
        }
    };
    
    const availableStatuses = ['Chờ xác nhận', 'Đang xử lý', 'Hoàn thành', 'Đã hủy'];

    const renderDetailModal = () => (
        <Modal
            animationType="slide"
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chi tiết #{selectedOrder?.id}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                {selectedOrder && (
                    <ScrollView style={styles.modalContent}>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailRow}>Khách hàng: {selectedOrder.customer}</Text>
                            <Text style={styles.detailRow}>Người tạo: {selectedOrder.userName}</Text>
                            <Text style={styles.detailRow}>Ngày tạo: {selectedOrder.date}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Sản phẩm</Text>
                            {/* Chi tiết sản phẩm có thể được tải từ một API khác nếu cần */}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalText}>Tổng cộng</Text>
                                <Text style={styles.totalAmount}>{formatCurrency(selectedOrder.total)}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Cập nhật trạng thái</Text>
                            <View style={styles.statusSelectContainer}>
                                {availableStatuses.map(status => (
                                     <TouchableOpacity 
                                        key={status}
                                        style={[
                                            styles.statusSelectButton_Modal, 
                                            selectedOrder.status === status && styles.statusSelectButtonActive_Modal
                                        ]}
                                        onPress={() => setSelectedOrder({...selectedOrder, status: status})}
                                    >
                                        <Text style={[
                                            styles.statusSelectText_Modal,
                                            selectedOrder.status === status && styles.statusSelectTextActive_Modal
                                        ]}>{status}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                )}
                <View style={styles.modalFooter}>
                    <Button title="Lưu thay đổi" onPress={handleUpdateStatus} color={COLORS.primary} />
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
                <Text style={styles.headerTitle}>Đơn hàng</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm mã ĐH, tên khách hàng..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>
            </View>

            <View>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.statusFilterContainer}
                >
                    <TouchableOpacity onPress={() => setStatusFilter('all')} style={[styles.statusButton, statusFilter === 'all' && styles.statusButtonActive]}>
                        <Text style={[styles.statusButtonText, statusFilter === 'all' && styles.statusButtonTextActive]}>Tất cả</Text>
                    </TouchableOpacity>
                    {availableStatuses.map(status => (
                        <TouchableOpacity key={status} onPress={() => setStatusFilter(status)} style={[styles.statusButton, statusFilter === status && styles.statusButtonActive]}>
                            <Text style={[styles.statusButtonText, statusFilter === status && styles.statusButtonTextActive]}>{status}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={({ item }) => <OrderItem item={item} onSelect={handleSelectOrder} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không có đơn hàng nào.</Text>}
                />
            )}
            {renderDetailModal()}
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
        backgroundColor: COLORS.white 
    },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2 },
    searchContainer: { 
        paddingHorizontal: SIZES.padding, 
        backgroundColor: COLORS.white, 
        paddingBottom: SIZES.padding 
    },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.black}08`, borderRadius: SIZES.radius, height: 48 },
    searchIcon: { marginHorizontal: SIZES.base * 1.5 },
    searchInput: { flex: 1, ...FONTS.body3 },
    listContainer: { 
        padding: SIZES.padding,
        backgroundColor: COLORS.background,
    },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    statusFilterContainer: { 
        paddingVertical: SIZES.base,
        paddingHorizontal: SIZES.padding,
        backgroundColor: COLORS.white, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.lightGray 
    },
    statusButton: { 
        paddingVertical: SIZES.base, 
        paddingHorizontal: SIZES.padding, 
        marginRight: SIZES.base,
        borderRadius: SIZES.radius * 2,
        backgroundColor: COLORS.background 
    },
    statusButtonActive: { 
        backgroundColor: COLORS.primary 
    },
    statusButtonText: { 
        ...FONTS.body3, 
        color: COLORS.textDark, 
        fontWeight: '600' 
    },
    statusButtonTextActive: { 
        color: COLORS.white 
    },
    modalContainer: { flex: 1, backgroundColor: COLORS.white },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray, backgroundColor: COLORS.white },
    detailSection: { marginBottom: SIZES.padding * 1.5 },
    sectionTitle: { ...FONTS.h3, marginBottom: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray, paddingBottom: SIZES.base },
    detailRow: { ...FONTS.body3, color: COLORS.textMuted, marginBottom: SIZES.base },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SIZES.base * 1.5, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    productName: { ...FONTS.body3, flex: 1 },
    productPrice: { ...FONTS.body3, color: COLORS.textDark, fontWeight: 'bold' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SIZES.padding, marginTop: SIZES.base },
    totalText: { ...FONTS.h4 },
    totalAmount: { ...FONTS.h4, color: COLORS.primary },
    statusSelectContainer: { flexWrap: 'wrap', flexDirection: 'row' },
    statusSelectButton_Modal: { padding: SIZES.base, paddingHorizontal: SIZES.padding, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, marginRight: SIZES.base, marginBottom: SIZES.base },
    statusSelectButtonActive_Modal: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    statusSelectText_Modal: { ...FONTS.body3, fontWeight: '600' },
    statusSelectTextActive_Modal: { color: COLORS.white },
});

export default QuanLyDonHangScreen;