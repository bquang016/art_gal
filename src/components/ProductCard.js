import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import { SERVER_BASE_URL } from '../api/apiService';

const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) {
        return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

const ProductCard = ({ item, onAddToCart }) => {
    const isSoldOut = item.status !== 'Đang bán';

    return (
        <View style={[styles.container, isSoldOut && styles.soldOutContainer]}>
            <TouchableOpacity style={styles.imageContainer} disabled={isSoldOut}>
                <Image
                    source={item.image ? { uri: `${SERVER_BASE_URL}/api/files/${item.image}` } : require('../../assets/images/placeholder.png')}
                    style={styles.image}
                />
                {isSoldOut && (
                    <View style={styles.soldOutOverlay}>
                        <Text style={styles.soldOutText}>ĐÃ BÁN</Text>
                    </View>
                )}
            </TouchableOpacity>
            <View style={styles.infoContainer}>
                <Text style={[styles.productName, isSoldOut && styles.soldOutTextInfo]} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.productPrice, isSoldOut && styles.soldOutTextInfo]}>{formatCurrency(item.sellingPrice)}</Text>
            </View>
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => onAddToCart(item)}
                disabled={isSoldOut} 
            >
                <Ionicons name="add-circle" size={32} color={isSoldOut ? COLORS.lightGray : COLORS.primary} />
            </TouchableOpacity>
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
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    soldOutContainer: {
        backgroundColor: '#f8f9fa',
    },
    imageContainer: {
        width: '100%',
        height: 150,
        backgroundColor: COLORS.lightGray,
        borderTopLeftRadius: SIZES.radius,
        borderTopRightRadius: SIZES.radius,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldOutText: {
        ...FONTS.h2,
        color: COLORS.danger,
        fontWeight: 'bold',
        transform: [{ rotate: '-15deg' }],
        borderWidth: 2,
        borderColor: COLORS.danger,
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base,
        borderRadius: SIZES.radius,
    },
    infoContainer: {
        padding: SIZES.base,
        height: 80,
    },
    productName: {
        ...FONTS.h4,
        flexWrap: 'wrap',
    },
    productPrice: {
        ...FONTS.body3,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginTop: SIZES.base,
    },
    soldOutTextInfo: {
        color: COLORS.textMuted,
    },
    addButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
    },
});

export default ProductCard;