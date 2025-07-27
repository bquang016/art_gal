import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet,
    TouchableOpacity, Modal, SafeAreaView, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import ImportSlipListItem from '../components/ImportSlipListItem';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const QuanLyNhapHangScreen = ({ navigation }) => {
    const [importSlips, setImportSlips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchImportSlips = async () => {
                setLoading(true);
                try {
                    const response = await apiService.get('/import-slips');
                    // Ánh xạ lại dữ liệu để khớp với component
                    const formattedData = response.data.map(slip => ({
                        ...slip,
                        id: slip.id.toString(),
                        date: slip.importDate,
                        status: 'Đã hoàn tất', // Tạm mock status
                    }));
                    setImportSlips(formattedData);
                } catch (error) {
                    console.error("Failed to fetch import slips:", error.response?.data || error.message);
                    Alert.alert("Lỗi", "Không thể tải danh sách phiếu nhập.");
                } finally {
                    setLoading(false);
                }
            };
            fetchImportSlips();
        }, [])
    );

    const handleViewDetails = (slip) => {
        setSelectedSlip(slip);
        setModalVisible(true);
    };

    const renderDetailModal = () => (
        <Modal visible={isModalVisible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chi tiết Phiếu nhập</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                {selectedSlip && (
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.slipIdText}>Mã phiếu: #{selectedSlip.id}</Text>
                        <Text style={styles.detailText}>Nhà cung cấp: {selectedSlip.artistName}</Text>
                        <Text style={styles.detailText}>Người tạo: {selectedSlip.userName}</Text>
                        <Text style={styles.detailText}>Ngày nhập: {new Date(selectedSlip.date).toLocaleDateString('vi-VN')}</Text>

                        <Text style={styles.sectionTitle}>Sản phẩm đã nhập</Text>
                        {/* SỬA LẠI CHỖ NÀY: Dùng 'importSlipDetails' thay vì 'products' */}
                        {selectedSlip.importSlipDetails && selectedSlip.importSlipDetails.map((p, index) => (
                            <View key={p.paintingId || index} style={styles.productRow}>
                                <Text style={styles.productName}>{p.paintingName}</Text>
                                <Text style={styles.productPrice}>{formatCurrency(p.price)}</Text>
                            </View>
                        ))}
                    </ScrollView>
                )}
                <View style={styles.modalFooter}>
                    <Text style={styles.totalLabel}>Tổng giá trị</Text>
                    <Text style={styles.totalValue}>{formatCurrency(selectedSlip?.totalValue || 0)}</Text>
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
                <Text style={styles.headerTitle}>Nhập hàng</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TaoPhieuNhap')} style={styles.headerButton}>
                    <Ionicons name="add" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={importSlips}
                    renderItem={({ item }) => <ImportSlipListItem item={item} onViewDetails={handleViewDetails} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Chưa có phiếu nhập nào.</Text>}
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
        backgroundColor: COLORS.white, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.lightGray 
    },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2 },
    listContainer: { 
        padding: SIZES.padding,
        backgroundColor: COLORS.background,
    },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray, alignItems: 'flex-end' },
    slipIdText: { ...FONTS.h3, color: COLORS.primary, marginBottom: SIZES.padding },
    detailText: { ...FONTS.body3, color: COLORS.textMuted, marginBottom: SIZES.base },
    sectionTitle: { ...FONTS.h3, marginTop: SIZES.padding * 2, marginBottom: SIZES.base, borderTopWidth: 1, borderColor: COLORS.lightGray, paddingTop: SIZES.padding },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SIZES.padding, borderBottomWidth: 1, borderColor: COLORS.lightGray },
    productName: { ...FONTS.body3, flex: 1 },
    productPrice: { ...FONTS.body3, fontWeight: 'bold' },
    totalLabel: { ...FONTS.body3, color: COLORS.textMuted },
    totalValue: { ...FONTS.h2, color: COLORS.primary },
});

export default QuanLyNhapHangScreen;