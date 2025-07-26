// src/screens/QuanLyTaiKhoanScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, Modal, SafeAreaView, ScrollView, Button, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/mockApi';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import AccountListItem from '../components/AccountListItem';

const QuanLyTaiKhoanScreen = ({ navigation }) => {
    const [accounts, setAccounts] = useState([]);

    // Modal States
    const [isFormModalVisible, setFormModalVisible] = useState(false);
    const [isResetModalVisible, setResetModalVisible] = useState(false);

    const [modalMode, setModalMode] = useState('add');
    const [editingAccount, setEditingAccount] = useState(null);
    const [newPassword, setNewPassword] = useState({ pass: '', confirm: '' });

    useEffect(() => {
        api.getAccounts().then(setAccounts);
    }, []);

    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingAccount({ employeeName: '', username: '', email: '', role: 'Nhân viên', status: 'Hoạt động' });
        setFormModalVisible(true);
    };

    const handleOpenEditModal = (account) => {
        setModalMode('edit');
        setEditingAccount({ ...account });
        setFormModalVisible(true);
    };

    const handleOpenResetModal = (account) => {
        setEditingAccount(account);
        setNewPassword({ pass: '', confirm: '' });
        setResetModalVisible(true);
    };

    const handleSave = () => {
        if (!editingAccount.employeeName || !editingAccount.username || !editingAccount.email) {
            Alert.alert("Lỗi", "Vui lòng điền các trường bắt buộc.");
            return;
        }

        if (modalMode === 'add') {
            const newAccount = { ...editingAccount, id: `acc${Date.now()}` };
            setAccounts(prev => [newAccount, ...prev]);
        } else {
            setAccounts(prev => prev.map(acc => acc.id === editingAccount.id ? editingAccount : acc));
        }

        Alert.alert("Thành công", `Đã ${modalMode === 'add' ? 'thêm' : 'cập nhật'} tài khoản.`);
        setFormModalVisible(false);
    };

    const handlePasswordReset = () => {
        if (newPassword.pass.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }
        if (newPassword.pass !== newPassword.confirm) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
            return;
        }
        Alert.alert("Thành công", `Đã đặt lại mật khẩu cho ${editingAccount.username}.`);
        setResetModalVisible(false);
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

                        <Text style={styles.inputLabel}>Email *</Text>
                        <TextInput style={styles.input} value={editingAccount.email} onChangeText={text => setEditingAccount({ ...editingAccount, email: text })} keyboardType="email-address" />

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
                            <TouchableOpacity onPress={() => setEditingAccount({ ...editingAccount, status: 'Dừng hoạt động' })} style={[styles.statusSelectButton, editingAccount.status === 'Dừng hoạt động' && { backgroundColor: COLORS.textMuted }]}>
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
    
    // SỬA MỤC 4: Sửa lại modal đổi mật khẩu
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
    // Kết thúc sửa mục 4

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

                <FlatList
                    data={accounts}
                    renderItem={({ item }) => <AccountListItem item={item} onEdit={handleOpenEditModal} onResetPassword={handleOpenResetModal} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
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
    statusSelectContainer: { flexDirection: 'row', borderRadius: SIZES.radius, overflow: 'hidden', marginBottom: SIZES.itemSpacing },
    statusSelectButton: { flex: 1, padding: SIZES.padding, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    statusSelectText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    modalSubText: { ...FONTS.body3, color: COLORS.textMuted, marginBottom: SIZES.padding*2 },
});

export default QuanLyTaiKhoanScreen;