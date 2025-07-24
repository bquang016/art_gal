// src/components/ImportSlipListItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import StatusBadge from './StatusBadge';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const ImportSlipListItem = ({ item, onViewDetails }) => (
    <TouchableOpacity style={styles.container} onPress={() => onViewDetails(item)}>
        <View style={styles.header}>
            <Text style={styles.slipId}>#{item.id}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString('vi-VN')}</Text>
        </View>
        <Text style={styles.artist}>NCC: {item.artistName}</Text>
        <View style={styles.footer}>
            <StatusBadge status={item.status === 'Đã hoàn tất' ? 'Hoàn thành' : 'Đã hủy'} />
            <Text style={styles.total}>{formatCurrency(item.totalValue)}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.itemSpacing,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.base,
    },
    slipId: {
        ...FONTS.h4,
        color: COLORS.primary,
    },
    date: {
        ...FONTS.body4,
        color: COLORS.textMuted,
    },
    artist: {
        ...FONTS.h3,
        marginVertical: SIZES.padding,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    total: {
        ...FONTS.h3,
    },
});

export default ImportSlipListItem;