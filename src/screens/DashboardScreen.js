import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    SafeAreaView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SIZES } from '../theme/theme';
import apiService from '../api/apiService';
import { Ionicons } from '@expo/vector-icons';
import KpiCard from '../components/KpiCard';

const DashboardScreen = ({ navigation }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
      useCallback(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await apiService.get('/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error.response?.data || error.message);
                Alert.alert("Lỗi", "Không thể tải dữ liệu tổng quan. Vui lòng kiểm tra kết nối tới server.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
      }, [])
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </SafeAreaView>
        );
    }
    
    if (!data) {
        return (
             <SafeAreaView style={styles.loadingContainer}>
                <Text>Không có dữ liệu.</Text>
            </SafeAreaView>
         );
    }

    const { kpiData, salesData, proportionData } = data;
    
    const pieChartData = proportionData.labels.length > 0 ? proportionData.labels.map((label, index) => ({
        name: label,
        population: proportionData.data[index] || 0,
        color: ['#fd7e14', '#20c997', '#0dcaf0', '#6c757d'][index % 4],
        legendFontColor: "#7F7F7F",
        legendFontSize: 14
    })) : [];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
                    <Ionicons name="menu" size={28} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tổng quan</Text>
                {/* ✅ SỬA LẠI: Thêm onPress để điều hướng đến màn hình Notification */}
                <TouchableOpacity 
                    style={styles.headerButton} 
                    onPress={() => navigation.navigate('Notification')}
                >
                    <Ionicons name="notifications-outline" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.kpiContainer}>
                    <KpiCard icon="cube-outline" title="Tổng Đơn hàng" value={kpiData.totalOrders} isCurrency={false} color={COLORS.primary} />
                    <KpiCard icon="cash-outline" title="Tổng Doanh thu" value={kpiData.totalRevenue} isCurrency={true} color={COLORS.success} />
                    <KpiCard icon="archive-outline" title="Tồn kho" value={kpiData.inventory} isCurrency={false} changeText="sản phẩm" color={COLORS.textMuted}/>
                    <KpiCard icon="trending-up-outline" title="Lợi nhuận" value={kpiData.profit} isCurrency={true} color={COLORS.warning}/>
                </View>

                {/* Biểu đồ doanh thu */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Thống kê Doanh thu (7 đơn gần nhất)</Text>
                    <LineChart
                        data={{
                            labels: salesData.labels.length > 0 ? salesData.labels : ["Không có"],
                            datasets: [{ data: salesData.data.length > 0 ? salesData.data : [0] }]
                        }}
                        width={SIZES.width - SIZES.padding * 2}
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
                        bezier
                    />
                </View>

                {/* Biểu đồ tỷ lệ */}
                {pieChartData.length > 0 && (
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Tỷ lệ tranh (Theo thể loại)</Text>
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
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.white 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: SIZES.base,
        ...FONTS.body3,
        color: COLORS.textMuted
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base,
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