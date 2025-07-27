import React, { useState, useMemo, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
    Modal, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import apiService, { SERVER_BASE_URL } from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import PaintingListItem from '../components/PaintingListItem';
import PaintingGridItem from '../components/PaintingGridItem';
import CustomPicker from '../components/CustomPicker';

const QuanLyTranhScreen = ({ route, navigation }) => {
    const [paintings, setPaintings] = useState([]);
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingPainting, setEditingPainting] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [paintingsRes, artistsRes, categoriesRes] = await Promise.all([
                        apiService.get('/paintings'),
                        apiService.get('/artists'),
                        apiService.get('/categories')
                    ]);
                    setPaintings(paintingsRes.data);
                    setArtists(artistsRes.data);
                    setCategories(categoriesRes.data);
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                    Alert.alert("Lỗi", "Không thể tải dữ liệu.");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            const artistFilterFromNav = route.params?.artistFilter;
            if (artistFilterFromNav) {
                setSearchQuery(artistFilterFromNav);
                navigation.setParams({ artistFilter: undefined });
            }
        }, [route.params?.artistFilter, navigation])
    );

    const paintingsWithArtistNames = useMemo(() => {
        return paintings.map(p => {
            const artist = artists.find(a => a.id === p.artistId);
            return { ...p, artistName: artist ? artist.name : 'Không rõ' };
        });
    }, [paintings, artists]);

    const filteredPaintings = useMemo(() => {
        return paintingsWithArtistNames.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.artistName && p.artistName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [paintingsWithArtistNames, searchQuery]);

    const handleOpenEditModal = (item) => {
        const originalPainting = paintings.find(p => p.id === item.id);
        setEditingPainting({ ...originalPainting });
        setModalVisible(true);
    };

    const handleUploadImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Lỗi", "Bạn cần cấp quyền truy cập thư viện ảnh.");
            return;
        }
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (pickerResult.canceled) return;
        
        const uri = pickerResult.assets[0].uri;
        const filename = uri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;

        const formData = new FormData();
        formData.append('file', { uri, name: filename, type });

        setIsUploading(true);
        try {
            const response = await apiService.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                transformRequest: (data) => data,
            });
            const uploadedFilename = response.data;
            setEditingPainting({...editingPainting, image: uploadedFilename});
            Alert.alert("Thành công", "Tải ảnh lên thành công! Nhấn 'Lưu' để xác nhận.");
        } catch (error) {
            Alert.alert("Lỗi", "Tải ảnh lên thất bại.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSavePainting = async () => {
        if (!editingPainting || !editingPainting.name || !editingPainting.sellingPrice || !editingPainting.artistId || !editingPainting.categoryId) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }
        try {
            const payload = { ...editingPainting };
            await apiService.put(`/paintings/${editingPainting.id}`, payload);
            Alert.alert("Thành công", `Đã cập nhật tranh "${editingPainting.name}".`);
            setModalVisible(false);
            setEditingPainting(null);
            fetchData();
        } catch (error) {
            console.error("Failed to save painting:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Cập nhật thất bại.");
        }
    };
    
    const categoryDataForPicker = categories.map(c => ({ label: c.name, value: c.id }));
    const artistDataForPicker = artists.map(a => ({ label: a.name, value: a.id }));

    const renderFormModal = () => (
        <Modal
            animationType="slide"
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chỉnh sửa Tranh</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                    {editingPainting && (
                        <>
                            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage} disabled={isUploading}>
                                {isUploading ? <ActivityIndicator color={COLORS.primary}/> :
                                    (editingPainting.image ? 
                                        <Image source={{ uri: `${SERVER_BASE_URL}/api/files/${editingPainting.image}` }} style={styles.previewImage} />
                                        : <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
                                    )
                                }
                            </TouchableOpacity>
                            <Text style={styles.hintText}>Nhấn vào ảnh để thay đổi</Text>
                            
                            <Text style={styles.inputLabel}>Tên tranh *</Text>
                            <TextInput style={styles.input} value={editingPainting.name} onChangeText={text => setEditingPainting({ ...editingPainting, name: text })} />
                            <CustomPicker
                                label="Họa sĩ *"
                                data={artistDataForPicker}
                                selectedValue={editingPainting.artistId}
                                onValueChange={val => setEditingPainting({ ...editingPainting, artistId: val })}
                                placeholder="Chọn họa sĩ"
                            />
                             <CustomPicker
                                label="Thể loại *"
                                data={categoryDataForPicker}
                                selectedValue={editingPainting.categoryId}
                                onValueChange={val => setEditingPainting({ ...editingPainting, categoryId: val })}
                                placeholder="Chọn thể loại"
                            />
                            <Text style={styles.inputLabel}>Chất liệu *</Text>
                            <TextInput style={styles.input} value={editingPainting.material} onChangeText={text => setEditingPainting({ ...editingPainting, material: text })} />
                            <Text style={styles.inputLabel}>Giá bán (VND) *</Text>
                            <TextInput style={styles.input} value={String(editingPainting.sellingPrice)} onChangeText={text => setEditingPainting({ ...editingPainting, sellingPrice: text })} keyboardType="numeric" />
                            <Text style={styles.inputLabel}>Giá nhập (VND)</Text>
                            <TextInput style={[styles.input, styles.inputDisabled]} value={String(editingPainting.importPrice)} editable={false} />
                            <Text style={styles.inputLabel}>Trạng thái</Text>
                            <View style={styles.statusSelectContainer}>
                                <TouchableOpacity onPress={() => setEditingPainting({ ...editingPainting, status: 'Đang bán' })} style={[styles.statusSelectButton, editingPainting.status === 'Đang bán' && styles.statusSelectButtonActive]}>
                                    <Text style={[styles.statusSelectText, editingPainting.status === 'Đang bán' && styles.statusSelectTextActive]}>Đang bán</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditingPainting({ ...editingPainting, status: 'Dừng bán' })} style={[styles.statusSelectButton, editingPainting.status === 'Dừng bán' && styles.statusSelectButtonActive]}>
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
                    <Ionicons name="menu" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Tranh</Text>
                <View style={{ width: 44 }} />
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
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    key={viewMode}
                    data={filteredPaintings}
                    renderItem={({ item }) =>
                        viewMode === 'grid'
                            ? <PaintingGridItem item={{...item, artist: item.artistName}} onEdit={handleOpenEditModal} onHistory={() => alert('Xem lịch sử')} />
                            : <PaintingListItem item={{...item, artist: item.artistName}} onEdit={handleOpenEditModal} onHistory={() => alert('Xem lịch sử')} />
                    }
                    keyExtractor={item => item.id.toString()}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy tranh nào.</Text>}
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
    searchFilterContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.padding, backgroundColor: COLORS.white, paddingBottom: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    searchWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.black}08`, borderRadius: SIZES.radius },
    searchIcon: { marginHorizontal: SIZES.base * 1.5 },
    searchInput: { flex: 1, height: 44, ...FONTS.body3 },
    viewModeButton: { padding: SIZES.base, marginLeft: SIZES.base },
    listContainer: {
        padding: SIZES.base,
        backgroundColor: COLORS.background,
    },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    modalContainer: { flex: 1, backgroundColor: COLORS.white },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray, justifyContent: 'flex-end' },
    inputLabel: { ...FONTS.body3, color: COLORS.textMuted, marginBottom: SIZES.base, fontWeight: '600' },
    input: { height: 50, backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.body3, marginBottom: SIZES.itemSpacing },
    inputDisabled: { backgroundColor: COLORS.lightGray, color: COLORS.textMuted },
    statusSelectContainer: { flexDirection: 'row', borderRadius: SIZES.radius, overflow: 'hidden' },
    statusSelectButton: { flex: 1, padding: SIZES.padding, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    statusSelectButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    statusSelectText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    statusSelectTextActive: { color: COLORS.white },
    uploadButton: {
        height: 200,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: SIZES.radius,
        marginBottom: SIZES.base,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: SIZES.radius,
        resizeMode: 'contain',
    },
    hintText: {
        ...FONTS.body4,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SIZES.padding,
    },
});

export default QuanLyTranhScreen;