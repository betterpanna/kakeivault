import { Tabs } from 'expo-router'
import { Platform } from 'react-native'

/**
 * Tab navigation layout.
 *
 * Adaptive layout:
 * - Phone: bottom tab bar
 * - iPad: uses sidebar via Expo Router's drawer (Phase 1)
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2c5282',
        tabBarInactiveTintColor: '#6c757d',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#dee2e6',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        headerStyle: { backgroundColor: '#2c5282' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ダッシュボード',
          tabBarLabel: 'ダッシュボード',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: '取引',
          tabBarLabel: '取引',
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'スキャン',
          tabBarLabel: 'スキャン',
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: '書類',
          tabBarLabel: '書類',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarLabel: '設定',
        }}
      />
    </Tabs>
  )
}
