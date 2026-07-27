import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 Global Mobile App Error Boundary Caught Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    try {
      router.replace('/(brand-tabs)/home');
    } catch (e) {
      console.log('Error boundary redirect:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.gradient}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={styles.card}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="shield-alert" size={56} color="#38bdf8" />
                </View>
                <Text style={styles.title}>Fluencer Mobile Safeguard</Text>
                <Text style={styles.subtitle}>
                  Something unexpected happened, but your data and wallet are completely safe!
                </Text>
                {this.state.error && (
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 8, marginBottom: 20, width: '100%' }}>
                    <Text style={{ color: '#f87171', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                      {this.state.error.toString()}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.button}
                  onPress={this.handleRestart}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Reload Screen</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GlobalErrorBoundary;
