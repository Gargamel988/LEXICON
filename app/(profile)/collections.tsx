import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collectionService } from '../../services/collectionService';
import { WORD_COLLECTIONS, WordCollection, CollectionCard } from '../../constants/collections';
import { useAuth } from '../../hooks/useAuth';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

import { useQuery } from '@tanstack/react-query';

export default function CollectionsScreen() {
  const { user } = useAuth();
  const { scale, moderateScale } = useResponsive();

  const { data: unlockedCardIds = [], isLoading } = useQuery({
    queryKey: ['userCards', user?.id],
    queryFn: () => user ? collectionService.getUserCards(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.correct.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Koleksiyonlar</Text>
        <Text style={styles.subtitle}>Bulduğun kelimelerle nadir kartları topla!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {WORD_COLLECTIONS.map((collection) => {
          const unlockedInThis = collection.cards.filter(c => unlockedCardIds.includes(c.id)).length;
          const totalInThis = collection.cards.length;
          const isFinished = unlockedInThis === totalInThis;

          return (
            <View key={collection.id} style={styles.collectionSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{collection.title}</Text>
                  <Text style={styles.sectionDesc}>{collection.description}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: isFinished ? Colors.correct.main + '20' : Colors.glass }]}>
                  <Text style={[styles.badgeText, { color: isFinished ? Colors.correct.main : Colors.textSecondary }]}>
                    {unlockedInThis}/{totalInThis}
                  </Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardList}>
                {collection.cards.map((card) => {
                  const isUnlocked = unlockedCardIds.includes(card.id);
                  return (
                    <View key={card.id} style={[styles.cardContainer, !isUnlocked && styles.lockedCard]}>
                      <View style={[styles.cardImagePlaceholder, { borderColor: getRarityColor(card.rarity) }]}>
                        {isUnlocked ? (
                          <Ionicons name="image-outline" size={40} color={getRarityColor(card.rarity)} />
                        ) : (
                          <Ionicons name="lock-closed" size={30} color={Colors.textSecondary} />
                        )}
                      </View>
                      <Text style={[styles.cardName, !isUnlocked && { color: Colors.textSecondary }]}>
                        {isUnlocked ? card.name : '???'}
                      </Text>
                      <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(card.rarity) + '20' }]}>
                         <Text style={[styles.rarityText, { color: getRarityColor(card.rarity) }]}>
                           {card.rarity.toUpperCase()}
                         </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return '#A0A0A0';
    case 'rare': return '#3498db';
    case 'epic': return '#9b59b6';
    case 'legendary': return '#f1c40f';
    default: return '#fff';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: { padding: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4, fontWeight: '600' },
  scrollContent: { paddingBottom: 30 },
  collectionSection: { marginTop: 20 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginBottom: 15
  },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sectionDesc: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontWeight: '800', fontSize: 12 },
  cardList: { paddingLeft: 20, paddingRight: 10, gap: 12 },
  cardContainer: {
    width: 130,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lockedCard: { opacity: 0.6 },
  cardImagePlaceholder: {
    width: 110,
    height: 140,
    backgroundColor: Colors.glass,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderStyle: 'dashed'
  },
  cardName: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  rarityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  rarityText: { fontSize: 8, fontWeight: '900' },
});
