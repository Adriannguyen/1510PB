# Phân tích Logic Move to Review

## 📋 Yêu cầu của người dùng

Khi chuyển mail từ Valid (DungHan) hoặc Expired (QuaHan) xuống Review:
1. `isReplied`: false → true
2. `filePath`: `C:\classifyMail\ReviewMail\pending\ten_file.json` → `C:\classifyMail\ReviewMail\processed\ten_file.json`
3. Chuyển thẳng tới folder processed

## 🔍 Phân tích Logic hiện tại (từ server.js dòng 3347)

### ✅ Logic đã được cập nhật ĐÚNG:

1. **Target Folder**: 
   ```javascript
   const targetReviewFolder = "processed"; // Always processed when moving from Valid/Expired
   ```

2. **Reply Status**:
   ```javascript
   const shouldMarkAsReplied = true; // Always mark as replied/processed
   ```

3. **Review Mail Data Creation**:
   ```javascript
   const reviewMailData = {
     ...mailData,
     category: "ReviewMail",
     isReplied: shouldMarkAsReplied, // Always true (processed)
     processedDate: now.toISOString(), // Always add timestamp when moving to processed
   };
   ```

4. **File Path Construction**:
   ```javascript
   const reviewMailTargetPath = path.join(
     MAIL_DATA_PATH,
     "ReviewMail",
     targetReviewFolder  // = "processed"
   );
   reviewMailData.filePath = reviewFilePath.replace(/\//g, "\\");
   ```

### 🎯 Key Comments xác nhận logic mới:

```javascript
// Step 2: NEW LOGIC - ALL mails from Valid/Expired → processed folder
// Reason: When moving from Valid/Expired Mails, they are considered "Processed" for review
console.log(`🎯 NEW LOGIC: All mails from Valid/Expired → processed folder`);
console.log(`🎯 Target ReviewMail folder: ${targetReviewFolder}`);
console.log(`🎯 Will be marked as: Processed (replied)`);
```

## ✅ Kết quả

**TẤT CẢ YÊU CẦU ĐÃ ĐƯỢC THỰC HIỆN ĐÚNG:**

1. ✅ `isReplied` được set thành `true`
2. ✅ `filePath` trỏ tới folder `processed` 
3. ✅ Mail được chuyển thẳng tới `ReviewMail/processed` (không qua `pending`)

## 📝 Chi tiết implement:

- **Target folder**: Luôn là `"processed"` khi chuyển từ Valid/Expired
- **Reply status**: Luôn là `true` (processed)
- **File path**: `C:\classifyMail\ReviewMail\processed\{filename}.json`
- **Timestamp**: Thêm `processedDate` khi chuyển
- **Original category**: Được tính toán dựa trên Date sent

## 🔧 Không cần thay đổi gì thêm!

Logic hiện tại đã đáp ứng chính xác tất cả yêu cầu của người dùng. Hệ thống sẽ:
- Tự động set `isReplied = true`
- Chuyển mail thẳng tới folder `processed`
- Cập nhật `filePath` đúng theo yêu cầu
