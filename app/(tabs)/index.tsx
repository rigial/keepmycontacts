import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { tintColorLight } from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet } from 'react-native';
import { checkPermissionStatus, downloadContactsAsvcf, readContacts, requestContactPermission } from '@/helper/Permisson';
import { Contact, PermissionStatus } from 'expo-contacts';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);

  useEffect(() => {
    async function getPermissionStatus() {
      const status = await checkPermissionStatus();
      setPermissionStatus(status)
    }
    getPermissionStatus();
  }, []);

  const isContactPermissionsAllowed = permissionStatus === PermissionStatus.GRANTED;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<IconSymbol size={200} color={tintColorLight} name="arrow.clockwise.circle.fill" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="subtitle">Welcome to ContactSafe!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Allow Permissions {isContactPermissionsAllowed ? "✅" : "❌"}</ThemedText>
        <ThemedText>
          Grant access to your contacts so we can back them up securely.
        </ThemedText>
        {!isContactPermissionsAllowed && <Button onPress={requestContactPermission} title='Allow Permisson' color={tintColorLight} />}
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Read Contacts {contacts.length > 0 ? "✅" : "❌"}</ThemedText>
        <ThemedText>
          {`We’ll fetch all your contacts safely from your device.`}
        </ThemedText>
        {loading && <ActivityIndicator color={tintColorLight} />}
        {isContactPermissionsAllowed && !loading && contacts.length === 0 && <Button onPress={() => readContacts(setLoading, setContacts)} title='Read Contacts' color={tintColorLight} />}
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Save & Backup</ThemedText>
        <ThemedText>
          {`Store your contacts in a secure format, ready to restore anytime.`}
        </ThemedText>
        {downloading && <ActivityIndicator color={tintColorLight} />}
        {!downloading && isContactPermissionsAllowed && contacts.length > 0 && <Button disabled={contacts.length === 0} title={`Save All ${contacts.length} Contacts`} onPress={() => downloadContactsAsvcf(setDownloading, contacts)} color={tintColorLight} />}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerImage: {
    color: tintColorLight,
    bottom: -35,
    left: 0,
    position: 'absolute',
  },
});
