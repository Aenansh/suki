import { Tabs } from 'expo-router';
import { CalendarDays, Coins, House } from 'lucide-react-native';

import { fonts, iconStrokeWidth } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function TabLayout() {
  const t = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.faint,
        tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.line },
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House size={22} color={color} strokeWidth={iconStrokeWidth} />,
        }}
      />
      <Tabs.Screen
        name="points"
        options={{
          title: 'Points',
          tabBarIcon: ({ color }) => <Coins size={22} color={color} strokeWidth={iconStrokeWidth} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <CalendarDays size={22} color={color} strokeWidth={iconStrokeWidth} />,
        }}
      />
    </Tabs>
  );
}
