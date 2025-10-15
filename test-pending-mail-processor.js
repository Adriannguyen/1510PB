const fs = require('fs');
const path = require('path');

// Configuration
const PENDING_FOLDER = 'C:\\classifyMail\\ReviewMail\\pending';

/**
 * Process pending mail files and update their status based on sent time
 */
function processPendingMails() {
    console.log('Starting to process pending mails...');
    
    // Check if pending folder exists
    if (!fs.existsSync(PENDING_FOLDER)) {
        console.error(`Pending folder does not exist: ${PENDING_FOLDER}`);
        return;
    }
    
    // Get all files in the pending folder
    const files = fs.readdirSync(PENDING_FOLDER);
    console.log(`Found ${files.length} files in pending folder`);
    
    let processedCount = 0;
    let updatedCount = 0;
    
    // Process each file
    files.forEach(file => {
        try {
            const filePath = path.join(PENDING_FOLDER, file);
            
            // Skip directories, only process files
            if (!fs.statSync(filePath).isFile()) {
                console.log(`Skipping directory: ${file}`);
                return;
            }
            
            // Only process .json files
            if (!file.endsWith('.json')) {
                console.log(`Skipping non-JSON file: ${file}`);
                return;
            }
            
            console.log(`\nProcessing file: ${file}`);
            processedCount++;
            
            // Read file content
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const mailData = JSON.parse(fileContent);
            
            // Get Date from the mail data (it's stored as an array [date, time])
            const dateArray = mailData['Date'];
            if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 2) {
                console.log(`  - No valid 'Date' field found in file, skipping`);
                return;
            }
            
            const dateStr = dateArray[0]; // e.g., "2025-09-08"
            const timeStr = dateArray[1]; // e.g., "13:47"
            const dateSentStr = `${dateStr}T${timeStr}:00`;
            
            console.log(`  - Date: ${dateStr}, Time: ${timeStr}`);
            
            // Parse the date sent
            const dateSent = new Date(dateSentStr);
            if (isNaN(dateSent.getTime())) {
                console.log(`  - Invalid date format: ${dateSentStr}, skipping`);
                return;
            }
            
            // Get current time
            const now = new Date();
            console.log(`  - Current time: ${now.toISOString()}`);
            
            // Calculate time difference in hours
            const timeDiffMs = now - dateSent;
            const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
            console.log(`  - Time difference: ${timeDiffHours.toFixed(2)} hours`);
            
            // Determine status based on time difference
            let status, originalCategory, originalStatus;
            if (timeDiffHours < 24) {
                status = "mustRep";
                originalCategory = "DungHan";
                originalStatus = "mustRep";
                console.log(`  - Within 24h, setting to mustRep/DungHan`);
            } else {
                status = "chuaRep";
                originalCategory = "QuaHan";
                originalStatus = "chuaRep";
                console.log(`  - Over 24h, setting to chuaRep/QuaHan`);
            }
            
            // Check if update is needed
            if (mailData.status === status && 
                mailData.originalCategory === originalCategory && 
                mailData.originalStatus === originalStatus) {
                console.log(`  - File already has correct status, no update needed`);
                return;
            }
            
            // Update the mail data
            const oldStatus = mailData.status;
            const oldCategory = mailData.originalCategory;
            const oldOriginalStatus = mailData.originalStatus;
            
            mailData.status = status;
            mailData.originalCategory = originalCategory;
            mailData.originalStatus = originalStatus;
            
            // Write updated data back to file
            fs.writeFileSync(filePath, JSON.stringify(mailData, null, 2), 'utf8');
            
            console.log(`  - File updated successfully:`);
            console.log(`    status: ${oldStatus} -> ${status}`);
            console.log(`    originalCategory: ${oldCategory} -> ${originalCategory}`);
            console.log(`    originalStatus: ${oldOriginalStatus} -> ${originalStatus}`);
            
            updatedCount++;
            
        } catch (error) {
            console.error(`Error processing file ${file}:`, error.message);
        }
    });
    
    console.log(`\n=== Processing Summary ===`);
    console.log(`Total files processed: ${processedCount}`);
    console.log(`Files updated: ${updatedCount}`);
    console.log(`Files skipped: ${processedCount - updatedCount}`);
}

// Run the processor
if (require.main === module) {
    processPendingMails();
}

module.exports = { processPendingMails };
