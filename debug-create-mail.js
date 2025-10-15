// Debug script - Create mail and manually check logs
const fs = require('fs');
const path = require('path');

const MAIL_DATA_PATH = 'C:\\classifyMail';

console.log('🐛 DEBUG: Manual Mail Creation for Auto-Assign Test');
console.log('===================================================\n');

const testMail = {
  id: `debug-test-${Date.now()}`,
  Subject: 'DEBUG Test Auto-Assign',
  From: 'a@gmail.com',
  To: 'test@company.com',
  Date: ['2025-10-09', '15:00'],
  Type: 'To',
  Status: 'New',
  SummaryContent: 'Debug test - checking if auto-assign works'
};

const folderPath = path.join(MAIL_DATA_PATH, 'DungHan', 'mustRep');
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
  console.log(`📁 Created folder: ${folderPath}`);
}

const fileName = `${testMail.id}.json`;
const filePath = path.join(folderPath, fileName);

console.log('📧 Creating test mail:');
console.log(`   File: ${fileName}`);
console.log(`   Path: ${filePath}`);
console.log(`   From: ${testMail.From}`);
console.log(`   Subject: ${testMail.Subject}\n`);

fs.writeFileSync(filePath, JSON.stringify(testMail, null, 2), 'utf8');
console.log('✅ Mail file created!\n');

console.log('📋 Mail content:');
console.log(JSON.stringify(testMail, null, 2));
console.log('\n');

console.log('🔍 What to check in mail-server console:');
console.log('=========================================');
console.log('1. Look for: "📁 New Valid Mail (Must Reply) file detected"');
console.log('2. Look for: "🔍 Auto-assign: Looking for group for sender: a@gmail.com"');
console.log('3. Look for: "📦 Loaded X groups from AssignmentData/Groups" or "📦 Using default groups"');
console.log('4. Look for: "🎯 AUTO-ASSIGN: a@gmail.com → John Doe (Marketing Team)"');
console.log('5. Look for: "✅ Saved auto-assigned mail to..."');
console.log('\n');

console.log('⏳ Wait 2-3 seconds, then check the file again:\n');
console.log(`   Get-Content "${filePath}"\n`);
console.log('👁️  Look for "assignedTo" field in the JSON output\n');

console.log('🗑️  To delete test file when done:');
console.log(`   Remove-Item "${filePath}"\n`);
