import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import StatusBadge from './StatusBadge';
import { SERVER_BASE_URL } from '../api/apiService';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const PaintingListItem = ({ item, onEdit, onViewDetails }) => {
    const isSold = item.status === 'Đã bán';

    return (
        <View style={[styles.container, isSold && styles.soldContainer]}>
            <Image 
                source={item.image ? { uri: `${SERVER_BASE_URL}/api/files/${item.image}` } : require('../../assets/images/placeholder.png')} 
                style={styles.image} 
            />
            <View style={styles.infoContainer}>
                <View>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                </View>
                <View style={styles.footer}>
                     <StatusBadge status={item.status} />
                     <Text style={styles.price}>{formatCurrency(item.sellingPrice)}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => onViewDetails(item)} style={styles.button} disabled={isSold}>
                    <Ionicons name="eye-outline" size={22} color={isSold ? COLORS.lightGray : COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.button} disabled={isSold}>
                    <Ionicons name="create-outline" size={22} color={isSold ? COLORS.lightGray : COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: SIZES.base,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.itemSpacing,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    soldContainer: {
        backgroundColor: '#f8f9fa',
        opacity: 0.7
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: SIZES.radius,
    },
    infoContainer: {
        flex: 1,
        marginLeft: SIZES.base * 1.5,
        // ✅ SỬA LẠI: Bỏ height: '100%' và để flexbox tự căn chỉnh
        justifyContent: 'space-between', 
        alignSelf: 'stretch', // Đảm bảo container co dãn theo chiều cao của item
    },
    name: {
        ...FONTS.h4,
        color: COLORS.textDark,
        marginBottom: SIZES.base / 2,
    },
    artist: {
        ...FONTS.body3,
        color: COLORS.textMuted,
    },
    footer: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: SIZES.base
    },
    price: {
        ...FONTS.h4,
        color: COLORS.primary,
    },
    actions: {
        marginLeft: SIZES.base,
        justifyContent: 'space-around',
    },
    button: {
        padding: SIZES.base,
    },
});

export default PaintingListItem;