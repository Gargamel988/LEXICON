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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { useResponsive } from '@/hooks/useResponsive';
import { BlurView } from 'expo-blur';
import { supabase } from '@/lib/supabase';
import { AvatarWithFrame } from '../Cosmetics/AvatarWithFrame';
import { FrameDef, FRAMES } from "@/constants/frames";
import { Title, TITLES, getTitleStyle } from "@/constants/titles";
import { NAMETAGS } from '@/constants/nametags';
 
const PRESET_AVATARS = [
  '👤', '🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', 
  '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐥', '🐺', '🐗', '🐴', '🦄',
  '🥷', '🧙', '🧛', '🧟', '🧞', '🧜', '🧚', '👼', '🦸', '🦹'
];

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  currentName: string;
  currentAvatar: string;
  onSave: (name: string, avatar: string, isPublic: boolean, showOnLeaderboard: boolean) => void;
  isLoading: boolean;
  isPublicInitial: boolean;
  showOnLeaderboardInitial: boolean;
  activeFrame?: FrameDef | null;
  activeTitle?: Title | null;
  activeNameTag?: string | null;
  ownedTitles?: Title[];
  ownedCosmetics?: string[];
  onSaveTitle: (titleId: string | null) => void;
  onSaveFrame: (frameId: string) => void;
  onSaveNameTag: (nametagId: string | null) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isVisible,
  onClose,
  userId,
  currentName,
  currentAvatar,
  onSave,
  isLoading: isParentLoading,
  isPublicInitial,
  showOnLeaderboardInitial,
  activeFrame,
  activeTitle,
  activeNameTag,
  ownedTitles = [],
  ownedCosmetics = [],
  onSaveTitle,
  onSaveFrame,
  onSaveNameTag,
}) => {
  const [name, setName] = useState(currentName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [isPublic, setIsPublic] = useState(isPublicInitial);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(showOnLeaderboardInitial);
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
    onSave(name.trim(), selectedAvatar, isPublic, showOnLeaderboard);
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
        <BlurView intensity={20} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: '90%', backgroundColor: '#15151b', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: moderateScale(24) }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: Colors.accent, fontSize: 18, fontWeight: '900', letterSpacing: 1.5 }}>PROFİLİ DÜZENLE</Text>
              <TouchableOpacity onPress={onClose} disabled={isLoading}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Avatar Preview */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: scale(80), height: scale(80), justifyContent: 'center', alignItems: 'center' }}>
                {isUploading ? (
                  <ActivityIndicator color={Colors.accent} size="large" />
                ) : (
                  <AvatarWithFrame 
                    avatarUrl={selectedAvatar} 
                    frameId={activeFrame?.id || 'frame_default'} 
                    size={scale(80) * 0.9} 
                  />
                )}
              </View>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 6 }} 
                onPress={pickImage}
                disabled={isUploading}
              >
                <Ionicons name="image-outline" size={16} color={Colors.accent} />
                <Text style={{ color: Colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>GALERİDEN SEÇ</Text>
              </TouchableOpacity>
 
              {/* Preset Avatars */}
              <View style={{ marginTop: 20, width: '100%' }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5, textAlign: 'center' }}>VEYA BİR İKON SEÇ</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}
                >
                  {PRESET_AVATARS.map((emoji) => {
                    const isSelected = selectedAvatar === emoji;
                    return (
                      <TouchableOpacity
                        key={emoji}
                        onPress={() => setSelectedAvatar(emoji)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: isSelected ? 'rgba(255,214,0,0.2)' : 'rgba(255,255,255,0.05)',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 2,
                          borderColor: isSelected ? Colors.accent : 'transparent'
                        }}
                      >
                        <Text style={{ fontSize: 24 }}>{emoji}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Name Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 }}>GÖRÜNÜM ADI</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, color: '#fff', paddingHorizontal: 16, fontSize: 16, fontWeight: '600', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', height: verticalScale(50) }}
                value={name}
                onChangeText={setName}
                placeholder="İsmini gir..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                maxLength={20}
                autoCorrect={false}
              />
            </View>

            {/* Title Selection */}
            {ownedTitles.length > 0 && (
              <View style={{ marginBottom: verticalScale(16) }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 }}>UNVAN SEÇİMİ</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: scale(8), paddingVertical: verticalScale(2) }}
                >
                  <TouchableOpacity
                    onPress={() => onSaveTitle(null)}
                    style={[
                      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
                      !activeTitle && { borderColor: Colors.accent, backgroundColor: 'rgba(255,214,0,0.15)' }
                    ]}
                  >
                    <Text style={[{ fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }, { color: 'rgba(255,255,255,0.4)' }]}>YOK</Text>
                  </TouchableOpacity>

                  {ownedTitles.map((title) => {
                    const titleStyle = getTitleStyle(title.id);
                    const isSelected = activeTitle?.id === title.id;
                    return (
                      <TouchableOpacity
                        key={title.id}
                        onPress={() => onSaveTitle(title.id)}
                        style={[
                          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
                          isSelected && { borderColor: title.color, backgroundColor: `${title.color}20` }
                        ]}
                      >
                        <Text style={[
                          { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }, 
                          titleStyle
                        ]}>
                          {title.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Frame Selection */}
            <View style={{ marginBottom: verticalScale(16) }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 }}>ÇERÇEVE SEÇİMİ</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: scale(10), paddingVertical: verticalScale(2) }}
              >
                {FRAMES.filter(f => ownedCosmetics.includes(f.id)).map((frame) => {
                  const isSelected = activeFrame?.id === frame.id;
                  return (
                    <TouchableOpacity
                      key={frame.id}
                      onPress={() => onSaveFrame(frame.id)}
                      style={[
                        { width: scale(50), height: scale(50), borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
                        isSelected && { borderColor: frame.color, backgroundColor: `${frame.color}20` }
                      ]}
                    >
                      <Image 
                        source={frame.source} 
                        style={{ width: '100%', height: '100%', transform: [{ scale: 0.8 }] }} 
                        resizeMode="contain" 
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Nametag Selection */}
            <View style={{ marginBottom: verticalScale(16) }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 }}>İSİMLİK SEÇİMİ</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: scale(10), paddingVertical: verticalScale(2) }}
              >
                <TouchableOpacity
                  onPress={() => onSaveNameTag(null)}
                  style={[
                    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
                    !activeNameTag && { borderColor: Colors.accent, backgroundColor: 'rgba(255,214,0,0.15)' }
                  ]}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>VARSAYILAN</Text>
                </TouchableOpacity>

                {NAMETAGS.filter(n => ownedCosmetics.includes(n.id)).map((tag) => {
                  const isSelected = activeNameTag === tag.id;
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() => onSaveNameTag(tag.id)}
                      style={[
                        { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
                        isSelected && { borderColor: Colors.accent, backgroundColor: 'rgba(255,214,0,0.1)' }
                      ]}
                    >
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{tag.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Privacy Settings */}
            <View style={{ marginBottom: verticalScale(16), gap: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 }}>GİZLİLİK AYARLARI</Text>
              
              {/* Public Profile Toggle */}
              <TouchableOpacity 
                onPress={() => setIsPublic(!isPublic)}
                activeOpacity={0.7}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isPublic ? Colors.accent + '40' : 'rgba(255,255,255,0.1)'
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Profil Herkese Açık</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>Diğer oyuncular profilinizi görebilir.</Text>
                </View>
                <View style={{ 
                  width: 44, height: 24, borderRadius: 12, 
                  backgroundColor: isPublic ? Colors.accent : 'rgba(255,255,255,0.1)',
                  padding: 2,
                  justifyContent: 'center',
                  alignItems: isPublic ? 'flex-end' : 'flex-start'
                }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: isPublic ? '#000' : 'rgba(255,255,255,0.5)' }} />
                </View>
              </TouchableOpacity>

              {/* Leaderboard Toggle */}
              <TouchableOpacity 
                onPress={() => setShowOnLeaderboard(!showOnLeaderboard)}
                activeOpacity={0.7}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: showOnLeaderboard ? Colors.accent + '40' : 'rgba(255,255,255,0.1)'
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Sıralamada Göster</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>Skorlarınız liderlik tablosunda yayınlanır.</Text>
                </View>
                <View style={{ 
                  width: 44, height: 24, borderRadius: 12, 
                  backgroundColor: showOnLeaderboard ? Colors.accent : 'rgba(255,255,255,0.1)',
                  padding: 2,
                  justifyContent: 'center',
                  alignItems: showOnLeaderboard ? 'flex-end' : 'flex-start'
                }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: showOnLeaderboard ? '#000' : 'rgba(255,255,255,0.5)' }} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={[
                { backgroundColor: Colors.accent, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }, 
                { height: verticalScale(55) }, 
                isLoading && { opacity: 0.7 }
              ]}
              onPress={handleSave}
              disabled={isLoading || name.trim().length === 0}
            >
              <Text style={{ color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>
                {isLoading ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

