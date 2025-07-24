// src/components/OrderItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import StatusBadge from './StatusBadge';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const OrderItem = ({ item, onSelect }) => (
    <TouchableOpacity style={styles.container} onPress={() => onSelect(item)}>
        <View style={styles.header}>
            <Text style={styles.orderId}>#{item.id}</Text>
            <Text style={styles.date}>{item.date}</Text>
        </View>
        <View style={styles.body}>
            <Text style={styles.customer}>Khách hàng: {item.customer}</Text>
            <Text style={styles.total}>{formatCurrency(item.total)}</Text>
        </View>
        <View style={styles.footer}>
            <StatusBadge status={item.status} />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.itemSpacing,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.base,
    },
    orderId: {
        ...FONTS.h4,
        color: COLORS.primary,
    },
    date: {
        ...FONTS.body4,
        color: COLORS.textMuted,
    },
    body: {
        marginVertical: SIZES.padding,
    },
    customer: {
        ...FONTS.body3,
        color: COLORS.textDark,
        marginBottom: SIZES.base,
    },
    total: {
        ...FONTS.h3,
        textAlign: 'right',
    },
    footer: {
        alignItems: 'flex-start',
    },
});

export default OrderItem;