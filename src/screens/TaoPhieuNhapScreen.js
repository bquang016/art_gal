import React, { useState, useMemo, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, Modal, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import ImportListItem from '../components/ImportListItem';
import CustomPicker from '../components/CustomPicker';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const TaoPhieuNhapScreen = ({ navigation }) => {
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [slipItems, setSlipItems] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newItem, setNewItem] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [artistsRes, categoriesRes] = await Promise.all([
                        apiService.get('/artists'),
                        apiService.get('/categories')
                    ]);
                    setArtists(artistsRes.data);
                    setCategories(categoriesRes.data);
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                    Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.", [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, [navigation])
    );

    const handleOpenAddModal = () => {
        if (categories.length === 0) {
            Alert.alert("Lỗi", "Chưa có dữ liệu danh mục. Vui lòng tạo danh mục trước.");
            return;
        }
        setNewItem({
            name: '',
            size: '',
            description: '',
            importPrice: '',
            sellingPrice: '',
            categoryId: categories[0].id,
            material: 'Sơn dầu',
        });
        setModalVisible(true);
    };

    const addItemToSlip = () => {
        const category = categories.find(c => c.id === newItem.categoryId);
        setSlipItems(prev => [...prev, { ...newItem, id: `item${Date.now()}`, category: category?.name }]);
        setModalVisible(false);
        setNewItem(null);
    };

    const handleAddItemToSlip = () => {
        if (!newItem || !newItem.name || !newItem.importPrice || !newItem.sellingPrice) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin sản phẩm có dấu *.");
            return;
        }

        const importPrice = parseFloat(newItem.importPrice);
        const sellingPrice = parseFloat(newItem.sellingPrice);

        if (!isNaN(importPrice) && !isNaN(sellingPrice) && importPrice > sellingPrice) {
            Alert.alert(
                "Cảnh báo",
                "Giá nhập đang cao hơn giá bán dự kiến. Bạn có chắc muốn tiếp tục?",
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Tiếp tục', onPress: addItemToSlip }
                ]
            );
            return;
        }
        addItemToSlip();
    };

    const handleRemoveItem = (itemId) => {
        setSlipItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleCreateSlip = async () => {
        if (!selectedArtist || slipItems.length === 0) {
            Alert.alert("Lỗi", "Vui lòng chọn Nhà cung cấp và thêm ít nhất 1 sản phẩm.");
            return;
        }
        
        const payload = {
            artistId: selectedArtist,
            items: slipItems.map(item => ({
                name: item.name,
                size: item.size,
                description: item.description,
                importPrice: parseFloat(item.importPrice),
                sellingPrice: parseFloat(item.sellingPrice),
                categoryId: item.categoryId,
                material: item.material,
            }))
        };
        
        try {
            setIsCreating(true);
            await apiService.post('/import-slips', payload);
            Alert.alert("Thành công", "Đã tạo phiếu nhập thành công!", [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Tạo phiếu nhập thất bại.";
            console.error("Failed to create import slip:", error.response?.data || error.message);
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const totalValue = useMemo(() => slipItems.reduce((sum, item) => sum + parseFloat(item.importPrice || 0), 0), [slipItems]);

    const artistDataForPicker = artists.map(a => ({ label: a.name, value: a.id }));
    const categoryDataForPicker = categories.map(c => ({ label: c.name, value: c.id }));

    const renderAddProductModal = () => (
        <Modal visible={isModalVisible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Thêm sản phẩm</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                {newItem && (
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.inputLabel}>Tên tranh *</Text>
                        <TextInput style={styles.input} value={newItem.name} onChangeText={t => setNewItem({ ...newItem, name: t })} />
                        
                        <Text style={styles.inputLabel}>Kích thước (VD: 80x120 cm)</Text>
                        <TextInput style={styles.input} value={newItem.size} onChangeText={t => setNewItem({ ...newItem, size: t })} />
                        
                        <Text style={styles.inputLabel}>Mô tả</Text>
                        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={newItem.description} onChangeText={t => setNewItem({ ...newItem, description: t })} multiline />

                        <Text style={styles.inputLabel}>Giá nhập (VND) *</Text>
                        <TextInput style={styles.input} value={String(newItem.importPrice)} onChangeText={t => setNewItem({ ...newItem, importPrice: t })} keyboardType="numeric" />
                        
                        <Text style={styles.inputLabel}>Giá bán dự kiến (VND) *</Text>
                        <TextInput style={styles.input} value={String(newItem.sellingPrice)} onChangeText={t => setNewItem({ ...newItem, sellingPrice: t })} keyboardType="numeric" />
                        
                        <CustomPicker
                            label="Thể loại *"
                            data={categoryDataForPicker}
                            selectedValue={newItem.categoryId}
                            onValueChange={val => setNewItem({ ...newItem, categoryId: val })}
                            placeholder="Chọn thể loại"
                        />

                        <Text style={styles.inputLabel}>Chất liệu *</Text>
                        <TextInput style={styles.input} value={newItem.material} onChangeText={t => setNewItem({ ...newItem, material: t })} />
                    </ScrollView>
                )}
                <View style={styles.modalFooter}>
                    <Button title="Thêm vào phiếu" onPress={handleAddItemToSlip} color={COLORS.primary} />
                </View>
            </SafeAreaView>
        </Modal>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back-outline" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo Phiếu nhập</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.mainContent}>
                <FlatList
                    data={slipItems}
                    renderItem={({ item }) => <ImportListItem item={item} onRemove={() => handleRemoveItem(item.id)} />}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: SIZES.padding }}
                    ListHeaderComponent={
                        <View style={styles.formContainer}>
                            <Text style={styles.sectionTitle}>Thông tin chung</Text>
                            
                            <CustomPicker
                                label="Nhà cung cấp (Họa sĩ) *"
                                data={artistDataForPicker}
                                selectedValue={selectedArtist}
                                onValueChange={(itemValue) => setSelectedArtist(itemValue)}
                                placeholder="-- Chọn họa sĩ --"
                            />
                            
                            <View style={styles.listHeader}>
                                <Text style={styles.sectionTitle}>Sản phẩm nhập ({slipItems.length})</Text>
                                <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
                                    <Ionicons name="add" size={20} color={COLORS.primary} />
                                    <Text style={styles.addButtonText}>Thêm SP</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Chưa có sản phẩm nào trong phiếu.</Text>
                        </View>
                    }
                />
            </View>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.totalLabel}>Tổng giá trị nhập</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.confirmButton, isCreating && styles.disabledButton]} 
                    onPress={handleCreateSlip}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.confirmButtonText}>Tạo Phiếu</Text>
                    )}
                </TouchableOpacity>
            </View>
            {renderAddProductModal()}
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2 },
    mainContent: { flex: 1 },
    formContainer: {},
    sectionTitle: { ...FONTS.h3, marginBottom: SIZES.padding },
    inputLabel: { ...FONTS.h4, color: COLORS.textMuted, marginBottom: SIZES.base, marginLeft: SIZES.base },
    input: { height: 50, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.body3, marginBottom: SIZES.itemSpacing },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SIZES.padding * 2, marginBottom: SIZES.padding },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.primary}20`, paddingVertical: SIZES.base, paddingHorizontal: SIZES.padding, borderRadius: SIZES.radius },
    addButtonText: { color: COLORS.primary, ...FONTS.h4, marginLeft: SIZES.base },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: SIZES.padding * 2, backgroundColor: COLORS.white, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.lightGray, borderStyle: 'dashed' },
    emptyText: { color: COLORS.textMuted, ...FONTS.body3 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray, backgroundColor: `${COLORS.white}F0` },
    totalLabel: { ...FONTS.body4, color: COLORS.textMuted },
    totalValue: { ...FONTS.h2, color: COLORS.primary },
    confirmButton: { backgroundColor: COLORS.success, paddingHorizontal: SIZES.padding * 2, paddingVertical: SIZES.padding, borderRadius: SIZES.radius, minWidth: 120, alignItems: 'center' },
    disabledButton: { backgroundColor: COLORS.textMuted },
    confirmButtonText: { ...FONTS.h3, color: COLORS.white },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
});

export default TaoPhieuNhapScreen;