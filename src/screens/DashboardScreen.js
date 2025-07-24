import React, { useState, useEffect } from 'react';
// SỬA LỖI 1: Import thêm SafeAreaView
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SIZES } from '../theme/theme';
import { api } from '../api/mockApi';
import { Ionicons } from '@expo/vector-icons';
import KpiCard from '../components/KpiCard';

const DashboardScreen = ({ navigation }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.getDashboardData().then(setData);
    }, []);

    if (!data) {
        return <SafeAreaView style={styles.loadingContainer}><Text>Đang tải dữ liệu...</Text></SafeAreaView>;
    }

    const { kpiData, salesData, proportionData } = data;
    
    const pieChartData = proportionData.category.labels.map((label, index) => ({
        name: label,
        population: proportionData.category.data[index],
        color: ['#fd7e14', '#20c997', '#0dcaf0', '#6c757d'][index % 4],
        legendFontColor: "#7F7F7F",
        legendFontSize: 14
    }));

    return (
        // SỬA LỖI 2: Bọc toàn bộ màn hình bằng SafeAreaView
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
                    <Ionicons name="menu" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tổng quan</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.kpiContainer}>
                    <KpiCard icon="cube-outline" title="Tổng Đơn hàng" value={kpiData.totalOrders.toLocaleString('vi-VN')} change={2.5} changeText="so với hôm qua" color={COLORS.primary} />
                    <KpiCard icon="cash-outline" title="Tổng Doanh thu" value={kpiData.totalRevenue} change={5.1} changeText="so với hôm qua" color={COLORS.success} />
                    <KpiCard icon="archive-outline" title="Tồn kho" value={kpiData.inventory} change={-10} changeText="sản phẩm" color={COLORS.textMuted}/>
                    <KpiCard icon="trending-up-outline" title="Lợi nhuận" value={kpiData.profit} change={3.2} changeText="so với hôm qua" color={COLORS.warning}/>
                </View>

                {/* Biểu đồ doanh thu */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Thống kê Doanh thu (Tuần)</Text>
                    <LineChart
                        data={{
                            labels: salesData.week.labels,
                            datasets: [{ data: salesData.week.data }]
                        }}
                        width={SIZES.width - SIZES.padding * 2 - (SIZES.padding * 2) /* Adjust for padding */}
                        height={220}
                        yAxisSuffix="tr"
                        chartConfig={{
                            backgroundColor: COLORS.white,
                            backgroundGradientFrom: COLORS.white,
                            backgroundGradientTo: COLORS.white,
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(249, 123, 34, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.primaryHover }
                        }}
                        style={{ borderRadius: SIZES.radius, marginLeft: -SIZES.base }}
                    />
                </View>

                {/* Biểu đồ tỷ lệ */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Tỷ lệ bán chạy (Thể loại)</Text>
                    <PieChart
                        data={pieChartData}
                        width={SIZES.width - SIZES.padding * 2}
                        height={220}
                        chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[10, 0]}
                        absolute
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // SỬA LỖI 3: Điều chỉnh Style
    container: { 
        flex: 1, 
        backgroundColor: COLORS.white 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base, // Giảm padding dọc
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        backgroundColor: COLORS.white,
    },
    headerButton: { 
        padding: SIZES.base 
    },
    headerTitle: { 
        ...FONTS.h2, 
        color: COLORS.textDark 
    },
    scrollView: { 
        padding: SIZES.padding,
        backgroundColor: COLORS.background
    },
    kpiContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    chartContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.itemSpacing,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center'
    },
    chartTitle: { 
        ...FONTS.h3, 
        color: COLORS.textDark, 
        marginBottom: SIZES.base,
        alignSelf: 'flex-start'
    },
});

export default DashboardScreen;