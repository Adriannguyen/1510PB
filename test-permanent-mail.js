// Test - Create mail and KEEP it (don't delete)
const fs = require('fs');

const id = Date.now();
const mail = {
  id: `permanent-test-${id}`,
  Subject: 'Permanent Auto-Assign Test',
  From: 'a@gmail.com',
  To: 'test@company.com',
  Date: ['2025-10-09', '19:00'],
  Type: 'To',
  Status: 'New',
  SummaryContent: 'This mail will NOT be deleted - check manually'
};

const filePath = `C:\\classifyMail\\DungHan\\mustRep\\permanent-test-${id}.json`;

console.log(`\n📝 Creating PERMANENT test mail:`);
console.log(`   File: permanent-test-${id}.json`);
console.log(`   From: ${mail.From}`);
console.log(`   Path: ${filePath}\n`);

fs.writeFileSync(filePath, JSON.stringify(mail, null, 2));

console.log(`✅ File created and will STAY there!`);
console.log(`\n👀 NOW watch mail-server console for:`);
console.log(`   1. "🔔 FILE ADD EVENT: ...permanent-test-${id}.json"`);
console.log(`   2. "📁 ✅ MATCHED! New Valid Mail..."`);
console.log(`   3. "🔍 Auto-assign: Looking for group for sender: a@gmail.com"`);
console.log(`   4. "📦 Loaded X groups..." or "📦 Using default groups"`);
console.log(`   5. "🎯 AUTO-ASSIGN: a@gmail.com → John Doe (Marketing Team)"`);
console.log(`   6. "✅ Saved auto-assigned mail to..."`);

console.log(`\n⏳ Wait 3-5 seconds...`);

setTimeout(() => {
  console.log(`\n🔍 Checking if mail was assigned...`);
  
  try {
    const updatedMail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (updatedMail.assignedTo) {
      console.log(`\n🎉 ✅ SUCCESS! Mail WAS auto-assigned!`);
      console.log(`   📧 Assigned to: ${updatedMail.assignedTo.picName}`);
      console.log(`   🏢 Group: ${updatedMail.assignedTo.groupName}`);
      console.log(`   📧 Email: ${updatedMail.assignedTo.picEmail}`);
      console.log(`   🤖 By: ${updatedMail.assignedTo.assignedBy}`);
      
      // Now delete it
      fs.unlinkSync(filePath);
      console.log(`\n🗑️  Test file deleted (cleanup)`);
    } else {
      console.log(`\n❌ FAILED! Mail was NOT auto-assigned`);
      console.log(`\n🔧 Troubleshooting:`);
      console.log(`   1. Check if you see "🔔 FILE ADD EVENT" in server logs`);
      console.log(`   2. If NO → File watcher is not working`);
      console.log(`   3. If YES but no auto-assign → Check groups configuration`);
      console.log(`\n📁 Mail file kept at: ${filePath}`);
      console.log(`   Delete manually: Remove-Item "${filePath}"`);
    }
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
  }
}, 5000);
