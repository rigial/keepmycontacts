import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ABOUT_APP from '@/constants/About';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">About KeepMyContacts</ThemedText>
      </ThemedView>
      <ThemedText>Learn how the app works, how your data is handled, and the terms of use.</ThemedText>
      {
        ABOUT_APP.map((data, index) => {
          return (
            <Collapsible key={index} title={data.title}>
              <ThemedText>{data.detail}</ThemedText>
              {
                data?.externalLink && (
                  <ExternalLink href={data?.externalLink}>
                    <ThemedText type="link">{data?.externalTitle}</ThemedText>
                  </ExternalLink>
                )
              }

            </Collapsible>
          )
        })
      }
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
