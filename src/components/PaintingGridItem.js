// src/components/PaintingGridItem.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const PaintingGridItem = ({ item, onEdit, onHistory }) => (
    <View style={styles.container}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.infoContainer}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.price}>{formatCurrency(item.sellingPrice)}</Text>
        </View>
        {/* === BỔ SUNG NÚT HÀNH ĐỘNG === */}
        <View style={styles.actionsOverlay}>
            <TouchableOpacity onPress={() => onHistory(item)} style={styles.actionButton}>
                <Ionicons name="time-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                <Ionicons name="create-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    </View>
);

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
    image: {
        width: '100%',
        height: 150, // Tăng chiều cao ảnh
        borderRadius: SIZES.radius,
    },
    infoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', // Lớp nền mờ
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
    // Styles cho nút hành động
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