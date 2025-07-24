import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
    Modal, SafeAreaView, ScrollView, Button, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/mockApi';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import ArtistListItem from '../components/ArtistListItem';

const QuanLyHoaSiScreen = ({ navigation }) => {
    const [artists, setArtists] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // State cho Modal
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingArtist, setEditingArtist] = useState(null);

    useEffect(() => {
        api.getArtists().then(setArtists);
    }, []);

    const filteredArtists = useMemo(() => {
        return artists.filter(artist =>
            (artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             artist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             artist.phone.includes(searchQuery)) &&
            (statusFilter === 'all' || artist.status === statusFilter)
        );
    }, [artists, searchQuery, statusFilter]);

    const handleViewPaintings = (artistName) => {
        navigation.navigate('QuanLyTranh', { artistFilter: artistName });
    };

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingArtist({
            name: '',
            phone: '',
            email: '',
            address: '',
            joinDate: new Date().toISOString().split('T')[0],
            status: 'Đang hợp tác'
        });
        setModalVisible(true);
    };

    const handleOpenEditModal = (artist) => {
        setModalMode('edit');
        setEditingArtist({ ...artist });
        setModalVisible(true);
    };

    const handleSaveArtist = () => {
        if (!editingArtist || !editingArtist.name || !editingArtist.email) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ Tên và Email của họa sĩ.");
            return;
        }

        if (modalMode === 'add') {
            const newArtist = { ...editingArtist, id: `HS${Date.now()}` };
            setArtists(prev => [newArtist, ...prev]);
            Alert.alert("Thành công", `Đã thêm họa sĩ mới: ${newArtist.name}`);
        } else {
            setArtists(prev => prev.map(artist => artist.id === editingArtist.id ? editingArtist : artist));
            Alert.alert("Thành công", `Đã cập nhật thông tin cho họa sĩ: ${editingArtist.name}`);
        }
        setModalVisible(false);
        setEditingArtist(null);
    };

    const renderFormModal = () => (
        <Modal
            animationType="slide"
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Thêm Họa sĩ' : 'Chỉnh sửa Họa sĩ'}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                    {editingArtist && (
                        <>
                            <Text style={styles.inputLabel}>Họ và Tên *</Text>
                            <TextInput style={styles.input} value={editingArtist.name} onChangeText={text => setEditingArtist({ ...editingArtist, name: text })} />
                            <Text style={styles.inputLabel}>Email *</Text>
                            <TextInput style={styles.input} value={editingArtist.email} onChangeText={text => setEditingArtist({ ...editingArtist, email: text })} keyboardType="email-address" />
                            <Text style={styles.inputLabel}>Số điện thoại</Text>
                            <TextInput style={styles.input} value={editingArtist.phone} onChangeText={text => setEditingArtist({ ...editingArtist, phone: text })} keyboardType="phone-pad" />
                            <Text style={styles.inputLabel}>Địa chỉ</Text>
                            <TextInput style={styles.input} value={editingArtist.address} onChangeText={text => setEditingArtist({ ...editingArtist, address: text })} />
                            <Text style={styles.inputLabel}>Trạng thái</Text>
                            <View style={styles.statusSelectContainer}>
                                <TouchableOpacity
                                    style={[styles.statusSelectButton, editingArtist.status === 'Đang hợp tác' && styles.statusSelectButtonActive]}
                                    onPress={() => setEditingArtist({ ...editingArtist, status: 'Đang hợp tác' })} >
                                    <Text style={[styles.statusSelectText, editingArtist.status === 'Đang hợp tác' && styles.statusSelectTextActive]}>Đang hợp tác</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.statusSelectButton, editingArtist.status === 'Dừng hợp tác' && styles.statusSelectButtonActive]}
                                    onPress={() => setEditingArtist({ ...editingArtist, status: 'Dừng hợp tác' })} >
                                    <Text style={[styles.statusSelectText, editingArtist.status === 'Dừng hợp tác' && styles.statusSelectTextActive]}>Dừng hợp tác</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
                <View style={styles.modalFooter}>
                    <Button title="Hủy" onPress={() => setModalVisible(false)} color={COLORS.textMuted} />
                    <View style={{width: SIZES.padding}}/>
                    <Button title="Lưu" onPress={handleSaveArtist} color={COLORS.primary} />
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
                <Text style={styles.headerTitle}>Họa sĩ</Text>
                <TouchableOpacity onPress={handleOpenAddModal} style={styles.headerButton}>
                    <Ionicons name="add" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm theo tên, email, SĐT..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>
            </View>

            <View style={styles.statusFilterContainer}>
                <TouchableOpacity onPress={() => setStatusFilter('all')} style={[styles.statusButton, statusFilter === 'all' && styles.statusButtonActive]}>
                    <Text style={[styles.statusButtonText, statusFilter === 'all' && styles.statusButtonTextActive]}>Tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStatusFilter('Đang hợp tác')} style={[styles.statusButton, statusFilter === 'Đang hợp tác' && styles.statusButtonActive]}>
                    <Text style={[styles.statusButtonText, statusFilter === 'Đang hợp tác' && styles.statusButtonTextActive]}>Đang hợp tác</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStatusFilter('Dừng hợp tác')} style={[styles.statusButton, statusFilter === 'Dừng hợp tác' && styles.statusButtonActive]}>
                    <Text style={[styles.statusButtonText, statusFilter === 'Dừng hợp tác' && styles.statusButtonTextActive]}>Dừng hợp tác</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredArtists}
                renderItem={({ item }) => (
                    <ArtistListItem
                        item={item}
                        onViewPaintings={handleViewPaintings}
                        onEdit={handleOpenEditModal}
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy họa sĩ nào.</Text>}
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
    searchContainer: { 
        paddingHorizontal: SIZES.padding, 
        backgroundColor: COLORS.white, 
        paddingBottom: SIZES.base 
    },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.black}08`, borderRadius: SIZES.radius, height: 48 },
    searchIcon: { marginHorizontal: SIZES.base * 1.5 },
    searchInput: { flex: 1, ...FONTS.body3 },
    listContainer: { 
        paddingHorizontal: SIZES.padding, 
        paddingTop: SIZES.padding,
        backgroundColor: COLORS.background, // Thêm màu nền cho list
    },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    statusFilterContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    statusButton: { paddingVertical: SIZES.padding/2, paddingHorizontal: SIZES.padding },
    statusButtonActive: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
    statusButtonText: { ...FONTS.h4, color: COLORS.textMuted },
    statusButtonTextActive: { color: COLORS.primary, fontWeight: 'bold' },
    // Modal Styles
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { flexDirection: 'row', padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray, justifyContent: 'flex-end'},
    inputLabel: { ...FONTS.body3, color: COLORS.textMuted, marginBottom: SIZES.base, fontWeight: '600' },
    input: { height: 50, backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.body3, marginBottom: SIZES.itemSpacing },
    statusSelectContainer: { flexDirection: 'row', borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, overflow: 'hidden' },
    statusSelectButton: { flex: 1, padding: SIZES.padding, alignItems: 'center' },
    statusSelectButtonActive: { backgroundColor: COLORS.primary },
    statusSelectText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    statusSelectTextActive: { color: COLORS.white }
});

export default QuanLyHoaSiScreen;