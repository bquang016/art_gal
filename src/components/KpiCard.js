// src/components/KpiCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const KpiCard = ({ icon, title, value, change, changeText, color }) => (
    <View style={styles.kpiCard}>
        <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>{title}</Text>
            <View style={[styles.iconBg, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
        </View>
        {/* Kiểm tra nếu giá trị là số thì mới format */}
        <Text style={styles.kpiValue}>
            {typeof value === 'number' ? formatCurrency(value) : value}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: change > 0 ? COLORS.success : COLORS.danger, ...FONTS.body4 }}>
                {/* Hiển thị dấu + nếu là số dương */}
                {change > 0 ? '+' : ''}
                {/* Format số cho dễ đọc */}
                {typeof change === 'number' ? change.toLocaleString('vi-VN') : change}
            </Text>
            <Text style={styles.kpiChangeText}> {changeText}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    kpiCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.base * 2,
        width: '48%', // Chiếm gần 1 nửa chiều rộng để tạo 2 cột
        marginBottom: SIZES.base * 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    kpiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: SIZES.radius,
        justifyContent: 'center',
        alignItems: 'center',
    },
    kpiTitle: {
        ...FONTS.body4,
        color: COLORS.textMuted,
        flex: 1, // Để text tự xuống dòng nếu quá dài
    },
    kpiValue: {
        ...FONTS.h3,
        fontWeight: 'bold',
        marginVertical: SIZES.base,
        color: COLORS.textDark,
    },
    kpiChangeText: {
        ...FONTS.body4,
        color: COLORS.textMuted,
    },
});

// Đừng quên export để các file khác có thể import
export default KpiCard;