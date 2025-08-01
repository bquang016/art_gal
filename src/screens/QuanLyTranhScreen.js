import React, { useState, useMemo, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
    Modal, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { SERVER_BASE_URL } from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import PaintingListItem from '../components/PaintingListItem';
import PaintingGridItem from '../components/PaintingGridItem';
import CustomPicker from '../components/CustomPicker';
import StatusBadge from '../components/StatusBadge';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const QuanLyTranhScreen = ({ route, navigation }) => {
    const [paintings, setPaintings] = useState([]);
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isViewModalVisible, setViewModalVisible] = useState(false);
    const [selectedPainting, setSelectedPainting] = useState(null);

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

    const paintingsWithFullInfo = useMemo(() => {
        return paintings.map(p => {
            const artist = artists.find(a => a.id === p.artistId);
            const category = categories.find(c => c.id === p.categoryId);
            return { 
                ...p, 
                artistName: artist ? artist.name : 'Không rõ',
                categoryName: category ? category.name : 'Không rõ',
            };
        });
    }, [paintings, artists, categories]);

    const filteredPaintings = useMemo(() => {
        return paintingsWithFullInfo.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.artistName && p.artistName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [paintingsWithFullInfo, searchQuery]);

    const handleOpenEditModal = (item) => {
        setSelectedPainting({ ...item });
        setEditModalVisible(true);
    };

    const handleOpenViewModal = (item) => {
        setSelectedPainting(item);
        setViewModalVisible(true);
    };

    const handleUploadImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Lỗi", "Quyền truy cập thư viện ảnh đã bị từ chối.");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (result.canceled) return;
        
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        const formData = new FormData();
        formData.append('file', { uri, name: filename, type });

        setIsUploading(true);
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            const response = await apiService.post('/files/upload', formData, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const uploadedFilename = response.data;
            setSelectedPainting({...selectedPainting, image: uploadedFilename});
            Alert.alert("Thành công", "Tải ảnh lên thành công! Nhấn 'Lưu' để xác nhận.");
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Lỗi", "Tải ảnh lên thất bại.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSavePainting = async () => {
        if (!selectedPainting || !selectedPainting.name || !selectedPainting.sellingPrice || !selectedPainting.artistId || !selectedPainting.categoryId) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }
        try {
            const payload = { ...selectedPainting };
            await apiService.put(`/paintings/${selectedPainting.id}`, payload);
            Alert.alert("Thành công", `Đã cập nhật tranh "${selectedPainting.name}".`);
            setEditModalVisible(false);
            setSelectedPainting(null);
            const response = await apiService.get('/paintings'); // Tải lại dữ liệu
            setPaintings(response.data);
        } catch (error) {
            console.error("Failed to save painting:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Cập nhật thất bại.");
        }
    };
    
    const categoryDataForPicker = categories.map(c => ({ label: c.name, value: c.id }));
    const artistDataForPicker = artists.map(a => ({ label: a.name, value: a.id }));

    const renderDetailModal = () => {
        if (!selectedPainting) return null;

        const DetailRow = ({ label, value }) => (
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        );

        return (
            <Modal
                animationType="slide"
                visible={isViewModalVisible}
                onRequestClose={() => setViewModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle} numberOfLines={1}>{selectedPainting.name}</Text>
                        <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                            <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalContent}>
                        <Image source={{ uri: `${SERVER_BASE_URL}/api/files/${selectedPainting.image}` }} style={styles.detailImage} />
                        <View style={styles.detailSection}>
                           <DetailRow label="Tác giả" value={selectedPainting.artistName} />
                           <DetailRow label="Thể loại" value={selectedPainting.categoryName} />
                           <DetailRow label="Chất liệu" value={selectedPainting.material} />
                           <DetailRow label="Kích thước" value={selectedPainting.size || 'Chưa cập nhật'} />
                        </View>
                         <View style={styles.detailSection}>
                           <DetailRow label="Giá bán" value={formatCurrency(selectedPainting.sellingPrice)} />
                           <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Trạng thái</Text>
                                <StatusBadge status={selectedPainting.status} />
                           </View>
                        </View>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Mô tả</Text>
                            <Text style={styles.descriptionText}>{selectedPainting.description || 'Chưa có mô tả.'}</Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        );
    };

    const renderEditModal = () => (
        <Modal
            animationType="slide"
            visible={isEditModalVisible}
            onRequestClose={() => setEditModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chỉnh sửa Tranh</Text>
                    <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                    {selectedPainting && (
                        <>
                            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage} disabled={isUploading}>
                                {isUploading ? <ActivityIndicator color={COLORS.primary}/> :
                                    (selectedPainting.image ? 
                                        <Image source={{ uri: `${SERVER_BASE_URL}/api/files/${selectedPainting.image}` }} style={styles.previewImage} />
                                        : <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
                                    )
                                }
                            </TouchableOpacity>
                            <Text style={styles.hintText}>Nhấn vào ảnh để thay đổi</Text>
                            
                            <Text style={styles.inputLabel}>Tên tranh *</Text>
                            <TextInput style={styles.input} value={selectedPainting.name} onChangeText={text => setSelectedPainting({ ...selectedPainting, name: text })} />
                            
                            <Text style={styles.inputLabel}>Kích thước</Text>
                            <TextInput style={styles.input} value={selectedPainting.size} onChangeText={text => setSelectedPainting({ ...selectedPainting, size: text })} />
                            
                            <Text style={styles.inputLabel}>Mô tả</Text>
                            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={selectedPainting.description} onChangeText={text => setSelectedPainting({ ...selectedPainting, description: text })} multiline />

                            <CustomPicker
                                label="Họa sĩ *"
                                data={artistDataForPicker}
                                selectedValue={selectedPainting.artistId}
                                onValueChange={val => setSelectedPainting({ ...selectedPainting, artistId: val })}
                                placeholder="Chọn họa sĩ"
                            />
                             <CustomPicker
                                label="Thể loại *"
                                data={categoryDataForPicker}
                                selectedValue={selectedPainting.categoryId}
                                onValueChange={val => setSelectedPainting({ ...selectedPainting, categoryId: val })}
                                placeholder="Chọn thể loại"
                            />
                            <Text style={styles.inputLabel}>Chất liệu *</Text>
                            <TextInput style={styles.input} value={selectedPainting.material} onChangeText={text => setSelectedPainting({ ...selectedPainting, material: text })} />
                            <Text style={styles.inputLabel}>Giá bán (VND) *</Text>
                            <TextInput style={styles.input} value={String(selectedPainting.sellingPrice)} onChangeText={text => setSelectedPainting({ ...selectedPainting, sellingPrice: text })} keyboardType="numeric" />
                            <Text style={styles.inputLabel}>Giá nhập (VND)</Text>
                            <TextInput style={[styles.input, styles.inputDisabled]} value={String(selectedPainting.importPrice)} editable={false} />
                            <Text style={styles.inputLabel}>Trạng thái</Text>
                            <View style={styles.statusSelectContainer}>
                                <TouchableOpacity onPress={() => setSelectedPainting({ ...selectedPainting, status: 'Đang bán' })} style={[styles.statusSelectButton, selectedPainting.status === 'Đang bán' && styles.statusSelectButtonActive]}>
                                    <Text style={[styles.statusSelectText, selectedPainting.status === 'Đang bán' && styles.statusSelectTextActive]}>Đang bán</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSelectedPainting({ ...selectedPainting, status: 'Dừng bán' })} style={[styles.statusSelectButton, selectedPainting.status === 'Dừng bán' && styles.statusSelectButtonActive]}>
                                    <Text style={[styles.statusSelectText, selectedPainting.status === 'Dừng bán' && styles.statusSelectTextActive]}>Dừng bán</Text>
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
                            ? <PaintingGridItem item={item} onEdit={handleOpenEditModal} onViewDetails={handleOpenViewModal} />
                            : <PaintingListItem item={item} onEdit={handleOpenEditModal} onViewDetails={handleOpenViewModal} />
                    }
                    keyExtractor={item => item.id.toString()}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy tranh nào.</Text>}
                />
            )}
            {renderEditModal()}
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
    modalTitle: { ...FONTS.h2, flex: 1, marginRight: SIZES.base },
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
    uploadButton: { height: 200, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderRadius: SIZES.radius, marginBottom: SIZES.base, borderWidth: 1, borderColor: COLORS.border },
    previewImage: { width: '100%', height: '100%', borderRadius: SIZES.radius, resizeMode: 'contain' },
    hintText: { ...FONTS.body4, color: COLORS.textMuted, textAlign: 'center', marginBottom: SIZES.padding },
    detailImage: { width: '100%', height: 250, borderRadius: SIZES.radius, resizeMode: 'contain', backgroundColor: COLORS.background, marginBottom: SIZES.padding },
    detailSection: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding, marginBottom: SIZES.itemSpacing, borderWidth: 1, borderColor: COLORS.lightGray },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.base },
    detailLabel: { ...FONTS.body3, color: COLORS.textMuted },
    detailValue: { ...FONTS.h4, color: COLORS.textDark, flex: 1, textAlign: 'right' },
    descriptionText: { ...FONTS.body3, color: COLORS.textDark, lineHeight: 22, marginTop: SIZES.base },
});

export default QuanLyTranhScreen;