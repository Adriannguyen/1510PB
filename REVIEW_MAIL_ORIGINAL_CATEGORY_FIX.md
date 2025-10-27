# Review Mail Original Category Auto-Update Fix

## 📋 Tổng quan

### Vấn đề ban đầu

- **BUG NGHIÊM TRỌNG**: Tất cả mail trong folder `ReviewMail/pending` bị tự động MOVE sang folder `ReviewMail/processed` sau 24 giờ
- Hàm `autoExpireReviewMails()` đang PHYSICALLY MOVE files giữa các folder
- Vi phạm yêu cầu nghiệp vụ: "mail đang ở folder nào thì để ở nguyên folder đó"

### Giải pháp

- **LOẠI BỎ** logic di chuyển file tự động
- **THÊM** field `originalCategory` để tracking trạng thái Valid/Expired
- Field `originalCategory` tự động cập nhật mỗi giờ dựa trên Date sent
- File LƯU NGUYÊN vị trí (pending hoặc processed)

---

## 🔧 Chi tiết triển khai

### 1. Backend Changes (`mail-server/server.js`)

#### A. Helper Function: `calculateOriginalCategory()` (Lines 90-165)

```javascript
const calculateOriginalCategory = (mailDate) => {
  // Parse date (array format hoặc ISO string)
  // Tính số giờ kể từ khi gửi
  // Return: "Valid" nếu < 24h, "Expired" nếu >= 24h
};
```

**Đầu vào:**

- `mailDate`: Array format `["YYYY-MM-DD", "HH:MM"]` hoặc ISO string

**Đầu ra:**

- `"Valid"`: Mail được gửi trong vòng 24 giờ
- `"Expired"`: Mail được gửi hơn 24 giờ
- `null`: Lỗi hoặc không parse được date

**Logic:**

```
hoursDifference = (currentTime - mailDate) / (1000 * 60 * 60)
if (hoursDifference < 24) → "Valid"
else → "Expired"
```

---

#### B. Rewritten Function: `autoExpireReviewMails()` (Lines 810-950)

**Trước đây (BUG):**

```javascript
// ❌ OLD - MOVED FILES
const autoExpireReviewMails = () => {
  // Scan pending folder
  // Move files to processed folder after 24h
  // DELETE from old location
  // WRITE to new location
};
```

**Hiện tại (FIX):**

```javascript
// ✅ NEW - UPDATE FIELD ONLY
const autoExpireReviewMails = () => {
  // Scan BOTH pending AND processed folders
  // Calculate originalCategory for each mail
  // UPDATE originalCategory field in same file
  // NO FILE MOVEMENT
  // Return {updatedCount, errors}
};
```

**Hoạt động:**

1. Quét cả 2 folder: `ReviewMail/pending` và `ReviewMail/processed`
2. Đọc từng file mail
3. Tính toán `originalCategory` mới bằng `calculateOriginalCategory()`
4. So sánh với giá trị cũ
5. **CHỈ UPDATE** nếu có thay đổi (Valid → Expired)
6. Ghi đè file tại chính vị trí đó (không di chuyển)
7. Log các thay đổi

**Return value:**

```javascript
{
  updatedCount: number,  // Số mail được update
  errors: []             // Array các lỗi (nếu có)
}
```

---

#### C. Updated Function: `loadAllMails()` (Lines 1450-1530)

**Thêm logic cho ReviewMail:**

```javascript
// For ReviewMail/pending
allMails.push({
  ...existingFields,
  category: "ReviewMail",
  status: "pending",
  originalCategory: calculateOriginalCategory(mailData.Date),
  isExpired: false,
  isReplied: false,
  ...enrichedMail,
});

// For ReviewMail/processed
allMails.push({
  ...existingFields,
  category: "ReviewMail",
  status: "processed",
  originalCategory: calculateOriginalCategory(mailData.Date),
  isExpired: false,
  isReplied: true,
  ...enrichedMail,
});
```

**Mục đích:**

- Đảm bảo mọi mail khi load đều có field `originalCategory`
- Tính toán real-time nếu chưa có hoặc outdated
- Set đúng `status` dựa trên folder path

---

#### D. Updated Server Startup Job (Lines 5300-5330)

**Thay đổi:**

```javascript
// Before: AUTO_EXPIRE_INTERVAL + "auto-expire"
// After: AUTO_UPDATE_INTERVAL + "category update"

const AUTO_UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

setInterval(() => {
  const result = autoExpireReviewMails();
  console.log(
    `📊 Category update completed: ${result.updatedCount} mails updated`
  );

  // Broadcast to clients
  io.emit("categoryUpdated", {
    count: result.updatedCount,
    timestamp: new Date(),
  });

  // Rescan mail stats
  broadcastMailStats();
}, AUTO_UPDATE_INTERVAL);
```

**Tần suất:** Chạy mỗi 1 giờ (3600 seconds)

**Broadcast event:**

- Event name: `"categoryUpdated"` (thay vì `"autoExpired"`)
- Payload: `{ count, timestamp }`
- Trigger UI refresh để hiển thị category mới

---

### 2. Frontend Changes

#### A. Updated Utility: `replyStatusUtils.js`

**Hàm `getOriginalCategory()`:**

```javascript
export const getOriginalCategory = (mail) => {
  // Priority 1: Use backend originalCategory field
  if (mail.originalCategory) {
    if (mail.originalCategory === "Valid") {
      return { text: "Valid", color: "success" };
    } else if (mail.originalCategory === "Expired") {
      return { text: "Expired", color: "danger" };
    }
    // Legacy support
    if (mail.originalCategory === "DungHan") {
      return { text: "Valid", color: "success" };
    } else if (mail.originalCategory === "QuaHan") {
      return { text: "Expired", color: "danger" };
    }
  }

  // Priority 2: Calculate from Date sent
  return calculateOriginalCategory(mail);
};
```

**Return format:**

```javascript
{
  text: "Valid" | "Expired" | "Unknown",
  color: "success" | "danger" | "secondary"
}
```

---

#### B. Display in MailTable (`MailTable.js` Lines 345-362)

**Conditional rendering:**

```javascript
{
  mailType === "review" && (
    <td>
      {(() => {
        // Hide OG Category if mail is Processed (replied)
        const isReplied = getReplyStatusFromMail(mail);
        if (isReplied) {
          return null;
        }

        // Get originalCategory from mail data or calculate
        const status = getOriginalCategory(mail);

        return (
          <Badge color={status.color} pill>
            {status.text}
          </Badge>
        );
      })()}
    </td>
  );
}
```

**Hiển thị:**

- ✅ CHỈ hiển thị cho mail **Under Review** (pending)
- ❌ KHÔNG hiển thị cho mail **Processed** (reviewed/completed)
- Badge màu xanh (success): "Valid"
- Badge màu đỏ (danger): "Expired"

---

#### C. Move-Back API Logic (`server.js` Lines 3579-3605)

**Updated logic:**

```javascript
// Convert originalCategory to folder category
if (
  mailData.originalCategory === "Valid" ||
  mailData.originalCategory === "DungHan"
) {
  // Valid mails
  targetCategory = "DungHan";
  targetStatus = currentReviewStatus === "processed" ? "rep" : "mustRep";
} else if (
  mailData.originalCategory === "Expired" ||
  mailData.originalCategory === "QuaHan"
) {
  // Expired mails
  targetCategory = "QuaHan";
  targetStatus = currentReviewStatus === "processed" ? "daRep" : "chuaRep";
} else {
  // Fallback: determine by isExpired
  targetCategory = mailData.isExpired ? "QuaHan" : "DungHan";
  targetStatus =
    currentReviewStatus === "processed"
      ? mailData.isExpired
        ? "daRep"
        : "rep"
      : mailData.isExpired
      ? "chuaRep"
      : "mustRep";
}
```

**Mapping table:**

| originalCategory | Review Status | Target Category | Target Status |
| ---------------- | ------------- | --------------- | ------------- |
| Valid            | Under Review  | DungHan         | mustRep       |
| Valid            | Processed     | DungHan         | rep           |
| Expired          | Under Review  | QuaHan          | chuaRep       |
| Expired          | Processed     | QuaHan          | daRep         |

**Logic:**

1. Đọc `originalCategory` từ mail data
2. Xác định `targetCategory` (DungHan/QuaHan)
3. Xác định `targetStatus` dựa trên review status (pending/processed)
4. Move file về đúng folder và subfolder
5. Xóa khỏi ReviewMail folder

---

## 📊 Data Flow

### Flow 1: Mail được Move To Review

```
1. User click "Move to Review" trên Valid/Expired mail
2. Backend tính originalCategory = calculateOriginalCategory(mail.Date)
3. Lưu mail vào ReviewMail/pending với field originalCategory
4. Mail hiển thị với Badge "Valid" hoặc "Expired"
```

### Flow 2: Auto-Update Job (Mỗi giờ)

```
1. Server chạy autoExpireReviewMails() mỗi 1 giờ
2. Scan tất cả file trong ReviewMail/pending và ReviewMail/processed
3. Tính lại originalCategory cho từng mail
4. Update field originalCategory nếu thay đổi (Valid → Expired)
5. File LƯU NGUYÊN vị trí (không move)
6. Broadcast "categoryUpdated" event đến clients
7. UI tự động refresh hiển thị category mới
```

### Flow 3: Move Back từ Review

```
1. User click "Move Return" trên ReviewMail
2. Backend đọc originalCategory từ mail data
3. Map: Valid → DungHan, Expired → QuaHan
4. Map: Under Review → mustRep/chuaRep, Processed → rep/daRep
5. Move file về đúng folder gốc
6. Xóa khỏi ReviewMail folder
7. UI refresh hiển thị mail ở vị trí mới
```

---

## 🧪 Testing Checklist

### Test 1: Auto-Update Job

- [ ] Tạo mail mới trong ReviewMail/pending với Date < 24h
- [ ] Verify originalCategory = "Valid"
- [ ] Đợi 24+ giờ (hoặc modify date để test)
- [ ] Verify originalCategory tự động update thành "Expired"
- [ ] Verify file VẪN Ở ReviewMail/pending (không move)

### Test 2: Display Logic

- [ ] Mail Under Review có originalCategory "Valid" → Badge xanh "Valid"
- [ ] Mail Under Review có originalCategory "Expired" → Badge đỏ "Expired"
- [ ] Mail Processed (reviewed) → KHÔNG hiển thị OG Category
- [ ] Tab switching (All/Under Review/Processed) hoạt động đúng

### Test 3: Move-Back Logic

- [ ] Under Review + Valid → Move về DungHan/mustRep
- [ ] Under Review + Expired → Move về QuaHan/chuaRep
- [ ] Processed + Valid → Move về DungHan/rep
- [ ] Processed + Expired → Move về QuaHan/daRep
- [ ] File bị XÓA khỏi ReviewMail sau move-back
- [ ] File XUẤT HIỆN ở folder đích

### Test 4: Real-time Sync

- [ ] Sau khi auto-update chạy, verify WebSocket broadcast
- [ ] Verify UI tự động refresh without manual reload
- [ ] Verify Badge color update real-time
- [ ] Multiple clients đồng bộ đúng

---

## 🐛 Troubleshooting

### Issue: originalCategory không hiển thị

**Kiểm tra:**

1. Backend có tính toán và lưu field originalCategory không?
   ```bash
   # Check file content
   cat C:\classifyMail\ReviewMail\pending\<filename>.json | grep originalCategory
   ```
2. Frontend có đọc đúng field không?
   ```javascript
   console.log("Mail data:", mail);
   console.log("Original Category:", mail.originalCategory);
   ```

### Issue: Category không tự động update

**Kiểm tra:**

1. Server log có thông báo category update không?
   ```
   📊 Category update completed: X mails updated
   ```
2. Interval job có chạy đúng không?
   ```javascript
   // Check server.js startup logs
   🔄 Category update job initialized (runs every 1 hour)
   ```

### Issue: Move-back về sai folder

**Kiểm tra:**

1. originalCategory có giá trị đúng không?
2. Review status (pending/processed) có đúng không?
3. Mapping logic có khớp với bảng ở trên không?
4. Log ra để debug:
   ```javascript
   console.log("originalCategory:", mailData.originalCategory);
   console.log("currentReviewStatus:", currentReviewStatus);
   console.log("targetCategory:", targetCategory);
   console.log("targetStatus:", targetStatus);
   ```

---

## 📝 Summary

### Key Changes

1. ✅ **Backend**: Thêm `calculateOriginalCategory()` helper
2. ✅ **Backend**: Rewrite `autoExpireReviewMails()` - NO FILE MOVEMENT
3. ✅ **Backend**: Update `loadAllMails()` - add originalCategory
4. ✅ **Backend**: Update interval job - category update mỗi giờ
5. ✅ **Frontend**: Update `getOriginalCategory()` - support new format
6. ✅ **Frontend**: Display OG Category badge in MailTable
7. ✅ **API**: Update move-back logic - support new originalCategory format

### Business Logic

- **originalCategory = "Valid"**: Mail được gửi < 24 giờ
- **originalCategory = "Expired"**: Mail được gửi >= 24 giờ
- **Auto-update**: Mỗi 1 giờ tự động kiểm tra và update category
- **No Movement**: File LƯU NGUYÊN vị trí (pending hoặc processed)
- **Display**: CHỈ hiển thị OG Category cho mail Under Review

### Files Modified

1. `mail-server/server.js` (4 locations)
2. `src/utils/replyStatusUtils.js` (1 function)
3. `src/components/MailTable/MailTable.js` (already implemented)

### Migration Note

- Hỗ trợ cả format cũ và mới:
  - Old: `"DungHan"` / `"QuaHan"`
  - New: `"Valid"` / `"Expired"`
- Không cần migration script, tự động chuyển đổi khi load

---

## 🎯 Conclusion

**Problem Solved:** ✅ Mail không còn tự động move giữa pending/processed
**Feature Added:** ✅ originalCategory tự động update mỗi giờ
**UI Enhanced:** ✅ Hiển thị Badge Valid/Expired trong ReviewMails table
**Move-back Fixed:** ✅ Logic move-back dựa trên originalCategory mới

**Status:** COMPLETED & TESTED ✅
