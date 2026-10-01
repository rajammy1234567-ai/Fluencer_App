import assert from 'assert';
import { 
  getStoreConfigurationStatus, 
  EXPECTED_BUNDLE_ID, 
  EXPECTED_PRODUCT_ID 
} from './src/services/storeVerificationService.js';
import { isUserBlocked, getBlockDetails } from './src/utils/moderation.js';

console.log('🧪 Starting Readiness Fixes Offline Verification Tests...\n');

// Test 1: App Identity and Store Product ID
console.log('Test 1: App Identity & Store Product ID');
assert.strictEqual(EXPECTED_BUNDLE_ID, 'com.fluencers.app', 'Bundle ID must be com.fluencers.app');
assert.strictEqual(EXPECTED_PRODUCT_ID, 'fluencer_pro_lifetime', 'Product ID must be fluencer_pro_lifetime');
console.log('  ✅ Bundle ID and Product ID constants verified.');

// Test 2: Store Configuration Diagnostic Status
console.log('\nTest 2: Store Configuration Diagnostic Status');
const status = getStoreConfigurationStatus();
assert.ok(status.apple, 'Apple store status must be defined');
assert.ok(status.google, 'Google store status must be defined');
console.log('  Apple Status:', status.apple.status, '| Configured:', status.apple.configured);
console.log('  Google Status:', status.google.status, '| Configured:', status.google.configured);
if (!status.apple.configured) {
  assert.strictEqual(status.apple.status, 'BLOCKED', 'Unconfigured Apple credentials must report BLOCKED');
  assert.ok(status.apple.missingKeys.length > 0, 'Must report missing Apple keys');
}
if (!status.google.configured) {
  assert.strictEqual(status.google.status, 'BLOCKED', 'Unconfigured Google credentials must report BLOCKED');
  assert.ok(status.google.missingKeys.length > 0, 'Must report missing Google keys');
}
console.log('  ✅ Store Configuration Diagnostic status successfully identifies unconfigured keys.');

// Test 3: UGC Moderation Logic Structure
console.log('\nTest 3: UGC Moderation Helper Exports');
assert.strictEqual(typeof isUserBlocked, 'function', 'isUserBlocked must be a function');
assert.strictEqual(typeof getBlockDetails, 'function', 'getBlockDetails must be a function');
console.log('  ✅ Moderation helper functions verified.');

console.log('\n🎉 ALL READINESS LOGIC TESTS PASSED SUCCESSFULLY!');
