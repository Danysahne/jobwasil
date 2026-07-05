import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useLanguage } from '@/context/LanguageContext';

export default function TabLayout() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_search'),
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={26} name="magnify" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('tab_favorites'),
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={26} name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab_settings'),
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={26} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
