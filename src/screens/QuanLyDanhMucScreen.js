import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    Modal, SafeAreaView, TextInput, Button, Alert, Dimensions
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import CategoryListItem from '../components/CategoryListItem';

// Dữ liệu mẫu
const sampleGenres = [
    { id: 'gen01', name: 'Sơn dầu', description: 'Tranh được vẽ bằng chất liệu sơn dầu, có độ bền cao.', paintingCount: 3, status: 'Hiển thị' },
    { id: 'gen02', name: 'Trừu tượng', description: 'Tranh không mô tả vật thể cụ thể.', paintingCount: 2, status: 'Hiển thị' },
];
const sampleMaterials = [
    { id: 'mat01', name: 'Sơn dầu', description: 'Chất liệu sơn dầu trên vải toan.', paintingCount: 2, status: 'Hiển thị' },
    { id: 'mat03', name: 'Sơn mài', description: 'Chất liệu sơn mài truyền thống.', paintingCount: 1, status: 'Hiển thị' },
];

const CategoryTab = ({ data, onEdit }) => (
    <FlatList
        data={data}
        renderItem={({ item }) => <CategoryListItem item={item} onEdit={onEdit} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có dữ liệu.</Text>}
    />
);

const QuanLyDanhMucScreen = ({ navigation }) => {
    const [genres, setGenres] = useState(sampleGenres);
    const [materials, setMaterials] = useState(sampleMaterials);

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'genres', title: 'Thể loại' },
        { key: 'materials', title: 'Chất liệu' },
    ]);
    
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
            Alert.alert("Lỗi", "Tên không được để trống.");
            return;
        }

        const isGenreTab = index === 0;
        const listUpdater = isGenreTab ? setGenres : setMaterials;
        
        if(modalMode === 'add') {
            const newItem = {...editingItem, id: `${isGenreTab ? 'gen' : 'mat'}${Date.now()}`, paintingCount: 0 };
            listUpdater(prev => [newItem, ...prev]);
            Alert.alert("Thành công", "Đã thêm mới.");
        } else {
            listUpdater(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
            Alert.alert("Thành công", "Đã cập nhật.");
        }

        setModalVisible(false);
        setEditingItem(null);
    };

    const renderScene = SceneMap({
        genres: () => <CategoryTab data={genres} onEdit={handleOpenEditModal} />,
        materials: () => <CategoryTab data={materials} onEdit={handleOpenEditModal} />,
    });
    
    const renderTabBar = props => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: COLORS.primary, height: 3 }}
            style={{ backgroundColor: COLORS.white, elevation: 0, shadowOpacity: 0 }}
            labelStyle={{ ...FONTS.h4, color: COLORS.textDark, textTransform: 'capitalize' }}
            activeColor={COLORS.primary}
            inactiveColor={COLORS.textMuted}
        />
    );
    
     const renderFormModal = () => (
        <Modal
            animationType="slide"
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                {editingItem && (
                    <View style={styles.modalContent}>
                         <Text style={styles.inputLabel}>Tên *</Text>
                         <TextInput style={styles.input} value={editingItem.name} onChangeText={text => setEditingItem({...editingItem, name: text})}/>
                         
                         <Text style={styles.inputLabel}>Mô tả</Text>
                         <TextInput style={[styles.input, {height: 100, textAlignVertical: 'top'}]} value={editingItem.description} onChangeText={text => setEditingItem({...editingItem, description: text})} multiline/>
                         
                         <Text style={styles.inputLabel}>Trạng thái</Text>
                         <View style={styles.statusSelectContainer}>
                            <TouchableOpacity onPress={() => setEditingItem({...editingItem, status: 'Hiển thị'})} 
                                style={[styles.statusSelectButton, editingItem.status === 'Hiển thị' && styles.statusButtonActiveSuccess]}>
                                <Text style={[styles.statusSelectText, editingItem.status === 'Hiển thị' && styles.statusSelectTextActive]}>Hiển thị</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditingItem({...editingItem, status: 'Ẩn'})} 
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
        // SỬA LỖI: Bọc bằng SafeAreaView
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
                    <Ionicons name="menu" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Danh mục</Text>
                <TouchableOpacity onPress={handleOpenAddModal} style={styles.headerButton}>
                    <Ionicons name="add" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={renderTabBar}
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
    listContainer: { 
        padding: SIZES.padding,
        backgroundColor: COLORS.background
    },
    emptyText: { textAlign: 'center', marginTop: SIZES.padding * 2, ...FONTS.body3, color: COLORS.textMuted },
    // Modal Styles
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