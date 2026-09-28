import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { EmptyState } from '../Common/EmptyState';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Plus,
  Zap,
  X
} from 'lucide-react-native';

const ViewKey = View as any;
const TouchableKey = TouchableOpacity as any;

export const WalletTab: React.FC = () => {
  const {
    walletAddress,
    solBalance,
    skrBalance,
    walletType,
    disconnectWallet,
    payments,
    sendDirectPayment,
    transactions,
    showToast,
    profiles
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'payments' | 'transactions' | 'tokens'>('payments');

  // Direct Payment Transfer Modal inside Wallet
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [payTitle, setPayTitle] = useState('');
  const [payTalentId, setPayTalentId] = useState(profiles[1].id);
  const [payAmountSol, setPayAmountSol] = useState<number>(5.0);
  const [payNotes, setPayNotes] = useState('');

  const handleCopy = (text: string) => {
    showToast('Copied to Clipboard!', text, 'info');
  };

  const handleSendPayment = () => {
    if (!payTitle.trim()) return;

    sendDirectPayment(payTitle, payTalentId, payAmountSol, 'SOL', payNotes);
    setIsNewPaymentOpen(false);
    setPayTitle('');
    setPayNotes('');
  };

  const usdValue = (solBalance * 180.5).toFixed(2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Balance Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroBadge}>Solana Wallet ({walletType})</Text>
          <TouchableOpacity onPress={disconnectWallet} style={styles.iconBtn}>
            <Wallet size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.balanceVal}>{solBalance.toFixed(2)} SOL</Text>
        <Text style={styles.balanceSub}>≈ ${usdValue} USD</Text>

        <TouchableOpacity onPress={() => handleCopy(walletAddress)} style={styles.addrRow}>
          <Text style={styles.addrText}>{walletAddress}</Text>
          <Copy size={12} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsNewPaymentOpen(true)}
          style={styles.newPaymentBtn}
        >
          <Plus size={14} color="#FFFFFF" />
          <Text style={styles.newPaymentBtnText}>Send Direct Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tabs */}
      <View style={styles.tabBar}>
        {[
          { id: 'payments', label: `Direct Payments (${payments.length})` },
          { id: 'transactions', label: `Tx Log (${transactions.length})` },
          { id: 'tokens', label: 'Tokens' }
        ].map((tab) => (
          <TouchableKey
            key={tab.id}
            onPress={() => setActiveSubTab(tab.id as any)}
            style={[styles.tabItem, activeSubTab === tab.id && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeSubTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableKey>
        ))}
      </View>

      {/* Direct Payments View */}
      {activeSubTab === 'payments' && (
        <View style={styles.listSection}>
          {payments.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              compact
              badge="Direct Payments"
              title="No direct payments recorded"
              description="Send instant on-chain Solana compensation to collaborators with zero platform commissions."
              actionLabel="Send Payment"
              onAction={() => setIsNewPaymentOpen(true)}
            />
          ) : (
            payments.map((pay) => (
              <ViewKey key={pay.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentTitle}>{pay.jobTitle}</Text>
                  <Text style={styles.paymentStatus}>{pay.status}</Text>
                </View>

                <Text style={styles.paymentSub}>Client: {pay.clientName} • Talent: {pay.talentName}</Text>
                <Text style={styles.paymentAmount}>{pay.amountSol} SOL</Text>

                <View style={styles.paymentActions}>
                  <View style={styles.releasedRow}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <Text style={styles.releasedText}>Direct Settlement Verified</Text>
                  </View>
                </View>
              </ViewKey>
            ))
          )}
        </View>
      )}

      {/* Transactions View */}
      {activeSubTab === 'transactions' && (
        <View style={styles.listSection}>
          {transactions.length === 0 ? (
            <EmptyState
              icon={Zap}
              compact
              badge="Solana Ledger"
              title="No transactions yet"
              description="Your on-chain settlement and micro-tipping transaction history will appear here."
            />
          ) : (
            transactions.map((tx) => (
            <ViewKey key={tx.id} style={styles.txCard}>
              <View style={styles.txIcon}>
                <Zap size={16} color="#2554EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txType}>{tx.type.replace('_', ' ')}</Text>
                <Text style={styles.txMeta}>{tx.counterpartyName} • {tx.timestamp}</Text>
              </View>
              <Text style={styles.txAmount}>{tx.amountSol} SOL</Text>
            </ViewKey>
          )))}
        </View>
      )}

      {/* Tokens View */}
      {activeSubTab === 'tokens' && (
        <View style={styles.listSection}>
          <View style={styles.tokenCard}>
            <Text style={styles.tokenName}>Solana Native (SOL)</Text>
            <Text style={styles.tokenVal}>{solBalance.toFixed(2)} SOL</Text>
          </View>
          <View style={styles.tokenCard}>
            <Text style={styles.tokenName}>SkillChain Token (SKR)</Text>
            <Text style={styles.tokenVal}>{skrBalance.toLocaleString()} SKR</Text>
          </View>
        </View>
      )}

      {/* Direct Payment Modal */}
      <CustomModal visible={isNewPaymentOpen} onRequestClose={() => setIsNewPaymentOpen(false)}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Direct Solana Payment</Text>
            <TouchableOpacity onPress={() => setIsNewPaymentOpen(false)}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Payment / Job Purpose</Text>
          <TextInput
            value={payTitle}
            onChangeText={setPayTitle}
            placeholder="e.g. Phase 1: Anchor Program Delivery"
            placeholderTextColor="#94A3B8"
            style={styles.modalInput}
          />

          <Text style={styles.inputLabel}>Amount (SOL)</Text>
          <TextInput
            value={payAmountSol.toString()}
            onChangeText={(v) => setPayAmountSol(Number(v) || 0)}
            keyboardType="numeric"
            style={styles.modalInput}
          />

          <TouchableOpacity onPress={handleSendPayment} style={styles.modalPrimaryBtn}>
            <Text style={styles.modalPrimaryBtnText}>Transfer {payAmountSol} SOL Direct</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  contentContainer: {
    padding: 12,
    gap: 12,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  iconBtn: {
    padding: 4,
  },
  balanceVal: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  balanceSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  addrText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  newPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    borderRadius: 20,
    paddingVertical: 10,
    marginTop: 14,
  },
  newPaymentBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItemActive: {
    backgroundColor: '#2554EB',
    borderColor: '#2554EB',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listSection: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2554EB',
  },
  paymentSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 6,
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  paymentActions: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnPrimary: {
    backgroundColor: '#2554EB',
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionBtnSuccess: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  releasedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  releasedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  txMeta: {
    fontSize: 10,
    color: '#64748B',
  },
  txAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  tokenCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tokenName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  tokenVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2554EB',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  modalPrimaryBtn: {
    backgroundColor: '#2554EB',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
