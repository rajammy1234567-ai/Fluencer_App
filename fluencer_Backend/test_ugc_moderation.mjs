import mongoose from 'mongoose';
import UserBlock from './src/models/UserBlock.js';
import ContentReport from './src/models/ContentReport.js';
import { getTermsPageContent } from './src/termsHtml.js';

console.log('🧪 Starting Offline/Mock UGC Moderation Unit Tests...');

// 1. Verify UserBlock model
const block = new UserBlock({
  blocker_id: new mongoose.Types.ObjectId(),
  blocked_id: new mongoose.Types.ObjectId(),
  reason: 'Harassment in chat'
});
const blockErr = block.validateSync();
if (blockErr) throw new Error('UserBlock validation failed: ' + blockErr.message);
console.log('✅ 1. UserBlock Schema & Validation: PASSED');

// 2. Verify ContentReport model
const report = new ContentReport({
  reporter_id: new mongoose.Types.ObjectId(),
  reported_user_id: new mongoose.Types.ObjectId(),
  content_type: 'message',
  reason: 'harassment',
  details: 'Offensive language in direct message'
});
const reportErr = report.validateSync();
if (reportErr) throw new Error('ContentReport validation failed: ' + reportErr.message);
console.log('✅ 2. ContentReport Schema & Validation: PASSED');

// 3. Verify Invalid Report Reason Rejection
const invalidReport = new ContentReport({
  reporter_id: new mongoose.Types.ObjectId(),
  reported_user_id: new mongoose.Types.ObjectId(),
  content_type: 'invalid_type',
  reason: 'invalid_reason'
});
const invalidErr = invalidReport.validateSync();
if (!invalidErr || !invalidErr.errors['content_type'] || !invalidErr.errors['reason']) {
  throw new Error('ContentReport failed to reject invalid enum values!');
}
console.log('✅ 3. ContentReport Enum Restriction: PASSED');

// 4. Verify Terms & EULA HTML Generation
const termsHtml = getTermsPageContent();
if (!termsHtml.includes('Zero-Tolerance Policy') || !termsHtml.includes('support@fluencer.app') || !termsHtml.includes('EULA')) {
  throw new Error('Terms HTML is missing Apple Guideline 1.2 required clauses!');
}
console.log('✅ 4. EULA & Zero-Tolerance Community Standards HTML: PASSED');

console.log('🎉 All UGC Moderation Backend Tests Passed Successfully!');
