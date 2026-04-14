import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import Colors from '../../constants/Colors';

/**
 * Custom Lexicon Design System Toast Configuration
 * Matches the obsidian/dark aesthetic of the word hunt game.
 */
export const lexiconToastConfig: ToastConfig = {
  success: (props) => (
    <View style={[styles.container, { borderColor: Colors.correct.main }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${Colors.correct.main}20` }]}>
        <Ionicons name="checkmark-circle" size={24} color={Colors.correct.main} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 && <Text style={styles.message}>{props.text2}</Text>}
      </View>
    </View>
  ),

  error: (props) => (
    <View style={[styles.container, { borderColor: Colors.danger }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${Colors.danger}20` }]}>
        <Ionicons name="alert-circle" size={24} color={Colors.danger} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 && <Text style={styles.message}>{props.text2}</Text>}
      </View>
    </View>
  ),

  info: (props) => (
    <View style={[styles.container, { borderColor: Colors.textSecondary }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${Colors.textSecondary}20` }]}>
        <Ionicons name="information-circle" size={24} color={Colors.textSecondary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 && <Text style={styles.message}>{props.text2}</Text>}
      </View>
    </View>
  ),
};

// Helper function to trigger haptics based on type (DISABLED - Visuals only)
export const triggerToastHaptics = (type: 'success' | 'error' | 'info') => {
  // Haptics disabled for toasts as per user request
};

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1.5,
    marginTop: Platform.OS === 'ios' ? 10 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  message: {
    color: '#888780',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
