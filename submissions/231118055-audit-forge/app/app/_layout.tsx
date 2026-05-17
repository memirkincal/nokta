import 'react-native-reanimated';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AuditWidget } from '@/components/AuditWidget';
import { createAuditDeps } from '@/lib/audit-host';
import { theme } from '@/constants/theme';

function routeKey(pathname: string | null) {
  if (!pathname || pathname === '/') {
    return 'home';
  }
  if (pathname.includes('inspect')) {
    return 'inspect';
  }
  if (pathname.includes('ledger')) {
    return 'ledger';
  }
  return 'home';
}

export default function RootLayout() {
  const pathname = usePathname();

  const currentScreen = routeKey(pathname);
  const deps = createAuditDeps(currentScreen, 'codex-reviewer');

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.bg },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="inspect" />
            <Stack.Screen name="ledger" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <AuditWidget deps={deps} />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
