import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, Modal, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import AccountListItem from '../components/AccountListItem';

// HÀM KIỂM TRA EMAIL
const validateEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(String(email).toLowerCase());
};

const QuanLyTaiKhoanScreen = ({ navigation }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isFormModalVisible, setFormModalVisible] = useState(false);
    const [isResetModalVisible, setResetModalVisible] = useState(false);

    const [modalMode, setModalMode] = useState('add');
    const [editingAccount, setEditingAccount] = useState(null);
    const [newPassword, setNewPassword] = useState({ pass: '', confirm: '' });
    const [emailError, setEmailError] = useState(''); // State cho lỗi email

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiService.get('/users');
            const formattedAccounts = response.data.map(acc => ({
                ...acc,
                id: acc.id.toString(),
                employeeName: acc.name,
                role: acc.roles.includes("ADMIN") ? "Admin" : "Nhân viên",
            }));
            setAccounts(formattedAccounts);
        } catch (error) {
            console.error("Failed to fetch accounts:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Không thể tải danh sách tài khoản. Bạn có phải là Admin không?");
        } finally {
            setLoading(false);
        }
    }, []);

    // SỬA LẠI CÁCH VIẾT useFocusEffect
    useFocusEffect(
        useCallback(() => {
            fetchAccounts();
        }, [fetchAccounts])
    );

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingAccount({ employeeName: '', username: '', email: '', password: '', role: 'Nhân viên', status: 'Hoạt động' });
        setEmailError('');
        setFormModalVisible(true);
    };

    const handleOpenEditModal = (account) => {
        setModalMode('edit');
        setEditingAccount({ ...account });
        setEmailError('');
        setFormModalVisible(true);
    };

    const handleOpenResetModal = (account) => {
        setEditingAccount(account);
        setNewPassword({ pass: '', confirm: '' });
        setResetModalVisible(true);
    };

    const handleSave = async () => {
        if (!editingAccount || !editingAccount.employeeName || !editingAccount.username || !editingAccount.email) {
            Alert.alert("Lỗi", "Vui lòng điền các trường bắt buộc.");
            return;
        }
        if (modalMode === 'add' && !editingAccount.password) {
            Alert.alert("Lỗi", "Vui lòng nhập mật khẩu cho tài khoản mới.");
            return;
        }
        if (editingAccount.email && !validateEmail(editingAccount.email)) {
            setEmailError('Định dạng email không hợp lệ.');
            return;
        }

        try {
            if (modalMode === 'add') {
                const payload = {
                    name: editingAccount.employeeName,
                    username: editingAccount.username,
                    email: editingAccount.email,
                    password: editingAccount.password,
                    status: editingAccount.status,
                    roles: [editingAccount.role.toUpperCase()]
                };
                await apiService.post('/users/create', payload);
            } else {
                 const payload = {
                    name: editingAccount.employeeName,
                    email: editingAccount.email,
                    status: editingAccount.status,
                    roles: [editingAccount.role.toUpperCase()]
                };
                await apiService.put(`/users/${editingAccount.id}`, payload);
            }
            Alert.alert("Thành công", `Đã ${modalMode === 'add' ? 'thêm' : 'cập nhật'} tài khoản.`);
            setFormModalVisible(false);
            fetchAccounts();

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Thao tác thất bại.";
            console.error("Save account error:", error.response?.data || error.message);
            Alert.alert("Lỗi", errorMessage);
        }
    };

    const handlePasswordReset = async () => {
        if (newPassword.pass.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }
        if (newPassword.pass !== newPassword.confirm) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
            return;
        }
        try {
            const payload = { newPassword: newPassword.pass };
            await apiService.patch(`/users/${editingAccount.id}/reset-password`, payload);
            Alert.alert("Thành công", `Đã đặt lại mật khẩu cho ${editingAccount.username}.`);
            setResetModalVisible(false);
        } catch(error) {
            console.error("Reset password error:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Đặt lại mật khẩu thất bại.");
        }
    };
    
    const handleEmailChange = (text) => {
        setEditingAccount({...editingAccount, email: text});
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
                    <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Tạo tài khoản' : 'Sửa tài khoản'}</Text>
                    <TouchableOpacity onPress={() => setFormModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                {editingAccount && (
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.inputLabel}>Tên nhân viên *</Text>
                        <TextInput style={styles.input} value={editingAccount.employeeName} onChangeText={text => setEditingAccount({ ...editingAccount, employeeName: text })} />

                        <Text style={styles.inputLabel}>Tên đăng nhập *</Text>
                        <TextInput style={[styles.input, modalMode === 'edit' && styles.inputDisabled]} value={editingAccount.username} onChangeText={text => setEditingAccount({ ...editingAccount, username: text })} editable={modalMode === 'add'} />
                        
                        {modalMode === 'add' && (
                            <>
                                <Text style={styles.inputLabel}>Mật khẩu *</Text>
                                <TextInput style={styles.input} placeholder="Nhập mật khẩu" secureTextEntry value={editingAccount.password} onChangeText={text => setEditingAccount({ ...editingAccount, password: text })} />
                            </>
                        )}

                        <Text style={styles.inputLabel}>Email *</Text>
                        <TextInput 
                            style={[styles.input, emailError ? styles.inputError : null]} 
                            value={editingAccount.email} 
                            onChangeText={handleEmailChange} 
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                        <Text style={styles.inputLabel}>Vai trò</Text>
                        <View style={styles.statusSelectContainer}>
                            <TouchableOpacity onPress={() => setEditingAccount({ ...editingAccount, role: 'Nhân viên' })} style={[styles.statusSelectButton, editingAccount.role === 'Nhân viên' && { backgroundColor: COLORS.info }]}>
                                <Text style={[styles.statusSelectText, editingAccount.role === 'Nhân viên' && { color: COLORS.white }]}>Nhân viên</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditingAccount({ ...editingAccount, role: 'Admin' })} style={[styles.statusSelectButton, editingAccount.role === 'Admin' && { backgroundColor: COLORS.primary }]}>
                                <Text style={[styles.statusSelectText, editingAccount.role === 'Admin' && { color: COLORS.white }]}>Admin</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.inputLabel}>Trạng thái</Text>
                        <View style={styles.statusSelectContainer}>
                            <TouchableOpacity onPress={() => setEditingAccount({ ...editingAccount, status: 'Hoạt động' })} style={[styles.statusSelectButton, editingAccount.status === 'Hoạt động' && { backgroundColor: COLORS.success }]}>
                                <Text style={[styles.statusSelectText, editingAccount.status === 'Hoạt động' && { color: COLORS.white }]}>Hoạt động</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditingAccount({ ...editingAccount, status: 'Dừng hoạt động' })} style={[styles.statusSelectButton, editingAccount.status === 'Dừng hoạt động' && { backgroundColor: COLORS.danger }]}>
                                <Text style={[styles.statusSelectText, editingAccount.status === 'Dừng hoạt động' && { color: COLORS.white }]}>Dừng hoạt động</Text>
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
    
    const renderResetPasswordModal = () => (
        <Modal visible={isResetModalVisible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Đặt lại mật khẩu</Text>
                     <TouchableOpacity onPress={() => setResetModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                <View style={styles.modalContent}>
                    <Text style={styles.modalSubText}>
                        Tài khoản: <Text style={{fontWeight: 'bold'}}>{editingAccount?.username}</Text>
                    </Text>
                    
                    <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Nhập mật khẩu mới"
                        secureTextEntry
                        value={newPassword.pass}
                        onChangeText={text => setNewPassword({...newPassword, pass: text})}
                    />
                    
                    <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                     <TextInput 
                        style={styles.input} 
                        placeholder="Nhập lại mật khẩu mới"
                        secureTextEntry
                        value={newPassword.confirm}
                        onChangeText={text => setNewPassword({...newPassword, confirm: text})}
                    />
                </View>
                 <View style={styles.modalFooter}>
                    <Button title="Lưu mật khẩu mới" onPress={handlePasswordReset} color={COLORS.primary} />
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
                <Text style={styles.headerTitle}>Tài khoản</Text>
                <TouchableOpacity onPress={handleOpenAddModal} style={styles.headerButton}>
                    <Ionicons name="add" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.warningBox}>
                    <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.warning} />
                    <Text style={styles.warningText}>Chức năng này chỉ dành cho Quản trị viên.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
                ) : (
                    <FlatList
                        data={accounts}
                        renderItem={({ item }) => <AccountListItem item={item} onEdit={handleOpenEditModal} onResetPassword={handleOpenResetModal} />}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
            </View>

            {renderFormModal()}
            {renderResetPasswordModal()}
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
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray
    },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2 },
    content: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.warning}20`, padding: SIZES.padding, margin: SIZES.padding, borderRadius: SIZES.radius },
    warningText: { ...FONTS.body3, color: '#856404', marginLeft: SIZES.base, flex: 1 },
    listContainer: { paddingHorizontal: SIZES.padding },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
    modalTitle: { ...FONTS.h2 },
    modalContent: { flex: 1, padding: SIZES.padding },
    modalFooter: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
    inputLabel: { ...FONTS.h4, color: COLORS.textMuted, marginBottom: SIZES.base },
    input: { height: 50, backgroundColor: COLORS.background, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, ...FONTS.body3, marginBottom: SIZES.itemSpacing },
    inputDisabled: { backgroundColor: COLORS.lightGray },
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
    statusSelectContainer: { flexDirection: 'row', borderRadius: SIZES.radius, overflow: 'hidden', marginBottom: SIZES.itemSpacing },
    statusSelectButton: { flex: 1, padding: SIZES.padding, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    statusSelectText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    modalSubText: { ...FONTS.body3, color: COLORS.textMuted, marginBottom: SIZES.padding*2 },
});

export default QuanLyTaiKhoanScreen;