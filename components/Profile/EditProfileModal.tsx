import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { useResponsive } from '@/hooks/useResponsive';
import { BlurView } from 'expo-blur';
import { supabase } from '@/lib/supabase';

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  currentName: string;
  currentAvatar: string;
  onSave: (name: string, avatar: string) => void;
  isLoading: boolean;
}

const AVATARS = [
  '🦊', '🐼', '🦁', '🐨', '🐸', 
  '🚀', '⭐', '🔥', '💎', '🎮',
  '🧙', '🥷', '🤴', '🧚', '🦄',
  '🌈', '⚡', '🍀', '🍎', '🍕'
];

export const EditProfileModal = ({
  isVisible,
  onClose,
  userId,
  currentName,
  currentAvatar,
  onSave,
  isLoading: isParentLoading,
}: EditProfileModalProps) => {
  const [name, setName] = useState(currentName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || AVATARS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const { scale, moderateScale, verticalScale } = useResponsive();

  const isLoading = isParentLoading || isUploading;

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image selection error:', error);
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    try {
      const ext = uri.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${userId}/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      } as any);

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData, {
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setSelectedAvatar(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (name.trim().length === 0 || isLoading) return;
    onSave(name.trim(), selectedAvatar);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <BlurView intensity={20} tint="dark" style={styles.container}>
          <View style={[styles.content, { padding: moderateScale(24) }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>PROFİLİ DÜZENLE</Text>
              <TouchableOpacity onPress={onClose} disabled={isLoading}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Avatar Preview */}
            <View style={styles.previewContainer}>
              <View style={[styles.avatarPreview, { width: scale(80), height: scale(80), borderRadius: scale(20) }]}>
                {isUploading ? (
                  <ActivityIndicator color={Colors.accent} size="large" />
                ) : selectedAvatar.startsWith('http') ? (
                  <Image source={{ uri: selectedAvatar }} style={{ width: '100%', height: '100%', borderRadius: scale(20) }} />
                ) : (
                  <Text style={{ fontSize: scale(40) }}>{selectedAvatar}</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.galleryButton} 
                onPress={pickImage}
                disabled={isUploading}
              >
                <Ionicons name="image-outline" size={16} color={Colors.accent} />
                <Text style={styles.galleryButtonText}>GALERİDEN SEÇ</Text>
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>GÖRÜNÜM ADI</Text>
              <TextInput
                style={[styles.input, { height: verticalScale(50) }]}
                value={name}
                onChangeText={setName}
                placeholder="İsmini gir..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                maxLength={20}
                autoCorrect={false}
              />
            </View>

            {/* Avatar Selection Grid */}
            <Text style={styles.inputLabel}>AVATAR LİSTESİ</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarGrid}
            >
              {AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar}
                  onPress={() => setSelectedAvatar(avatar)}
                  style={[
                    styles.avatarOption,
                    { width: scale(50), height: scale(50), borderRadius: scale(12) },
                    selectedAvatar === avatar && styles.selectedAvatar
                  ]}
                >
                  <Text style={{ fontSize: scale(24) }}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <TouchableOpacity
              style={[styles.saveButton, { height: verticalScale(55) }, isLoading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isLoading || name.trim().length === 0}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    width: '90%',
    backgroundColor: '#15151b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPreview: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    marginBottom: 12,
  },
  previewLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarGrid: {
    paddingVertical: 10,
    gap: 12,
  },
  avatarOption: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedAvatar: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
    borderWidth: 2,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  galleryButtonText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
