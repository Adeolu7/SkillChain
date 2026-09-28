import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput
} from 'react-native';
import {
  KeyRound,
  Mail,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  AlertCircle,
  ShieldCheck,
  Inbox
} from 'lucide-react-native';

export interface AuthStepProps {
  email: string;
  username: string;
  generatedOtp: string;
  isDark?: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  isSubmitting: boolean;
  onVerify: (code: string) => void;
  onResendOtp: () => void;
  onBackToCredentials: () => void;
}

export const AuthStep: React.FC<AuthStepProps> = ({
  email,
  username,
  generatedOtp,
  isDark = false,
  error,
  setError,
  isSubmitting,
  onVerify,
  onResendOtp,
  onBackToCredentials
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(120);
  const [canResend, setCanResend] = useState<boolean>(false);
  const inputRefs = useRef<Array<HTMLInputElement | any>>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0]?.focus) {
        inputRefs.current[0].focus();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Resend timer countdown
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Handle digit input & paste for 4 digits
  const handleDigitChange = (index: number, val: string) => {
    if (error) setError(null);

    // Multi-digit paste handler (up to 4 digits)
    if (val.length > 1) {
      const pasted = val.replace(/[^0-9]/g, '').slice(0, 4).split('');
      if (pasted.length > 0) {
        const nextDigits = ['', '', '', ''];
        pasted.forEach((char, i) => {
          if (i < 4) nextDigits[i] = char;
        });
        setOtpDigits(nextDigits);
        const focusIdx = Math.min(pasted.length, 3);
        if (inputRefs.current[focusIdx]?.focus) {
          inputRefs.current[focusIdx].focus();
        }
        if (pasted.length === 4) {
          onVerify(nextDigits.join(''));
        }
        return;
      }
    }

    const cleanChar = val.replace(/[^0-9]/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = cleanChar;
    setOtpDigits(nextDigits);

    // Advance to next input
    if (cleanChar && index < 3) {
      if (inputRefs.current[index + 1]?.focus) {
        inputRefs.current[index + 1].focus();
      }
    }

    // Auto submit on 4th digit
    if (cleanChar && index === 3 && nextDigits.every((d) => d !== '')) {
      onVerify(nextDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: any) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (inputRefs.current[index - 1]?.focus) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleResendClick = () => {
    if (!canResend || isSubmitting) return;
    setResendTimer(120);
    setCanResend(false);
    setOtpDigits(['', '', '', '']);
    onResendOtp();
    if (inputRefs.current[0]?.focus) {
      inputRefs.current[0].focus();
    }
  };

  const handleSubmit = () => {
    const fullCode = otpDigits.join('');
    if (fullCode.length < 4) {
      setError('Please enter all 4 digits of your verification code.');
      return;
    }
    onVerify(fullCode);
  };

  const isComplete = otpDigits.join('').length === 4;
  const minutes = Math.floor(resendTimer / 60);
  const seconds = resendTimer % 60;
  const formattedTimer = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerBlock}>
        <View style={[styles.badgeIconBox, isDark && styles.badgeIconBoxDark]}>
          <KeyRound size={26} color={isDark ? '#60A5FA' : '#2554EB'} />
        </View>

        <Text style={[styles.title, isDark && styles.textWhite]}>
          Verify Your Email
        </Text>

        <Text style={[styles.subtitle, isDark && styles.textMutedDark]}>
          Enter the 4-digit code sent to your email inbox
        </Text>

        <View style={styles.emailPillRow}>
          <Text style={[styles.emailText, isDark && styles.textWhite]}>
            {email}
          </Text>
          <TouchableOpacity
            onPress={onBackToCredentials}
            style={[styles.editPill, isDark && styles.editPillDark]}
            activeOpacity={0.7}
          >
            <Text style={[styles.editText, isDark && styles.editTextDark]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Email Inbox Delivery Notification Card */}
      <View style={[styles.infoBanner, isDark && styles.infoBannerDark]}>
        <Inbox size={18} color={isDark ? '#60A5FA' : '#2554EB'} style={{ marginTop: 2 }} />
        <Text style={[styles.infoBannerText, isDark && styles.infoBannerTextDark]}>
          We just emailed a secure 4-digit verification code to <Text style={[styles.boldEmail, isDark && styles.textWhite]}>{email}</Text>. Check your spam folder if it doesn't appear in a few moments.
        </Text>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={[styles.errorBox, isDark && styles.errorBoxDark]}>
          <AlertCircle size={16} color="#DC2626" />
          <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
            {error}
          </Text>
        </View>
      )}

      {/* 4-Digit OTP Box Grid */}
      <View style={styles.digitGrid}>
        {otpDigits.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(value) => handleDigitChange(idx, value)}
            onKeyPress={(e) => handleKeyDown(idx, e.nativeEvent)}
            editable={!isSubmitting}
            caretHidden
            style={{
              width: 56,
              height: 62,
              fontSize: 24,
              fontWeight: 800,
              textAlign: 'center',
              borderRadius: 14,
              borderWidth: error || digit ? 2 : 1,
              borderColor: error ? '#EF4444' : digit ? '#2554EB' : isDark ? '#334155' : '#CBD5E1',
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              color: isDark ? '#F8FAFC' : '#0F172A',
            }}
          />
        ))}
      </View>

      {/* Resend Timer / Action */}
      <View style={styles.resendRow}>
        {canResend ? (
          <TouchableOpacity
            onPress={handleResendClick}
            style={styles.resendBtn}
            activeOpacity={0.7}
          >
            <RotateCcw size={13} color={isDark ? '#60A5FA' : '#2554EB'} />
            <Text style={[styles.resendBtnText, isDark && styles.resendBtnTextDark]}>
              Resend verification code
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.timerText, isDark && styles.textMutedDark]}>
            Resend code in <Text style={[styles.timerHighlight, isDark && styles.textWhite]}>{formattedTimer}</Text>
          </Text>
        )}
      </View>

      {/* Primary Submit Button */}
      <TouchableOpacity
        style={[
          styles.verifyBtn,
          (isSubmitting || !isComplete) && styles.verifyBtnDisabled
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting || !isComplete}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.verifyBtnText}>Verify & Sign In</Text>
            <CheckCircle2 size={16} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>

      {/* Back to Credentials */}
      <TouchableOpacity
        onPress={onBackToCredentials}
        style={styles.backBtn}
        activeOpacity={0.7}
        disabled={isSubmitting}
      >
        <ChevronLeft size={15} color={isDark ? '#94A3B8' : '#64748B'} />
        <Text style={[styles.backBtnText, isDark && styles.textMutedDark]}>
          Back to credentials
        </Text>
      </TouchableOpacity>

      {/* Security note */}
      <View style={styles.securityRow}>
        <ShieldCheck size={13} color={isDark ? '#34D399' : '#059669'} />
        <Text style={[styles.securityText, isDark && styles.textMutedDark]}>
          256-bit encrypted authentication handshake
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 4,
  },
  headerBlock: {
    alignItems: 'center',
    textAlign: 'center',
  },
  badgeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  badgeIconBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  emailPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  emailText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  editPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  editPillDark: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  editText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2554EB',
  },
  editTextDark: {
    color: '#60A5FA',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  infoBannerDark: {
    backgroundColor: '#172554',
    borderColor: '#1E3A8A',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#1E40AF',
  },
  infoBannerTextDark: {
    color: '#BFDBFE',
  },
  boldEmail: {
    fontWeight: '700',
    color: '#1E3A8A',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 11,
    borderRadius: 10,
  },
  errorBoxDark: {
    backgroundColor: '#450A0A',
    borderColor: '#991B1B',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  errorTextDark: {
    color: '#FCA5A5',
  },
  digitGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 4,
  },
  resendRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  timerHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  resendBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2554EB',
  },
  resendBtnTextDark: {
    color: '#60A5FA',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2554EB',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#2554EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  verifyBtnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: -4,
  },
  securityText: {
    fontSize: 11,
    color: '#64748B',
  },
  textWhite: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
});
