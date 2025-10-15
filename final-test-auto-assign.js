// FINAL TEST: Auto-assign with PIC configured
const fs = require('fs');

const id = Date.now();

const testMail = {
  id: `final-test-${id}`,
  Subject: 'Final Test - Galaxy Store with PIC',
  From: 'duongg@gmail.com', // Galaxy Store group (NOW HAS PIC: Julie Yang)
  To: 'test@company.com',
  Date: ['2025-10-09', '21:00'],
  Type: 'To',
  Status: 'New',
  SummaryContent: 'Testing auto-assign with configured PIC'
};

const filePath = `C:\\classifyMail\\DungHan\\mustRep\\final-test-${id}.json`;

console.log('🚀 Creating test mail for auto-assign...\n');
console.log(`📧 From: ${testMail.From}`);
console.log(`📂 Group: Galaxy Store`);
console.log(`👤 Expected PIC: Julie Yang (julie.yang@samsung.com)\n`);

fs.writeFileSync(filePath, JSON.stringify(testMail, null, 2));
console.log(`✅ Created: final-test-${id}.json\n`);

console.log('⏳ Waiting 15 seconds for polling to auto-assign...\n');

setTimeout(() => {
  console.log('🔍 Checking if auto-assigned...\n');
  
  try {
    const mail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (mail.assignedTo) {
      console.log('🎉🎉🎉 SUCCESS! AUTO-ASSIGN WORKED! 🎉🎉🎉\n');
      console.log('📋 Assignment Details:');
      console.log(`   👤 PIC Name: ${mail.assignedTo.picName}`);
      console.log(`   📧 PIC Email: ${mail.assignedTo.picEmail}`);
      console.log(`   🏢 Group: ${mail.assignedTo.groupName}`);
      console.log(`   ⏰ Assigned At: ${mail.assignedTo.assignedAt}`);
      console.log(`   🤖 Assigned By: ${mail.assignedTo.assignedBy}\n`);
      console.log('✅ FEATURE WORKING PERFECTLY!\n');
    } else {
      console.log('❌ FAILED: Mail not assigned yet\n');
      console.log('💡 Check server logs for errors');
    }
    
    // Cleanup
    fs.unlinkSync(filePath);
    console.log('🗑️  Test file cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
}, 15000);
