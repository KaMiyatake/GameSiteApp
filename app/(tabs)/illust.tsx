import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth } = Dimensions.get('window');

interface IllustData {
  imageUrl: string;
  articleUrl: string;
  articleTitle: string;
  publishedDate: string;
  illustNumber: number;
  sortKey: string;
}

type DisplayMode = 'single' | 'double';

export default function IllustScreen() {
  const colorScheme = useColorScheme();
  const [illusts, setIllusts] = useState<IllustData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('double'); // デフォルトは2列表示

  // 記事情報を取得
  const fetchArticleData = async () => {
    try {
      const response = await fetch('https://www.gamesanpi.com/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      const articles: {url: string, title: string, slug: string, sortKey: string}[] = [];
      const seenUrls = new Set<string>();
      
      // 記事情報を抽出
      const articleBlockRegex = /<a[^>]*href="\/news\/([a-zA-Z0-9-]+)"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<\/a>/g;
      let blockMatch;
      
      while ((blockMatch = articleBlockRegex.exec(html)) !== null) {
        const slug = blockMatch[1];
        const title = blockMatch[2]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/&#x27;/g, "'")
          .replace(/&#x2F;/g, '/')
          .trim();
        
        const fullUrl = `https://gamesanpi.com/news/${slug}`;
        
        if (seenUrls.has(fullUrl)) continue;
        seenUrls.add(fullUrl);
        
        if (title.length > 5 && 
            title !== 'カテゴリー' && 
            title !== '人気記事' && 
            title !== 'ゲーム賛否' &&
            title !== '人気タグ' &&
            !title.includes('span') &&
            !title.includes('記事') &&
            !title.includes('タグ') &&
            !title.includes('カテゴリ')) {
          
          // 日付部分を抽出してソートキーを作成
          const dateMatch = slug.match(/^(\d{2})(\d{2})(\d{2})(\d{2})/);
          let sortKey = '';
          
          if (dateMatch) {
            const year = `20${dateMatch[1]}`;
            const month = dateMatch[2];
            const day = dateMatch[3];
            sortKey = `${year}${month}${day}${dateMatch[4]}`;
          }
          
          articles.push({
            url: fullUrl,
            title,
            slug,
            sortKey
          });
        }
      }
      
      console.log('取得した記事数:', articles.length);
      return articles.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
      
    } catch (error) {
      console.error('記事データの取得エラー:', error);
      throw error;
    }
  };

  // イラスト画像の存在チェック
  const checkIllustExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  // イラストデータを取得
  const fetchIllustData = async () => {
    try {
      setError(null);
      
      // 記事データを取得
      const articles = await fetchArticleData();
      const illustData: IllustData[] = [];
      
      console.log('イラスト検索を開始...');
      
      // 各記事のイラストをチェック（最大15記事まで、イラスト10件を目指す）
      const maxArticlesToCheck = Math.min(articles.length, 15);
      
      for (let i = 0; i < maxArticlesToCheck && illustData.length < 10; i++) {
        const article = articles[i];
        const slug = article.slug;
        
        // 日付情報を抽出
        const dateMatch = slug.match(/^(\d{2})(\d{2})(\d{2})(\d{2})/);
        let publishedDate = '';
        let year = '';
        let month = '';
        
        if (dateMatch) {
          year = `20${dateMatch[1]}`;
          month = dateMatch[2];
          const day = dateMatch[3];
          publishedDate = `${year}年${month}月${day}日`;
        }
        
        // イラスト画像を順番にチェック（illust1.png, illust2.png, ...）
        for (let illustNum = 1; illustNum <= 3; illustNum++) {
          if (illustData.length >= 10) break;
          
          const illustUrl = `https://www.gamesanpi.com/images/articles/${year}/${month}/${slug}/illust${illustNum}.png`;
          
          console.log(`イラストチェック中: ${illustUrl}`);
          
          const exists = await checkIllustExists(illustUrl);
          
          if (exists) {
            const illustItem: IllustData = {
              imageUrl: illustUrl,
              articleUrl: article.url,
              articleTitle: article.title,
              publishedDate,
              illustNumber: illustNum,
              sortKey: `${article.sortKey}_${illustNum}`
            };
            
            illustData.push(illustItem);
            console.log('イラスト発見:', illustUrl);
          }
        }
      }
      
      console.log('最終イラスト数:', illustData.length);
      
      // 日付順でソート
      const sortedIllusts = illustData.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
      
      return sortedIllusts.slice(0, 10);
      
    } catch (error) {
      console.error('イラストデータの取得エラー:', error);
      throw error;
    }
  };

  // イラスト一覧を取得
  const fetchIllusts = async () => {
    try {
      setError(null);
      
      const illustData = await fetchIllustData();
      
      if (illustData.length === 0) {
        throw new Error('イラストが見つかりませんでした');
      }
      
      setIllusts(illustData);
      
    } catch (err) {
      console.error('イラストの取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'イラストの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // イラスト画像を新しいタブで開く
  const openIllustInNewTab = async (illustData: IllustData) => {
    try {
      await WebBrowser.openBrowserAsync(illustData.imageUrl);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('イラストを開けませんでした:', error);
      Alert.alert('エラー', 'イラストを開けませんでした');
    }
  };

  // 記事をブラウザで開く
  const openArticle = async (illustData: IllustData) => {
    try {
      await WebBrowser.openBrowserAsync(illustData.articleUrl);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('ブラウザを開けませんでした:', error);
      Alert.alert('エラー', 'ブラウザを開けませんでした');
    }
  };

  // 表示モードを切り替え
  const toggleDisplayMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // リフレッシュ
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIllusts();
    setRefreshing(false);
  };

  // 初回読み込み
  useEffect(() => {
    fetchIllusts();
  }, []);

  // 表示モードに応じたサイズ計算
  const imageWidth = displayMode === 'single' 
    ? screenWidth - 30 
    : (screenWidth - 45) / 2;

  // 1列表示時は3:4の縦長比率を維持、2列表示時も3:4を維持
  const imageHeight = (imageWidth * 4) / 3;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.headerContainer}>
          <IconSymbol 
            size={40} 
            name="photo.on.rectangle" 
            color={Colors[colorScheme ?? 'light'].tint}
            style={styles.headerIcon}
          />
          <ThemedText type="title" style={styles.headerTitle}>
            記事イラスト
          </ThemedText>
        </ThemedView>

        {/* 表示切り替えボタン */}
        <ThemedView style={styles.displayModeContainer}>
          <TouchableOpacity
            style={[
              styles.displayModeButton,
              displayMode === 'single' && [styles.activeModeButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]
            ]}
            onPress={() => toggleDisplayMode('single')}
          >
            <IconSymbol 
              name="rectangle.fill" 
              size={20} 
              color={displayMode === 'single' ? Colors[colorScheme ?? 'light'].background : Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText 
              style={[
                styles.modeButtonText,
                displayMode === 'single' && { color: Colors[colorScheme ?? 'light'].background }
              ]}
            >
              1列
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.displayModeButton,
              displayMode === 'double' && [styles.activeModeButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]
            ]}
            onPress={() => toggleDisplayMode('double')}
          >
            <IconSymbol 
              name="square.grid.2x2.fill" 
              size={20} 
              color={displayMode === 'double' ? Colors[colorScheme ?? 'light'].background : Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText 
              style={[
                styles.modeButtonText,
                displayMode === 'double' && { color: Colors[colorScheme ?? 'light'].background }
              ]}
            >
              2列
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ThemedText type="default">イラストを検索中...</ThemedText>
            <ThemedText type="default" style={styles.loadingSubtext}>
              画像の存在確認を行っています
            </ThemedText>
          </ThemedView>
        ) : error ? (
          <ThemedView style={styles.errorContainer}>
            <ThemedText type="default" style={styles.errorText}>
              {error}
            </ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
              onPress={fetchIllusts}
            >
              <ThemedText style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
                再試行
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.illustsContainer}>
            <View style={[
              styles.gridContainer,
              displayMode === 'single' && styles.singleColumnContainer
            ]}>
              {illusts.map((illust, index) => (
                <View
                  key={index}
                  style={[
                    styles.illustCard,
                    { width: imageWidth },
                    displayMode === 'single' && styles.singleColumnCard
                  ]}
                >
                  {/* イラスト画像部分 - 画像を新しいタブで開く */}
                  <TouchableOpacity
                    style={[
                      styles.illustImageContainer,
                      { height: imageHeight }
                    ]}
                    onPress={() => openIllustInNewTab(illust)}
                  >
                    <Image
                      source={{ uri: illust.imageUrl }}
                      style={[
                        styles.illustImage,
                        { width: imageWidth, height: imageHeight }
                      ]}
                      resizeMode={displayMode === 'single' ? 'contain' : 'cover'}
                      onError={() => {
                        console.log('イラスト画像の読み込みに失敗:', illust.imageUrl);
                      }}
                    />
                    <View style={styles.illustOverlay}>
                      <IconSymbol 
                        size={20} 
                        name="arrow.up.right.square" 
                        color="white"
                      />
                    </View>
                  </TouchableOpacity>
                  
                  {/* テキスト情報部分 - 記事ページに遷移 */}
                  <TouchableOpacity
                    style={[
                      styles.illustInfo,
                      displayMode === 'single' && styles.singleColumnInfo
                    ]}
                    onPress={() => openArticle(illust)}
                  >
                    <ThemedText 
                      style={[
                        styles.illustTitle,
                        displayMode === 'single' && styles.singleColumnTitle
                      ]} 
                      numberOfLines={displayMode === 'single' ? 3 : 2}
                    >
                      {illust.articleTitle}
                    </ThemedText>
                    
                    <ThemedText 
                      style={[
                        styles.illustDate,
                        displayMode === 'single' && styles.singleColumnDate
                      ]}
                    >
                      {illust.publishedDate}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ThemedView>
        )}

        <ThemedView style={styles.footer}>
          {/* <ThemedText type="default" style={styles.footerText}>
            下に引っ張って更新
          </ThemedText> */}
          {/* <TouchableOpacity
            style={[styles.siteButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => WebBrowser.openBrowserAsync('https://www.gamesanpi.com/')}
          >
            <ThemedText style={[styles.siteButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
              ゲーム賛否サイトを見る
            </ThemedText>
          </TouchableOpacity> */}
        </ThemedView>
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
    paddingTop: 10,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerIcon: {
    marginBottom: 0,
    marginRight: 10,
  },
  headerTitle: {
    textAlign: 'left',
    fontSize: 24,
    marginBottom: 0,
  },
  // 表示切り替えボタンのスタイル
  displayModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  displayModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeModeButton: {
    borderColor: 'transparent',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingSubtext: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#F44336',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: 'bold',
  },
  illustsContainer: {
    paddingHorizontal: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  singleColumnContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  illustCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#ffffff',
  },
  singleColumnCard: {
    marginBottom: 24,
  },
  illustImageContainer: {
    position: 'relative',
    backgroundColor: '#f8f8f8',
  },
  illustImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  illustOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
    borderRadius: 4,
  },
  illustInfo: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  singleColumnInfo: {
    padding: 16,
  },
  illustTitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
    color: '#000000',
    fontWeight: '500',
  },
  singleColumnTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: '600',
  },
  illustDate: {
    fontSize: 10,
    color: '#333333',
  },
  singleColumnDate: {
    fontSize: 14,
    color: '#666666',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    opacity: 0.6,
    fontSize: 14,
    marginBottom: 15,
  },
  siteButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  siteButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
