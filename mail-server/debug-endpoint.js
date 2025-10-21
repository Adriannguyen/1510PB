// Debug script to examine the exact content of the move-to-review endpoint
const fs = require('fs');
const path = require('path');

console.log('🔍 Debug: Extracting exact endpoint code...\n');

const serverPath = path.join(__dirname, 'server.js');
const serverContent = fs.readFileSync(serverPath, 'utf8');

// Find the move-to-review endpoint with a more specific pattern
const startMarker = 'app.post("/api/move-to-review"';
const startIndex = serverContent.indexOf(startMarker);

if (startIndex === -1) {
    console.log('❌ Could not find start of endpoint');
    process.exit(1);
}

// Find the end of the endpoint (next app.post or end of function)
let endIndex = startIndex;
let braceCount = 0;
let inString = false;
let stringChar = '';
let foundStart = false;

for (let i = startIndex; i < serverContent.length; i++) {
    const char = serverContent[i];
    
    if (!inString) {
        if (char === '"' || char === "'") {
            inString = true;
            stringChar = char;
        } else if (char === '{') {
            if (!foundStart) {
                foundStart = true;
            }
            braceCount++;
        } else if (char === '}') {
            braceCount--;
            if (foundStart && braceCount === 0) {
                // Find the end of this statement (usually a semicolon or next app.post)
                for (let j = i + 1; j < Math.min(i + 100, serverContent.length); j++) {
                    if (serverContent.substring(j, j + 7) === 'app.post' || 
                        serverContent.substring(j, j + 8) === 'app.get' ||
                        serverContent.substring(j, j + 9) === 'app.put' ||
                        serverContent.substring(j, j + 10) === 'app.delete') {
                        endIndex = j;
                        break;
                    }
                    if (serverContent[j] === '\n' && serverContent[j + 1] === '\n') {
                        endIndex = j + 1;
                        break;
                    }
                }
                if (endIndex === startIndex) {
                    endIndex = i + 1;
                }
                break;
            }
        }
    } else {
        if (char === stringChar && serverContent[i - 1] !== '\\') {
            inString = false;
        }
    }
}

const endpointCode = serverContent.substring(startIndex, endIndex);

console.log('📄 Extracted endpoint code:');
console.log('=' .repeat(80));
console.log(endpointCode);
console.log('=' .repeat(80));

// Now check for specific patterns
console.log('\n🔍 Pattern Analysis:');

const patterns = [
    { name: 'targetReviewFolder = "processed"', pattern: /targetReviewFolder\s*=\s*["']processed["']/ },
    { name: 'shouldMarkAsReplied = true', pattern: /shouldMarkAsReplied\s*=\s*true/ },
    { name: 'isReplied: shouldMarkAsReplied', pattern: /isReplied\s*:\s*shouldMarkAsReplied/ },
    { name: 'processedDate', pattern: /processedDate/ },
    { name: 'MAIL_DATA_PATH, "ReviewMail"', pattern: /MAIL_DATA_PATH,\s*["']ReviewMail["']/ },
    { name: 'reviewMailTargetPath', pattern: /reviewMailTargetPath/ }
];

patterns.forEach(({ name, pattern }) => {
    const match = endpointCode.match(pattern);
    console.log(`   ${match ? '✅' : '❌'} ${name}`);
    if (match) {
        console.log(`      Found: ${match[0]}`);
    }
});

console.log('\n🎯 Key findings:');
if (endpointCode.includes('targetReviewFolder = "processed"')) {
    console.log('   ✅ targetReviewFolder is set to "processed"');
}

if (endpointCode.includes('shouldMarkAsReplied = true')) {
    console.log('   ✅ shouldMarkAsReplied is set to true');
}

if (endpointCode.includes('isReplied: shouldMarkAsReplied')) {
    console.log('   ✅ isReplied uses shouldMarkAsReplied (which is true)');
}

if (endpointCode.includes('MAIL_DATA_PATH, "ReviewMail"')) {
    console.log('   ✅ Uses ReviewMail path construction');
}
