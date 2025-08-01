import React, { useState, useMemo, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
    Modal, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import ArtistListItem from '../components/ArtistListItem';

const validateEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(String(email).toLowerCase());
};

const QuanLyHoaSiScreen = ({ navigation }) => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingArtist, setEditingArtist] = useState(null);
    const [emailError, setEmailError] = useState('');

    const fetchArtists = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiService.get('/artists');
            setArtists(response.data);
        } catch (error) {
            console.error("Failed to fetch artists:", error);
            Alert.alert("Lỗi", "Không thể tải danh sách họa sĩ.");
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ SỬA LẠI CÁCH VIẾT useFocusEffect
    useFocusEffect(
      useCallback(() => {
        fetchArtists();
      }, [fetchArtists])
    );

    const filteredArtists = useMemo(() => {
        return artists.filter(artist =>
            (artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (artist.email && artist.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
             (artist.phone && artist.phone.includes(searchQuery))) &&
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
            status: 'Đang hợp tác'
        });
        setEmailError('');
        setModalVisible(true);
    };

    const handleOpenEditModal = (artist) => {
        setModalMode('edit');
        setEditingArtist({ ...artist });
        setEmailError('');
        setModalVisible(true);
    };

    const handleSaveArtist = async () => {
        if (!editingArtist || !editingArtist.name || !editingArtist.email) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ Tên và Email của họa sĩ.");
            return;
        }
        if (editingArtist.email && !validateEmail(editingArtist.email)) {
            setEmailError('Định dạng email không hợp lệ.');
            return;
        }

        try {
            if (modalMode === 'add') {
                await apiService.post('/artists', editingArtist);
                Alert.alert("Thành công", `Đã thêm họa sĩ mới: ${editingArtist.name}`);
            } else {
                await apiService.put(`/artists/${editingArtist.id}`, editingArtist);
                Alert.alert("Thành công", `Đã cập nhật thông tin cho họa sĩ: ${editingArtist.name}`);
            }
            setModalVisible(false);
            setEditingArtist(null);
            fetchArtists();
        } catch (error) {
            console.error("Failed to save artist:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Thao tác thất bại.");
        }
    };
    
    const handleEmailChange = (text) => {
        setEditingArtist({...editingArtist, email: text});
        if (text && !validateEmail(text)) {
            setEmailError('Định dạng email không hợp lệ.');
        } else {
            setEmailError('');
        }
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
                            <TextInput 
                                style={[styles.input, emailError ? styles.inputError : null]} 
                                value={editingArtist.email} 
                                onChangeText={handleEmailChange} 
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                            
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
            
            {loading ? (
                <ActivityIndicator style={{ marginTop: SIZES.padding * 2 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={filteredArtists}
                    renderItem={({ item }) => (
                        <ArtistListItem
                            item={item}
                            onViewPaintings={handleViewPaintings}
                            onEdit={handleOpenEditModal}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy họa sĩ nào.</Text>}
                />
            )}

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
        backgroundColor: COLORS.background,
    },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    statusFilterContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    statusButton: { paddingVertical: SIZES.padding/2, paddingHorizontal: SIZES.padding },
    statusButtonActive: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
    statusButtonText: { ...FONTS.h4, color: COLORS.textMuted },
    statusButtonTextActive: { color: COLORS.primary, fontWeight: 'bold' },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { flexDirection: 'row', padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray, justifyContent: 'flex-end'},
    inputLabel: { ...FONTS.body3, color: COLORS.textMuted, marginBottom: SIZES.base, fontWeight: '600' },
    input: { height: 50, backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.body3, marginBottom: SIZES.itemSpacing },
    inputError: {
        borderColor: COLORS.danger,
        borderWidth: 1,
    },
    errorText: {
        ...FONTS.body4,
        color: COLORS.danger,
        marginTop: -SIZES.itemSpacing + 4,
        marginBottom: SIZES.itemSpacing,
        marginLeft: SIZES.base,
    },
    statusSelectContainer: { flexDirection: 'row', borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, overflow: 'hidden' },
    statusSelectButton: { flex: 1, padding: SIZES.padding, alignItems: 'center' },
    statusSelectButtonActive: { backgroundColor: COLORS.primary },
    statusSelectText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    statusSelectTextActive: { color: COLORS.white }
});

export default QuanLyHoaSiScreen;