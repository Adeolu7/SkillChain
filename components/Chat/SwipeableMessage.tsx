import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Reply } from 'lucide-react-native';

interface SwipeableMessageProps {
  children: React.ReactNode;
  onReply: () => void;
  onLongPress?: () => void;
  isMyMessage?: boolean;
}

export const SwipeableMessage: React.FC<SwipeableMessageProps> = ({ children, onReply, onLongPress, isMyMessage = false }) => {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef<number | null>(null);
  const currentOffset = useRef(0);

  const handleStart = (event: any) => {
    startX.current = event.nativeEvent.pageX;
  };

  const handleMove = (event: any) => {
    if (startX.current === null) return;
    const delta = event.nativeEvent.pageX - startX.current;
    const offset = isMyMessage ? Math.max(-70, Math.min(20, delta)) : Math.min(70, Math.max(-20, delta));
    currentOffset.current = offset;
    setOffsetX(offset);
  };

  const handleEnd = () => {
    if (Math.abs(currentOffset.current) >= 42) onReply();
    startX.current = null;
    currentOffset.current = 0;
    setOffsetX(0);
  };

  const showReply = Math.abs(offsetX) > 12;

  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
      <View onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} style={styles.wrapper}>
        {showReply && (
          <View style={[styles.replyBadge, isMyMessage ? styles.replyRight : styles.replyLeft, Math.abs(offsetX) >= 42 && styles.replyActive]}>
            <Reply size={16} color={Math.abs(offsetX) >= 42 ? '#FFFFFF' : '#2554EB'} />
          </View>
        )}
        <View style={{ transform: [{ translateX: offsetX }] }}>{children}</View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: 'relative', width: '100%' },
  replyBadge: { position: 'absolute', top: '50%', marginTop: -16, width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', zIndex: 0 },
  replyLeft: { left: 8 },
  replyRight: { right: 8 },
  replyActive: { backgroundColor: '#2554EB' },
});
