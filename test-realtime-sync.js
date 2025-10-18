/**
 * 🧪 Test Real-time File Sync
 * 
 * Script này test khả năng real-time sync khi thêm/sửa/xóa file thủ công
 * 
 * Usage: node test-realtime-sync.js
 */

const fs = require('fs');
const path = require('path');

const MAIL_DATA_PATH = 'C:\\classifyMail';
const TEST_FOLDER = path.join(MAIL_DATA_PATH, 'DungHan', 'mustRep');

console.log('🧪 Testing Real-time File Sync\n');
console.log('📋 Make sure:');
console.log('   1. Mail server is running (npm run start:server)');
console.log('   2. Frontend is running (npm start)');
console.log('   3. Browser is open at http://localhost:3000');
console.log('   4. Browser console is open (F12)\n');

// Ensure test folder exists
if (!fs.existsSync(TEST_FOLDER)) {
  console.log(`❌ Folder not found: ${TEST_FOLDER}`);
  console.log('   Run: npm run setup:classifyMail');
  process.exit(1);
}

console.log('✅ Starting tests in 3 seconds...\n');
console.log('👀 Watch your browser - UI should update automatically!\n');

setTimeout(() => {
  runTests();
}, 3000);

async function runTests() {
  try {
    // Test 1: Add new file
    console.log('═══════════════════════════════════════════');
    console.log('Test 1: Adding new file...');
    console.log('═══════════════════════════════════════════');
    
    const testFile1 = path.join(TEST_FOLDER, 'RealtimeTest-Add.json');
    const mailData1 = {
      Subject: 'Real-time Sync Test - File Added',
      From: 'test-realtime@example.com',
      Type: 'To',
      Date: [new Date().toISOString().split('T')[0], new Date().toTimeString().split(' ')[0].substring(0, 5)],
      'Check rep': false,
      Status: 'New'
    };
    
    fs.writeFileSync(testFile1, JSON.stringify(mailData1, null, 2));
    console.log(`✅ Created: ${path.basename(testFile1)}`);
    console.log('👀 Check browser - mail should appear automatically!\n');
    
    await sleep(5000);
    
    // Test 2: Modify file
    console.log('═══════════════════════════════════════════');
    console.log('Test 2: Modifying file...');
    console.log('═══════════════════════════════════════════');
    
    mailData1.Subject = 'Real-time Sync Test - File MODIFIED ✏️';
    mailData1.Status = 'Updated';
    fs.writeFileSync(testFile1, JSON.stringify(mailData1, null, 2));
    console.log(`✅ Modified: ${path.basename(testFile1)}`);
    console.log('👀 Check browser - mail should update automatically!\n');
    
    await sleep(5000);
    
    // Test 3: Add another file
    console.log('═══════════════════════════════════════════');
    console.log('Test 3: Adding second file...');
    console.log('═══════════════════════════════════════════');
    
    const testFile2 = path.join(TEST_FOLDER, 'RealtimeTest-Second.json');
    const mailData2 = {
      Subject: 'Real-time Sync Test - Second Mail',
      From: 'linkedin@example.com',
      Type: 'CC',
      Date: [new Date().toISOString().split('T')[0], new Date().toTimeString().split(' ')[0].substring(0, 5)],
      'Check rep': false,
      Status: 'New'
    };
    
    fs.writeFileSync(testFile2, JSON.stringify(mailData2, null, 2));
    console.log(`✅ Created: ${path.basename(testFile2)}`);
    console.log('👀 Check browser - second mail should appear!\n');
    
    await sleep(5000);
    
    // Test 4: Delete first file
    console.log('═══════════════════════════════════════════');
    console.log('Test 4: Deleting file...');
    console.log('═══════════════════════════════════════════');
    
    fs.unlinkSync(testFile1);
    console.log(`✅ Deleted: ${path.basename(testFile1)}`);
    console.log('👀 Check browser - first mail should disappear!\n');
    
    await sleep(5000);
    
    // Test 5: Clean up
    console.log('═══════════════════════════════════════════');
    console.log('Test 5: Cleanup...');
    console.log('═══════════════════════════════════════════');
    
    if (fs.existsSync(testFile2)) {
      fs.unlinkSync(testFile2);
      console.log(`✅ Cleaned up: ${path.basename(testFile2)}`);
    }
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  🎉 ALL TESTS COMPLETED!              ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    console.log('📊 Expected Results:');
    console.log('   ✅ Mail appeared when file was added');
    console.log('   ✅ Mail updated when file was modified');
    console.log('   ✅ Second mail appeared');
    console.log('   ✅ Mail disappeared when file was deleted');
    console.log('   ✅ NO F5 needed!\n');
    
    console.log('🔍 Check Browser Console for:');
    console.log('   • "🔄 Mails updated: {type: \'fileAdded\', ...}"');
    console.log('   • "🔄 Mails updated: {type: \'fileChanged\', ...}"');
    console.log('   • "🔄 Mails updated: {type: \'fileDeleted\', ...}"');
    console.log('   • "✅ Đã load X mail từ C:\\\\classifyMail\\\\"\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
