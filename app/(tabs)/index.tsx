import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  // Newsページに移動
  const navigateToNews = () => {
    router.push('/news');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Illustページに移動
  const navigateToIllust = () => {
    router.push('/illust');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // 公式サイトを開く
  const openOfficialSite = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://www.gamesanpi.com/');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('サイトを開けませんでした:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ロゴセクション */}
        <ThemedView style={styles.logoSection}>
          <Image
            source={{ uri: 'https://www.gamesanpi.com/GameSanpiLogo.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
        </ThemedView>

        {/* 機能紹介セクション */}
        <ThemedView style={styles.featuresSection}>

          {/* Newsページ */}
          <TouchableOpacity
            style={[
              styles.featureCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].background }
            ]}
            onPress={navigateToNews}
          >
            <View style={styles.featureIconContainer}>
              <IconSymbol 
                name="newspaper.fill" 
                size={40} 
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </View>
            <View style={styles.featureContent}>
              <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                最新ニュース
              </ThemedText>
              <ThemedText type="default" style={styles.featureDescription}>
                ゲーム業界の最新情報をお届け
              </ThemedText>
            </View>
            <View style={styles.featureArrow}>
              <IconSymbol 
                name="chevron.right" 
                size={24} 
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </View>
          </TouchableOpacity>

          {/* Illustページ */}
          <TouchableOpacity
            style={[
              styles.featureCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].background }
            ]}
            onPress={navigateToIllust}
          >
            <View style={styles.featureIconContainer}>
              <IconSymbol 
                name="photo.on.rectangle" 
                size={40} 
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </View>
            <View style={styles.featureContent}>
              <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                記事イラスト
              </ThemedText>
              <ThemedText type="default" style={styles.featureDescription}>
                記事に掲載されている美しいイラストを一覧で表示
              </ThemedText>
            </View>
            <View style={styles.featureArrow}>
              <IconSymbol 
                name="chevron.right" 
                size={24} 
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </View>
          </TouchableOpacity>

          {/* 公式サイトへのリンク */}
          <TouchableOpacity
            style={[
              styles.featureCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].background }
            ]}
            onPress={openOfficialSite}
          >
            <View style={styles.featureIconContainer}>
              <IconSymbol 
                name="globe" 
                size={40} 
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </View>
            <View style={styles.featureContent}>
              <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                ゲーム賛否公式サイト
              </ThemedText>
              <ThemedText type="default" style={styles.featureDescription}>
                公式サイトにアクセス
              </ThemedText>
            </View>
            <View style={styles.featureArrow}>
              <IconSymbol 
                name="arrow.up.right.square" 
                size={24} 
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* アプリ情報セクション */}
        {/* <ThemedView style={styles.infoSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            このアプリについて
          </ThemedText>
          
          <View style={styles.infoCard}>
            <ThemedText type="default" style={styles.infoText}>
              このアプリは、ゲーム賛否サイトの記事を快適に閲覧するためのモバイルアプリです。最新のゲーム情報を素早くキャッチアップできます。
            </ThemedText>
          </View>

          <View style={styles.infoCard}>
            <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
              主な特徴
            </ThemedText>
            <ThemedText type="default" style={styles.infoText}>
              • 最新記事の自動取得{'\n'}
              • 記事イラストの一覧表示{'\n'}
              • 1列・2列の表示切り替え{'\n'}
              • プルトゥリフレッシュ対応{'\n'}
              • ダークモード対応
            </ThemedText>
          </View>
        </ThemedView> */}

        {/* フッター */}
        {/* <ThemedView style={styles.footer}>
          <ThemedText type="default" style={styles.footerText}>
            © 2025 ゲーム賛否アプリ
          </ThemedText>
        </ThemedView> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  
  // ロゴセクション
  logoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: Math.min(screenWidth - 40, 300),
    height: 120,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  versionText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // 機能紹介セクション
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIconContainer: {
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  featureArrow: {
    marginLeft: 12,
  },
  
  // アプリ情報セクション
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  
  // フッター
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 20,
  },
  officialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  officialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
