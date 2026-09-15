import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';

const ViewKey = View as any;

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ViewKey
          key={toast.id}
          style={[
            styles.toastCard,
            toast.type === 'success' && styles.toastSuccess,
            toast.type === 'error' && styles.toastError,
            toast.type === 'warning' && styles.toastWarning,
            toast.type === 'info' && styles.toastInfo,
          ]}
        >
          <View style={styles.iconContainer}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="#10B981" />}
            {toast.type === 'error' && <AlertCircle size={18} color="#EF4444" />}
            {toast.type === 'warning' && <AlertTriangle size={18} color="#F59E0B" />}
            {toast.type === 'info' && <Info size={18} color="#00E5FF" />}
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.toastTitle}>{toast.title}</Text>
            {toast.message ? <Text style={styles.toastMessage}>{toast.message}</Text> : null}
          </View>

          <TouchableOpacity
            onPress={() => removeToast(toast.id)}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <X size={14} color="#64748B" />
          </TouchableOpacity>
        </ViewKey>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute' as any,
    bottom: 70,
    left: 12,
    right: 12,
    zIndex: 9999,
    gap: 8,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  toastSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  toastError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  toastWarning: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  toastInfo: {
    borderColor: '#00E5FF',
    backgroundColor: '#F0FDFF',
  },
  iconContainer: {
    marginRight: 8,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  toastMessage: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  closeBtn: {
    padding: 2,
    marginLeft: 6,
  },
});
