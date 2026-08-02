import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { borderWidth, color, font } from '@/theme/tokens';

/** Tab bar — Accueil / Programme / Nutrition / Profil, actif en accent. */
export default function TabsLayout() {
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
          title: 'Accueil',
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="home-outline" color={tint} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="programme"
        options={{
          title: 'Parcours',
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="map-outline" color={tint} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="nutrition-outline" color={tint} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="habitudes"
        options={{
          title: 'Habitudes',
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="checkbox-outline" color={tint} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color: tint, size }) => (
            <Ionicons name="person-outline" color={tint} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
