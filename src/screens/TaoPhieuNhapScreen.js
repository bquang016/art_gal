import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, Modal, SafeAreaView, ScrollView, Button, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/mockApi';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import ImportListItem from '../components/ImportListItem';
import { Picker } from '@react-native-picker/picker';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const TaoPhieuNhapScreen = ({ navigation }) => {
    // Data from API
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    // Form state
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [notes, setNotes] = useState('');
    const [slipItems, setSlipItems] = useState([]);

    // Modal state
    const [isModalVisible, setModalVisible] = useState(false);
    const [newItem, setNewItem] = useState(null);

    useEffect(() => {
        // Tải tất cả dữ liệu cần thiết khi component được mount
        api.getArtists().then(setArtists);
        api.getCategories().then(setCategories);
        api.getMaterials().then(setMaterials);
    }, []);

    const handleOpenAddModal = () => {
        // === PHẦN SỬA LỖI LOGIC QUAN TRỌNG NHẤT ===
        // Luôn khởi tạo item mới với giá trị mặc định từ state hiện tại của categories và materials
        // Đảm bảo rằng dù API có tải xong lúc nào, khi nhấn nút này, nó sẽ lấy đúng dữ liệu.
        setNewItem({
            name: '',
            importPrice: '',
            sellingPrice: '',
            category: categories.length > 0 ? categories[0] : '',
            material: materials.length > 0 ? materials[0] : '',
        });
        setModalVisible(true);
    };

    const handleAddItemToSlip = () => {
        if (!newItem || !newItem.name || !newItem.importPrice) {
            Alert.alert("Lỗi", "Vui lòng nhập Tên tranh và Giá nhập.");
            return;
        }
        setSlipItems(prev => [...prev, { ...newItem, id: `item${Date.now()}` }]);
        setModalVisible(false);
        setNewItem(null); // Reset form state
    };

    const handleRemoveItem = (itemId) => {
        setSlipItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleCreateSlip = () => {
        if (!selectedArtist || slipItems.length === 0) {
            Alert.alert("Lỗi", "Vui lòng chọn Nhà cung cấp và thêm ít nhất 1 sản phẩm.");
            return;
        }
        Alert.alert("Xác nhận", `Tạo phiếu nhập từ họa sĩ ${selectedArtist} với ${slipItems.length} sản phẩm?`, [
            { text: "Hủy" },
            { text: "OK", onPress: () => {
                Alert.alert("Thành công", "Đã tạo phiếu nhập thành công!");
                navigation.goBack();
            }}
        ]);
    };
    
    const totalValue = useMemo(() => slipItems.reduce((sum, item) => sum + parseFloat(item.importPrice || 0), 0), [slipItems]);

    const renderAddProductModal = () => (
        <Modal visible={isModalVisible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Thêm sản phẩm</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                {/* Chỉ render khi newItem đã được khởi tạo */}
                {newItem && (
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.inputLabel}>Tên tranh *</Text>
                        <TextInput style={styles.input} value={newItem.name} onChangeText={t => setNewItem({...newItem, name: t})} />
                        
                        <Text style={styles.inputLabel}>Giá nhập (VND) *</Text>
                        <TextInput style={styles.input} value={String(newItem.importPrice)} onChangeText={t => setNewItem({...newItem, importPrice: t})} keyboardType="numeric" />
                        
                        <Text style={styles.inputLabel}>Giá bán dự kiến (VND)</Text>
                        <TextInput style={styles.input} value={String(newItem.sellingPrice)} onChangeText={t => setNewItem({...newItem, sellingPrice: t})} keyboardType="numeric" />
                        
                        <Text style={styles.inputLabel}>Thể loại</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={newItem.category} onValueChange={val => setNewItem({...newItem, category: val})}>
                                {categories.map(c => <Picker.Item key={c} label={c} value={c} />)}
                            </Picker>
                        </View>
                         <Text style={styles.inputLabel}>Chất liệu</Text>
                         <View style={styles.pickerContainer}>
                            <Picker selectedValue={newItem.material} onValueChange={val => setNewItem({...newItem, material: val})}>
                                {materials.map(m => <Picker.Item key={m} label={m} value={m} />)}
                            </Picker>
                        </View>
                    </ScrollView>
                )}
                 <View style={styles.modalFooter}>
                    <Button title="Thêm vào phiếu" onPress={handleAddItemToSlip} color={COLORS.primary} />
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back-outline" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo Phiếu nhập</Text>
                <View style={{width: 44}} />
            </View>

            <View style={styles.mainContent}>
                <FlatList
                    data={slipItems}
                    renderItem={({ item }) => <ImportListItem item={item} onRemove={() => handleRemoveItem(item.id)} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{padding: SIZES.padding}}
                    ListHeaderComponent={
                        <View style={styles.formContainer}>
                            <Text style={styles.sectionTitle}>Thông tin chung</Text>
                            <Text style={styles.inputLabel}>Nhà cung cấp (Họa sĩ) *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker selectedValue={selectedArtist} onValueChange={(itemValue) => setSelectedArtist(itemValue)}>
                                    <Picker.Item label="-- Chọn họa sĩ --" value={null} style={{color: COLORS.textMuted}}/>
                                    {artists.map(a => <Picker.Item key={a.id} label={a.name} value={a.name} />)}
                                </Picker>
                            </View>

                            <Text style={styles.inputLabel}>Ghi chú</Text>
                            <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} value={notes} onChangeText={setNotes} multiline />
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
                <TouchableOpacity style={styles.confirmButton} onPress={handleCreateSlip}>
                    <Text style={styles.confirmButtonText}>Tạo Phiếu</Text>
                </TouchableOpacity>
            </View>
            {renderAddProductModal()}
        </SafeAreaView>
    );
};

// ... Styles không đổi
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
    pickerContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, marginBottom: SIZES.itemSpacing, backgroundColor: COLORS.white },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SIZES.padding * 2, marginBottom: SIZES.padding },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.primary}20`, paddingVertical: SIZES.base, paddingHorizontal: SIZES.padding, borderRadius: SIZES.radius },
    addButtonText: { color: COLORS.primary, ...FONTS.h4, marginLeft: SIZES.base },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: SIZES.padding * 2, backgroundColor: COLORS.white, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.lightGray, borderStyle: 'dashed' },
    emptyText: { color: COLORS.textMuted, ...FONTS.body3 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray, backgroundColor: `${COLORS.white}F0` },
    totalLabel: { ...FONTS.body4, color: COLORS.textMuted },
    totalValue: { ...FONTS.h2, color: COLORS.primary },
    confirmButton: { backgroundColor: COLORS.success, paddingHorizontal: SIZES.padding * 2, paddingVertical: SIZES.padding, borderRadius: SIZES.radius },
    confirmButtonText: { ...FONTS.h3, color: COLORS.white },
    // Modal Styles
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
});

export default TaoPhieuNhapScreen;