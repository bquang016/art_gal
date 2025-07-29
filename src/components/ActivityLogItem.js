import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import TimeAgo from 'javascript-time-ago';
import vi from 'javascript-time-ago/locale/vi';

// Thêm ngôn ngữ Tiếng Việt cho TimeAgo
TimeAgo.addDefaultLocale(vi);
const timeAgo = new TimeAgo('vi-VN');

const getActionInfo = (action) => {
    switch (action) {
        case 'TẠO ĐƠN HÀNG':
            return { icon: 'cart', color: COLORS.success };
        case 'CẬP NHẬT ĐƠN HÀNG':
            return { icon: 'cube', color: COLORS.info };
        case 'CẬP NHẬT TRANH':
            return { icon: 'palette', color: COLORS.primary };
        case 'TẠO TÀI KHOẢN':
            return { icon: 'person-add', color: COLORS.success };
        case 'CẬP NHẬT TÀI KHOẢN':
            return { icon: 'person', color: COLORS.info };
        case 'ĐẶT LẠI MẬT KHẨU':
            return { icon: 'key', color: COLORS.warning };
        case 'TẠO PHIẾU NHẬP':
            return { icon: 'arrow-down-circle', color: COLORS.primary };
        default:
            return { icon: 'notifications', color: COLORS.textMuted };
    }
};

const ActivityLogItem = ({ item }) => {
    const { icon, color } = getActionInfo(item.action);

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.content}>
                <Text style={styles.details}><Text style={styles.actor}>{item.actor}</Text> {item.details}</Text>
                <Text style={styles.timestamp}>{timeAgo.format(new Date(item.createdAt))}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.itemSpacing,
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.padding,
    },
    content: {
        flex: 1,
    },
    details: {
        ...FONTS.body3,
        color: COLORS.textDark,
        lineHeight: 22,
    },
    actor: {
        fontWeight: 'bold',
    },
    timestamp: {
        ...FONTS.body4,
        color: COLORS.textMuted,
        marginTop: SIZES.base / 2,
    },
});

export default ActivityLogItem;