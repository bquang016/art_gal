// src/components/ImportListItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const ImportListItem = ({ item, onRemove }) => (
    <View style={styles.container}>
        {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
            <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
            </View>
        )}
        <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.details}>{item.category} / {item.material}</Text>
            <Text style={styles.price}>{formatCurrency(item.importPrice)}</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.base,
        marginBottom: SIZES.base,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: SIZES.radius,
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginHorizontal: SIZES.padding,
    },
    name: {
        ...FONTS.h4,
    },
    details: {
        ...FONTS.body4,
        color: COLORS.textMuted,
    },
    price: {
        ...FONTS.h4,
        color: COLORS.primary,
        marginTop: SIZES.base,
    },
    removeButton: {
        padding: SIZES.base,
    },
});

export default ImportListItem;