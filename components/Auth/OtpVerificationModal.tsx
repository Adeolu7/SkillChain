import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  TextInput
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { useApp } from '../../context/AppContext';
import {
  KeyRound,
  Inbox,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  AlertCircle,
  ShieldCheck,
  X
} from 'lucide-react-native';

export interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  username: string;
  expectedOtp?: string;
  onSuccess?: () => void;
  onBackToCredentials?: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  username,
  expectedOtp: initialExpectedOtp,
  onSuccess,
  onBackToCredentials
}) => {
  const { login, showToast, isDark } = useApp();

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [currentExpectedOtp, setCurrentExpectedOtp] = useState<string>(
    initialExpectedOtp || String(Math.floor(1000 + Math.random() * 9000))
  );
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<Array<HTMLInputElement | any>>([]);

  // Reset or initialize state on modal open
  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '']);
      setResendTimer(120);
      setCanResend(false);
      setIsVerifying(false);
      setIsSuccess(false);
      setErrorMessage(null);

      const code = initialExpectedOtp || String(Math.floor(1000 + Math.random() * 9000));
      setCurrentExpectedOtp(code);

      console.log(`%c[SkillChain Email Service] Sent 4-digit verification OTP (${code}) to ${email}`, 'color: #2563eb; font-weight: bold; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');

      // Auto-focus first input
      const timer = setTimeout(() => {
        if (inputRefs.current[0]?.focus) {
          inputRefs.current[0].focus();
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, initialExpectedOtp, email]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isOpen && resendTimer > 0 && !isSuccess) {
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
  }, [isOpen, resendTimer, isSuccess]);

  if (!isOpen) return null;

  // Handle 4-digit input change & paste
  const handleDigitChange = (index: number, val: string) => {
    if (errorMessage) setErrorMessage(null);

    // Multi-digit paste handling (e.g. pasting 4 digits at once)
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

        // Auto verify if 4 digits are entered via paste
        if (pasted.length === 4) {
          triggerVerification(nextDigits.join(''));
        }
        return;
      }
    }

    const cleanChar = val.replace(/[^0-9]/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = cleanChar;
    setOtpDigits(nextDigits);

    // Advance to next input if a digit was entered
    if (cleanChar && index < 3) {
      if (inputRefs.current[index + 1]?.focus) {
        inputRefs.current[index + 1].focus();
      }
    }

    // Automatically trigger verification when 4th digit is typed
    if (cleanChar && index === 3 && nextDigits.every((d) => d !== '')) {
      triggerVerification(nextDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: any) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (inputRefs.current[index - 1]?.focus) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Resend OTP code
  const handleResend = () => {
    if (!canResend || isVerifying || isSuccess) return;

    const newCode = String(Math.floor(1000 + Math.random() * 9000));
    setCurrentExpectedOtp(newCode);
    setOtpDigits(['', '', '', '']);
    setResendTimer(120);
    setCanResend(false);
    setErrorMessage(null);

    console.log(`%c[SkillChain Email Service] Resent 4-digit verification OTP (${newCode}) to ${email}`, 'color: #2563eb; font-weight: bold; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');

    showToast(
      'New Code Sent!',
      `A new 4-digit verification code has been dispatched to ${email}.`,
      'info'
    );

    if (inputRefs.current[0]?.focus) {
      inputRefs.current[0].focus();
    }
  };

  // Perform OTP verification logic
  const triggerVerification = (codeToVerify: string) => {
    if (isVerifying || isSuccess) return;

    if (codeToVerify.length !== 4) {
      setErrorMessage('Please enter all 4 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    setTimeout(() => {
      if (codeToVerify !== currentExpectedOtp) {
        setIsVerifying(false);
        setErrorMessage('Invalid 4-digit code. Please verify the code or request a new one.');
        return;
      }

      // Success State
      setIsVerifying(false);
      setIsSuccess(true);

      showToast('Verified Successfully', 'Authenticating your session...', 'success');

      // Complete login after brief celebratory transition
      setTimeout(() => {
        const loginResult = login(username, email);
        if (loginResult.success) {
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setIsSuccess(false);
          setErrorMessage(loginResult.error || 'Authentication error. Please try again.');
        }
      }, 800);
    }, 600);
  };

  const isFormComplete = otpDigits.every((d) => d.trim() !== '');
  const timerMinutes = Math.floor(resendTimer / 60);
  const timerSeconds = resendTimer % 60;
  const formattedCountdown = `${timerMinutes}:${timerSeconds < 10 ? '0' : ''}${timerSeconds}`;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Security Verification"
      maxWidth={440}
    >
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, isDark && styles.closeBtnDark]}
            activeOpacity={0.7}
          >
            <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>

          {isSuccess ? (
            /* Success State View */
            <View style={styles.successContainer}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                  <CheckCircle2 size={38} color="#10B981" />
                </View>
              </View>

              <Text style={[styles.successTitle, isDark && styles.textWhite]}>
                Verification Successful!
              </Text>

              <Text style={[styles.successSubtitle, isDark && styles.textMutedDark]}>
                Establishing cryptographic session for <Text style={styles.highlightText}>@{username}</Text>...
              </Text>

              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={[styles.loadingText, isDark && styles.textMutedDark]}>
                  Launching SkillChain Dashboard
                </Text>
              </View>
            </View>
          ) : (
            /* OTP Input & Verification Form */
            <View style={styles.formContainer}>
              {/* Header Badge & Copy */}
              <View style={styles.headerBlock}>
                <View style={[styles.badgeIconBox, isDark && styles.badgeIconBoxDark]}>
                  <KeyRound size={26} color={isDark ? '#60A5FA' : '#2554EB'} />
                </View>

                <Text style={[styles.title, isDark && styles.textWhite]}>
                  Enter 4-Digit Code
                </Text>

                <Text style={[styles.subtitle, isDark && styles.textMutedDark]}>
                  We sent a 4-digit verification code to
                </Text>

                <View style={styles.emailPillRow}>
                  <Text style={[styles.emailText, isDark && styles.textWhite]}>
                    {email || 'your email'}
                  </Text>
                  {onBackToCredentials && (
                    <TouchableOpacity
                      onPress={onBackToCredentials}
                      style={[styles.editPill, isDark && styles.editPillDark]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.editText, isDark && styles.editTextDark]}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Email Delivery Confirmation Card */}
              <View style={[styles.infoBanner, isDark && styles.infoBannerDark]}>
                <Inbox size={18} color={isDark ? '#60A5FA' : '#2554EB'} style={{ marginTop: 2 }} />
                <Text style={[styles.infoBannerText, isDark && styles.infoBannerTextDark]}>
                  A 4-digit code has been delivered to <Text style={[styles.boldEmail, isDark && styles.textWhite]}>{email}</Text>. Please check your inbox and junk folder.
                </Text>
              </View>

              {/* Error Notice */}
              {errorMessage && (
                <View style={[styles.errorBox, isDark && styles.errorBoxDark]}>
                  <AlertCircle size={16} color="#DC2626" />
                  <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                    {errorMessage}
                  </Text>
                </View>
              )}

              {/* 4-Digit Input Grid */}
              <View style={styles.digitGrid}>
                {otpDigits.map((digit, idx) => {
                  const hasError = !!errorMessage;
                  const isFilled = !!digit;
                  return (
                    <TextInput
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(value) => handleDigitChange(idx, value)}
                      onKeyPress={(e) => handleKeyDown(idx, e.nativeEvent)}
                      editable={!isVerifying}
                      caretHidden
                      style={{
                        width: 58,
                        height: 64,
                        fontSize: 26,
                        fontWeight: 800,
                        textAlign: 'center',
                        borderRadius: 14,
                        borderWidth: hasError || isFilled ? 2 : 1,
                        borderColor: hasError ? '#EF4444' : isFilled ? '#2554EB' : isDark ? '#334155' : '#CBD5E1',
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  );
                })}
              </View>

              {/* Resend Countdown Row */}
              <View style={styles.resendRow}>
                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResend}
                    style={styles.resendBtn}
                    activeOpacity={0.7}
                  >
                    <RotateCcw size={13} color={isDark ? '#60A5FA' : '#2554EB'} />
                    <Text style={[styles.resendBtnText, isDark && styles.resendBtnTextDark]}>
                      Resend 4-digit code
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.timerText, isDark && styles.textMutedDark]}>
                    Resend code in{' '}
                    <Text style={[styles.timerHighlight, isDark && styles.textWhite]}>
                      {formattedCountdown}
                    </Text>
                  </Text>
                )}
              </View>

              {/* Primary Verification Action Button */}
              <TouchableOpacity
                style={[
                  styles.verifyBtn,
                  (!isFormComplete || isVerifying) && styles.verifyBtnDisabled
                ]}
                onPress={() => triggerVerification(otpDigits.join(''))}
                disabled={!isFormComplete || isVerifying}
                activeOpacity={0.85}
              >
                {isVerifying ? (
                  <View style={styles.btnLoadingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.verifyBtnText}>Verifying Code...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.verifyBtnText}>Verify & Sign In</Text>
                    <CheckCircle2 size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              {/* Back to Credentials button */}
              {onBackToCredentials && (
                <TouchableOpacity
                  onPress={onBackToCredentials}
                  style={styles.backBtn}
                  activeOpacity={0.7}
                  disabled={isVerifying}
                >
                  <ChevronLeft size={15} color={isDark ? '#94A3B8' : '#64748B'} />
                  <Text style={[styles.backBtnText, isDark && styles.textMutedDark]}>
                    Back to credentials
                  </Text>
                </TouchableOpacity>
              )}

              {/* Security Shield Banner */}
              <View style={styles.securityRow}>
                <ShieldCheck size={13} color={isDark ? '#34D399' : '#059669'} />
                <Text style={[styles.securityText, isDark && styles.textMutedDark]}>
                  End-to-end encrypted single-use authentication
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    position: 'relative',
  },
  cardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    shadowColor: '#000000',
    shadowOpacity: 0.6,
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnDark: {
    backgroundColor: '#1E293B',
  },
  formContainer: {
    gap: 16,
  },
  headerBlock: {
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 4,
  },
  badgeIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12.5,
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
    fontSize: 13,
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
    borderRadius: 12,
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
    marginVertical: 6,
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
    opacity: 0.55,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
    textAlign: 'center',
  },
  successIconOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  successIconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  highlightText: {
    fontWeight: '700',
    color: '#2554EB',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  textWhite: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
});
