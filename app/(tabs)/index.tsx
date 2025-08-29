import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { tintColorLight } from '@/constants/Colors';
import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<Contacts.PermissionStatus | null>(null);

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
      Alert.alert('Error', 'Failed to check permission status');
    }
  };

  const requestContactPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        Alert.alert('Success', 'Contact permission granted!');
        return true;
      } else if (status === 'denied') {
        Alert.alert('Permission Denied', 'Contact access was denied');
        return false;
      } else if (status === 'undetermined') {
        Alert.alert('Permission Undetermined', 'Permission status is undetermined');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', 'Failed to request permission');
      return false;
    }
  };

  const readContacts = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.getPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant contact permission first');
        setLoading(false);
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      if (data.length > 0) {
        setContacts(data);
        Alert.alert('Success', `Loaded ${data.length} contacts`);
      } else {
        Alert.alert('No Contacts', 'No contacts found on device');
      }
    } catch (error) {
      console.error('Error reading contacts:', error);
      Alert.alert('Error', 'Failed to read contacts');
    }
    setLoading(false);
  };

  const convertContactsToCSV = (contactsData: Contacts.Contact[]) => {
    const headers = ['Name', 'First Name', 'Last Name', 'Phone', 'Email', 'Company'];
    const csvContent = [headers.join(',')];

    contactsData.forEach(contact => {
      const name = contact.name || '';
      const firstName = contact.firstName || '';
      const lastName = contact.lastName || '';
      const phone = contact.phoneNumbers && contact.phoneNumbers.length > 0
        ? contact.phoneNumbers.map(p => p.number).join('; ')
        : '';
      const email = contact.emails && contact.emails.length > 0
        ? contact.emails.map(e => e.email).join('; ')
        : '';
      const company = contact.company || '';

      const escapeCSV = (field: string) => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      };

      const row = [
        escapeCSV(name),
        escapeCSV(firstName),
        escapeCSV(lastName),
        escapeCSV(phone),
        escapeCSV(email),
        escapeCSV(company)
      ];

      csvContent.push(row.join(','));
    });

    return csvContent.join('\n');
  };

  const downloadContactsAsCSV = async () => {
    setDownloading(true);
    try {
      const csvData = convertContactsToCSV(contacts);
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `contacts_${currentDate}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const sharingAvailable = await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Save Contacts CSV',
        });

        Alert.alert(
          'Success',
          `Contacts exported successfully!\n\nFile: ${filename}\nContacts: ${contacts.length}`,
          [
            {
              text: 'OK',
              onPress: () => console.log('CSV download completed')
            }
          ]
        );
      } else {
        Alert.alert(
          'Export Complete',
          `Contacts saved to:\n${fileUri}\n\nContacts exported: ${contacts.length}`,
          [
            { text: 'OK' }
          ]
        );
      }

    } catch (error) {
      console.error('Error downloading contacts:', error);
      Alert.alert('Error', 'Failed to export contacts to CSV');
    }
    setDownloading(false);
  };

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const isContactPermissionsAllowed = permissionStatus === Contacts.PermissionStatus.GRANTED;


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
        {isContactPermissionsAllowed && !loading && contacts.length === 0 && <Button onPress={readContacts} title='Read Contacts' color={tintColorLight} />}
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Save & Backup</ThemedText>
        <ThemedText>
          {`Store your contacts in a secure format, ready to restore anytime.`}
        </ThemedText>
        {isContactPermissionsAllowed && contacts.length > 0 && <Button disabled={contacts.length === 0} title={`Save All ${contacts.length} Contacts`} onPress={downloadContactsAsCSV} color={tintColorLight} />}
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
