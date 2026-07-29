import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isReloading: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 Global Mobile App Error Boundary Caught Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRestart = (targetRoute = '/(brand-tabs)/home') => {
    this.setState({ isReloading: true });
    setTimeout(() => {
      this.setState({ hasError: false, error: null, errorInfo: null, isReloading: false });
      try {
        router.replace(targetRoute);
      } catch (e) {
        console.log('Error boundary redirect fallback:', e);
      }
    }, 400);
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={['#FFFFFF', '#0f172a']}
            style={styles.gradient}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
              <View style={styles.card}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="shield-alert" size={56} color="#38bdf8" />
                </View>
                <Text style={styles.title}>Fluencer Mobile Safeguard</Text>
                <Text style={styles.subtitle}>
                  Something unexpected happened, but your data and wallet are completely safe!
                </Text>

                {/* Crash Diagnostics Viewer */}
                {this.state.error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorHeader}>⚠️ Error Details:</Text>
                    <Text style={styles.errorText}>
                      {this.state.error.toString()}
                    </Text>
                    {this.state.errorInfo?.componentStack ? (
                      <Text style={styles.stackText} numberOfLines={8}>
                        {this.state.errorInfo.componentStack.trim()}
                      </Text>
                    ) : null}
                  </View>
                )}

                {/* Loader during Reload */}
                {this.state.isReloading ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#38bdf8" />
                    <Text style={styles.loaderText}>Restoring App State...</Text>
                  </View>
                ) : (
                  <View style={{ width: '100%', gap: 10 }}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => this.handleRestart('/(brand-tabs)/home')}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Reload Screen (Home)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#334155' }]}
                      onPress={() => this.handleRestart('/(brand-tabs)/profile')}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="account" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Open Profile</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
    color: 'rgba(255,255,255,0.45)',
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
  errorBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  errorHeader: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stackText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loaderText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GlobalErrorBoundary;
