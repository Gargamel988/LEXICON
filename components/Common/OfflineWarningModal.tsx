import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';

interface OfflineWarningModalProps {
  visible: boolean;
  onClose: () => void;
}

export function OfflineWarningModal({ visible, onClose }: OfflineWarningModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-offline" size={32} color={Colors.correct.main} />
            </View>
            <Text style={styles.title}>İnternet Bağlantısı Yok</Text>
          </View>

          <Text style={styles.description}>
            Uygulama şu an çevrimdışı modda çalışıyor. Bazı özellikler kısıtlanmıştır:
          </Text>

          <View style={styles.list}>
            <View style={styles.listItem}>
              <Ionicons name="cart-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.listText}>Mağaza ve satın almalar kapalıdır.</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="trophy-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.listText}>Sıralama tablosu güncellenmez.</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="flash-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.listText}>Elmas harcamaları sadece güçlendirmeler için yapılabilir.</Text>
            </View>
          </View>

          <Text style={styles.footerNote}>
            İnternet geldiğinde ilerlemeniz otomatik olarak senkronize edilecektir.
          </Text>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Anladım</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  list: {
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
  },
  listText: {
    color: '#eee',
    fontSize: 13,
    flex: 1,
  },
  footerNote: {
    color: Colors.correct.main,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.correct.main,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
});
