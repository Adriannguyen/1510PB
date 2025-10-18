# ⚡ Fix: Tự động cập nhật khi thêm file thủ công

## ❌ Vấn đề cũ

Khi bạn thêm file JSON bằng tay vào các folder:
- `C:\classifyMail\DungHan\mustRep\`
- `C:\classifyMail\DungHan\rep\`
- `C:\classifyMail\QuaHan\chuaRep\`
- `C:\classifyMail\QuaHan\daRep\`
- `C:\classifyMail\ReviewMail\pending\`
- `C:\classifyMail\ReviewMail\processed\`

**➡️ Phải bấm F5 mới thấy mail xuất hiện trên UI**

## ✅ Đã fix

Giờ đây, **KHÔNG CẦN F5** nữa! Hệ thống tự động cập nhật real-time:

### Cách hoạt động:
1. 📁 Bạn thêm/sửa/xóa file JSON vào folder
2. 👀 Backend (chokidar) phát hiện thay đổi ngay lập tức
3. 📡 Backend emit WebSocket event `mailsUpdated`
4. ⚡ Frontend nhận event và tự động reload data
5. 🎉 UI cập nhật tự động - **KHÔNG CẦN F5!**

### Các thay đổi:
- ✅ Backend emit `mailsUpdated` khi file add/change/delete
- ✅ Frontend lắng nghe event `mailsUpdated` và auto-reload
- ✅ Cả khi dùng tool BE trả mail về đều tự động hiển thị

## 🧪 Test thử

### Cách 1: Chạy script test tự động
```bash
node test-realtime-sync.js
```
Script sẽ:
1. Tạo file mới → Mail xuất hiện tự động
2. Sửa file → Mail cập nhật tự động
3. Xóa file → Mail biến mất tự động

### Cách 2: Test thủ công

**Bước 1: Khởi động hệ thống**
```bash
# Terminal 1
cd mail-server
npm start

# Terminal 2
npm start
```

**Bước 2: Mở browser**
- Vào http://localhost:3000
- Mở Console (F12)

**Bước 3: Thêm file thủ công**
Tạo file: `C:\classifyMail\DungHan\mustRep\Test-RealTime.json`
```json
{
  "Subject": "Test Real-time Sync",
  "From": "test@example.com",
  "Type": "To",
  "Date": ["2025-10-16", "14:30"],
  "Check rep": false,
  "Status": "New"
}
```

**Bước 4: Quan sát**
- ✅ Console log: `🔄 Mails updated: {type: 'fileAdded', ...}`
- ✅ Mail hiển thị ngay trên UI
- ✅ KHÔNG CẦN F5!

**Bước 5: Sửa file**
Thay đổi Subject trong file → Mail cập nhật tự động

**Bước 6: Xóa file**
Delete file → Mail biến mất tự động

## 🎯 Kết quả

### Trước:
```
Thêm file → ❌ Không thấy gì → Phải F5 → ✅ Thấy mail
```

### Sau:
```
Thêm file → ✅ Mail hiển thị ngay lập tức (real-time!)
```

## 📡 Events được emit

Backend emit các events sau qua WebSocket:

1. **`mailsUpdated`** - Khi file thay đổi
   - `type: 'fileAdded'` - File mới
   - `type: 'fileChanged'` - File sửa
   - `type: 'fileDeleted'` - File xóa
   - `type: 'fileSystemChange'` - Thay đổi tổng quát

2. **`mailAssigned`** - Khi auto-assign thành công

3. **`mailStatsUpdate`** - Khi thống kê thay đổi

4. **`newMailsDetected`** - Khi có mail mới

## 🔍 Debug

Nếu không tự động cập nhật, kiểm tra:

### 1. Backend có chạy không?
```bash
# Should see:
🚀 Mail Server Started!
📡 Server running on 0.0.0.0:3002
🔍 File watcher is READY and watching
```

### 2. WebSocket có kết nối không?
Mở Browser Console, tìm:
```
Socket connected: <socket-id>
```

### 3. Có nhận event không?
Khi thêm file, phải thấy trong Console:
```
🔄 Mails updated: {type: "fileAdded", fileName: "Test.json", ...}
✅ Đã load X mail từ C:\classifyMail\
```

### 4. File có đúng format không?
```json
{
  "Subject": "Required",
  "From": "Required",
  "Type": "To|CC|BCC",
  "Date": ["YYYY-MM-DD", "HH:MM"]
}
```

## 📝 Files đã sửa

1. `mail-server/server.js` - Thêm emit events
2. `src/hooks/useMailData.js` - Thêm event listeners
3. `REALTIME_FILE_SYNC_FIX.md` - Tài liệu chi tiết
4. `test-realtime-sync.js` - Script test

## 💡 Tips

- 💾 Tự động lưu code → Tự động reload (HMR)
- 📁 Thêm file thủ công → Tự động hiển thị
- 🔧 Tool BE trả mail → Tự động update
- 🎯 Auto-assign → Tự động gán PIC
- ⚡ Mọi thứ đều **REAL-TIME**!

---

**🎉 HOÀN THÀNH! Không còn phải F5 nữa!**
