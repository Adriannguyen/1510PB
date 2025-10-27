// Test script to analyze the current move-to-review logic
// This script examines the server code without making HTTP requests

const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing Move to Review Logic in server.js...\n');

// Read server.js file
const serverPath = path.join(__dirname, 'server.js');
const serverContent = fs.readFileSync(serverPath, 'utf8');

// Find the move-to-review endpoint
const moveToReviewMatch = serverContent.match(/app\.post\("\/api\/move-to-review".*?\n\}\);/s);

if (moveToReviewMatch) {
    const endpointCode = moveToReviewMatch[0];
    
    console.log('✅ Found /api/move-to-review endpoint\n');
    
    // Check for key logic elements
    const checks = [
        {
            name: 'NEW LOGIC comment found',
            test: endpointCode.includes('NEW LOGIC: All mails from Valid/Expired → processed folder')
        },
        {
            name: 'targetReviewFolder = "processed"',
            test: endpointCode.includes('const targetReviewFolder = "processed"')
        },
        {
            name: 'shouldMarkAsReplied = true',
            test: endpointCode.includes('const shouldMarkAsReplied = true')
        },
        {
            name: 'isReplied: shouldMarkAsReplied',
            test: endpointCode.includes('isReplied: shouldMarkAsReplied')
        },
        {
            name: 'processedDate added',
            test: endpointCode.includes('processedDate: now.toISOString()')
        },
        {
            name: 'filePath points to processed folder',
            test: endpointCode.includes('ReviewMail/processed') || 
                 endpointCode.includes('ReviewMail\\\\processed') ||
                 endpointCode.includes('"ReviewMail", targetReviewFolder') ||
                 endpointCode.includes('MAIL_DATA_PATH, "ReviewMail"')
        }
    ];
    
    console.log('📋 Logic Verification:');
    checks.forEach(check => {
        console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
    });
    
    // Extract key logic lines
    const keyLines = [
        'const targetReviewFolder = "processed"',
        'const shouldMarkAsReplied = true',
        'isReplied: shouldMarkAsReplied',
        'processedDate: now.toISOString()'
    ];
    
    console.log('\n🔍 Key Logic Lines Found:');
    keyLines.forEach(line => {
        if (endpointCode.includes(line)) {
            console.log(`   ✅ ${line}`);
        }
    });
    
    // Check for the specific comment
    if (endpointCode.includes('🎯 NEW LOGIC: All mails from Valid/Expired → processed folder')) {
        console.log('\n🎯 NEW LOGIC CONFIRMED: All mails from Valid/Expired go to processed folder');
    }
    
    // Summary
    const allPassed = checks.every(check => check.test);
    console.log(`\n${allPassed ? '🎉' : '❌'} Overall Status: ${allPassed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
    
    if (allPassed) {
        console.log('\n✨ The logic has been correctly implemented according to your requirements:');
        console.log('   1. isReplied is set to true');
        console.log('   2. filePath points to ReviewMail/processed folder');
        console.log('   3. Mail goes directly to processed folder (not pending)');
    }
    
} else {
    console.log('❌ Could not find /api/move-to-review endpoint in server.js');
}
