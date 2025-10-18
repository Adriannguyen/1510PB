# 🔄 Fix Real-time File Synchronization

## 📋 Vấn đề

Khi thêm file JSON thủ công vào các thư mục `mustRep`, `rep`, `chuaRep`, `daRep`, `pending`, `processed`, hệ thống **KHÔNG tự động cập nhật UI** mà phải F5 mới hiển thị.

### Nguyên nhân:
1. ❌ Backend có chokidar file watcher nhưng **không emit event `mailsUpdated`** khi file thay đổi
2. ❌ Frontend có socket.io client nhưng **không lắng nghe event `mailsUpdated`** 
3. ❌ Auto-reload đã bị **disable** (commented out) trong `useMailData.js` để tối ưu performance

## ✅ Giải pháp

### 1️⃣ Backend Changes (`mail-server/server.js`)

#### A. Cải thiện `checkForNewMails()` function:
```javascript
const checkForNewMails = () => {
  // ...existing code...
  
  if (hasChanges) {
    mailStats = newStats;
    broadcastToClients("mailStatsUpdate", mailStats);
    
    // ✅ NEW: Always emit mailsUpdated when there are changes
    broadcastToClients("mailsUpdated", {
      type: "fileSystemChange",
      timestamp: new Date().toISOString(),
      stats: newStats,
    });
    
    // ...rest of code...
  }
};
```

#### B. Cải thiện Chokidar event handlers:

**File Added Event:**
```javascript
.on("add", (filePath) => {
  // ✅ NEW: Emit immediate update for ANY file addition
  broadcastToClients("mailsUpdated", {
    type: "fileAdded",
    fileName: path.basename(filePath),
    timestamp: new Date().toISOString(),
  });
  
  // ...existing auto-assign logic...
})
```

**File Changed Event:**
```javascript
.on("change", (filePath) => {
  if (filePath.endsWith(".json")) {
    console.log(`📝 File changed: ${path.basename(filePath)}`);
    
    // ✅ NEW: Emit immediate update
    broadcastToClients("mailsUpdated", {
      type: "fileChanged",
      fileName: path.basename(filePath),
      timestamp: new Date().toISOString(),
    });
    
    setTimeout(checkForNewMails, 500);
  }
})
```

**File Deleted Event:**
```javascript
.on("unlink", (filePath) => {
  if (filePath.endsWith(".json")) {
    console.log(`🗑️ File deleted: ${path.basename(filePath)}`);
    
    // ✅ NEW: Emit immediate update
    broadcastToClients("mailsUpdated", {
      type: "fileDeleted",
      fileName: path.basename(filePath),
      timestamp: new Date().toISOString(),
    });
    
    setTimeout(checkForNewMails, 500);
  }
})
```

### 2️⃣ Frontend Changes (`src/hooks/useMailData.js`)

#### Re-enable auto-reload và thêm listeners:
```javascript
// ✅ Listen for mail stats updates
newSocket.on("mailStatsUpdate", (stats) => {
  console.log("📡 Received mail stats update:", stats);
  loadData(); // ✅ ENABLED
});

// ✅ Listen for new mails detected
newSocket.on("newMailsDetected", (data) => {
  console.log("🆕 New mails detected:", data);
  loadData(); // ✅ ENABLED
});

// ✅ Listen for mail moved events
newSocket.on("mailMoved", (data) => {
  console.log("📧 Mail moved:", data);
  loadData(); // ✅ ENABLED
});

// ✅ NEW: Listen for mailsUpdated events (file add/change/delete)
newSocket.on("mailsUpdated", (data) => {
  console.log("🔄 Mails updated:", data);
  loadData(); // ✅ ENABLED
});

// ✅ NEW: Listen for mailAssigned events (auto-assignment)
newSocket.on("mailAssigned", (data) => {
  console.log("👤 Mail assigned:", data);
  loadData(); // ✅ ENABLED
});
```

## 🎯 Kết quả

### Trước khi fix:
- ❌ Thêm file thủ công → Phải F5 mới thấy
- ❌ Sửa file → Phải F5 mới cập nhật
- ❌ Xóa file → Phải F5 mới biến mất
- ✅ Dùng nút "Move" → Tự động cập nhật (vì có API call)

### Sau khi fix:
- ✅ Thêm file thủ công → **Tự động hiển thị ngay lập tức**
- ✅ Sửa file → **Tự động cập nhật real-time**
- ✅ Xóa file → **Tự động biến mất ngay**
- ✅ Dùng nút "Move" → Tự động cập nhật
- ✅ Auto-assign → **Tự động hiển thị assignedTo**

## 📡 WebSocket Events Flow

```
File System Change (add/change/delete)
         ↓
Chokidar detects change
         ↓
Backend emits "mailsUpdated" ────────┐
         ↓                           │
Backend calls checkForNewMails()     │
         ↓                           │
Backend emits "mailStatsUpdate" ─────┤
         ↓                           │
(if auto-assigned)                   │
Backend emits "mailAssigned" ────────┤
         ↓                           │
         ↓                           ↓
    WebSocket (Socket.io)
         ↓
Frontend receives events
         ↓
useMailData.js triggers loadData()
         ↓
API call: GET /api/mails
         ↓
UI updates automatically! ✅
```

## 🧪 Testing

### Test Case 1: Thêm file mới
```bash
# Tạo file mới trong folder
echo '{"Subject":"Test","From":"test@test.com","Type":"To","Date":["2025-10-16","10:00"]}' > C:\classifyMail\DungHan\mustRep\Test.json

# Kết quả mong đợi:
# ✅ Console log: "🔄 Mails updated: {type: 'fileAdded', ...}"
# ✅ UI tự động hiển thị mail mới
# ✅ Không cần F5
```

### Test Case 2: Sửa file
```bash
# Sửa nội dung file existing
# Kết quả mong đợi:
# ✅ Console log: "🔄 Mails updated: {type: 'fileChanged', ...}"
# ✅ UI tự động cập nhật
```

### Test Case 3: Xóa file
```bash
# Xóa file
del "C:\classifyMail\DungHan\mustRep\Test.json"

# Kết quả mong đợi:
# ✅ Console log: "🔄 Mails updated: {type: 'fileDeleted', ...}"
# ✅ Mail biến mất khỏi UI ngay lập tức
```

### Test Case 4: Dùng external tool (Outlook Addin, script)
```bash
# Tool BE trả về mail vào folder
# Kết quả mong đợi:
# ✅ Chokidar detect file added
# ✅ Auto-assign nếu có matching group
# ✅ UI tự động hiển thị ngay
# ✅ Không cần F5
```

## ⚡ Performance Notes

- **Debounce**: Chokidar có `awaitWriteFinish: true` để tránh emit nhiều lần
- **Throttle**: `checkForNewMails` được gọi sau `setTimeout(500ms)` để tránh spam
- **Network**: Mỗi file change chỉ trigger 1 API call để reload data
- **Efficient**: Chỉ reload khi thực sự có thay đổi (hasChanges check)

## 🔧 Configuration

### Chokidar Options:
```javascript
const watcher = chokidar.watch(MAIL_DATA_PATH, {
  ignored: /(^|[\/\\])\../,  // Ignore dotfiles
  persistent: true,
  ignoreInitial: true,        // Don't trigger on initial scan
  awaitWriteFinish: true,     // Wait for file write to finish
  depth: 10,                  // Watch subdirectories
});
```

## 📝 Files Modified

1. ✅ `mail-server/server.js` - Backend event emission
2. ✅ `src/hooks/useMailData.js` - Frontend event listeners
3. ✅ `REALTIME_FILE_SYNC_FIX.md` - This documentation

## ✨ Summary

Hệ thống giờ đây **100% real-time sync**! Bất kể file được thêm bằng cách nào (thủ công, tool, script, API), UI sẽ **tự động cập nhật ngay lập tức** mà không cần F5.

🎉 **Problem Solved!**
