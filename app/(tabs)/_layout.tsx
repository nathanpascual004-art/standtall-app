import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors, fonts } from '@/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accentLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontFamily: fonts.body },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stature',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="body-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="programme"
        options={{
          title: 'Programme',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
