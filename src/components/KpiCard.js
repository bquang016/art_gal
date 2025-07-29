import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const KpiCard = ({ icon, title, value, change = 0, changeText, color, isCurrency = true }) => (
    <View style={styles.kpiCard}>
        <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>{title}</Text>
            <View style={[styles.iconBg, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
        </View>
        
        <Text style={styles.kpiValue}>
            {isCurrency ? formatCurrency(value) : (value || 0).toLocaleString('vi-VN')}
        </Text>

        {/* ✅ SỬA LẠI: Chỉ hiển thị phần này khi change khác 0 hoặc có changeText */}
        {(change !== 0 || changeText) && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {change !== 0 && (
                    <Text style={{ color: change > 0 ? COLORS.success : COLORS.danger, ...FONTS.body4 }}>
                        {change > 0 ? '+' : ''}
                        {typeof change === 'number' ? change.toLocaleString('vi-VN') : change}
                    </Text>
                )}
                <Text style={styles.kpiChangeText}> {changeText}</Text>
            </View>
        )}
    </View>
);

const styles = StyleSheet.create({
    kpiCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.base * 2,
        width: '48%',
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
        flex: 1,
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
        // Thêm marginLeft nếu không có số thay đổi
        marginLeft: 2,
    },
});

export default KpiCard;