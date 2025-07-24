// src/components/ProductCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

// Hàm format tiền tệ
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const ProductCard = ({ item, onAddToCart }) => (
    <View style={styles.productCard}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productArtist} numberOfLines={1}>Họa sĩ: {item.artist}</Text>
            <View style={styles.productFooter}>
                <Text style={styles.productPrice}>{formatCurrency(item.sellingPrice)}</Text>
                <TouchableOpacity onPress={() => onAddToCart(item)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    productCard: {
        flex: 1, // Để các card có chiều cao bằng nhau khi trong grid
        margin: SIZES.base,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    productImage: {
        width: '100%',
        aspectRatio: 1, // Giữ ảnh là hình vuông
        resizeMode: 'cover',
    },
    productInfo: {
        padding: SIZES.base,
    },
    productName: {
        ...FONTS.h4,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    productArtist: {
        ...FONTS.body4,
        color: COLORS.textMuted,
        fontSize: 12,
        marginVertical: 2,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SIZES.base,
    },
    productPrice: {
        ...FONTS.body3,
        color: COLORS.primary,
        fontWeight: 'bold',
        flex: 1, // Cho phép giá chiếm không gian còn lại
    },
    addButton: {
        // Có thể thêm style cho nút nếu cần
    },
});

// Đừng quên export component
export default ProductCard;