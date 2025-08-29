import { Alert } from "react-native";
import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system';

export const requestContactPermission = async () => {
    try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            Alert.alert('Success', 'Contact permission granted!');
            return status;
        } else if (status === 'denied') {
            Alert.alert('Permission Denied', 'Contact access was denied');
            return status;
        } else if (status === 'undetermined') {
            Alert.alert('Permission Undetermined', 'Permission status is undetermined');
            return status;
        }
    } catch (error) {
        console.error('Error requesting permission:', error);
        Alert.alert('Error', 'Failed to request permission');
        return null;
    }
};

export const checkPermissionStatus = async () => {
    try {
        const { status } = await Contacts.getPermissionsAsync();
        return status;
    } catch (error) {
        console.error('Error checking permission status:', error);
        Alert.alert('Error', 'Failed to check permission status');
        return null;
    }
};

export const readContacts = async (setLoading: React.Dispatch<React.SetStateAction<boolean>>, setContacts: React.Dispatch<React.SetStateAction<Contacts.Contact[]>>) => {
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
    } finally {
        setLoading(false);
    }
};

export const convertContactsToVCF = (contactsData: Contacts.Contact[]) => {
    let vcfContent = "";

    contactsData.forEach((contact) => {
        const name = contact.name || "";
        const firstName = contact.firstName || "";
        const lastName = contact.lastName || "";
        const phoneNumbers =
            contact.phoneNumbers && contact.phoneNumbers.length > 0
                ? contact.phoneNumbers.map((p) => p.number)
                : [];
        const email =
            contact.emails && contact.emails.length > 0
                ? contact.emails.map((e) => e.email).join(";")
                : "";
        const company = contact.company || "";

        vcfContent += "BEGIN:VCARD\n";
        vcfContent += "VERSION:3.0\n";
        vcfContent += `FN:${name}\n`;
        vcfContent += `N:${lastName};${firstName};;;\n`;

        const uniquePhones = Array.from(new Set(phoneNumbers.map((n) => n?.trim())));
        uniquePhones.forEach((num) => {
            if (num) {
                vcfContent += `TEL;TYPE=CELL:${num}\n`;
            }
        });

        if (email) {
            email.split(";").forEach((mail) => {
                vcfContent += `EMAIL:${mail}\n`;
            });
        }

        if (company) {
            vcfContent += `ORG:${company}\n`;
        }

        vcfContent += "END:VCARD\n";
    });

    return vcfContent;
};

export const downloadContactsAsvcf = async (setDownloading: React.Dispatch<React.SetStateAction<boolean>>, contacts: Contacts.Contact[]) => {
    setDownloading(true);
    try {
        const vcfData = convertContactsToVCF(contacts);
        const currentDate = new Date().toISOString().split("T")[0];
        const filename = `contacts_${currentDate}.vcf`;

        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permission.granted) {
            const directoryUri = permission.directoryUri;

            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                directoryUri,
                filename,
                "text/x-vcard"
            );
            await FileSystem.writeAsStringAsync(fileUri, vcfData, {
                encoding: FileSystem.EncodingType.UTF8,
            });
            Alert.alert("Success", `Contacts saved as ${filename}`);
        } else {
            Alert.alert("Permission denied", "Storage access not granted.");
        }
    } catch (error) {
        console.error("Error downloading contacts:", error);
        Alert.alert("Error", "Failed to export contacts to vcf");
    }
    setDownloading(false);
};