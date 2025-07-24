// src/components/StatusBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../theme/theme';

const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
        switch (status) {
            case 'Hoạt động':
            case 'Đang bán':
            case 'Hoàn thành':
            case 'Đang hợp tác':
                return { backgroundColor: COLORS.success, color: COLORS.white };
            case 'Dừng hoạt động':
            case 'Dừng bán':
            case 'Đã hủy':
            case 'Dừng hợp tác':
                return { backgroundColor: COLORS.danger, color: COLORS.white };
            case 'Đang xử lý':
                return { backgroundColor: COLORS.info, color: COLORS.white };
            case 'Chờ xác nhận':
                 return { backgroundColor: COLORS.warning, color: COLORS.textDark };
            default:
                return { backgroundColor: COLORS.lightGray, color: COLORS.textMuted };
        }
    };

    const style = getStatusStyle();

    return (
        <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: style.color }]}>{status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: SIZES.base,
        paddingVertical: SIZES.base / 2,
        borderRadius: SIZES.radius / 2,
        alignSelf: 'flex-start', // Để badge chỉ chiếm đúng độ rộng của text
    },
    badgeText: {
        ...FONTS.body4,
        fontSize: 12,
        fontWeight: '600',
    },
});

export default StatusBadge;