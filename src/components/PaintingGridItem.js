import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import { SERVER_BASE_URL } from '../api/apiService';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// ✅ Đổi tên prop "onHistory" thành "onViewDetails" cho rõ nghĩa
const PaintingGridItem = ({ item, onEdit, onViewDetails }) => {
    const isSold = item.status === 'Đã bán';

    return (
        <View style={[styles.container, isSold && styles.soldContainer]}>
            <Image 
                source={item.image ? { uri: `${SERVER_BASE_URL}/api/files/${item.image}` } : require('../../assets/images/placeholder.png')} 
                style={styles.image} 
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>{formatCurrency(item.sellingPrice)}</Text>
            </View>

            {isSold && (
                <View style={styles.soldOverlay}>
                    <Text style={styles.soldText}>ĐÃ BÁN</Text>
                </View>
            )}

            {!isSold && (
                <View style={styles.actionsOverlay}>
                    {/* ✅ Cập nhật lại sự kiện onPress */}
                    <TouchableOpacity onPress={() => onViewDetails(item)} style={styles.actionButton}>
                        <Ionicons name="eye-outline" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                        <Ionicons name="create-outline" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: SIZES.base,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    soldContainer: {
        opacity: 0.6,
    },
    soldOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: SIZES.radius,
    },
    soldText: {
        ...FONTS.h2,
        color: COLORS.danger,
        fontWeight: 'bold',
        borderWidth: 2,
        borderColor: COLORS.danger,
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base,
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: SIZES.radius,
    },
    infoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: SIZES.base,
        borderBottomLeftRadius: SIZES.radius,
        borderBottomRightRadius: SIZES.radius,
    },
    name: {
        ...FONTS.h4,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    price: {
        ...FONTS.body3,
        color: COLORS.white,
    },
    actionsOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: SIZES.radius,
    },
    actionButton: {
        padding: SIZES.base,
    },
});

export default PaintingGridItem;