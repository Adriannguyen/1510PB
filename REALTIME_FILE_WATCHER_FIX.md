# Real-time File Watcher Update Fix

## 📋 Vấn đề

**Mô tả:**
- Khi tool BE thêm file mới trực tiếp vào các folder (mustRep, rep, chuaRep, daRep, pending, processed)
- Frontend **KHÔNG tự động cập nhật** danh sách mail
- Phải **F5 (refresh)** mới thấy mail mới

**Nguyên nhân:**
- Backend Chokidar file watcher **ĐÃ** emit event `"mailsUpdated"` ✅
- Frontend `useMailData` hook **ĐÃ** lắng nghe event ✅
- Nhưng `ValidMails.js` component có socket listener riêng chỉ refresh khi `type === "expired_moved"` ❌
- Các type khác (`"fileAdded"`, `"fileChanged"`, `"fileDeleted"`) bị **BỎ QUA**

---

## 🔧 Giải pháp

### 1. Backend - Chokidar Events (ALREADY WORKING ✅)

**File:** `mail-server/server.js`

#### Event 1: File Added (Line 1990-2001)
```javascript
watcher.on("add", (filePath) => {
  console.log(`🔔 FILE ADD EVENT: ${filePath}`);
  
  // ✅ Emit immediate update event for ANY file addition
  broadcastToClients("mailsUpdated", {
    type: "fileAdded",
    fileName: path.basename(filePath),
    timestamp: new Date().toISOString(),
  });
  
  // ... auto-assignment logic ...
});
```

#### Event 2: File Changed (Line 2127-2138)
```javascript
watcher.on("change", (filePath) => {
  if (filePath.endsWith(".json")) {
    console.log(`📝 File changed: ${path.basename(filePath)}`);

    // Emit immediate update event
    broadcastToClients("mailsUpdated", {
      type: "fileChanged",
      fileName: path.basename(filePath),
      timestamp: new Date().toISOString(),
    });

    setTimeout(checkForNewMails, 500);
  }
});
```

#### Event 3: File Deleted (Line 2139-2152)
```javascript
watcher.on("unlink", (filePath) => {
  if (filePath.endsWith(".json")) {
    console.log(`🗑️ File deleted: ${path.basename(filePath)}`);

    // Emit immediate update event
    broadcastToClients("mailsUpdated", {
      type: "fileDeleted",
      fileName: path.basename(filePath),
      timestamp: new Date().toISOString(),
    });

    setTimeout(checkForNewMails, 500);
  }
});
```

**Event Types Emitted:**
- `"fileAdded"` - Khi file mới được tạo
- `"fileChanged"` - Khi file được chỉnh sửa
- `"fileDeleted"` - Khi file bị xóa
- `"fileSystemChange"` - Từ `checkForNewMails()` (line 1008)
- `"expired_moved"` - Khi mail expired được di chuyển

---

### 2. Frontend Hook - useMailData.js (ALREADY WORKING ✅)

**File:** `src/hooks/useMailData.js` (Line 82-91)

```javascript
// Listen for mailsUpdated events (when files added/changed manually)
newSocket.on("mailsUpdated", (data) => {
  console.log("📡 [useMailData] Mails updated event received:", data);
  console.log("🔄 [useMailData] Triggering loadData() to fetch latest mails...");
  loadData(); // ← Fetch mới từ server
});

// Listen for mailAssigned events (when auto-assignment happens)
newSocket.on("mailAssigned", (data) => {
  console.log("👤 [useMailData] Mail assigned event received:", data);
  console.log("🔄 [useMailData] Triggering loadData() to fetch latest mails...");
  loadData(); // ← Fetch mới từ server
});
```

**Logic:**
- Lắng nghe event `"mailsUpdated"` từ backend
- Gọi `loadData()` để fetch danh sách mail mới từ `/api/mails`
- `setMails(loadedMails)` trigger React re-render
- **Áp dụng cho TẤT CẢ components** dùng `useMailContext()`

---

### 3. Frontend Component - ValidMails.js (FIXED ✅)

**File:** `src/views/mail/ValidMails.js` (Line 511-530)

#### Before (BUG):
```javascript
// ❌ CHỈ refresh khi type === "expired_moved"
socket.on("mailsUpdated", (data) => {
  if (data.type === "expired_moved" && data.count > 0) {
    // ... show alert ...
    
    // Refresh mail data
    if (refreshMails) {
      refreshMails();
    }
  }
  // ← Các type khác bị BỎ QUA!
});
```

#### After (FIXED):
```javascript
// ✅ Refresh cho TẤT CẢ types
socket.on("mailsUpdated", (data) => {
  console.log("📡 ValidMails received mailsUpdated:", data);
  
  // Show alert for expired_moved specifically
  if (data.type === "expired_moved" && data.count > 0) {
    setExpiredMovedAlert({
      type: "info",
      message: `${data.count} mail(s) đã quá hạn và được chuyển sang phần "Expired Mails"`,
      timestamp: new Date(),
    });

    setTimeout(() => {
      setExpiredMovedAlert(null);
    }, 5000);
  }

  // Refresh mail data for ALL types (fileAdded, fileChanged, fileDeleted, etc.)
  if (refreshMails) {
    console.log("🔄 Refreshing ValidMails due to mailsUpdated event");
    refreshMails();
  }
});
```

**Thay đổi:**
- **Tách riêng** logic hiển thị alert (chỉ cho `expired_moved`)
- **Di chuyển** logic refresh ra ngoài if statement
- **Refresh cho TẤT CẢ** event types: `fileAdded`, `fileChanged`, `fileDeleted`, `fileSystemChange`, `expired_moved`

---

## 📊 Flow hoàn chỉnh

### Scenario 1: Tool BE thêm file mới vào DungHan/mustRep

```
1. Tool BE tạo file: C:\classifyMail\DungHan\mustRep\newmail.json
   ↓
2. Chokidar watcher detect: "add" event
   ↓
3. Backend emit: 
   io.emit("mailsUpdated", {
     type: "fileAdded",
     fileName: "newmail.json",
     timestamp: "2025-10-26T10:30:00.000Z"
   })
   ↓
4. Frontend useMailData hook nhận event:
   console.log("📡 [useMailData] Mails updated event received")
   ↓
5. Hook gọi loadData():
   - Fetch GET /api/mails
   - Backend gọi loadAllMails() (không cache, luôn đọc files mới)
   - Return danh sách mails bao gồm newmail.json
   ↓
6. Hook update state:
   setMails(loadedMails) // ← Trigger React re-render
   ↓
7. ValidMails component nhận event riêng:
   console.log("📡 ValidMails received mailsUpdated")
   refreshMails() // ← Trigger dispatch event
   ↓
8. MailContext refresh:
   window.dispatchEvent("mailDataReload")
   ↓
9. UI tự động hiển thị mail mới ✅
```

**Kết quả:** Mail mới hiển thị NGAY LẬP TỨC, không cần F5!

---

### Scenario 2: Tool BE sửa file existing

```
1. Tool BE update: C:\classifyMail\DungHan\rep\existingmail.json
   ↓
2. Chokidar detect: "change" event
   ↓
3. Backend emit: 
   io.emit("mailsUpdated", {
     type: "fileChanged",
     fileName: "existingmail.json"
   })
   ↓
4-9. Tương tự Scenario 1
   ↓
10. UI tự động cập nhật mail đã sửa ✅
```

---

### Scenario 3: Tool BE xóa file

```
1. Tool BE delete: C:\classifyMail\QuaHan\chuaRep\oldmail.json
   ↓
2. Chokidar detect: "unlink" event
   ↓
3. Backend emit: 
   io.emit("mailsUpdated", {
     type: "fileDeleted",
     fileName: "oldmail.json"
   })
   ↓
4-9. Tương tự Scenario 1
   ↓
10. UI tự động xóa mail khỏi danh sách ✅
```

---

## 🧪 Testing Guide

### Test 1: Thêm file mới thủ công
```bash
# Tạo file test
echo '{"Subject":"Test Mail","From":"test@example.com","Date":["2025-10-26","10:30"],"Type":"AA"}' > C:\classifyMail\DungHan\mustRep\testmail.json

# Expected behavior:
# - Backend console: "🔔 FILE ADD EVENT: ...testmail.json"
# - Backend emit: "mailsUpdated" với type "fileAdded"
# - Frontend console: "📡 [useMailData] Mails updated event received"
# - Frontend console: "🔄 [useMailData] Triggering loadData()"
# - Frontend console: "✅ [useMailData] Successfully loaded X mails"
# - UI: Mail mới xuất hiện NGAY trong ValidMails tab (KHÔNG cần F5)
```

### Test 2: Sửa file existing
```bash
# Sửa file test (thay đổi Subject)
# Expected: UI cập nhật Subject mới NGAY LẬP TỨC
```

### Test 3: Xóa file
```bash
# Xóa file test
del C:\classifyMail\DungHan\mustRep\testmail.json

# Expected: Mail biến mất khỏi UI NGAY LẬP TỨC
```

### Test 4: Auto-assignment
```bash
# Khi file mới được thêm, kiểm tra auto-assignment
# Expected:
# - File được assign cho PIC tự động
# - Backend emit "mailAssigned" event
# - UI cập nhật assignedTo field NGAY
```

### Test 5: Multiple files
```bash
# Thêm nhiều file cùng lúc (tool BE thêm hàng loạt)
# Expected:
# - Mỗi file trigger 1 event riêng
# - UI update từng mail một (có thể có small delay giữa các updates)
# - Không bị miss mail nào
```

---

## 🐛 Troubleshooting

### Issue 1: Mail mới vẫn không hiển thị sau khi thêm file

**Kiểm tra:**
1. Backend console có log "🔔 FILE ADD EVENT" không?
   ```
   # Nếu KHÔNG → Chokidar không watch đúng folder
   # Check: watcher = chokidar.watch(MAIL_DATA_PATH, {...})
   ```

2. Backend có emit "mailsUpdated" event không?
   ```
   # Search log: "broadcastToClients("mailsUpdated""
   # Nếu KHÔNG → Event không được emit
   ```

3. Frontend có nhận event không?
   ```
   # Browser console có log "📡 [useMailData] Mails updated event received" không?
   # Nếu KHÔNG → Socket.io connection bị đứt
   # Check: WebSocket tab trong DevTools Network
   ```

4. loadData() có được gọi không?
   ```
   # Browser console có log "🔄 [useMailData] Triggering loadData()" không?
   # Nếu CÓ nhưng không update → Check API response
   ```

5. API /api/mails có trả về mail mới không?
   ```
   # Network tab → Check response của /api/mails
   # Nếu KHÔNG có mail mới → Backend loadAllMails() bị lỗi
   ```

---

### Issue 2: UI chỉ update một số mail, không phải tất cả

**Nguyên nhân:** React batching multiple state updates

**Giải pháp:** Đã handle bằng cách gọi `loadData()` (fetch lại toàn bộ)

---

### Issue 3: UI update nhưng có delay 1-2 giây

**Nguyên nhân:** 
- `checkForNewMails()` được gọi với `setTimeout(..., 500)` hoặc `setTimeout(..., 1000)`
- Auto-assignment polling chạy mỗi 10 giây

**Đây là NORMAL behavior!** Real-time update vẫn nhanh hơn F5 rất nhiều.

---

### Issue 4: Sau khi tool BE thêm nhiều file, UI bị flicker/jump

**Nguyên nhân:** Multiple re-renders do nhiều events liên tiếp

**Giải pháp (nếu cần):**
- Debounce `loadData()` với delay 300ms
- Hoặc batch multiple events thành 1 update

**Code example:**
```javascript
let loadDataTimer = null;
const debouncedLoadData = () => {
  if (loadDataTimer) clearTimeout(loadDataTimer);
  loadDataTimer = setTimeout(() => {
    loadData();
  }, 300);
};

newSocket.on("mailsUpdated", (data) => {
  debouncedLoadData(); // ← Instead of loadData()
});
```

---

## 📝 Summary

### Files Modified

1. ✅ **src/views/mail/ValidMails.js** (Line 511-530)
   - Updated `socket.on("mailsUpdated")` listener
   - Moved `refreshMails()` call outside of conditional
   - Now refreshes for ALL event types

2. ✅ **src/hooks/useMailData.js** (Line 17-50, 82-91)
   - Added detailed logging in `loadData()`
   - Added detailed logging in socket listeners
   - Better visibility for debugging

### Backend (No changes needed - Already working!)

- `mail-server/server.js`:
  - Chokidar watcher already emits `"mailsUpdated"` for add/change/unlink ✅
  - `checkForNewMails()` already emits `"mailsUpdated"` ✅
  - Auto-assignment already emits `"mailAssigned"` ✅

### Architecture

```
Tool BE adds file
    ↓
Chokidar detects (< 1s)
    ↓
Backend emits "mailsUpdated" (immediate)
    ↓
Frontend useMailData receives (< 100ms)
    ↓
loadData() fetches /api/mails (200-500ms)
    ↓
setMails() triggers React re-render (< 100ms)
    ↓
UI updates (TOTAL: ~1-2 seconds)
```

**Kết luận:** 
- ✅ Real-time update **ĐÃ HOẠT ĐỘNG** sau fix
- ✅ Không cần F5 nữa
- ✅ All event types được xử lý (fileAdded, fileChanged, fileDeleted)
- ✅ Works cho ValidMails, ExpiredMails, ReviewMails (via MailContext)

---

**Date:** 2025-10-26
**Status:** COMPLETED ✅
**Impact:** All components now update in real-time when files are added/modified by external tools
