// Test auto-assign functionality for ALL folders
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3002';
const MAIL_DATA_PATH = 'C:\\classifyMail';

// Test mail data
const testMails = [
  {
    folder: 'DungHan/mustRep',
    mail: {
      id: 'test-valid-mustrep-' + Date.now(),
      Subject: 'Test Auto-Assign Valid Mail (Must Reply)',
      From: 'a@gmail.com', // Should match Marketing Team
      To: 'test@company.com',
      Date: ['2025-10-09', '10:00'],
      Type: 'To',
      Status: 'New',
      SummaryContent: 'Test auto-assign for valid mail that must be replied'
    }
  },
  {
    folder: 'DungHan/rep',
    mail: {
      id: 'test-valid-rep-' + Date.now(),
      Subject: 'Test Auto-Assign Valid Mail (Replied)',
      From: 'b@gmail.com', // Should match Marketing Team
      To: 'test@company.com',
      Date: ['2025-10-09', '11:00'],
      Type: 'To',
      Status: 'Read',
      SummaryContent: 'Test auto-assign for valid mail that has been replied'
    }
  },
  {
    folder: 'QuaHan/chuaRep',
    mail: {
      id: 'test-expired-chuarep-' + Date.now(),
      Subject: 'Test Auto-Assign Expired Mail (Not Replied)',
      From: 'c@gmail.com', // Should match Sales Team
      To: 'test@company.com',
      Date: ['2025-08-01', '14:00'],
      Type: 'To',
      Status: 'New',
      SummaryContent: 'Test auto-assign for expired mail not replied'
    }
  },
  {
    folder: 'QuaHan/daRep',
    mail: {
      id: 'test-expired-darep-' + Date.now(),
      Subject: 'Test Auto-Assign Expired Mail (Replied)',
      From: 'd@gmail.com', // Should match Sales Team
      To: 'test@company.com',
      Date: ['2025-08-01', '15:00'],
      Type: 'To',
      Status: 'Read',
      SummaryContent: 'Test auto-assign for expired mail already replied'
    }
  },
  {
    folder: 'ReviewMail/pending',
    mail: {
      id: 'test-review-pending-' + Date.now(),
      Subject: 'Test Auto-Assign Review Mail (Pending)',
      From: 'support@company.com', // Should match Support Team
      To: 'test@company.com',
      Date: ['2025-10-05', '09:00'],
      Type: 'To',
      Status: 'New',
      SummaryContent: 'Test auto-assign for review mail pending'
    }
  },
  {
    folder: 'ReviewMail/processed',
    mail: {
      id: 'test-review-processed-' + Date.now(),
      Subject: 'Test Auto-Assign Review Mail (Processed)',
      From: 'help@company.com', // Should match Support Team
      To: 'test@company.com',
      Date: ['2025-10-05', '10:00'],
      Type: 'To',
      Status: 'Read',
      SummaryContent: 'Test auto-assign for review mail processed'
    }
  }
];

// Function to create test mail file
const createTestMailFile = (folder, mail) => {
  const folderPath = path.join(MAIL_DATA_PATH, folder);
  
  // Create folder if not exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Created folder: ${folderPath}`);
  }

  const fileName = `${mail.id}.json`;
  const filePath = path.join(folderPath, fileName);

  // Write mail file
  fs.writeFileSync(filePath, JSON.stringify(mail, null, 2), 'utf8');
  console.log(`✅ Created test mail: ${folder}/${fileName}`);
  
  return filePath;
};

// Function to check if mail was auto-assigned
const checkMailAssignment = (filePath) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const mailData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (mailData.assignedTo) {
          console.log(`✅ Mail auto-assigned to: ${mailData.assignedTo.picName} (${mailData.assignedTo.groupName})`);
          resolve({ assigned: true, data: mailData.assignedTo });
        } else {
          console.log(`❌ Mail NOT auto-assigned`);
          resolve({ assigned: false });
        }
      } catch (error) {
        console.error(`❌ Error checking assignment:`, error.message);
        resolve({ assigned: false, error: error.message });
      }
    }, 2000); // Wait 2 seconds for auto-assign to complete
  });
};

// Function to delete test mail file
const deleteTestMailFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted test mail: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting file:`, error.message);
  }
};

// Main test function
const runAutoAssignTests = async () => {
  console.log('🧪 Testing Auto-Assign for ALL Folders');
  console.log('======================================\n');

  const results = [];

  for (const testCase of testMails) {
    console.log(`\n📝 Testing: ${testCase.folder}`);
    console.log(`   Sender: ${testCase.mail.From}`);
    console.log(`   Subject: ${testCase.mail.Subject}`);
    
    // Create test mail file
    const filePath = createTestMailFile(testCase.folder, testCase.mail);
    
    // Wait and check if auto-assigned
    const result = await checkMailAssignment(filePath);
    
    results.push({
      folder: testCase.folder,
      sender: testCase.mail.From,
      assigned: result.assigned,
      assignment: result.data || null
    });

    // Clean up
    deleteTestMailFile(filePath);
    
    console.log('---');
  }

  // Print summary
  console.log('\n\n📊 Test Results Summary');
  console.log('========================\n');
  
  const successCount = results.filter(r => r.assigned).length;
  const failCount = results.filter(r => !r.assigned).length;
  
  results.forEach((result, index) => {
    const status = result.assigned ? '✅ PASSED' : '❌ FAILED';
    console.log(`${index + 1}. ${status} - ${result.folder}`);
    if (result.assigned) {
      console.log(`   → Assigned to: ${result.assignment.picName} (${result.assignment.groupName})`);
    } else {
      console.log(`   → Not assigned`);
    }
  });

  console.log(`\n📈 Success Rate: ${successCount}/${results.length} (${((successCount/results.length)*100).toFixed(1)}%)`);
  
  if (failCount > 0) {
    console.log(`\n⚠️  ${failCount} test(s) failed. Check your group configurations.`);
  } else {
    console.log(`\n🎉 All tests passed! Auto-assign working correctly for all folders.`);
  }
};

// Run tests
console.log('Starting auto-assign tests in 2 seconds...');
console.log('Make sure mail-server is running on port 3002\n');

setTimeout(() => {
  runAutoAssignTests().catch(error => {
    console.error('❌ Test failed:', error);
  });
}, 2000);
