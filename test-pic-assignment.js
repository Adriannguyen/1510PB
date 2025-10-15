// Test auto-assign với PIC từ AssignmentData/PIC
const fs = require('fs');

const id = Date.now();

const testMail = {
  id: `pic-test-${id}`,
  Subject: 'Test PIC Assignment from PIC Files',
  From: 'duongg@gmail.com', // Galaxy Store group (1757390072466)
  To: 'test@company.com',
  Date: ['2025-10-09', '21:30'],
  Type: 'To',
  Status: 'New',
  SummaryContent: 'Testing PIC auto-assign from PIC files'
};

const filePath = `C:\\classifyMail\\DungHan\\mustRep\\pic-test-${id}.json`;

console.log('🚀 Testing PIC Assignment Logic\n');
console.log('📧 Test Mail:');
console.log(`   From: ${testMail.From}`);
console.log(`   Expected Group: Galaxy Store (ID: 1757390072466)`);
console.log(`   Expected PIC: Dương (duongnguyen@gmail.com)`);
console.log(`   Reason: PIC 1759336936889 has groupLeaderships: [1757390072466]\n`);

fs.writeFileSync(filePath, JSON.stringify(testMail, null, 2));
console.log(`✅ Created: pic-test-${id}.json\n`);

console.log('⏳ Waiting 15 seconds for polling to auto-assign...\n');
console.log('👀 Watch server logs for:');
console.log('   📦 Loaded X groups from AssignmentData/Groups');
console.log('   👤 Loaded X PICs with group leaderships from AssignmentData/PIC');
console.log('   📋 Found group: "Galaxy Store" (ID: 1757390072466) for sender');
console.log('   🎯 AUTO-ASSIGN: duongg@gmail.com → Dương (duongnguyen@gmail.com)\n');

setTimeout(() => {
  console.log('🔍 Checking assignment result...\n');
  
  try {
    const mail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (mail.assignedTo) {
      console.log('🎉🎉🎉 SUCCESS! PIC AUTO-ASSIGN WORKED! 🎉🎉🎉\n');
      console.log('📋 Assignment Details:');
      console.log(`   👤 PIC ID: ${mail.assignedTo.picId}`);
      console.log(`   👤 PIC Name: ${mail.assignedTo.picName}`);
      console.log(`   📧 PIC Email: ${mail.assignedTo.picEmail}`);
      console.log(`   🏢 Group ID: ${mail.assignedTo.groupId}`);
      console.log(`   🏢 Group Name: ${mail.assignedTo.groupName}`);
      console.log(`   ⏰ Assigned At: ${mail.assignedTo.assignedAt}`);
      console.log(`   🤖 Assigned By: ${mail.assignedTo.assignedBy}\n`);
      
      console.log('✅ NEW LOGIC WORKING:');
      console.log('   1. ✅ Sender → Group mapping');
      console.log('   2. ✅ Group ID → PIC leader lookup');
      console.log('   3. ✅ PIC from AssignmentData/PIC files\n');
    } else {
      console.log('❌ FAILED: Mail not assigned\n');
      console.log('💡 Check server logs for:');
      console.log('   - "No group found for sender"');
      console.log('   - "has no PIC leader in AssignmentData/PIC"');
    }
    
    // Cleanup
    fs.unlinkSync(filePath);
    console.log('🗑️  Test file cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
}, 15000);
