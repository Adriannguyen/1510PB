# Move to Review Logic Update - All to Processed Folder

## 📋 Tổng quan thay đổi

### Yêu cầu mới

1. **TẤT CẢ mail từ Valid Mails / Expired Mails khi move xuống Review → vào folder `processed` luôn**
2. **Original Category (OG)** xác định khi move xuống dựa trên thời gian hiện tại:
   - Mail được gửi **< 24 giờ** → OG = `"Valid"`
   - Mail được gửi **≥ 24 giờ** → OG = `"Expired"`
3. **Khi Move Back** → Luôn về folder **Replied** (rep/daRep) vì đã ở processed

### Lý do thay đổi

- **Logic cũ**: Mail từ mustRep/chuaRep → pending, Mail từ rep/daRep → processed
- **Logic mới**: **TẤT CẢ** → processed (vì khi move xuống Review nghĩa là đã xử lý/kiểm tra)
- **Trường hợp đặc biệt**: Một số mail Expired vẫn ở Valid Mails (do tool BE chưa update kịp)
  - Khi move xuống → mark Processed + Expired
  - Khi move lên → về Replied + Expired (QuaHan/daRep)

---

## 🔧 Chi tiết triển khai

### 1. Backend: Move to Review API (`/api/move-to-review`)

**File:** `mail-server/server.js` (Lines ~3370-3425)

#### A. Thay đổi logic xác định target folder

**Trước đây:**

```javascript
// ❌ OLD - Phụ thuộc vào folder nguồn
let targetReviewFolder = "pending"; // default
if (lowerPath.includes("\\rep\\") || lowerPath.includes("/rep/")) {
  targetReviewFolder = "processed";
} else if (lowerPath.includes("\\mustrep\\")) {
  targetReviewFolder = "pending";
}
```

**Hiện tại:**

```javascript
// ✅ NEW - TẤT CẢ đều vào processed
const targetReviewFolder = "processed"; // Always processed
const shouldMarkAsReplied = true; // Always mark as replied/processed

// Calculate Original Category based on current time vs Date sent
const originalCategory = calculateOriginalCategory(mailData.Date);
console.log(`📊 Calculated Original Category: ${originalCategory}`);
```

**Logic mới:**

1. **KHÔNG còn** check folder nguồn (rep/mustRep/daRep/chuaRep)
2. **LUÔN LUÔN** set `targetReviewFolder = "processed"`
3. **LUÔN LUÔN** set `shouldMarkAsReplied = true`
4. **Tính toán** `originalCategory` dựa trên `Date` sent vs current time

---

#### B. Thay đổi cấu trúc reviewMailData

**Trước đây:**

```javascript
// ❌ OLD
const reviewMailData = {
  ...mailData,
  originalCategory: mailData.originalCategory || mailData.category || "Unknown",
  isReplied: shouldMarkAsReplied, // Có thể true/false
  processedDate: shouldMarkAsReplied ? now.toISOString() : undefined,
};
```

**Hiện tại:**

```javascript
// ✅ NEW
const reviewMailData = {
  ...mailData,
  category: "ReviewMail",
  dateMoved: [dateStr, timeStr],
  originalCategory: originalCategory, // "Valid" hoặc "Expired" (calculated)
  originalStatus: mailData.status || "Unknown", // mustRep/rep/chuaRep/daRep
  isReplied: true, // ALWAYS true (processed)
  processedDate: now.toISOString(), // ALWAYS có timestamp
};
```

**Thay đổi:**

- `originalCategory`: Giờ đây là giá trị **tính toán** từ `calculateOriginalCategory()`
- `isReplied`: **LUÔN = true** (vì tất cả vào processed)
- `processedDate`: **LUÔN có** timestamp

---

### 2. Backend: Move Back API (`/api/move-back-from-review`)

**File:** `mail-server/server.js` (Lines ~3545-3610)

#### A. Updated comment để rõ ràng hơn

```javascript
// IMPORTANT: Since all mails from Valid/Expired now go to "processed" folder,
// they will ALWAYS move back to Replied folders (rep/daRep)
if (
  mailData.originalCategory === "Valid" ||
  mailData.originalCategory === "DungHan"
) {
  // Valid mails: processed → rep (ALWAYS since all moved mails are processed)
  targetCategory = "DungHan";
  targetStatus = currentReviewStatus === "processed" ? "rep" : "mustRep";
} else if (
  mailData.originalCategory === "Expired" ||
  mailData.originalCategory === "QuaHan"
) {
  // Expired mails: processed → daRep (ALWAYS since all moved mails are processed)
  targetCategory = "QuaHan";
  targetStatus = currentReviewStatus === "processed" ? "daRep" : "chuaRep";
}
```

**Logic:**

- Vì tất cả mail đều ở `processed` → `currentReviewStatus` sẽ LUÔN = `"processed"`
- Valid mail → move về `DungHan/rep`
- Expired mail → move về `QuaHan/daRep`

---

#### B. Updated restoredMailData

```javascript
const restoredMailData = {
  ...mailData,
  category: targetCategory,
  status: targetStatus,
  isReplied: true, // ALWAYS true vì tất cả mail đều từ processed
  isExpired: targetCategory === "QuaHan", // true nếu về QuaHan
};

// Remove review-specific fields
delete restoredMailData.dateMoved;
delete restoredMailData.originalCategory;
delete restoredMailData.originalStatus;
delete restoredMailData.processedDate; // ← Added: xóa processedDate
```

**Thay đổi:**

- `isReplied`: **LUÔN = true** (comment rõ ràng hơn)
- `isExpired`: Xác định dựa trên `targetCategory` (QuaHan = expired)
- **Thêm**: `delete restoredMailData.processedDate` để cleanup

---

### 3. Frontend: MailTable Display Logic

**File:** `src/components/MailTable/MailTable.js` (Lines ~349-366)

#### Thay đổi hiển thị OG Category

**Trước đây:**

```javascript
// ❌ OLD - KHÔNG hiển thị nếu Processed
{
  mailType === "review" && (
    <td>
      {(() => {
        const isReplied = getReplyStatusFromMail(mail);
        if (isReplied) {
          return null; // ← Ẩn OG Category nếu Processed
        }
        const status = getOriginalCategory(mail);
        return <Badge color={status.color}>{status.text}</Badge>;
      })()}
    </td>
  );
}
```

**Hiện tại:**

```javascript
// ✅ NEW - LUÔN hiển thị OG Category
{
  mailType === "review" && (
    <td>
      {(() => {
        // ALWAYS show Original Category for ALL review mails
        // Reason: All mails now go to "processed" folder
        // We still need to show their original category

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

**Logic mới:**

- **LOẠI BỎ** check `isReplied`
- **LUÔN LUÔN** hiển thị OG Category Badge
- Badge màu xanh (success): `"Valid"`
- Badge màu đỏ (danger): `"Expired"`

---

## 📊 Flow hoàn chỉnh

### Scenario 1: Valid Mail (DungHan/mustRep, Date < 24h)

**1. Move to Review:**

```
User clicks "Move to Review" trên Valid Mail (mustRep)
↓
Backend:
- Tính originalCategory = "Valid" (vì Date < 24h)
- targetReviewFolder = "processed"
- isReplied = true
- processedDate = current timestamp
↓
File saved: C:\classifyMail\ReviewMail\processed\<filename>.json
{
  category: "ReviewMail",
  originalCategory: "Valid",
  originalStatus: "mustRep",
  isReplied: true,
  processedDate: "2025-10-17T10:30:00.000Z"
}
↓
UI: Review Mails tab
- Reply Status: "Processed" (badge xanh)
- OG Category: "Valid" (badge xanh)
- Date: Date sent formatted
```

**2. Move Back:**

```
User clicks "Move Return"
↓
Backend:
- Read originalCategory = "Valid"
- currentReviewStatus = "processed"
- targetCategory = "DungHan"
- targetStatus = "rep" (vì processed)
↓
File moved: C:\classifyMail\DungHan\rep\<filename>.json
{
  category: "DungHan",
  status: "rep",
  isReplied: true,
  isExpired: false
}
↓
UI: Valid Mails tab
- Hiển thị trong danh sách "Replied"
- Badge "Replied" màu xanh
```

---

### Scenario 2: Expired Mail (QuaHan/chuaRep, Date >= 24h)

**1. Move to Review:**

```
User clicks "Move to Review" trên Expired Mail (chuaRep)
↓
Backend:
- Tính originalCategory = "Expired" (vì Date >= 24h)
- targetReviewFolder = "processed"
- isReplied = true
- processedDate = current timestamp
↓
File saved: C:\classifyMail\ReviewMail\processed\<filename>.json
{
  category: "ReviewMail",
  originalCategory: "Expired",
  originalStatus: "chuaRep",
  isReplied: true,
  processedDate: "2025-10-17T10:30:00.000Z"
}
↓
UI: Review Mails tab
- Reply Status: "Processed" (badge xanh)
- OG Category: "Expired" (badge đỏ)
- Date: Date sent formatted
```

**2. Move Back:**

```
User clicks "Move Return"
↓
Backend:
- Read originalCategory = "Expired"
- currentReviewStatus = "processed"
- targetCategory = "QuaHan"
- targetStatus = "daRep" (vì processed)
↓
File moved: C:\classifyMail\QuaHan\daRep\<filename>.json
{
  category: "QuaHan",
  status: "daRep",
  isReplied: true,
  isExpired: true
}
↓
UI: Expired Mails tab
- Hiển thị trong danh sách "Replied"
- Badge "Replied" màu xanh
```

---

### Scenario 3: Expired mail vẫn ở Valid Mails (trường hợp đặc biệt)

**Tình huống:**

- Mail được gửi cách đây 3 ngày (> 24h)
- Nhưng tool BE chưa update kịp → vẫn ở `DungHan/mustRep`

**1. Move to Review:**

```
User clicks "Move to Review" trên mail này
↓
Backend:
- Tính originalCategory = "Expired" (vì Date >= 24h)
  ← LƯU Ý: Tính dựa trên thời gian hiện tại, KHÔNG phụ thuộc folder nguồn
- targetReviewFolder = "processed"
- isReplied = true
↓
File saved: C:\classifyMail\ReviewMail\processed\<filename>.json
{
  category: "ReviewMail",
  originalCategory: "Expired", ← Đúng!
  originalStatus: "mustRep", ← Giữ nguyên status gốc
  isReplied: true
}
↓
UI: Review Mails tab
- Reply Status: "Processed"
- OG Category: "Expired" ← Hiển thị đúng Expired (badge đỏ)
```

**2. Move Back:**

```
User clicks "Move Return"
↓
Backend:
- Read originalCategory = "Expired"
- targetCategory = "QuaHan" ← Về QuaHan
- targetStatus = "daRep" ← Về daRep (vì processed)
↓
File moved: C:\classifyMail\QuaHan\daRep\<filename>.json
{
  category: "QuaHan",
  status: "daRep",
  isReplied: true,
  isExpired: true
}
↓
UI: Expired Mails tab (Replied section)
- Mail xuất hiện đúng ở Expired/Replied
- KHÔNG quay về Valid Mails
```

---

## 🧪 Testing Checklist

### Test 1: Valid Mail Move to Review

- [ ] Valid Mail (DungHan/mustRep, Date < 24h)
- [ ] Click "Move to Review"
- [ ] Verify file vào `ReviewMail/processed/` (KHÔNG phải pending)
- [ ] Verify `originalCategory = "Valid"`
- [ ] Verify `isReplied = true`
- [ ] Verify UI hiển thị: Reply Status = "Processed", OG = "Valid" (xanh)

### Test 2: Valid Mail Move Back

- [ ] Từ test 1, click "Move Return"
- [ ] Verify file về `DungHan/rep/` (KHÔNG phải mustRep)
- [ ] Verify `isReplied = true`, `isExpired = false`
- [ ] Verify UI hiển thị trong Valid Mails / Replied section

### Test 3: Expired Mail Move to Review

- [ ] Expired Mail (QuaHan/chuaRep, Date >= 24h)
- [ ] Click "Move to Review"
- [ ] Verify file vào `ReviewMail/processed/`
- [ ] Verify `originalCategory = "Expired"`
- [ ] Verify UI hiển thị: Reply Status = "Processed", OG = "Expired" (đỏ)

### Test 4: Expired Mail Move Back

- [ ] Từ test 3, click "Move Return"
- [ ] Verify file về `QuaHan/daRep/` (KHÔNG phải chuaRep)
- [ ] Verify `isReplied = true`, `isExpired = true`
- [ ] Verify UI hiển thị trong Expired Mails / Replied section

### Test 5: Edge Case - Expired mail ở Valid folder

- [ ] Tạo mail cũ (Date > 24h) nhưng để ở `DungHan/mustRep`
- [ ] Click "Move to Review"
- [ ] Verify `originalCategory = "Expired"` (tính theo Date, không theo folder)
- [ ] Click "Move Return"
- [ ] Verify file về `QuaHan/daRep/` (đúng Expired/Replied)

### Test 6: Auto-Update Original Category

- [ ] Mail trong ReviewMails có OG = "Valid" (< 24h)
- [ ] Đợi auto-update job chạy (sau 24h)
- [ ] Verify `originalCategory` tự động update thành "Expired"
- [ ] Verify UI Badge đổi từ xanh (Valid) sang đỏ (Expired)
- [ ] File vẫn ở `ReviewMail/processed/` (KHÔNG move)

---

## 🎯 Tổng kết

### Mapping Table - Move to Review

| Folder nguồn    | Date sent | →   | Target folder | originalCategory | isReplied |
| --------------- | --------- | --- | ------------- | ---------------- | --------- |
| DungHan/mustRep | < 24h     | →   | processed     | Valid            | true      |
| DungHan/mustRep | >= 24h    | →   | processed     | Expired          | true      |
| DungHan/rep     | < 24h     | →   | processed     | Valid            | true      |
| DungHan/rep     | >= 24h    | →   | processed     | Expired          | true      |
| QuaHan/chuaRep  | < 24h     | →   | processed     | Valid            | true      |
| QuaHan/chuaRep  | >= 24h    | →   | processed     | Expired          | true      |
| QuaHan/daRep    | < 24h     | →   | processed     | Valid            | true      |
| QuaHan/daRep    | >= 24h    | →   | processed     | Expired          | true      |

**Kết luận:** **TẤT CẢ** → `processed` + `isReplied = true`

---

### Mapping Table - Move Back

| originalCategory | Review Status | →   | Target Category | Target Status |
| ---------------- | ------------- | --- | --------------- | ------------- |
| Valid            | processed     | →   | DungHan         | rep           |
| Expired          | processed     | →   | QuaHan          | daRep         |

**Kết luận:** Vì tất cả đều `processed` → **LUÔN về Replied** (rep/daRep)

---

### Key Points

1. ✅ **Folder nguồn KHÔNG còn ảnh hưởng** đến folder đích (pending/processed)
2. ✅ **TẤT CẢ mail** khi move xuống Review → vào `processed` folder
3. ✅ **originalCategory** xác định theo **Date sent vs current time**, KHÔNG theo folder nguồn
4. ✅ **Move back** luôn về **Replied folders** (rep/daRep)
5. ✅ **OG Category Badge** hiển thị cho **TẤT CẢ** mail trong ReviewMails
6. ✅ **Edge case** xử lý đúng: Mail expired ở Valid folder → về Expired/Replied

---

## 📝 Files Modified

1. **Backend:**

   - `mail-server/server.js`
     - Line ~3370: Move to Review logic
     - Line ~3390: Calculate originalCategory
     - Line ~3410: reviewMailData structure
     - Line ~3545: Move Back comments
     - Line ~3590: restoredMailData

2. **Frontend:**
   - `src/components/MailTable/MailTable.js`
     - Line ~349: OG Category display logic (removed isReplied check)

---

**Status:** COMPLETED ✅
**Date:** 2025-10-17
**Impact:** All move-to-review operations now go to processed folder
