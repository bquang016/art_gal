// src/screens/QuanLyDanhMucScreen.js
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    Modal, SafeAreaView, TextInput, Button, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import CategoryListItem from '../components/CategoryListItem';

// Dữ liệu mẫu
const sampleGenres = [
    { id: 'gen01', name: 'Sơn dầu', description: 'Tranh được vẽ bằng chất liệu sơn dầu, có độ bền cao.', paintingCount: 3, status: 'Hiển thị' },
    { id: 'gen02', name: 'Trừu tượng', description: 'Tranh không mô tả vật thể cụ thể.', paintingCount: 2, status: 'Hiển thị' },
];

const QuanLyDanhMucScreen = ({ navigation }) => {
    const [genres, setGenres] = useState(sampleGenres);

    // State cho Modal
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingItem, setEditingItem] = useState(null);

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingItem({ name: '', description: '', status: 'Hiển thị' });
        setModalVisible(true);
    };

    const handleOpenEditModal = (item) => {
        setModalMode('edit');
        setEditingItem({ ...item });
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!editingItem || !editingItem.name) {
            Alert.alert("Lỗi", "Tên thể loại không được để trống.");
            return;
        }

        if (modalMode === 'add') {
            const newItem = { ...editingItem, id: `gen${Date.now()}`, paintingCount: 0 };
            setGenres(prev => [newItem, ...prev]);
            Alert.alert("Thành công", "Đã thêm mới thể loại.");
        } else {
            setGenres(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
            Alert.alert("Thành công", "Đã cập nhật thể loại.");
        }

        setModalVisible(false);
        setEditingItem(null);
    };

    const renderFormModal = () => (
        <Modal
            animationType="slide"
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Thêm Thể loại' : 'Chỉnh sửa Thể loại'}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
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
            <FlatList
                data={genres}
                renderItem={({ item }) => <CategoryListItem item={item} onEdit={handleOpenEditModal} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có dữ liệu.</Text>}
            />
            {renderFormModal()}
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
    listContainer: {
        padding: SIZES.padding,
        backgroundColor: COLORS.background
    },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
    inputLabel: { ...FONTS.h4, color: COLORS.textMuted, marginBottom: SIZES.base },
    input: { height: 50, backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.body3, marginBottom: SIZES.itemSpacing },
    statusSelectContainer: {
        flexDirection: 'row',
        borderRadius: SIZES.radius,
        overflow: 'hidden'
    },
    statusSelectButton: {
        flex: 1,
        padding: SIZES.padding,
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusButtonActiveSuccess: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    statusButtonActiveMuted: {
        backgroundColor: COLORS.textMuted,
        borderColor: COLORS.textMuted,
    },
    statusSelectText: {
        ...FONTS.body3,
        fontWeight: '600',
        color: COLORS.textDark
    },
    statusSelectTextActive: {
        color: COLORS.white
    },
});

export default QuanLyDanhMucScreen;