// Simple test - Create mail file directly
const fs = require('fs');
const path = require('path');

const id = Date.now();
const mail = {
  id: `test-${id}`,
  Subject: 'Auto-Assign Test',
  From: 'a@gmail.com',
  To: 'test@company.com',
  Date: ['2025-10-09', '18:30'],
  Type: 'To',
  Status: 'New',
  SummaryContent: 'Testing auto-assign'
};

const filePath = `C:\\classifyMail\\DungHan\\mustRep\\test-${id}.json`;

console.log(`Creating mail: test-${id}.json`);
console.log(`From: ${mail.From}`);

fs.writeFileSync(filePath, JSON.stringify(mail, null, 2));

console.log(`✅ File created!`);
console.log(`\n👀 Watch mail-server console for:`);
console.log(`   - "🔔 FILE ADD EVENT"`);
console.log(`   - "📁 ✅ MATCHED!"`);
console.log(`   - "🎯 Starting auto-assign"`);
console.log(`   - "✅ SUCCESS! Auto-assigned to: John Doe"`);
console.log(`\n⏳ Wait 2 seconds then check file...`);

setTimeout(() => {
  const updatedMail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (updatedMail.assignedTo) {
    console.log(`\n🎉 SUCCESS! Mail was auto-assigned!`);
    console.log(`   PIC: ${updatedMail.assignedTo.picName}`);
    console.log(`   Group: ${updatedMail.assignedTo.groupName}`);
  } else {
    console.log(`\n❌ FAILED! Mail was NOT auto-assigned`);
  }
  
  // Cleanup
  fs.unlinkSync(filePath);
  console.log(`\n🗑️  Test file deleted`);
}, 2500);
