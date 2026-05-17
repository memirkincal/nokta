import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.root}>
        <Text style={styles.title}>Route not found</Text>
        <Text style={styles.body}>The host app still works, but this route does not exist.</Text>
        <Link href="/" style={styles.link}>
          Back home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '900',
  },
  body: {
    color: theme.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  link: {
    color: theme.accent2,
    fontWeight: '800',
  },
});
