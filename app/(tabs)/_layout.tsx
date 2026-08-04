import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { borderWidth, color, font } from '@/theme/tokens';

/** Tab bar — Accueil / Programme / Nutrition / Profil, actif en accent. */
export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: color.bg },
        tabBarStyle: {
          backgroundColor: color.surface,
          borderTopWidth: borderWidth.hairline,
          borderTopColor: color.border,
        },
        tabBarActiveTintColor: color.accent,
        tabBarInactiveTintColor: color.textMuted,
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: font.bold,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.tabHome'),
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="home-outline" color={tint} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="programme"
        options={{
          title: t('common.tabProgram'),
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="map-outline" color={tint} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: t('common.tabNutrition'),
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="nutrition-outline" color={tint} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progres"
        options={{
          title: t('common.tabProgress'),
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="trending-up-outline" color={tint} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: t('common.tabProfile'),
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="person-outline" color={tint} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
