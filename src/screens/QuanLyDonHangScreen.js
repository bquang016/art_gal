import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, Modal, SafeAreaView, ScrollView, Button, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/mockApi';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import OrderItem from '../components/OrderItem';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const QuanLyDonHangScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // State cho Modal chi tiết
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        api.getOrders().then(setOrders);
    }, []);

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

    const handleUpdateStatus = () => {
        if (selectedOrder) {
            setOrders(prevOrders => prevOrders.map(order => 
                order.id === selectedOrder.id ? selectedOrder : order
            ));
            Alert.alert("Thành công", `Đã cập nhật trạng thái đơn hàng #${selectedOrder.id}`);
            setModalVisible(false);
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
                            <Text style={styles.detailRow}>Người tạo: {selectedOrder.employee}</Text>
                            <Text style={styles.detailRow}>Ngày tạo: {selectedOrder.date}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Sản phẩm</Text>
                            {selectedOrder.products.map((p, index) => (
                                <View key={index} style={styles.productRow}>
                                    <Text style={styles.productName}>{p.name}</Text>
                                    <Text style={styles.productPrice}>{formatCurrency(p.price)}</Text>
                                </View>
                            ))}
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
        // SỬA LỖI: Bọc bằng SafeAreaView
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
            
            <FlatList
                data={filteredOrders}
                renderItem={({ item }) => <OrderItem item={item} onSelect={handleSelectOrder} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có đơn hàng nào.</Text>}
            />
            {renderDetailModal()}
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
        backgroundColor: COLORS.background, // Thêm màu nền cho list
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
    // Modal Styles
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