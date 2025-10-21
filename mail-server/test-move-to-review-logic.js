const axios = require("axios");

async function testMoveToReviewLogic() {
  console.log("🧪 Testing Move to Review logic...");
  console.log("📋 Expected behavior:");
  console.log("   - Mail from Valid/Expired → ReviewMail/processed");
  console.log("   - isReplied should be set to true");
  console.log("   - filePath should point to processed folder");

  try {
    // Test with a sample mail from Valid folder
    const testMailData = {
      id: "test-" + Date.now(),
      Subject: "Test Mail for Move to Review",
      From: "test@example.com",
      Date: ["2025-10-20", "10:30"],
      category: "DungHan",
      status: "mustRep",
      isReplied: false,
      filePath: "C:\\classifyMail\\DungHan\\mustRep\\test-mail.json"
    };

    console.log("\n📧 Sending test mail:", testMailData.Subject);
    console.log("📂 Current location:", testMailData.filePath);
    console.log("💬 Current isReplied:", testMailData.isReplied);

    const response = await axios.post(
      "http://localhost:3002/api/move-to-review",
      {
        mailId: testMailData.id,
        mailData: testMailData
      }
    );

    console.log("\n✅ Response received:");
    console.log("📊 Success:", response.data.success);
    console.log("📄 Message:", response.data.message);
    
    if (response.data.reviewMailData) {
      const reviewData = response.data.reviewMailData;
      console.log("\n🔍 Review Mail Data Analysis:");
      console.log("📂 New filePath:", reviewData.filePath);
      console.log("💬 New isReplied:", reviewData.isReplied);
      console.log("📁 Category:", reviewData.category);
      console.log("📅 Processed Date:", reviewData.processedDate);
      console.log("📊 Original Category:", reviewData.originalCategory);

      // Verify expectations
      console.log("\n✔️ Verification:");
      const isInProcessedFolder = reviewData.filePath.includes("processed");
      const isRepliedTrue = reviewData.isReplied === true;
      const hasProcessedDate = !!reviewData.processedDate;

      console.log(`   📁 Moved to processed folder: ${isInProcessedFolder ? "✅" : "❌"}`);
      console.log(`   💬 isReplied set to true: ${isRepliedTrue ? "✅" : "❌"}`);
      console.log(`   📅 Has processedDate: ${hasProcessedDate ? "✅" : "❌"}`);

      if (isInProcessedFolder && isRepliedTrue && hasProcessedDate) {
        console.log("\n🎉 ALL TESTS PASSED! Logic is working correctly.");
      } else {
        console.log("\n❌ Some tests failed. Logic needs adjustment.");
      }
    }

  } catch (error) {
    console.error("\n❌ Error during test:", error.response?.data || error.message);
  }
}

// Run the test
testMoveToReviewLogic();
