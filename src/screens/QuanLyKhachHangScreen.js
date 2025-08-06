import React, { useState, useMemo, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, Modal, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import CustomerListItem from '../components/CustomerListItem';
import StatusBadge from '../components/StatusBadge';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// HÀM KIỂM TRA EMAIL
const validateEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(String(email).toLowerCase());
};

const QuanLyKhachHangScreen = ({ navigation }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isFormModalVisible, setFormModalVisible] = useState(false);
    const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
    
    const [modalMode, setModalMode] = useState('add');
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    useFocusEffect(
      useCallback(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const response = await apiService.get('/customers');
                setCustomers(response.data);
            } catch (error) {
                console.error("Failed to fetch customers:", error);
                Alert.alert("Lỗi", "Không thể tải danh sách khách hàng.");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
      }, [])
    );

    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.phone && c.phone.includes(searchQuery)) ||
            (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [customers, searchQuery]);

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingCustomer({ name: '', phone: '', email: '', address: '', status: 'Hoạt động' });
        setEmailError('');
        setFormModalVisible(true);
    };

    const handleOpenEditModal = (customer) => {
        setModalMode('edit');
        setEditingCustomer({ ...customer });
        setEmailError('');
        setFormModalVisible(true);
    };

    const handleViewHistory = async (customer) => {
        setEditingCustomer(customer);
        setHistoryModalVisible(true);
        setHistoryLoading(true);
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            if (!token) {
                throw new Error("Không tìm thấy token xác thực.");
            }
            const response = await apiService.get(`/orders/customer/${customer.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPurchaseHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch purchase history:", error);
            Alert.alert("Lỗi", "Không thể tải lịch sử mua hàng. Vui lòng thử đăng nhập lại.");
            setHistoryModalVisible(false);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingCustomer || !editingCustomer.name || !editingCustomer.phone) {
            Alert.alert("Lỗi", "Vui lòng điền Tên và Số điện thoại.");
            return;
        }
        if (editingCustomer.email && !validateEmail(editingCustomer.email)) {
            setEmailError('Định dạng email không hợp lệ.');
            return;
        }

        try {
            if (modalMode === 'add') {
                await apiService.post('/customers', editingCustomer);
                Alert.alert("Thành công", `Đã thêm khách hàng: ${editingCustomer.name}`);
            } else {
                await apiService.put(`/customers/${editingCustomer.id}`, editingCustomer);
                Alert.alert("Thành công", `Đã cập nhật khách hàng: ${editingCustomer.name}`);
            }
            setFormModalVisible(false);
            const response = await apiService.get('/customers');
            setCustomers(response.data);
        } catch(error) {
            const errorMessage = error.response?.data?.message || "Thao tác thất bại.";
            console.error("Failed to save customer:", error.response?.data || error.message);
            Alert.alert("Lỗi", errorMessage);
        }
    };

    const handleEmailChange = (text) => {
        setEditingCustomer({...editingCustomer, email: text});
        if (text && !validateEmail(text)) {
            setEmailError('Định dạng email không hợp lệ.');
        } else {
            setEmailError('');
        }
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
                        <TextInput 
                            style={[styles.input, emailError ? styles.inputError : null]} 
                            value={editingCustomer.email} 
                            onChangeText={handleEmailChange} 
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        
                        <Text style={styles.inputLabel}>Địa chỉ</Text>
                        <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} value={editingCustomer.address} onChangeText={text => setEditingCustomer({...editingCustomer, address: text})} multiline />

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
                    {historyLoading ? (
                        <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
                    ) : (
                        <FlatList
                            data={purchaseHistory}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({item}) => (
                                <View style={styles.historyItem}>
                                    <View style={styles.historyItemHeader}>
                                        <Text style={styles.historyOrderId}>#{item.id}</Text>
                                        <Text style={styles.historyDate}>{new Date(item.orderDate).toLocaleDateString('vi-VN')}</Text>
                                    </View>
                                    <View style={styles.productDetailsContainer}>
                                        {item.orderDetails.map(detail => (
                                            <View key={detail.paintingId} style={styles.productRow}>
                                                <Text style={styles.productName} numberOfLines={1}>{detail.paintingName}</Text>
                                                <Text style={styles.productPrice}>{formatCurrency(detail.price)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.historyItemFooter}>
                                        <StatusBadge status={item.status} />
                                        <Text style={styles.historyTotal}>{formatCurrency(item.totalAmount)}</Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyText}>Chưa có lịch sử mua hàng.</Text>}
                        />
                    )}
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
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={filteredCustomers}
                    renderItem={({ item }) => <CustomerListItem item={item} onEdit={handleOpenEditModal} onViewHistory={handleViewHistory} />}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không có khách hàng nào.</Text>}
                />
            )}
            {renderFormModal()}
            {renderHistoryModal()}
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
        paddingBottom: SIZES.padding, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.lightGray 
    },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.black}08`, borderRadius: SIZES.radius, height: 48 },
    searchIcon: { marginHorizontal: SIZES.base * 1.5 },
    searchInput: { flex: 1, ...FONTS.body3 },
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
    historyCustomerName: { ...FONTS.h3, marginBottom: SIZES.padding },
    historyItem: { 
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.itemSpacing,
    },
    historyItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: SIZES.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray
    },
    historyOrderId: { ...FONTS.h4, color: COLORS.primary },
    historyDate: { ...FONTS.body4, color: COLORS.textMuted },
    productDetailsContainer: {
        marginVertical: SIZES.padding,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.base / 2
    },
    productName: {
        ...FONTS.body3,
        color: COLORS.textDark,
        flex: 1,
        marginRight: SIZES.base
    },
    productPrice: {
        ...FONTS.body3,
        color: COLORS.textMuted
    },
    historyItemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SIZES.base,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray
    },
    historyTotal: { ...FONTS.h4, fontWeight: 'bold' },
    statusSelectContainer: { flexDirection: 'row', borderRadius: SIZES.radius, overflow: 'hidden' },
    statusSelectButton: { flex: 1, padding: SIZES.padding, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    statusButtonActiveSuccess: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    statusButtonActiveMuted: { backgroundColor: COLORS.textMuted, borderColor: COLORS.textMuted },
    statusSelectText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    statusSelectTextActive: { color: COLORS.white },
});

export default QuanLyKhachHangScreen;