import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
    Modal, SafeAreaView, ScrollView, Button, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/mockApi';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import PaintingListItem from '../components/PaintingListItem';
import PaintingGridItem from '../components/PaintingGridItem';

const QuanLyTranhScreen = ({ route, navigation }) => {
    const [paintings, setPaintings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    // State cho Modal
    const [modalMode, setModalMode] = useState('add'); // 'add' hoặc 'edit'
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingPainting, setEditingPainting] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            const artistFilterFromNav = route.params?.artistFilter;
            if (artistFilterFromNav) {
                setSearchQuery(artistFilterFromNav);
                navigation.setParams({ artistFilter: undefined });
            }
        }, [route.params?.artistFilter])
    );

    useEffect(() => {
        api.getPaintings().then(setPaintings);
    }, []);

    const filteredPaintings = useMemo(() => {
        return paintings.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [paintings, searchQuery]);

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingPainting({
            name: '', artist: '', importPrice: '', sellingPrice: '', status: 'Đang bán'
        });
        setModalVisible(true);
    };

    const handleOpenEditModal = (item) => {
        setModalMode('edit');
        setEditingPainting({ ...item });
        setModalVisible(true);
    };
    
    const handleSavePainting = () => {
        if (!editingPainting.name || !editingPainting.artist || !editingPainting.sellingPrice) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }

        if (modalMode === 'add') {
            const newPainting = { ...editingPainting, id: `p${Date.now()}`, image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809' };
            setPaintings(prev => [newPainting, ...prev]);
            Alert.alert("Thành công", "Đã thêm tranh mới.");
        } else {
            setPaintings(prev => prev.map(p => p.id === editingPainting.id ? editingPainting : p));
            Alert.alert("Thành công", `Đã cập nhật tranh "${editingPainting.name}".`);
        }
        setModalVisible(false);
        setEditingPainting(null);
    };

    const renderFormModal = () => (
        <Modal
            animationType="slide"
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Thêm Tranh Mới' : 'Chỉnh sửa Tranh'}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                    {editingPainting && (
                        <>
                            <Text style={styles.inputLabel}>Tên tranh *</Text>
                            <TextInput style={styles.input} value={editingPainting.name} onChangeText={text => setEditingPainting({...editingPainting, name: text})} />
                            
                            <Text style={styles.inputLabel}>Họa sĩ *</Text>
                            <TextInput style={styles.input} value={editingPainting.artist} onChangeText={text => setEditingPainting({...editingPainting, artist: text})} />
                            
                            <Text style={styles.inputLabel}>Giá bán (VND) *</Text>
                            <TextInput style={styles.input} value={String(editingPainting.sellingPrice)} onChangeText={text => setEditingPainting({...editingPainting, sellingPrice: text})} keyboardType="numeric" />
                            
                            <Text style={styles.inputLabel}>Giá nhập (VND)</Text>
                            <TextInput style={styles.input} value={String(editingPainting.importPrice)} onChangeText={text => setEditingPainting({...editingPainting, importPrice: text})} keyboardType="numeric" />

                            <Text style={styles.inputLabel}>Trạng thái</Text>
                            <View style={styles.statusSelectContainer}>
                                <TouchableOpacity onPress={() => setEditingPainting({...editingPainting, status: 'Đang bán'})} style={[styles.statusSelectButton, editingPainting.status === 'Đang bán' && styles.statusSelectButtonActive]}>
                                    <Text style={[styles.statusSelectText, editingPainting.status === 'Đang bán' && styles.statusSelectTextActive]}>Đang bán</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditingPainting({...editingPainting, status: 'Dừng bán'})} style={[styles.statusSelectButton, editingPainting.status === 'Dừng bán' && styles.statusSelectButtonActive]}>
                                    <Text style={[styles.statusSelectText, editingPainting.status === 'Dừng bán' && styles.statusSelectTextActive]}>Dừng bán</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
                <View style={styles.modalFooter}>
                    <Button title="Lưu" onPress={handleSavePainting} color={COLORS.primary} />
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
                <Text style={styles.headerTitle}>Quản lý Tranh</Text>
                <TouchableOpacity onPress={handleOpenAddModal} style={styles.headerButton}>
                    <Ionicons name="add" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchFilterContainer}>
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm theo tên, họa sĩ..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>
                <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} style={styles.viewModeButton}>
                    <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={24} color={COLORS.textDark} />
                </TouchableOpacity>
            </View>

            <FlatList
                key={viewMode}
                data={filteredPaintings}
                renderItem={({ item }) =>
                    viewMode === 'grid'
                        ? <PaintingGridItem item={item} onEdit={handleOpenEditModal} onHistory={() => alert('Xem lịch sử')} />
                        : <PaintingListItem item={item} onEdit={handleOpenEditModal} onHistory={() => alert('Xem lịch sử')} />
                }
                keyExtractor={item => item.id}
                numColumns={viewMode === 'grid' ? 2 : 1}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy tranh nào.</Text>}
            />
            
            {renderFormModal()}
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
    searchFilterContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.padding, backgroundColor: COLORS.white, paddingBottom: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    searchWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.black}08`, borderRadius: SIZES.radius },
    searchIcon: { marginHorizontal: SIZES.base * 1.5 },
    searchInput: { flex: 1, height: 44, ...FONTS.body3 },
    viewModeButton: { padding: SIZES.base, marginLeft: SIZES.base },
    listContainer: { 
        padding: SIZES.base,
        backgroundColor: COLORS.background, // Thêm màu nền cho list
    },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: COLORS.white },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray, justifyContent: 'flex-end'},
    inputLabel: { ...FONTS.body3, color: COLORS.textMuted, marginBottom: SIZES.base, fontWeight: '600' },
    input: { height: 50, backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.body3, marginBottom: SIZES.itemSpacing },
    statusSelectContainer: { flexDirection: 'row', borderRadius: SIZES.radius, overflow: 'hidden' },
    statusSelectButton: { flex: 1, padding: SIZES.padding, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    statusSelectButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    statusSelectText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    statusSelectTextActive: { color: COLORS.white }
});

export default QuanLyTranhScreen;