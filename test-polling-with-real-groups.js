// Test với sender có trong group
const fs = require('fs');

const id = Date.now();

// Test với các sender khác nhau
const testMails = [
  {
    From: 'duongg@gmail.com', // Galaxy Store group (nhưng không có PIC)
    Subject: 'Test duongg@gmail.com',
    expected: 'Galaxy Store (but no PIC)'
  },
  {
    From: 'play-bd-ops@google.com', // Install Agent group (không có PIC)
    Subject: 'Test play-bd-ops@google.com',
    expected: 'Install Agent (but no PIC)'
  },
  {
    From: 'seller.cs@partner.samsung.com', // Seller Review (không có PIC)
    Subject: 'Test seller.cs@partner.samsung.com',
    expected: 'Seller Review (but no PIC)'
  }
];

console.log('📝 Creating test mails with REAL group members...\n');

testMails.forEach((test, index) => {
  const mail = {
    id: `polling-test-${id}-${index}`,
    Subject: test.Subject,
    From: test.From,
    To: 'test@company.com',
    Date: ['2025-10-09', '21:00'],
    Type: 'To',
    Status: 'New',
    SummaryContent: `Test polling auto-assign with ${test.From}`
  };

  const filePath = `C:\\classifyMail\\DungHan\\mustRep\\polling-test-${id}-${index}.json`;
  fs.writeFileSync(filePath, JSON.stringify(mail, null, 2));
  console.log(`✅ Created: ${test.Subject}`);
  console.log(`   From: ${test.From}`);
  console.log(`   Expected: ${test.expected}`);
  console.log(`   File: polling-test-${id}-${index}.json\n`);
});

console.log('⏳ Wait 15 seconds for next polling cycle...\n');
console.log('👀 Watch server logs for:');
console.log('   - "✅ Polling: Auto-assigned..."');
console.log('   OR');
console.log('   - "⚠️ Group \"...\" has no PIC assigned"\n');

setTimeout(() => {
  console.log('🔍 Checking results...\n');
  
  testMails.forEach((test, index) => {
    const filePath = `C:\\classifyMail\\DungHan\\mustRep\\polling-test-${id}-${index}.json`;
    try {
      const mail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (mail.assignedTo) {
        console.log(`✅ SUCCESS: ${test.From}`);
        console.log(`   Assigned to: ${mail.assignedTo.picName}`);
        console.log(`   Group: ${mail.assignedTo.groupName}\n`);
      } else {
        console.log(`❌ FAILED: ${test.From}`);
        console.log(`   Not assigned (group may not have PIC)\n`);
      }
      
      // Cleanup
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`❌ Error checking ${test.From}:`, error.message);
    }
  });
  
  console.log('🗑️  Test files cleaned up');
  console.log('\n💡 TIP: Add PIC to groups in C:\\classifyMail\\AssignmentData\\Groups\\');
  console.log('   Each group JSON should have: "pic": "PIC Name", "picEmail": "pic@email.com"');
}, 15000);
