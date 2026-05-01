import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useAdminManagement } from '../../src/hooks/useAdminManagement';

export default function AdminReportsScreen() {
  const {
    refunds,
    transactions,
    revenueStats,
    loading,
    fetchRefunds,
    fetchTransactionReports,
    fetchRevenueStats,
    approveRefund,
    rejectRefund,
    exportTransactionReports,
  } = useAdminManagement();

  const [activeTab, setActiveTab] = useState<'refunds' | 'transactions' | 'revenue'>(
    'refunds'
  );
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [approveAmount, setApproveAmount] = useState<string>('');
  const [refundMethod, setRefundMethod] = useState<'wallet' | 'bank_transfer'>('wallet');
  const [refundNotes, setRefundNotes] = useState<string>('');

  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');

  useEffect(() => {
    fetchRefunds();
    fetchTransactionReports();
    fetchRevenueStats();
  }, [fetchRefunds, fetchTransactionReports, fetchRevenueStats]);

  const handleApproveRefund = async () => {
    if (!selectedRefund || !approveAmount) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền');
      return;
    }

    try {
      await approveRefund(selectedRefund.id, {
        approved_amount: parseFloat(approveAmount),
        refund_method: refundMethod,
        notes: refundNotes,
      });
      Alert.alert('Thành công', 'Yêu cầu hoàn tiền đã được phê duyệt');
      setApproveAmount('');
      setRefundNotes('');
      setShowApproveModal(false);
      setSelectedRefund(null);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const handleRejectRefund = (refundId: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn từ chối yêu cầu hoàn tiền?', [
      {
        text: 'Hủy',
        onPress: () => {},
      },
      {
        text: 'Từ chối',
        onPress: () => {
          rejectRefund(refundId);
        },
      },
    ]);
  };

  const handleExportReport = async () => {
    try {
      await exportTransactionReports({
        fromDate: dateFromFilter,
        toDate: dateToFilter,
      });
      Alert.alert('Thành công', 'Báo cáo đã được xuất');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const renderRefundsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.filterButtons}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Chờ phê duyệt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Đã phê duyệt</Text>
        </TouchableOpacity>
      </View>

      {refunds.length === 0 ? (
        <Text style={styles.emptyText}>Không có yêu cầu hoàn tiền nào</Text>
      ) : (
        refunds.map((refund) => (
          <View key={refund.id} style={styles.refundCard}>
            <View style={styles.refundHeader}>
              <View>
                <Text style={styles.refundBooking}>Lịch #{refund.booking_id}</Text>
                <Text style={styles.refundReason}>Lý do: {refund.reason}</Text>
              </View>
              <View
                style={[
                  styles.refundStatus,
                  refund.status === 'approved' && styles.statusApproved,
                  refund.status === 'pending' && styles.statusPending,
                  refund.status === 'rejected' && styles.statusRejected,
                ]}
              >
                <Text style={styles.statusText}>
                  {refund.status === 'pending' && '⏳ Chờ'}
                  {refund.status === 'approved' && '✓ Phê duyệt'}
                  {refund.status === 'rejected' && '✕ Từ chối'}
                </Text>
              </View>
            </View>
            <View style={styles.refundAmounts}>
              <View>
                <Text style={styles.amountLabel}>Yêu cầu hoàn</Text>
                <Text style={styles.amountValue}>${refund.requested_amount.toFixed(2)}</Text>
              </View>
              <View>
                <Text style={styles.amountLabel}>Phê duyệt</Text>
                <Text style={styles.amountValue}>
                  ${refund.approved_amount?.toFixed(2) || '—'}
                </Text>
              </View>
              <View>
                <Text style={styles.amountLabel}>Thành viên</Text>
                <Text style={styles.amountValue}>#{refund.member_id}</Text>
              </View>
            </View>
            {refund.status === 'pending' && (
              <View style={styles.refundActions}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleRejectRefund(refund.id!)}
                >
                  <Text style={styles.rejectButtonText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => {
                    setSelectedRefund(refund);
                    setApproveAmount(refund.requested_amount.toString());
                    setShowApproveModal(true);
                  }}
                >
                  <Text style={styles.approveButtonText}>Phê duyệt</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderTransactionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.filterSection}>
        <TextInput
          style={styles.filterInput}
          placeholder="Từ (YYYY-MM-DD)"
          value={dateFromFilter}
          onChangeText={setDateFromFilter}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Đến (YYYY-MM-DD)"
          value={dateToFilter}
          onChangeText={setDateToFilter}
        />
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportReport}
        >
          <Text style={styles.exportButtonText}>📥 Xuất CSV</Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>Không có giao dịch nào</Text>
      ) : (
        <View style={styles.transactionTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellID]}>Ngày</Text>
            <Text style={[styles.tableCell, styles.tableCellType]}>Loại</Text>
            <Text style={[styles.tableCell, styles.tableCellAmount]}>Số tiền</Text>
          </View>
          {transactions.map((transaction, index) => (
            <View key={transaction.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellID]}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellType]}>
                {transaction.type === 'booking' ? '📅 Lịch' : '💳 Khác'}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellAmount]}>
                ${transaction.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderRevenueTab = () => (
    <ScrollView style={styles.tabContent}>
      {revenueStats && (
        <>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tổng doanh thu</Text>
              <Text style={styles.statValue}>${revenueStats.total_revenue?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Số giao dịch</Text>
              <Text style={styles.statValue}>{revenueStats.total_transactions || 0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Doanh thu trung bình</Text>
              <Text style={styles.statValue}>
                ${revenueStats.avg_order_value?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>Chỉ số hoạt động</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Thành viên hoạt động</Text>
              <Text style={styles.metricValue}>
                {0}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Tỷ lệ giữ chân</Text>
              <Text style={styles.metricValue}>
                0%
              </Text>
            </View>
          </View>

          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>Tổng quan giao dịch</Text>
            <Text style={styles.trendText}>
              Dữ liệu hiện có chỉ bao gồm doanh thu, số giao dịch và giá trị đơn trung bình.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'refunds' && styles.tabActive]}
          onPress={() => setActiveTab('refunds')}
        >
          <Text style={[styles.tabText, activeTab === 'refunds' && styles.tabTextActive]}>
            Hoàn tiền
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}>
            Giao dịch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'revenue' && styles.tabActive]}
          onPress={() => setActiveTab('revenue')}
        >
          <Text style={[styles.tabText, activeTab === 'revenue' && styles.tabTextActive]}>
            Thu nhập
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'refunds' && renderRefundsTab()}
      {activeTab === 'transactions' && renderTransactionsTab()}
      {activeTab === 'revenue' && renderRevenueTab()}

      {/* Approve Refund Modal */}
      <Modal visible={showApproveModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Phê duyệt hoàn tiền</Text>

            {selectedRefund && (
              <View style={styles.refundInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lịch:</Text>
                  <Text style={styles.infoValue}>#{selectedRefund.booking_id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Yêu cầu:</Text>
                  <Text style={styles.infoValue}>${selectedRefund.requested_amount.toFixed(2)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thành viên:</Text>
                  <Text style={styles.infoValue}>#{selectedRefund.member_id}</Text>
                </View>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Số tiền phê duyệt"
              value={approveAmount}
              onChangeText={setApproveAmount}
              keyboardType="decimal-pad"
            />

            <View style={styles.methodSelector}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  refundMethod === 'wallet' && styles.methodButtonActive,
                ]}
                onPress={() => setRefundMethod('wallet')}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    refundMethod === 'wallet' && styles.methodButtonTextActive,
                  ]}
                >
                  💳 Ví
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  refundMethod === 'bank_transfer' && styles.methodButtonActive,
                ]}
                onPress={() => setRefundMethod('bank_transfer')}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    refundMethod === 'bank_transfer' && styles.methodButtonTextActive,
                  ]}
                >
                  🏦 Ngân hàng
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, styles.textAreaInput]}
              placeholder="Ghi chú (tùy chọn)"
              value={refundNotes}
              onChangeText={setRefundNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowApproveModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleApproveRefund}
              >
                <Text style={styles.buttonText}>Phê duyệt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
  },
  tabTextActive: {
    color: '#FF6B6B',
  },
  tabContent: {
    padding: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 32,
  },
  refundCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  refundBooking: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  refundReason: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  refundStatus: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#FFF9E6',
  },
  statusApproved: {
    backgroundColor: '#E6F7E6',
  },
  statusPending: {
    backgroundColor: '#FFF9E6',
  },
  statusRejected: {
    backgroundColor: '#FFE6E6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  refundAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  amountLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  refundActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 4,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 13,
  },
  exportButton: {
    paddingVertical: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionTable: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableCell: {
    fontSize: 12,
  },
  tableCellID: {
    flex: 1,
    color: '#666',
  },
  tableCellType: {
    flex: 1,
    color: '#666',
  },
  tableCellAmount: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  metricsCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  trendCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  trendBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  trendIndicator: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  trendText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  refundInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  methodButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  methodButtonText: {
    fontSize: 13,
    color: '#666',
  },
  methodButtonTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
