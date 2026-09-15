import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';

interface CustomModalProps {
  visible?: boolean;
  isOpen?: boolean;
  onRequestClose?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
  alignTop?: boolean;
  title?: string;
  maxWidth?: number;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  isOpen,
  onRequestClose,
  onClose,
  children,
  alignTop = false,
  maxWidth = 440,
}) => {
  const isShown = visible ?? isOpen ?? false;
  const handleClose = onRequestClose || onClose;
  if (!isShown) return null;

  return (
    <Modal visible={isShown} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlayContainer}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.contentWrapper,
          { maxWidth },
          alignTop && styles.contentWrapperTop
        ]}
        pointerEvents="box-none"
      >
        {children}
      </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 999999,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(11, 15, 25, 0.72)',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '92%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    zIndex: 1000000,
    marginHorizontal: 'auto',
    alignSelf: 'center',
  },
  contentWrapperTop: {
    justifyContent: 'flex-start',
    paddingTop: 32,
  }
});

