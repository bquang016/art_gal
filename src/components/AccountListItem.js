import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import StatusBadge from './StatusBadge';

const RoleBadge = ({ role }) => (
    <View style={[styles.roleBadge, { backgroundColor: role === 'Admin' ? COLORS.primary : COLORS.info }]}>
        <Text style={styles.roleBadgeText}>{role}</Text>
    </View>
);

const AccountListItem = ({ item, onEdit, onResetPassword }) => (
    <View style={styles.container}>
        <View style={styles.info}>
            <Text style={styles.name}>{item.employeeName}</Text>
            <Text style={styles.username}>@{item.username}</Text>
            <View style={styles.badges}>
                <RoleBadge role={item.role} />
                {/* ✅ HIỂN THỊ STATUS BADGE */}
                <StatusBadge status={item.status} />
            </View>
        </View>
        <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.button}>
                <Ionicons name="create-outline" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onResetPassword(item)} style={styles.button}>
                <Ionicons name="key-outline" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.itemSpacing,
    },
    info: {
        flex: 1,
    },
    name: {
        ...FONTS.h3,
    },
    username: {
        ...FONTS.body3,
        color: COLORS.textMuted,
        marginVertical: SIZES.base / 2,
    },
    badges: {
        flexDirection: 'row',
        marginTop: SIZES.base,
        alignItems: 'center', // Căn chỉnh các badge cho đẹp hơn
    },
    roleBadge: {
        paddingHorizontal: SIZES.base,
        paddingVertical: SIZES.base / 2,
        borderRadius: SIZES.radius / 2,
        marginRight: SIZES.base,
    },
    roleBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
    },
    button: {
        padding: SIZES.base,
        marginLeft: SIZES.base,
    },
});

export default AccountListItem;