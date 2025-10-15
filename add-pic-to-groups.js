// Add PIC to groups that don't have one
const fs = require('fs');
const path = require('path');

const groupsPath = 'C:\\classifyMail\\AssignmentData\\Groups\\';

// Default PIC assignments based on group names
const picAssignments = {
  'Install Agent': {
    pic: 'Taegu Lee',
    picEmail: 'taegulee@samsung.com'
  },
  'Galaxy Store': {
    pic: 'Julie Yang',
    picEmail: 'julie.yang@samsung.com'
  },
  'Install Agent|Galaxy store': {
    pic: 'Minsu Kim',
    picEmail: 'minsu76.kim@samsung.com'
  },
  'Seller Review': {
    pic: 'David Bitton',
    picEmail: 'david.bitton@samsung.com'
  },
  'Test Group': {
    pic: 'Test User',
    picEmail: 'test@example.com'
  }
};

console.log('🔧 Adding PIC to groups...\n');

const files = fs.readdirSync(groupsPath).filter(f => f.endsWith('.json'));

let updatedCount = 0;
let skippedCount = 0;

files.forEach(file => {
  const filePath = path.join(groupsPath, file);
  const group = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Skip if already has PIC
  if (group.pic && group.picEmail) {
    console.log(`⏭️  SKIP: "${group.name}" already has PIC: ${group.pic}`);
    skippedCount++;
    return;
  }
  
  // Check if we have PIC assignment for this group
  const picInfo = picAssignments[group.name];
  
  if (picInfo) {
    group.pic = picInfo.pic;
    group.picEmail = picInfo.picEmail;
    
    fs.writeFileSync(filePath, JSON.stringify(group, null, 2));
    console.log(`✅ UPDATED: "${group.name}"`);
    console.log(`   PIC: ${picInfo.pic} (${picInfo.picEmail})\n`);
    updatedCount++;
  } else {
    console.log(`⚠️  NO MAPPING: "${group.name}" - skipping`);
    skippedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount} groups`);
console.log(`   ⏭️  Skipped: ${skippedCount} groups`);
console.log(`\n💡 Auto-assign should now work for updated groups!`);
console.log(`   Wait 10 seconds for next polling cycle...`);
