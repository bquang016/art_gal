import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import ActivityLogItem from '../components/ActivityLogItem';

const NotificationScreen = ({ navigation }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ SỬA LẠI CÚ PHÁP useFocusEffect
    useFocusEffect(
        useCallback(() => {
            const fetchLogs = async () => {
                setLoading(true);
                try {
                    const response = await apiService.get('/logs');
                    setLogs(response.data);
                } catch (error) {
                    console.error("Failed to fetch logs:", error);
                } finally {
                    setLoading(false);
                }
            };
        
            fetchLogs();
        }, [])
    );

    // Hàm để tải lại dữ liệu thủ công
    const handleRefresh = useCallback(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const response = await apiService.get('/logs');
                setLogs(response.data);
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back-outline" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nhật ký hoạt động</Text>
                <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
                    <Ionicons name="refresh" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={logs}
                    renderItem={({ item }) => <ActivityLogItem item={item} />}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Chưa có hoạt động nào.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    headerButton: { padding: SIZES.base },
    headerTitle: { ...FONTS.h2 },
    listContainer: {
        padding: SIZES.padding,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: SIZES.padding * 2,
        ...FONTS.body3,
        color: COLORS.textMuted,
    },
});

export default NotificationScreen;