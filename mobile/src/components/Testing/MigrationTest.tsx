import React from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage, SECURE_STORAGE_KEYS } from '../../services/secureStorage';

/**
 * TEMPORARY TESTING COMPONENT
 * Use this to test AsyncStorage → SecureStorage migration
 *
 * DELETE THIS FILE BEFORE PRODUCTION DEPLOYMENT
 */
export function MigrationTest() {
  const [status, setStatus] = React.useState<string>('Ready to test');

  /**
   * Step 1: Create old AsyncStorage keys (simulate existing user)
   */
  const setupOldKeys = async () => {
    try {
      setStatus('Creating old AsyncStorage keys...');

      await AsyncStorage.setItem('indelible_zklogin_ephemeral_key', 'TEST_EPHEMERAL_12345');
      await AsyncStorage.setItem('indelible_zklogin_max_epoch', '999999');
      await AsyncStorage.setItem('indelible_zklogin_randomness', 'TEST_RANDOMNESS_67890');
      await AsyncStorage.setItem('indelible_sui_wallet_address', '0xTEST_OLD_ADDRESS_ABC123');

      setStatus('✅ Old keys created in AsyncStorage');
      Alert.alert('Success', 'Old AsyncStorage keys created. Now test migration!');
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  /**
   * Step 2: Trigger migration (simulates app restart)
   */
  const testMigration = async () => {
    try {
      setStatus('Testing migration...');

      // Import the migration logic from zkLogin
      const { zkLoginService } = await import('../../services/zkLogin');

      // This would normally happen automatically on app start
      // We're calling it manually for testing
      await (zkLoginService as any).migrateOldStorageKeys();

      setStatus('✅ Migration triggered. Checking results...');

      // Verify migration worked
      const ephemeral = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL);
      const address = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS);

      // Check old keys are deleted
      const oldEphemeral = await AsyncStorage.getItem('indelible_zklogin_ephemeral_key');
      const oldAddress = await AsyncStorage.getItem('indelible_sui_wallet_address');

      if (ephemeral && address && !oldEphemeral && !oldAddress) {
        setStatus('✅ MIGRATION SUCCESS!\n' +
          `Ephemeral: ${ephemeral.substring(0, 20)}...\n` +
          `Address: ${address}\n` +
          `Old keys deleted: YES`);
        Alert.alert('Migration Success!',
          'Keys migrated to SecureStorage and old keys deleted.');
      } else {
        setStatus(`⚠️ MIGRATION ISSUE:\n` +
          `New ephemeral: ${ephemeral ? 'YES' : 'NO'}\n` +
          `New address: ${address ? 'YES' : 'NO'}\n` +
          `Old ephemeral deleted: ${!oldEphemeral ? 'YES' : 'NO'}\n` +
          `Old address deleted: ${!oldAddress ? 'YES' : 'NO'}`);
      }
    } catch (error) {
      setStatus(`❌ Migration error: ${error}`);
    }
  };

  /**
   * Step 3: Verify SecureStorage contents
   */
  const checkSecureStorage = async () => {
    try {
      setStatus('Checking SecureStorage...');

      const ephemeral = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL);
      const randomness = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_RANDOMNESS);
      const maxEpoch = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_MAX_EPOCH);
      const address = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS);

      setStatus(`SecureStorage Contents:\n` +
        `Ephemeral: ${ephemeral ? ephemeral.substring(0, 20) + '...' : 'NOT FOUND'}\n` +
        `Randomness: ${randomness ? randomness.substring(0, 20) + '...' : 'NOT FOUND'}\n` +
        `Max Epoch: ${maxEpoch || 'NOT FOUND'}\n` +
        `Address: ${address || 'NOT FOUND'}`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  /**
   * Step 4: Clear all storage (reset test)
   */
  const clearAll = async () => {
    try {
      setStatus('Clearing all storage...');

      // Clear AsyncStorage
      await AsyncStorage.removeItem('indelible_zklogin_ephemeral_key');
      await AsyncStorage.removeItem('indelible_zklogin_max_epoch');
      await AsyncStorage.removeItem('indelible_zklogin_randomness');
      await AsyncStorage.removeItem('indelible_sui_wallet_address');

      // Clear SecureStorage
      await SecureStorage.deleteSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL);
      await SecureStorage.deleteSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_RANDOMNESS);
      await SecureStorage.deleteSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_MAX_EPOCH);
      await SecureStorage.deleteSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS);

      setStatus('✅ All storage cleared. Ready for new test.');
      Alert.alert('Cleared', 'All storage cleared. Ready for testing!');
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Migration Test</Text>
      <Text style={styles.warning}>⚠️ TESTING ONLY - DELETE BEFORE PRODUCTION</Text>

      <Text style={styles.status}>{status}</Text>

      <View style={styles.buttonContainer}>
        <Button title="1. Setup Old Keys" onPress={setupOldKeys} />
        <Button title="2. Test Migration" onPress={testMigration} />
        <Button title="3. Check SecureStorage" onPress={checkSecureStorage} />
        <Button title="4. Clear All" onPress={clearAll} color="red" />
      </View>

      <Text style={styles.instructions}>
        {'\n'}Test Steps:{'\n'}
        1. Tap "Setup Old Keys" (simulates existing user){'\n'}
        2. Tap "Test Migration" (triggers migration logic){'\n'}
        3. Tap "Check SecureStorage" (verify keys migrated){'\n'}
        4. Tap "Clear All" when done testing
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  warning: {
    fontSize: 12,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    minHeight: 100,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  buttonContainer: {
    gap: 10,
  },
  instructions: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
});
