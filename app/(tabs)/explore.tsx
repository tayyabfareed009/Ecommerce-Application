import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Platform,
  Linking
} from 'react-native';

// Simple Collapsible Component
const Collapsible = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <View style={styles.collapsible}>
      <TouchableOpacity 
        onPress={() => setIsOpen(!isOpen)} 
        style={styles.collapsibleHeader}
      >
        <Text style={styles.collapsibleTitle}>{title}</Text>
        <Text>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.collapsibleContent}>{children}</View>}
    </View>
  );
};

// Simple ExternalLink Component
const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const handlePress = () => {
    if (Platform.OS === 'web') {
      window.open(href, '_blank');
    } else {
      Linking.openURL(href);
    }
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={styles.link}>{children}</Text>
    </TouchableOpacity>
  );
};

// Main Explore Screen
export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔗</Text>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Explore</Text>
        </View>
        
        <Text style={styles.paragraph}>
          This app includes example code to help you get started.
        </Text>
        
        <Collapsible title="File-based routing">
          <Text style={styles.paragraph}>
            This app has two screens:{' '}
            <Text style={styles.bold}>app/(tabs)/index.tsx</Text> and{' '}
            <Text style={styles.bold}>app/(tabs)/explore.tsx</Text>
          </Text>
          <Text style={styles.paragraph}>
            The layout file in <Text style={styles.bold}>app/(tabs)/_layout.tsx</Text>{' '}
            sets up the tab navigator.
          </Text>
          <ExternalLink href="https://docs.expo.dev/router/introduction">
            Learn more
          </ExternalLink>
        </Collapsible>
        
        <Collapsible title="Android, iOS, and web support">
          <Text style={styles.paragraph}>
            You can open this project on Android, iOS, and the web. To open the web version, press{' '}
            <Text style={styles.bold}>w</Text> in the terminal running this project.
          </Text>
        </Collapsible>
        
        <Collapsible title="Images">
          <Text style={styles.paragraph}>
            For static images, you can use the <Text style={styles.bold}>@2x</Text> and{' '}
            <Text style={styles.bold}>@3x</Text> suffixes to provide files for
            different screen densities
          </Text>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>React Logo</Text>
          </View>
          <ExternalLink href="https://reactnative.dev/docs/images">
            Learn more
          </ExternalLink>
        </Collapsible>
        
        <Collapsible title="Light and dark mode components">
          <Text style={styles.paragraph}>
            This template has light and dark mode support.
          </Text>
          <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
            Learn more
          </ExternalLink>
        </Collapsible>
        
        <Collapsible title="Animations">
          <Text style={styles.paragraph}>
            This template includes an example of an animated component.
          </Text>
          {Platform.OS === 'ios' && (
            <Text style={styles.paragraph}>
              The components provide a parallax effect for the header image.
            </Text>
          )}
        </Collapsible>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 250,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerIcon: {
    fontSize: 310,
    color: '#808080',
    position: 'absolute',
    bottom: -90,
    left: -35,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
  },
  link: {
    color: '#0a7ea4',
    fontSize: 16,
    marginTop: 8,
  },
  collapsible: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  collapsibleContent: {
    padding: 16,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#61dafb',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 8,
  },
  imageText: {
    color: 'white',
    fontWeight: 'bold',
  },
});