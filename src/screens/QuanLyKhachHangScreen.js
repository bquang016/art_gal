import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, Modal, SafeAreaView, ScrollView, Button, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/mockApi';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import CustomerListItem from '../components/CustomerListItem';
import StatusBadge from '../components/StatusBadge';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const QuanLyKhachHangScreen = ({ navigation }) => {
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isFormModalVisible, setFormModalVisible] = useState(false);
    const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
    
    const [modalMode, setModalMode] = useState('add');
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState([]);

    useEffect(() => {
        api.getCustomers().then(setCustomers);
    }, []);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [customers, searchQuery]);

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingCustomer({ name: '', phone: '', email: '', address: '', status: 'Hoạt động' });
        setFormModalVisible(true);
    };

    const handleOpenEditModal = (customer) => {
        setModalMode('edit');
        setEditingCustomer({ ...customer });
        setFormModalVisible(true);
    };

    const handleViewHistory = async (customer) => {
        setEditingCustomer(customer);
        const history = await api.getPurchaseHistory(customer.id);
        setPurchaseHistory(history);
        setHistoryModalVisible(true);
    };

    const handleSave = () => {
        if (!editingCustomer || !editingCustomer.name || !editingCustomer.phone) {
            Alert.alert("Lỗi", "Vui lòng điền Tên và Số điện thoại.");
            return;
        }

        if (modalMode === 'add') {
            const newCustomer = { ...editingCustomer, id: `KH${Date.now()}` };
            setCustomers(prev => [newCustomer, ...prev]);
            Alert.alert("Thành công", `Đã thêm khách hàng: ${newCustomer.name}`);
        } else {
            setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c));
            Alert.alert("Thành công", `Đã cập nhật khách hàng: ${editingCustomer.name}`);
        }
        setFormModalVisible(false);
    };

    const renderFormModal = () => (
        <Modal visible={isFormModalVisible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Thêm Khách hàng' : 'Sửa Khách hàng'}</Text>
                    <TouchableOpacity onPress={() => setFormModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                {editingCustomer && (
                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.inputLabel}>Tên *</Text>
                        <TextInput style={styles.input} value={editingCustomer.name} onChangeText={text => setEditingCustomer({...editingCustomer, name: text})} />
                        
                        <Text style={styles.inputLabel}>SĐT *</Text>
                        <TextInput style={styles.input} value={editingCustomer.phone} onChangeText={text => setEditingCustomer({...editingCustomer, phone: text})} keyboardType="phone-pad" />
                        
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput style={styles.input} value={editingCustomer.email} onChangeText={text => setEditingCustomer({...editingCustomer, email: text})} keyboardType="email-address" />
                        
                        <Text style={styles.inputLabel}>Địa chỉ</Text>
                        <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} value={editingCustomer.address} onChangeText={text => setEditingCustomer({...editingCustomer, address: text})} multiline />

                        {modalMode === 'edit' && (
                            <>
                                <Text style={styles.inputLabel}>Trạng thái</Text>
                                <View style={styles.statusSelectContainer}>
                                    <TouchableOpacity 
                                        style={[styles.statusSelectButton, editingCustomer.status === 'Hoạt động' && styles.statusButtonActiveSuccess]}
                                        onPress={() => setEditingCustomer({...editingCustomer, status: 'Hoạt động'})}>
                                        <Text style={[styles.statusSelectText, editingCustomer.status === 'Hoạt động' && styles.statusSelectTextActive]}>Hoạt động</Text>
                                    </TouchableOpacity>
                                     <TouchableOpacity 
                                        style={[styles.statusSelectButton, editingCustomer.status === 'Dừng hoạt động' && styles.statusButtonActiveMuted]}
                                        onPress={() => setEditingCustomer({...editingCustomer, status: 'Dừng hoạt động'})}>
                                        <Text style={[styles.statusSelectText, editingCustomer.status === 'Dừng hoạt động' && styles.statusSelectTextActive]}>Dừng hoạt động</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </ScrollView>
                )}
                <View style={styles.modalFooter}>
                    <Button title="Lưu" onPress={handleSave} color={COLORS.primary} />
                </View>
            </SafeAreaView>
        </Modal>
    );

     const renderHistoryModal = () => (
        <Modal visible={isHistoryModalVisible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                 <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Lịch sử mua hàng</Text>
                    <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                <View style={styles.modalContent}>
                    <Text style={styles.historyCustomerName}>{editingCustomer?.name}</Text>
                    <FlatList
                        data={purchaseHistory}
                        keyExtractor={item => item.id}
                        renderItem={({item}) => (
                            <View style={styles.historyItem}>
                                <View>
                                    <Text style={styles.historyOrderId}>#{item.id}</Text>
                                    <Text style={styles.historyDate}>{item.date}</Text>
                                </View>
                                <View style={{alignItems: 'flex-end'}}>
                                     <Text style={styles.historyTotal}>{formatCurrency(item.total)}</Text>
                                     <StatusBadge status={item.status} />
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có lịch sử mua hàng.</Text>}
                    />
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
                <Text style={styles.headerTitle}>Khách hàng</Text>
                <TouchableOpacity onPress={handleOpenAddModal} style={styles.headerButton}>
                    <Ionicons name="add" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
                 <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput style={styles.searchInput} placeholder="Tìm khách hàng..." value={searchQuery} onChangeText={setSearchQuery}/>
                </View>
            </View>
            <FlatList
                data={filteredCustomers}
                renderItem={({ item }) => <CustomerListItem item={item} onEdit={handleOpenEditModal} onViewHistory={handleViewHistory} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có khách hàng nào.</Text>}
            />
            {renderFormModal()}
            {renderHistoryModal()}
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
        paddingBottom: SIZES.padding, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.lightGray 
    },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.black}08`, borderRadius: SIZES.radius, height: 48 },
    searchIcon: { marginHorizontal: SIZES.base * 1.5 },
    searchInput: { flex: 1, ...FONTS.body3 },
    listContainer: { 
        padding: SIZES.padding,
        backgroundColor: COLORS.background // Thêm màu nền cho list
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
    // History Modal Styles
    historyCustomerName: { ...FONTS.h3, marginBottom: SIZES.padding },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SIZES.padding, borderBottomWidth: 1, borderColor: COLORS.lightGray },
    historyOrderId: { ...FONTS.h4, color: COLORS.primary },
    historyDate: { ...FONTS.body4, color: COLORS.textMuted },
    historyTotal: { ...FONTS.h4, marginBottom: SIZES.base },
    // Styles cho phần chọn trạng thái trong Modal
    statusSelectContainer: { flexDirection: 'row', borderRadius: SIZES.radius, overflow: 'hidden' },
    statusSelectButton: { flex: 1, padding: SIZES.padding, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    statusButtonActiveSuccess: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    statusButtonActiveMuted: { backgroundColor: COLORS.textMuted, borderColor: COLORS.textMuted },
    statusSelectText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    statusSelectTextActive: { color: COLORS.white },
});

export default QuanLyKhachHangScreen;