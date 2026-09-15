import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  TouchableWithoutFeedback
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { SwipeableMessage } from './SwipeableMessage';
import { EmptyState } from '../Common/EmptyState';
import { useApp } from '../../context/AppContext';
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  X,
  Zap,
  Lock,
  ArrowLeft,
  Reply,
  Pencil,
  Trash2,
  Check,
  CheckCheck,
  Coins,
  Copy,
  Sparkles,
  Search,
  ChevronUp,
  ChevronDown
} from 'lucide-react-native';
import { ChatMessage } from '../../types';

const ViewKey = View as any;
const TextKey = Text as any;
const TouchableOpacityKey = TouchableOpacity as any;

export const ChatTab: React.FC = () => {
  const {
    conversations,
    messages,
    sendMessage,
    profiles,
    currentUser,
    sendDirectPayment,
    viewProfileById,
    setActiveTab,
    showToast,
    markConversationAsRead,
    receiveRealtimeMessage,
    isDark
  } = useApp();

  // Default to null so user sees the inbox message list first
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);

  // Mark conversation as read as soon as it is opened
  React.useEffect(() => {
    if (selectedConversationId) {
      markConversationAsRead(selectedConversationId);
    }
  }, [selectedConversationId]);

  // In-Chat Message Search State (WhatsApp style)
  const [isInChatSearchOpen, setIsInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [activeSearchMatchIndex, setActiveSearchMatchIndex] = useState(0);

  // Tip Modal State (Screenshots 1 & 2)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [tipNetwork, setTipNetwork] = useState<'solana' | 'ethereum'>('solana');
  const [tipEthToken, setTipEthToken] = useState<'ETH' | 'USDC' | 'USDT'>('ETH');
  const [tipAmount, setTipAmount] = useState('0.05');
  const [tipNote, setTipNote] = useState('');

  // Local message state for immediate interactive reply/delete/edit experience
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>(messages);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<any>(null);

  // Sync if global messages change
  React.useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const activeConversation = selectedConversationId
    ? conversations.find((c) => c.id === selectedConversationId)
    : null;

  const partnerProfile = activeConversation
    ? profiles.find((p) => p.id === activeConversation.participantId) || profiles[1]
    : profiles[1];

  const currentMessages = selectedConversationId
    ? localMessages[selectedConversationId] || []
    : [];

  const matchingMessages = inChatSearchQuery.trim()
    ? currentMessages.filter((m) =>
        m.text.toLowerCase().includes(inChatSearchQuery.toLowerCase().trim())
      )
    : [];

  // Scroll to bottom when messages update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd?.({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentMessages, isTyping]);

  const handleSend = () => {
    if (!selectedConversationId) return;
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    if (editingMsgId) {
      // Update edited message
      setLocalMessages((prev) => {
        const convList = prev[selectedConversationId] || [];
        const updated = convList.map((m) =>
          m.id === editingMsgId ? { ...m, text: trimmed } : m
        );
        return { ...prev, [selectedConversationId]: updated };
      });
      setEditingMsgId(null);
      setInputMessage('');
      return;
    }

    const newMsgText = replyingTo
      ? `[Replying to "${replyingTo.text.slice(0, 30)}..."]\n${trimmed}`
      : trimmed;

    sendMessage(
      selectedConversationId,
      newMsgText
    );

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsgObj: ChatMessage = {
      id: `m_${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: currentUser.id,
      text: newMsgText,
      createdAt: nowTime,
      read: false
    };

    setLocalMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] || []), newMsgObj]
    }));

    setInputMessage('');
    setReplyingTo(null);

    // Realistic developer response from Elena
    if (selectedConversationId === 'conv_elena') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const elenaReplies = [
          "I've verified the state transitions on-chain. All invariant assertions passed smoothly!",
          "Sounds perfect Alex! I'll prepare the final test report and milestone sign-off for the Solana settlement.",
          "Confirmed! The zero-copy serialization and PDA bump seed validations are 100% compliant with Anchor 0.30.",
          "Awesome! Everything is staged on Devnet. Ready to proceed whenever you give the signal."
        ];
        const randomReply = elenaReplies[Math.floor(Math.random() * elenaReplies.length)];
        const elenaMsgObj: ChatMessage = {
          id: `m_elena_${Date.now()}`,
          conversationId: 'conv_elena',
          senderId: 'user_elena',
          text: randomReply,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: true
        };
        setLocalMessages((prev) => {
          const updatedConv = (prev.conv_elena || []).map((m) => ({ ...m, read: true }));
          return {
            ...prev,
            conv_elena: [...updatedConv, elenaMsgObj]
          };
        });
      }, 1400);
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!selectedConversationId) return;
    setLocalMessages((prev) => ({
      ...prev,
      [selectedConversationId]: (prev[selectedConversationId] || []).filter((m) => m.id !== msgId)
    }));
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setReplyingTo(null);
    setInputMessage(msg.text);
  };

  // USD Calculation for Tip Modal
  const getTipUsdValue = () => {
    const num = parseFloat(tipAmount) || 0;
    if (tipNetwork === 'solana') {
      return (num * 185).toFixed(2);
    }
    if (tipEthToken === 'ETH') {
      return (num * 3400).toFixed(2);
    }
    return num.toFixed(2);
  };

  const handleSendTipPayment = () => {
    const numAmount = parseFloat(tipAmount);
    if (!numAmount || numAmount <= 0) {
      showToast('Invalid Amount', 'Please enter a valid tip amount.', 'error');
      return;
    }

    const tokenSymbol = tipNetwork === 'solana' ? 'SOL' : tipEthToken;
    const networkName = tipNetwork === 'solana' ? 'Solana Mainnet' : 'Ethereum Mainnet';
    const txHash = tipNetwork === 'solana' 
      ? `5Kz${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`
      : `0x7a${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`;

    // Send direct payment if solana
    if (tipNetwork === 'solana') {
      sendDirectPayment(
        `Tip to ${partnerProfile.name}`,
        partnerProfile.id,
        numAmount,
        'SOL',
        tipNote || `Tip sent via chat`
      );
    }

    setIsPaymentModalOpen(false);
    showToast(
      'Tip Sent!',
      `Transferred ${tipAmount} ${tokenSymbol} to ${partnerProfile.name} on ${networkName}`,
      'success'
    );

    const tipMessageText = `🎉 [Tip Sent] ${tipAmount} ${tokenSymbol} (${networkName})\n` +
      (tipNote ? `Note: "${tipNote}"\n` : '') +
      `Tx Hash: ${txHash}`;

    const tipMsgObj: ChatMessage = {
      id: `m_tip_${Date.now()}`,
      conversationId: selectedConversationId || 'conv_elena',
      senderId: currentUser.id,
      text: tipMessageText,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };

    if (selectedConversationId) {
      setLocalMessages((prev) => ({
        ...prev,
        [selectedConversationId]: [...(prev[selectedConversationId] || []), tipMsgObj]
      }));
    }

    // Thank you message simulation
    setTimeout(() => {
      const thankReply: ChatMessage = {
        id: `m_thank_${Date.now()}`,
        conversationId: selectedConversationId || 'conv_elena',
        senderId: partnerProfile.id,
        text: `Thank you so much for the ${tipAmount} ${tokenSymbol} tip, ${currentUser.name.split(' ')[0]}! Really appreciate your support and partnership 🤝✨`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true
      };
      if (selectedConversationId) {
        setLocalMessages((prev) => ({
          ...prev,
          [selectedConversationId]: [...(prev[selectedConversationId] || []), thankReply]
        }));
      }
    }, 1200);

    setTipNote('');
  };

  const handleCopyPartnerWallet = () => {
    const address = partnerProfile.walletAddress || '3M2aB5vR8xYwZ1qP9tK4mL7nE6sJ0p89B';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(address);
    }
    showToast('Wallet Copied', address, 'success');
  };

  // If no conversation is selected, show the Conversations List view
  if (!selectedConversationId) {
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    return (
      <View style={[styles.listContainer, isDark && styles.listContainerDark]}>
        {/* Encrypted End-to-End Messages Header */}
        <View style={[styles.encryptedMainHeader, isDark && styles.encryptedMainHeaderDark]}>
          <View style={styles.encryptedMainHeaderLeft}>
            <View style={[styles.lockIconBox, isDark && styles.lockIconBoxDark]}>
              <Lock size={17} color={isDark ? '#60A5FA' : '#2554EB'} strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.encryptedHeaderTitleRow}>
                <Text style={[styles.encryptedMainHeaderTitle, isDark && styles.textDark]}>Encrypted End to End Messages</Text>
                {totalUnread > 0 && (
                  <View style={[styles.inboxUnreadBadge, isDark && styles.inboxUnreadBadgeDark]}>
                    <Text style={styles.inboxUnreadBadgeText}>{totalUnread} new</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.encryptedMainHeaderSub, isDark && styles.subtextDark]}>
                Peer-to-peer on-chain secured messaging
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
          {/* Conversations List */}
          {conversations.length === 0 ? (
            <EmptyState
              icon={Lock}
              badge="Encrypted Direct Messages"
              title="No conversations yet"
              description="Connect and start a secure, encrypted peer-to-peer chat with any verified freelancer or client."
              actionLabel="Discover Freelancers"
              onAction={() => setActiveTab('discover')}
            />
          ) : (
            <View style={styles.conversationsList}>
              {conversations.map((conv) => {
                const participant = profiles.find((p) => p.id === conv.participantId);
                if (!participant) return null;

                return (
                  <TouchableOpacityKey
                    key={conv.id}
                    style={[styles.conversationCard, isDark && styles.conversationCardDark]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedConversationId(conv.id)}
                  >
                    {/* Left: Avatar with green online dot */}
                    <View style={styles.avatarWrapper}>
                      <Image source={{ uri: participant.avatar }} style={styles.convAvatar} />
                      <View style={styles.onlineBadge} />
                    </View>

                    {/* Middle: Name & Last Message */}
                    <View style={styles.convMiddle}>
                      <View style={styles.nameBadgeRow}>
                        <Text style={[styles.convName, isDark && styles.textDark]}>{participant.name}</Text>
                        {participant.isVerified && (
                          <ShieldCheck size={13} color="#2554EB" />
                        )}
                        {participant.id === 'user_elena' && (
                          <View style={styles.softDotBadge} />
                        )}
                      </View>
                      <Text
                        style={[styles.convLastMessage, isDark && styles.subtextDark]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {conv.lastMessage}
                      </Text>
                    </View>

                    {/* Right: Timestamp & Unread count */}
                    <View style={styles.convRight}>
                      <Text style={[styles.convTime, isDark && styles.subtextDark]}>{conv.lastMessageAt}</Text>
                      {conv.unreadCount > 0 ? (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{conv.unreadCount}</Text>
                        </View>
                      ) : (
                        <View style={styles.unreadPlaceholder} />
                      )}
                    </View>
                  </TouchableOpacityKey>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  const renderHighlightedMessageText = (
    text: string,
    query: string,
    isMe: boolean
  ) => {
    if (!query || !query.trim()) {
      return (
        <Text style={isMe ? styles.myMessageText : (isDark ? styles.theirMessageTextDark : styles.theirMessageText)}>
          {text}
        </Text>
      );
    }

    const trimmedQuery = query.trim();
    const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <Text style={isMe ? styles.myMessageText : (isDark ? styles.theirMessageTextDark : styles.theirMessageText)}>
        {parts.map((part, index) => {
          if (part.toLowerCase() === trimmedQuery.toLowerCase()) {
            return (
              <TextKey
                key={index}
                style={
                  isMe
                    ? styles.highlightedInChatTextMy
                    : styles.highlightedInChatTextTheir
                }
              >
                {part}
              </TextKey>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  // Conversation Detail / Chat Room View
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Top Header Bar */}
      <View style={[styles.chatHeader, isDark && styles.chatHeaderDark]}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            onPress={() => {
              setSelectedConversationId(null);
              setIsInChatSearchOpen(false);
              setInChatSearchQuery('');
            }}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ArrowLeft size={19} color={isDark ? '#F8FAFC' : '#0F172A'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => viewProfileById(partnerProfile.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
            activeOpacity={0.8}
          >
            <View style={styles.headerAvatarWrapper}>
              <Image source={{ uri: partnerProfile.avatar }} style={styles.headerAvatar} />
              <View style={styles.headerOnlineDot} />
            </View>

            <View style={styles.headerTitleGroup}>
              <View style={styles.nameRow}>
                <Text style={[styles.headerName, isDark && styles.textDark]}>{partnerProfile.name}</Text>
                {partnerProfile.isVerified && (
                  <CheckCircle2 size={13} color="#2554EB" fill={isDark ? '#0F172A' : '#FFFFFF'} />
                )}
              </View>
              <Text style={[styles.headerRole, isDark && styles.subtextDark]}>{partnerProfile.title}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Right Action Buttons: In-Chat Search + Tip Button */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={() => {
              setIsInChatSearchOpen((prev) => !prev);
              if (isInChatSearchOpen) {
                setInChatSearchQuery('');
              }
            }}
            style={[
              styles.headerSearchActionBtn,
              isDark && styles.headerSearchActionBtnDark,
              isInChatSearchOpen && styles.headerSearchActionBtnActive
            ]}
            activeOpacity={0.8}
            accessibilityLabel="Search in conversation"
          >
            <Search size={16} color={isInChatSearchOpen ? '#2554EB' : (isDark ? '#CBD5E1' : '#475569')} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsPaymentModalOpen(true)}
            style={styles.tipHeaderBtn}
            activeOpacity={0.8}
            accessibilityLabel="Send Tip"
          >
            <Coins size={15} color="#059669" />
            <Text style={styles.tipHeaderBtnText}>Tip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* WhatsApp-Style In-Chat Search Bar */}
      {isInChatSearchOpen && (
        <View style={[styles.inChatSearchBar, isDark && styles.inChatSearchBarDark]}>
          <View style={[styles.inChatSearchInputWrapper, isDark && styles.inChatSearchInputWrapperDark]}>
            <Search size={14} color="#64748B" />
            <TextInput
              value={inChatSearchQuery}
              onChangeText={(text) => {
                setInChatSearchQuery(text);
                setActiveSearchMatchIndex(0);
              }}
              placeholder="Search in this chat..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={[styles.inChatSearchInput, isDark && styles.textDark]}
              autoFocus
            />
            {inChatSearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setInChatSearchQuery('');
                  setActiveSearchMatchIndex(0);
                }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <X size={14} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {inChatSearchQuery.trim().length > 0 && (
            <View style={styles.inChatMatchInfoRow}>
              <Text style={[styles.inChatMatchCountText, isDark && styles.subtextDark]}>
                {matchingMessages.length === 0
                  ? '0 found'
                  : `${activeSearchMatchIndex + 1} of ${matchingMessages.length}`}
              </Text>
              {matchingMessages.length > 1 && (
                <View style={styles.inChatNavArrows}>
                  <TouchableOpacity
                    onPress={() =>
                      setActiveSearchMatchIndex((prev) =>
                        prev > 0 ? prev - 1 : matchingMessages.length - 1
                      )
                    }
                    style={[styles.inChatArrowBtn, isDark && styles.inChatArrowBtnDark]}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <ChevronUp size={15} color={isDark ? '#F8FAFC' : '#0F172A'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setActiveSearchMatchIndex((prev) =>
                        prev < matchingMessages.length - 1 ? prev + 1 : 0
                      )
                    }
                    style={[styles.inChatArrowBtn, isDark && styles.inChatArrowBtnDark]}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <ChevronDown size={15} color={isDark ? '#F8FAFC' : '#0F172A'} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              setIsInChatSearchOpen(false);
              setInChatSearchQuery('');
            }}
            style={[styles.inChatDoneBtn, isDark && styles.inChatDoneBtnDark]}
          >
            <Text style={styles.inChatDoneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages Stream */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {currentMessages.length === 0 && (
          <EmptyState
            icon={Lock}
            compact
            badge="Encrypted Channel"
            title="Start the conversation"
            description={`Say hello to ${partnerProfile.name} to discuss project deliverables, milestones, and on-chain terms.`}
          />
        )}
        {currentMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isTipMessage = msg.text.includes('[Tip Sent]');

          if (isTipMessage) {
            const textLines = msg.text.split('\n');
            const mainLine = textLines[0].replace('🎉 [Tip Sent] ', '');
            const noteLine = textLines.find((l) => l.startsWith('Note: "'))?.replace(/^Note: "/, '').replace(/"$/, '');
            const txLine = textLines.find((l) => l.startsWith('Tx Hash: '))?.replace('Tx Hash: ', '') || '5Kz8...4Xq1';

            return (
              <ViewKey key={msg.id} style={styles.tipCardMessageWrapper}>
                <View style={[styles.tipCardMessage, isDark && styles.tipCardMessageDark]}>
                  {/* Top Bar */}
                  <View style={styles.tipCardMessageHeader}>
                    <View style={styles.tipCardMessageIconBox}>
                      <Coins size={16} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tipCardMessageTitle, isDark && styles.tipCardMessageTitleDark]}>Web3 Direct Tip</Text>
                      <Text style={[styles.tipCardMessageTime, isDark && styles.subtextDark]}>{msg.createdAt} • Instant Settlement</Text>
                    </View>
                    <View style={styles.tipCardVerifiedBadge}>
                      <ShieldCheck size={12} color="#059669" />
                      <Text style={styles.tipCardVerifiedText}>Verified</Text>
                    </View>
                  </View>

                  {/* Main Amount Display */}
                  <View style={[styles.tipCardAmountBox, isDark && styles.tipCardAmountBoxDark]}>
                    <Text style={styles.tipCardAmountHighlight}>+{mainLine}</Text>
                    <Text style={[styles.tipCardNetworkLabel, isDark && styles.subtextDark]}>Solana / Web3 Direct Transfer</Text>
                  </View>

                  {/* Note if available */}
                  {noteLine ? (
                    <View style={[styles.tipCardNoteBox, isDark && styles.tipCardNoteBoxDark]}>
                      <Text style={[styles.tipCardNoteQuote, isDark && styles.tipCardNoteQuoteDark]}>"{noteLine}"</Text>
                    </View>
                  ) : null}

                  {/* Tx Hash Row */}
                  <View style={[styles.tipCardTxRow, isDark && styles.tipCardTxRowDark]}>
                    <Text style={[styles.tipCardTxLabel, isDark && styles.subtextDark]}>TX: {txLine}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(txLine);
                        }
                        showToast('Copied Hash', txLine, 'success');
                      }}
                      style={styles.tipCardCopyBtn}
                      activeOpacity={0.75}
                    >
                      <Copy size={11} color="#059669" />
                      <Text style={styles.tipCardCopyBtnText}>Copy Tx</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ViewKey>
            );
          }

          if (!isMe) {
            // Left-aligned message from Partner
            return (
              <SwipeableMessage
                key={msg.id}
                onReply={() => setReplyingTo(msg)}
                isMyMessage={false}
              >
                <View style={styles.theirMessageRow}>
                  {/* Avatar on Left */}
                  <TouchableOpacity
                    onPress={() => viewProfileById(partnerProfile.id)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: partnerProfile.avatar }}
                      style={styles.senderAvatar}
                    />
                  </TouchableOpacity>

                  <View style={styles.theirBubbleContainer}>
                    <View style={[styles.theirBubble, isDark && styles.theirBubbleDark]}>
                      {renderHighlightedMessageText(msg.text, inChatSearchQuery, false)}
                    </View>

                    {/* Timestamp & Reply below bubble */}
                    <View style={styles.theirMetaRow}>
                      <Text style={[styles.metaTimeText, isDark && styles.subtextDark]}>{msg.createdAt}</Text>
                      <TouchableOpacity
                        onPress={() => setReplyingTo(msg)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        style={styles.actionIconBtn}
                      >
                        <Reply size={13} color={isDark ? '#64748B' : '#94A3B8'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </SwipeableMessage>
            );
          }

          // Right-aligned message from Me
          return (
            <SwipeableMessage
              key={msg.id}
              onReply={() => setReplyingTo(msg)}
              isMyMessage={true}
            >
              <View style={styles.myMessageRow}>
                <View style={styles.myBubbleContainer}>
                  <View style={styles.myBubble}>
                    {renderHighlightedMessageText(msg.text, inChatSearchQuery, true)}
                  </View>

                  {/* Timestamp & Read/Delivered Indicator */}
                  <View style={styles.myMetaRow}>
                    <Text style={[styles.metaTimeText, isDark && styles.subtextDark]}>{msg.createdAt}</Text>

                    {msg.read ? (
                      <View style={styles.readReceiptGroup}>
                        <CheckCheck size={14} color={isDark ? '#60A5FA' : '#2554EB'} strokeWidth={2.4} />
                        <Text style={[styles.readReceiptText, isDark && { color: '#60A5FA' }]}>Read</Text>
                      </View>
                    ) : (
                      <View style={styles.deliveredReceiptGroup}>
                        <Check size={13} color="#94A3B8" strokeWidth={2.4} />
                        <Text style={styles.deliveredReceiptText}>Delivered</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => setReplyingTo(msg)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      style={styles.actionIconBtn}
                    >
                      <Reply size={13} color={isDark ? '#64748B' : '#94A3B8'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleStartEdit(msg)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      style={styles.actionIconBtn}
                    >
                      <Pencil size={13} color={isDark ? '#64748B' : '#94A3B8'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteMessage(msg.id)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      style={styles.actionIconBtn}
                    >
                      <Trash2 size={13} color={isDark ? '#64748B' : '#94A3B8'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SwipeableMessage>
          );
        })}

        {/* Live Typing Indicator */}
        {isTyping && (
          <View style={styles.typingRow}>
            <Image source={{ uri: partnerProfile.avatar }} style={styles.typingAvatar} />
            <View style={[styles.typingBubble, isDark && styles.typingBubbleDark]}>
              <View style={[styles.typingDot, isDark && styles.typingDotDark]} />
              <View style={[styles.typingDot, isDark && styles.typingDotDark, { opacity: 0.7 }]} />
              <View style={[styles.typingDot, isDark && styles.typingDotDark, { opacity: 0.4 }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Replying Preview Bar */}
      {replyingTo && (
        <View style={[styles.replyPreviewBar, isDark && styles.replyPreviewBarDark]}>
          <View style={styles.replyLeftBar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.replyTitle}>Replying to {replyingTo.senderId === currentUser.id ? 'yourself' : partnerProfile.name}</Text>
            <Text style={[styles.replyText, isDark && styles.subtextDark]} numberOfLines={1}>{replyingTo.text}</Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <X size={14} color={isDark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Mode Preview Bar */}
      {editingMsgId && (
        <View style={[styles.replyPreviewBar, isDark && styles.replyPreviewBarDark]}>
          <View style={[styles.replyLeftBar, { backgroundColor: '#F59E0B' }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.replyTitle, { color: '#F59E0B' }]}>Editing Message</Text>
            <Text style={[styles.replyText, isDark && styles.subtextDark]} numberOfLines={1}>{inputMessage}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setEditingMsgId(null);
              setInputMessage('');
            }}
          >
            <X size={14} color={isDark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Message Input Bar */}
      <View style={[styles.bottomInputBar, isDark && styles.bottomInputBarDark]}>
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type an end-to-end encrypted message..."
          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
          style={[styles.chatTextInput, isDark && styles.chatTextInputDark]}
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          onPress={handleSend}
          style={styles.sendIconBtn}
          activeOpacity={0.85}
        >
          <Send size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Send Tip Modal (Exact Match to Screenshots 1 & 2) */}
      <CustomModal visible={isPaymentModalOpen} onRequestClose={() => setIsPaymentModalOpen(false)}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={[styles.tipModalContent, isDark && styles.tipModalContentDark]}>
            {/* 1. Modal Header */}
            <View style={[styles.tipModalHeader, isDark && styles.tipModalHeaderDark]}>
              <View style={styles.tipHeaderTitleGroup}>
                <View style={styles.tipGreenIconBox}>
                  <Coins size={18} color="#059669" />
                </View>
                <Text style={[styles.tipModalTitle, isDark && styles.textDark]}>Send Tip</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPaymentModalOpen(false)}
                style={styles.tipCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* 2. Recipient Card */}
            <View style={[styles.recipientCard, isDark && styles.recipientCardDark]}>
              <Image source={{ uri: partnerProfile.avatar }} style={styles.recipientAvatar} />
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientBadgeLabel}>RECIPIENT</Text>
                <Text style={[styles.recipientName, isDark && styles.textDark]}>{partnerProfile.name}</Text>
                <Text style={[styles.recipientRole, isDark && styles.subtextDark]}>{partnerProfile.title}</Text>
              </View>
              <View style={styles.recipientWalletBox}>
                <Text style={styles.walletLabel}>Wallet</Text>
                <TouchableOpacity
                  onPress={handleCopyPartnerWallet}
                  style={[styles.walletPillBtn, isDark && styles.walletPillBtnDark]}
                  activeOpacity={0.75}
                >
                  <Text style={styles.walletPillText}>
                    {partnerProfile.walletAddress ? `${partnerProfile.walletAddress.slice(0, 4)}...${partnerProfile.walletAddress.slice(-4)}` : '3M2a...p89B'}
                  </Text>
                  <Copy size={11} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Network Switcher Tabs (Solana vs Ethereum) */}
            <View style={[styles.networkSwitchRow, isDark && styles.networkSwitchRowDark]}>
              <TouchableOpacity
                onPress={() => {
                  setTipNetwork('solana');
                  setTipAmount('0.05');
                }}
                style={[
                  styles.networkTabBtn,
                  tipNetwork === 'solana' && (isDark ? styles.networkTabBtnActiveDark : styles.networkTabBtnActive)
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.purpleDot} />
                <Text
                  style={[
                    styles.networkTabText,
                    isDark && styles.subtextDark,
                    tipNetwork === 'solana' && (isDark ? styles.textDark : styles.networkTabTextActive)
                  ]}
                >
                  Solana
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setTipNetwork('ethereum');
                  setTipAmount(tipEthToken === 'ETH' ? '0.005' : '10');
                }}
                style={[
                  styles.networkTabBtn,
                  tipNetwork === 'ethereum' && (isDark ? styles.networkTabBtnActiveDark : styles.networkTabBtnActive)
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.blueDot} />
                <Text
                  style={[
                    styles.networkTabText,
                    isDark && styles.subtextDark,
                    tipNetwork === 'ethereum' && (isDark ? styles.textDark : styles.networkTabTextActive)
                  ]}
                >
                  Ethereum
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4. If Ethereum: Token Selector (ETH / USDC / USDT) */}
            {tipNetwork === 'ethereum' && (
              <View style={styles.tokenSelectContainer}>
                <Text style={[styles.tipFieldLabel, isDark && styles.subtextDark]}>SELECT ETHEREUM TOKEN</Text>
                <View style={styles.tokenPillRow}>
                  {(['ETH', 'USDC', 'USDT'] as const).map((token) => {
                    const isSelected = tipEthToken === token;
                    return (
                      <TouchableOpacityKey
                        key={token}
                        onPress={() => {
                          setTipEthToken(token);
                          setTipAmount(token === 'ETH' ? '0.005' : '10');
                        }}
                        style={[
                          styles.tokenPillBtn,
                          isDark && styles.tokenPillBtnDark,
                          isSelected && styles.tokenPillBtnActive
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.tokenPillText,
                            isDark && styles.subtextDark,
                            isSelected && styles.tokenPillTextActive
                          ]}
                        >
                          {token}
                        </Text>
                      </TouchableOpacityKey>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 5. Tip Amount Input Box */}
            <View style={styles.tipAmountSection}>
              <Text style={[styles.tipFieldLabel, isDark && styles.subtextDark]}>
                TIP AMOUNT ({tipNetwork === 'solana' ? 'SOL' : tipEthToken})
              </Text>
              
              <View style={[styles.tipInputWrapper, isDark && styles.tipInputWrapperDark]}>
                <TextInput
                  value={tipAmount}
                  onChangeText={setTipAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[styles.tipAmountInput, isDark && styles.textDark]}
                />
                <View style={[styles.tipCurrencySuffix, isDark && styles.tipCurrencySuffixDark]}>
                  <Text style={[styles.tipCurrencySuffixText, isDark && styles.textDark]}>
                    {tipNetwork === 'solana' ? 'SOL' : tipEthToken}
                  </Text>
                </View>
              </View>

              {/* Estimated USD Value */}
              <Text style={styles.estimatedUsdText}>
                Estimated Value: ≈ ${getTipUsdValue()} USD
              </Text>
            </View>

            {/* 6. Quick Amount Preset Buttons */}
            <View style={styles.quickPresetRow}>
              {(tipNetwork === 'solana'
                ? ['0.01', '0.05', '0.1', '0.5']
                : tipEthToken === 'ETH'
                ? ['0.002', '0.005', '0.01', '0.05']
                : ['5', '10', '25', '50']
              ).map((preset) => {
                const isSelected = tipAmount === preset;
                const tokenSym = tipNetwork === 'solana' ? 'SOL' : tipEthToken;
                return (
                  <TouchableOpacityKey
                    key={preset}
                    onPress={() => setTipAmount(preset)}
                    style={[
                      styles.quickPresetBtn,
                      isDark && styles.quickPresetBtnDark,
                      isSelected && (isDark ? styles.quickPresetBtnActiveDark : styles.quickPresetBtnActive)
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.quickPresetText,
                        isDark && styles.subtextDark,
                        isSelected && styles.quickPresetTextActive
                      ]}
                    >
                      {preset} {tokenSym}
                    </Text>
                  </TouchableOpacityKey>
                );
              })}
            </View>

            {/* 7. Optional Note / Message */}
            <View style={styles.tipNoteSection}>
              <Text style={[styles.tipFieldLabel, isDark && styles.subtextDark]}>OPTIONAL NOTE / MESSAGE</Text>
              <TextInput
                value={tipNote}
                onChangeText={setTipNote}
                placeholder="e.g. Thanks for the quick code review! 🚀"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                style={[styles.tipNoteInput, isDark && styles.tipNoteInputDark]}
              />
            </View>

            {/* 8. Send Tip Action Button */}
            <TouchableOpacity
              onPress={handleSendTipPayment}
              style={styles.sendTipSubmitBtn}
              activeOpacity={0.85}
            >
              <Coins size={16} color="#FFFFFF" />
              <Text style={styles.sendTipSubmitBtnText}>
                Send {tipAmount || '0'} {tipNetwork === 'solana' ? 'SOL' : tipEthToken} Tip
              </Text>
            </TouchableOpacity>

          </View>
        </TouchableWithoutFeedback>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Conversations list view styles
  listContainer: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  encryptedMainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' as any,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  encryptedMainHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lockIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  encryptedHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  encryptedMainHeaderTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  encryptedMainHeaderSub: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  inboxUnreadBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  inboxUnreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2554EB',
  },
  emptySearchBox: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptySearchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySearchSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  listContent: {
    padding: 14,
    paddingBottom: 30,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  bannerSubtitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11.5,
    lineHeight: 16,
    color: '#64748B',
    marginTop: 3,
  },
  conversationsList: {
    gap: 10,
  },
  conversationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  convAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convMiddle: {
    flex: 1,
    marginRight: 8,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  convName: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  softDotBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2554EB',
  },
  convLastMessage: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11.5,
    color: '#64748B',
  },
  convRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 46,
  },
  convTime: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10.5,
    color: '#94A3B8',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#2554EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
  unreadPlaceholder: {
    height: 18,
  },

  // Conversation Detail Room
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)' as any,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerAvatarWrapper: {
    position: 'relative',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerTitleGroup: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerName: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRole: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10.5,
    color: '#64748B',
  },

  // Header Right Actions & Search
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSearchActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSearchActionBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  // WhatsApp-Style In-Chat Search Bar
  inChatSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
    zIndex: 10,
  },
  inChatSearchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  inChatSearchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    color: '#0F172A',
    paddingVertical: 3,
  },
  inChatMatchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inChatMatchCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  inChatNavArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inChatArrowBtn: {
    padding: 3,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  inChatDoneBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  inChatDoneBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Highlighted Search Words
  highlightedInChatTextTheir: {
    backgroundColor: '#FEF08A',
    color: '#854D0E',
    fontWeight: '700',
    borderRadius: 2,
  },
  highlightedInChatTextMy: {
    backgroundColor: '#FEF08A',
    color: '#1E3A8A',
    fontWeight: '700',
    borderRadius: 2,
  },

  // Tip Header Button
  tipHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tipHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Messages Stream
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    paddingBottom: 20,
    gap: 12,
  },
  theirMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 4,
  },
  theirBubbleContainer: {
    flex: 1,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  theirMessageText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#0F172A',
  },
  theirMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginLeft: 4,
  },
  myMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  myBubbleContainer: {
    maxWidth: '82%',
    alignItems: 'flex-end',
  },
  myBubble: {
    backgroundColor: '#2554EB',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 13,
    paddingVertical: 10,
    shadowColor: '#2554EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  myMessageText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  myMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginRight: 4,
  },
  metaTimeText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 9.5,
    color: '#94A3B8',
  },
  readReceiptGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readReceiptText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 9.5,
    fontWeight: '600',
    color: '#2554EB',
  },
  deliveredReceiptGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  deliveredReceiptText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 9.5,
    color: '#94A3B8',
  },
  actionIconBtn: {
    padding: 3,
  },
  attachmentImg: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 6,
  },

  // On-Chain Tip Card in chat
  tipCardMessageWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },
  tipCardMessage: {
    width: '90%',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
  },
  tipCardMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipCardMessageIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCardMessageTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669',
  },
  tipCardMessageTime: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 9.5,
    color: '#64748B',
  },
  tipCardVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tipCardVerifiedText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  tipCardMessageContent: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    color: '#166534',
    lineHeight: 17,
  },
  tipCardAmountBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginVertical: 6,
    alignItems: 'center',
  },
  tipCardAmountHighlight: {
    fontFamily: "'JetBrains Mono', monospace" as any,
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  tipCardNetworkLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  tipCardNoteBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  tipCardNoteQuote: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11,
    fontStyle: 'italic',
    color: '#166534',
  },
  tipCardTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  tipCardTxLabel: {
    fontFamily: "'JetBrains Mono', monospace" as any,
    fontSize: 10,
    color: '#64748B',
    maxWidth: '70%',
  },
  tipCardCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tipCardCopyBtnText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 4,
  },
  typingAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderBottomLeftRadius: 2,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#64748B',
  },

  // Reply Bar
  replyPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  replyLeftBar: {
    width: 3,
    height: '100%',
    backgroundColor: '#2554EB',
    borderRadius: 2,
  },
  replyTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },
  replyText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Attachment bar
  attachBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  attachInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    color: '#0F172A',
  },
  closeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Bottom input bar
  bottomInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  paperclipBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTextInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  sendIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#2554EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Send Tip Modal (Screenshots 1 & 2)
  tipModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 12,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  tipModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tipHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipGreenIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  tipCloseBtn: {
    padding: 4,
  },

  // Recipient Card
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 10,
  },
  recipientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientBadgeLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  recipientName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  recipientRole: {
    fontSize: 10.5,
    color: '#64748B',
  },
  recipientWalletBox: {
    alignItems: 'flex-end',
  },
  walletLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginBottom: 2,
  },
  walletPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  walletPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },

  // Network Switcher Tabs
  networkSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  networkTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
  },
  networkTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  purpleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#A855F7',
  },
  blueDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#3B82F6',
  },
  networkTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  networkTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },

  // Ethereum Token Select
  tokenSelectContainer: {
    gap: 4,
  },
  tokenPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tokenPillBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  tokenPillBtnActive: {
    backgroundColor: '#2554EB',
    borderColor: '#2554EB',
  },
  tokenPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tokenPillTextActive: {
    color: '#FFFFFF',
  },

  // Tip Amount Section
  tipAmountSection: {
    gap: 4,
  },
  tipFieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  tipInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  tipAmountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 10,
    fontFamily: 'Plus Jakarta Sans',
  },
  tipCurrencySuffix: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipCurrencySuffixText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  estimatedUsdText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },

  // Quick Presets
  quickPresetRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickPresetBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickPresetBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2554EB',
  },
  quickPresetText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  quickPresetTextActive: {
    color: '#2554EB',
    fontWeight: '700',
  },

  // Tip Note
  tipNoteSection: {
    gap: 4,
  },
  tipNoteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },

  // Send Tip Button
  sendTipSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendTipSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Dark Mode Styles
  listContainerDark: {
    backgroundColor: '#0B0F19',
  },
  encryptedMainHeaderDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  lockIconBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  inboxUnreadBadgeDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.2)',
    borderColor: '#2554EB',
  },
  emptySearchBoxDark: {
    backgroundColor: 'transparent',
  },
  conversationCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  containerDark: {
    backgroundColor: '#0B0F19',
  },
  chatHeaderDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  headerSearchActionBtnDark: {
    backgroundColor: '#1E293B',
  },
  inChatSearchBarDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  inChatSearchInputWrapperDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  inChatArrowBtnDark: {
    backgroundColor: '#334155',
  },
  inChatDoneBtnDark: {
    backgroundColor: '#1E293B',
  },
  theirBubbleDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  theirMessageTextDark: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#F8FAFC',
  },
  typingBubbleDark: {
    backgroundColor: '#1E293B',
  },
  typingDotDark: {
    backgroundColor: '#94A3B8',
  },
  replyPreviewBarDark: {
    backgroundColor: '#1E293B',
    borderTopColor: '#334155',
  },
  bottomInputBarDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  chatTextInputDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  tipCardMessageDark: {
    backgroundColor: '#064E3B',
    borderColor: '#059669',
  },
  tipCardMessageTitleDark: {
    color: '#A7F3D0',
  },
  tipCardAmountBoxDark: {
    backgroundColor: '#022C22',
    borderColor: '#065F46',
  },
  tipCardNoteBoxDark: {
    backgroundColor: '#022C22',
    borderLeftColor: '#10B981',
  },
  tipCardNoteQuoteDark: {
    color: '#A7F3D0',
  },
  tipCardTxRowDark: {
    borderTopColor: '#065F46',
  },
  tipModalContentDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  tipModalHeaderDark: {
    borderBottomColor: '#1E293B',
  },
  recipientCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  walletPillBtnDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.2)',
    borderColor: '#2554EB',
  },
  networkSwitchRowDark: {
    backgroundColor: '#1E293B',
  },
  networkTabBtnActiveDark: {
    backgroundColor: '#334155',
  },
  tokenPillBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  tipInputWrapperDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  tipCurrencySuffixDark: {
    backgroundColor: '#334155',
  },
  quickPresetBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  quickPresetBtnActiveDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.3)',
    borderColor: '#3B82F6',
  },
  tipNoteInputDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  textDark: {
    color: '#F8FAFC',
  },
  subtextDark: {
    color: '#94A3B8',
  },
});
