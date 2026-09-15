import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { useApp } from '../../context/AppContext';
import { SkillChainLogo } from '../Common/SkillChainLogo';
import { AuthStep } from './AuthStep';
import {
  User,
  Mail,
  ArrowRight,
  AlertCircle,
  X
} from 'lucide-react-native';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, checkCredentials, showToast, isDark } = useApp();

  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');

  // Reset state when modal is opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('input');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Sanitize username
  const handleUsernameChange = (text: string) => {
    const sanitized = text.replace(/[^a-zA-Z0-9_@]/g, '');
    setUsername(sanitized);
    if (error) setError(null);
  };

  // Sanitize email
  const handleEmailChange = (text: string) => {
    const sanitized = text.trim();
    setEmail(sanitized);
    if (error) setError(null);
  };

  // Step 1: Validate credentials and advance to OTP verification (or direct login for returning users)
  const handleRequestOtp = () => {
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const check = checkCredentials(username, email);
      setIsSubmitting(false);

      if (!check.isValid) {
        setError(check.error || 'Please provide valid credentials.');
        return;
      }

      // If returning user with existing account (after 90 days or returning session), login directly without OTP
      if (check.isExisting) {
        const result = login(username, email);
        if (result.success) {
          showToast('Welcome Back! 🎉', `Logged in as ${check.cleanHandle}`, 'success');
          setIsAuthModalOpen(false);
          setUsername('');
          setEmail('');
          return;
        }
      }

      // New users: Generate a 4-digit numeric OTP code and advance to verification step
      const newOtp = String(Math.floor(1000 + Math.random() * 9000));
      setGeneratedOtp(newOtp);
      setStep('otp');

      // Emulate email dispatch server delivery
      console.log(`%c[SkillChain Email Service] Sent 4-digit verification OTP (${newOtp}) to ${email}`, 'color: #2563eb; font-weight: bold; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');

      showToast(
        'Verification Code Sent!',
        `A 4-digit code was sent to ${email}. Please check your inbox.`,
        'info'
      );
    }, 450);
  };

  // Resend OTP code generator
  const handleResendOtp = () => {
    const newOtp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(newOtp);
    setError(null);

    // Emulate email dispatch server delivery
    console.log(`%c[SkillChain Email Service] Resent 4-digit verification OTP (${newOtp}) to ${email}`, 'color: #2563eb; font-weight: bold; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');

    showToast(
      'New Code Sent!',
      `A fresh 4-digit verification code has been dispatched to ${email}.`,
      'info'
    );
  };

  // Step 2: Handle OTP verification and sign in
  const handleVerifyOtp = (code: string) => {
    if (code !== generatedOtp) {
      setError('Invalid verification code. Please check the code or request a new one.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      showToast('Verified Successfully! 🎉', 'Welcome to SkillChain. Let\'s set up your profile...', 'success');
      const result = login(username, email);
      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error || 'Authentication failed. Please try again.');
      } else {
        setUsername('');
        setEmail('');
        setStep('input');
      }
    }, 500);
  };

  return (
    <CustomModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title={step === 'input' ? 'Sign In / Register' : 'Email Verification'}
      maxWidth={440}
    >
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Close button */}
          <TouchableOpacity
            onPress={() => setIsAuthModalOpen(false)}
            style={[styles.closeBtn, isDark && styles.closeBtnDark]}
            activeOpacity={0.7}
          >
            <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>

          {step === 'input' ? (
            <View style={styles.formContainer}>
              {/* Header Block with Logo & Prominent Title */}
              <View style={styles.headerBlock}>
                <SkillChainLogo size={72} style={styles.logoBadge} />
                <Text style={[styles.title, isDark && styles.textWhite]}>
                  Welcome to SkillChain
                </Text>
              </View>

              {/* Error Message Notice */}
              {error && (
                <View style={[styles.errorBox, isDark && styles.errorBoxDark]}>
                  <AlertCircle size={16} color="#DC2626" />
                  <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                    {error}
                  </Text>
                </View>
              )}

              {/* Input Form */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>
                  Username
                </Text>
                <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                  <User size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="e.g. preciousudoessien"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={24}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>
                  Email Address
                </Text>
                <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                  <Mail size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="name@domain.com"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Submit Action Button */}
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleRequestOtp}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Continue with Email OTP</Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Step 2: Dedicated OTP Verification Step Component */
            <AuthStep
              email={email}
              username={username}
              generatedOtp={generatedOtp}
              isDark={isDark}
              error={error}
              setError={setError}
              isSubmitting={isSubmitting}
              onVerify={handleVerifyOtp}
              onResendOtp={handleResendOtp}
              onBackToCredentials={() => {
                setStep('input');
                setError(null);
              }}
            />
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
  logoBadge: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  textWhite: {
    color: '#F8FAFC',
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
  formGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  fieldLabelDark: {
    color: '#CBD5E1',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  inputWrapperDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 13.5,
    color: '#0F172A',
  },
  inputDark: {
    color: '#F8FAFC',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2554EB',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 4,
    shadowColor: '#2554EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
