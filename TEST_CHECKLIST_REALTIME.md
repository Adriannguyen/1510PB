# ✅ Checklist Test Real-time Sync

## 📋 Trước khi test

- [ ] Mail server đang chạy (`cd mail-server && npm start`)
- [ ] Frontend đang chạy (`npm start`)
- [ ] Browser mở tại http://localhost:3000
- [ ] Console browser đã mở (F12)

## 🧪 Test Cases

### Test 1: Thêm file mới bằng tay ✋
**Folder test**: `C:\classifyMail\DungHan\mustRep\`

1. [ ] Tạo file mới: `Test-Manual-Add.json`
   ```json
   {
     "Subject": "Test Manual Add",
     "From": "test@example.com",
     "Type": "To",
     "Date": ["2025-10-16", "14:00"]
   }
   ```

2. [ ] Kiểm tra Console có log:
   - `🔄 Mails updated: {type: "fileAdded", ...}`
   - `✅ Đã load X mail từ C:\classifyMail\`

3. [ ] Kiểm tra UI:
   - [ ] Mail xuất hiện tự động
   - [ ] **KHÔNG CẦN F5**

**✅ PASS** | **❌ FAIL**

---

### Test 2: Sửa file đang tồn tại ✏️

1. [ ] Mở file `Test-Manual-Add.json`
2. [ ] Đổi Subject thành: `"Test Manual Edit - UPDATED"`
3. [ ] Save file

4. [ ] Kiểm tra Console có log:
   - `🔄 Mails updated: {type: "fileChanged", ...}`

5. [ ] Kiểm tra UI:
   - [ ] Subject đã cập nhật
   - [ ] **KHÔNG CẦN F5**

**✅ PASS** | **❌ FAIL**

---

### Test 3: Xóa file 🗑️

1. [ ] Delete file `Test-Manual-Add.json`

2. [ ] Kiểm tra Console có log:
   - `🔄 Mails updated: {type: "fileDeleted", ...}`

3. [ ] Kiểm tra UI:
   - [ ] Mail đã biến mất
   - [ ] **KHÔNG CẦN F5**

**✅ PASS** | **❌ FAIL**

---

### Test 4: Chạy script test tự động 🤖

```bash
node test-realtime-sync.js
```

1. [ ] Script chạy không lỗi
2. [ ] Tất cả 5 tests PASS
3. [ ] UI update theo từng bước:
   - [ ] Mail 1 xuất hiện
   - [ ] Mail 1 cập nhật Subject
   - [ ] Mail 2 xuất hiện
   - [ ] Mail 1 biến mất
   - [ ] Mail 2 cleanup

**✅ PASS** | **❌ FAIL**

---

### Test 5: Tool BE thêm mail (Real-world scenario) 🔧

**Giả lập tool BE:**
```bash
# PowerShell
$mail = @{
  Subject = "From External Tool"
  From = "linkedin@linkedin.com"
  Type = "To"
  Date = @("2025-10-16", "15:00")
} | ConvertTo-Json

$mail | Out-File "C:\classifyMail\DungHan\mustRep\FromTool.json"
```

1. [ ] Chạy command trên
2. [ ] Kiểm tra Console
3. [ ] Kiểm tra UI:
   - [ ] Mail xuất hiện ngay lập tức
   - [ ] Có auto-assign nếu linkedin có trong group
   - [ ] **KHÔNG CẦN F5**

**✅ PASS** | **❌ FAIL**

---

### Test 6: Multiple files at once 📁📁📁

1. [ ] Copy-paste 5 files cùng lúc vào folder
2. [ ] Kiểm tra:
   - [ ] Tất cả 5 files xuất hiện
   - [ ] Console có 5 events
   - [ ] Không bị lag
   - [ ] **KHÔNG CẦN F5**

**✅ PASS** | **❌ FAIL**

---

### Test 7: Move file giữa các folders 🔄

1. [ ] Di chuyển file từ `DungHan\mustRep` → `QuaHan\chuaRep`
2. [ ] Kiểm tra:
   - [ ] File biến mất khỏi Valid Mails
   - [ ] File xuất hiện trong Expired Mails
   - [ ] **KHÔNG CẦN F5**

**✅ PASS** | **❌ FAIL**

---

## 🔍 Troubleshooting

### ❌ UI không update

**Check 1: Backend có chạy không?**
```bash
# Terminal backend phải có:
🚀 Mail Server Started!
📡 Server running on 0.0.0.0:3002
🔍 File watcher is READY
```

**Check 2: WebSocket có connect không?**
```javascript
// Browser Console phải có:
Socket connected: <id>
```

**Check 3: Backend có detect file change không?**
```bash
# Terminal backend phải có khi add file:
🔔 FILE ADD EVENT: C:\classifyMail\...
📁 ✅ MATCHED! New Valid Mail...
```

**Check 4: Frontend có nhận event không?**
```javascript
// Browser Console phải có:
🔄 Mails updated: {type: "fileAdded", ...}
```

**Check 5: API call có chạy không?**
```javascript
// Browser Console phải có:
🔄 Đang tải dữ liệu mail từ http://localhost:3002...
✅ Đã load X mail từ C:\classifyMail\
```

### ⚠️ Nếu vẫn không work:

1. [ ] Restart backend server
2. [ ] Restart frontend
3. [ ] Hard refresh browser (Ctrl + Shift + R)
4. [ ] Check firewall settings
5. [ ] Check port 3002 availability

---

## 📊 Final Score

**Total Tests**: 7  
**Passed**: ___  
**Failed**: ___  

### ✅ ALL PASS?
**🎉 Congratulations! Real-time sync is working perfectly!**

### ❌ Some FAIL?
**📝 Note which tests failed and check Troubleshooting section**

---

**Tester**: _______________  
**Date**: _______________  
**Time**: _______________  
**Result**: ✅ PASS / ❌ FAIL
