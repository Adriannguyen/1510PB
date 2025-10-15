// Simple test for auto-assign - like sender mapping in frontend
const fs = require('fs');
const path = require('path');

const MAIL_DATA_PATH = 'C:\\classifyMail';

console.log('🧪 Simple Auto-Assign Test');
console.log('===========================\n');

// Test mail with sender that should match
const testMail = {
  id: `test-${Date.now()}`,
  Subject: 'Test Simple Auto-Assign',
  From: 'a@gmail.com',  // Should match Marketing Team
  To: 'test@company.com',
  Date: ['2025-10-09', '14:00'],
  Type: 'To',
  Status: 'New',
  SummaryContent: 'Testing simple auto-assign like frontend sender mapping'
};

console.log('📧 Test Mail:');
console.log(`   From: ${testMail.From}`);
console.log(`   Subject: ${testMail.Subject}`);
console.log(`   Expected Group: Marketing Team (a@gmail.com in members)`);
console.log(`   Expected PIC: John Doe\n`);

// Create test mail file
const folderPath = path.join(MAIL_DATA_PATH, 'DungHan', 'mustRep');
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

const fileName = `${testMail.id}.json`;
const filePath = path.join(folderPath, fileName);

console.log(`📝 Creating test mail: ${fileName}`);
fs.writeFileSync(filePath, JSON.stringify(testMail, null, 2), 'utf8');
console.log(`✅ File created at: ${filePath}\n`);

console.log('⏳ Waiting 3 seconds for auto-assign to complete...\n');

// Check after 3 seconds
setTimeout(() => {
  try {
    console.log('🔍 Checking auto-assign result...\n');
    
    const mailData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (mailData.assignedTo) {
      console.log('✅ SUCCESS! Mail was AUTO-ASSIGNED!');
      console.log('📊 Assignment Details:');
      console.log(`   ├─ PIC Name: ${mailData.assignedTo.picName}`);
      console.log(`   ├─ PIC Email: ${mailData.assignedTo.picEmail}`);
      console.log(`   ├─ Group: ${mailData.assignedTo.groupName}`);
      console.log(`   ├─ Assigned By: ${mailData.assignedTo.assignedBy}`);
      console.log(`   └─ Assigned At: ${mailData.assignedTo.assignedAt}`);
      
      if (mailData.assignedTo.picName === 'John Doe') {
        console.log('\n🎉 PERFECT! Assigned to correct PIC (John Doe - Marketing Team)');
      } else {
        console.log(`\n⚠️  WARNING: Expected John Doe but got ${mailData.assignedTo.picName}`);
      }
    } else {
      console.log('❌ FAILED! Mail was NOT auto-assigned');
      console.log('\nTroubleshooting:');
      console.log('1. Is mail-server running? (cd mail-server && npm start)');
      console.log('2. Check server logs for auto-assign messages');
      console.log('3. Verify groups exist in C:\\classifyMail\\AssignmentData\\Groups');
      console.log('4. Check if a@gmail.com is in group members list');
    }
    
    // Clean up
    console.log('\n🗑️  Cleaning up test file...');
    fs.unlinkSync(filePath);
    console.log('✅ Test file deleted\n');
    
  } catch (error) {
    console.error('❌ Error checking result:', error.message);
  }
}, 3000);

console.log('💡 TIP: Watch mail-server console for auto-assign logs:');
console.log('   - "🔍 Auto-assign: Looking for group for sender: a@gmail.com"');
console.log('   - "🎯 AUTO-ASSIGN: a@gmail.com → John Doe (Marketing Team)"');
console.log('   - "✅ Saved auto-assigned mail to..."');
console.log('');
