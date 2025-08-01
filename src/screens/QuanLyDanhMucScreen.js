import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    Modal, SafeAreaView, TextInput, Button, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import CategoryListItem from '../components/CategoryListItem';
import apiService from '../api/apiService';
import StatusBadge from '../components/StatusBadge';

const QuanLyDanhMucScreen = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho modal Thêm/Sửa
    const [isFormModalVisible, setFormModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingItem, setEditingItem] = useState(null);

    // State cho modal Xem chi tiết
    const [isDetailModalVisible, setDetailModalVisible] = useState(false);
    const [viewingCategory, setViewingCategory] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiService.get('/categories');
            setCategories(response.data);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải danh sách danh mục.");
            console.error("Fetch categories error:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // ✅ SỬA LẠI CÁCH VIẾT useFocusEffect
    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [fetchCategories])
    );

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingItem({ name: '', description: '', status: 'Hiển thị' });
        setFormModalVisible(true);
    };

    const handleOpenEditModal = (item) => {
        setModalMode('edit');
        setEditingItem({ ...item });
        setFormModalVisible(true);
    };

    const handleViewDetails = async (category) => {
        setDetailModalVisible(true);
        setDetailLoading(true);
        try {
            const response = await apiService.get(`/categories/${category.id}/details`);
            setViewingCategory(response.data);
        } catch (error) {
            console.error("Fetch category details error:", error);
            Alert.alert("Lỗi", "Không thể tải chi tiết danh mục.");
            setDetailModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingItem || !editingItem.name) {
            Alert.alert("Lỗi", "Tên thể loại không được để trống.");
            return;
        }

        try {
            const payload = {
                id: editingItem.id,
                name: editingItem.name,
                description: editingItem.description,
                status: editingItem.status,
            };

            if (modalMode === 'add') {
                await apiService.post('/categories', payload);
                Alert.alert("Thành công", "Đã thêm mới thể loại.");
            } else {
                await apiService.put(`/categories/${editingItem.id}`, payload);
                Alert.alert("Thành công", "Đã cập nhật thể loại.");
            }

            setFormModalVisible(false);
            setEditingItem(null);
            fetchCategories();
        } catch (error) {
            Alert.alert("Lỗi", "Thao tác thất bại.");
            console.error("Save category error:", error.response?.data || error.message);
        }
    };

    const renderFormModal = () => (
        <Modal
            animationType="slide"
            visible={isFormModalVisible}
            onRequestClose={() => setFormModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Thêm Thể loại' : 'Chỉnh sửa Thể loại'}</Text>
                    <TouchableOpacity onPress={() => setFormModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                {editingItem && (
                    <View style={styles.modalContent}>
                        <Text style={styles.inputLabel}>Tên thể loại *</Text>
                        <TextInput style={styles.input} value={editingItem.name} onChangeText={text => setEditingItem({ ...editingItem, name: text })} />
                        <Text style={styles.inputLabel}>Mô tả</Text>
                        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={editingItem.description} onChangeText={text => setEditingItem({ ...editingItem, description: text })} multiline />
                        <Text style={styles.inputLabel}>Trạng thái</Text>
                        <View style={styles.statusSelectContainer}>
                            <TouchableOpacity onPress={() => setEditingItem({ ...editingItem, status: 'Hiển thị' })}
                                style={[styles.statusSelectButton, editingItem.status === 'Hiển thị' && styles.statusButtonActiveSuccess]}>
                                <Text style={[styles.statusSelectText, editingItem.status === 'Hiển thị' && styles.statusSelectTextActive]}>Hiển thị</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditingItem({ ...editingItem, status: 'Ẩn' })}
                                style={[styles.statusSelectButton, editingItem.status === 'Ẩn' && styles.statusButtonActiveMuted]}>
                                <Text style={[styles.statusSelectText, editingItem.status === 'Ẩn' && styles.statusSelectTextActive]}>Ẩn</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                <View style={styles.modalFooter}>
                    <Button title="Lưu" onPress={handleSave} color={COLORS.primary} />
                </View>
            </SafeAreaView>
        </Modal>
    );

    const renderDetailModal = () => (
        <Modal
            animationType="slide"
            visible={isDetailModalVisible}
            onRequestClose={() => setDetailModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle} numberOfLines={1}>{viewingCategory?.name}</Text>
                    <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                    {detailLoading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    ) : viewingCategory && (
                        <>
                            <View style={styles.detailSection}>
                                <Text style={styles.inputLabel}>Trạng thái</Text>
                                <StatusBadge status={viewingCategory.status} />
                            </View>
                            <View style={styles.detailSection}>
                                <Text style={styles.inputLabel}>Mô tả</Text>
                                <Text style={styles.descriptionText}>{viewingCategory.description || 'Không có mô tả.'}</Text>
                            </View>
                            <View style={styles.detailSection}>
                                <Text style={styles.inputLabel}>Danh sách tranh ({viewingCategory.paintings?.length || 0})</Text>
                                {viewingCategory.paintings?.length > 0 ? (
                                    viewingCategory.paintings.map(p => (
                                        <View key={p.id} style={styles.paintingRow}>
                                            <Text style={styles.paintingName}>{p.name}</Text>
                                            <Text style={styles.artistName}>{p.artistName}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>Không có tranh nào trong danh mục này.</Text>
                                )}
                            </View>
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
                    <Ionicons name="menu" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thể loại</Text>
                <TouchableOpacity onPress={handleOpenAddModal} style={styles.headerButton}>
                    <Ionicons name="add" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={categories}
                    renderItem={({ item }) => <CategoryListItem item={item} onEdit={handleOpenEditModal} onViewDetails={handleViewDetails} />}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không có dữ liệu.</Text>}
                />
            )}
            
            {renderFormModal()}
            {renderDetailModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base, backgroundColor: COLORS.white },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2 },
    listContainer: { padding: SIZES.padding, backgroundColor: COLORS.background },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2, flex: 1, marginRight: SIZES.base },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
    inputLabel: { ...FONTS.h4, color: COLORS.textMuted, marginBottom: SIZES.base },
    input: { height: 50, backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.body3, marginBottom: SIZES.itemSpacing },
    statusSelectContainer: { flexDirection: 'row', borderRadius: SIZES.radius, overflow: 'hidden' },
    statusSelectButton: { flex: 1, padding: SIZES.padding, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    statusButtonActiveSuccess: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    statusButtonActiveMuted: { backgroundColor: COLORS.textMuted, borderColor: COLORS.textMuted },
    statusSelectText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    statusSelectTextActive: { color: COLORS.white },
    detailSection: { marginBottom: SIZES.padding * 1.5, },
    descriptionText: { ...FONTS.body3, lineHeight: 22, color: COLORS.textDark, },
    paintingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SIZES.base, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray, },
    paintingName: { ...FONTS.body3, flex: 1, marginRight: SIZES.base, },
    artistName: { ...FONTS.body3, color: COLORS.textMuted },
});

export default QuanLyDanhMucScreen;