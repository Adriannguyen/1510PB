# 🤖 Auto-Assign PIC Feature Implementation

## 📋 Tổng quan

Đã implement tính năng **tự động phân công PIC (Person In Charge)** khi có mail mới xuất hiện trong các folder:
- ✅ **Valid Mails** (DungHan/mustRep, DungHan/rep)
- ✅ **Expired Mails** (QuaHan/chuaRep, QuaHan/daRep)
- ✅ **Review Mails** (ReviewMail/pending, ReviewMail/processed)

## 🎯 Cách hoạt động

### 1. **File Watcher Monitoring**
Khi có file JSON mới được tạo trong các folder trên, hệ thống sẽ:
1. Phát hiện file mới qua Chokidar watcher
2. Đọc dữ liệu mail từ file
3. Lấy email người gửi (From/from/sender/EncryptedFrom)
4. Tìm group tương ứng với sender email
5. Lấy PIC leader của group đó
6. Tự động assign mail cho PIC leader
7. Lưu lại thông tin assignment vào file
8. Broadcast notification qua WebSocket

### 2. **Group Matching Logic**

Hệ thống hỗ trợ 2 loại matching:

#### **Exact Email Match**
```javascript
// Group members: ['a@gmail.com', 'b@gmail.com']
// Mail from: 'a@gmail.com'
// → Match! ✅
```

#### **Domain Wildcard Match**
```javascript
// Group members: ['*.company.com']
// Mail from: 'user@company.com'
// → Match! ✅
```

### 3. **Assignment Data Structure**

Mail được assigned sẽ có thêm field:
```json
{
  "assignedTo": {
    "type": "pic",
    "picId": "group-123",
    "picName": "John Doe",
    "picEmail": "john.doe@company.com",
    "assignedAt": "2025-10-09T10:00:00.000Z",
    "assignedBy": "system_auto",
    "groupId": "group-123",
    "groupName": "Marketing Team"
  }
}
```

## 🔧 Thay đổi Code

### File: `mail-server/server.js`

#### **1. Enhanced File Watcher** (Lines ~1596)
```javascript
// Monitor 6 folders instead of just 2
const autoAssignFolders = [
  { path: "DungHan\\mustRep", category: "DungHan", status: "mustRep" },
  { path: "DungHan\\rep", category: "DungHan", status: "rep" },
  { path: "QuaHan\\chuaRep", category: "QuaHan", status: "chuaRep" },
  { path: "QuaHan\\daRep", category: "QuaHan", status: "daRep" },
  { path: "ReviewMail\\pending", category: "ReviewMail", status: "pending" },
  { path: "ReviewMail\\processed", category: "ReviewMail", status: "processed" }
];
```

#### **2. Improved Auto-Assign Function** (Lines ~860)
```javascript
const autoAssignLeaderBySenderGroup = (mailData, filePath = null) => {
  // Enhanced matching logic:
  // - Support multiple sender field names
  // - Exact email match
  // - Domain wildcard match (*.domain.com)
  // - Better error logging
}
```

## 📊 Testing

### Test Script: `test-auto-assign-all-folders.js`

Chạy test để verify tính năng:

```bash
node test-auto-assign-all-folders.js
```

Script sẽ:
1. Tạo 6 mail test (1 cho mỗi folder)
2. Đợi 2 giây để auto-assign hoạt động
3. Kiểm tra xem mail đã được assign chưa
4. Hiển thị kết quả chi tiết
5. Xóa file test

**Expected Output:**
```
🧪 Testing Auto-Assign for ALL Folders
======================================

📝 Testing: DungHan/mustRep
   Sender: a@gmail.com
   Subject: Test Auto-Assign Valid Mail (Must Reply)
✅ Mail auto-assigned to: John Doe (Marketing Team)
---

📊 Test Results Summary
========================
1. ✅ PASSED - DungHan/mustRep
   → Assigned to: John Doe (Marketing Team)
2. ✅ PASSED - DungHan/rep
   → Assigned to: John Doe (Marketing Team)
...
📈 Success Rate: 6/6 (100.0%)
🎉 All tests passed!
```

## 🚀 Cách sử dụng

### 1. **Setup Groups**
Tạo file group trong `C:\classifyMail\AssignmentData\Groups\`:

```json
{
  "id": "group-1",
  "name": "Marketing Team",
  "description": "Marketing Department",
  "members": [
    "a@gmail.com",
    "b@gmail.com",
    "*.marketing.com"
  ],
  "pic": "John Doe",
  "picEmail": "john.doe@company.com"
}
```

### 2. **Thêm Mail Mới**
Khi thêm mail vào bất kỳ folder nào:
- `C:\classifyMail\DungHan\mustRep\`
- `C:\classifyMail\DungHan\rep\`
- `C:\classifyMail\QuaHan\chuaRep\`
- `C:\classifyMail\QuaHan\daRep\`
- `C:\classifyMail\ReviewMail\pending\`
- `C:\classifyMail\ReviewMail\processed\`

Hệ thống sẽ **TỰ ĐỘNG** assign PIC leader dựa trên sender email!

### 3. **Kiểm tra Assignment**
Mở file mail sau khi tạo (sau ~1-2 giây):
```json
{
  "Subject": "Your mail subject",
  "From": "a@gmail.com",
  "assignedTo": {
    "picName": "John Doe",
    "picEmail": "john.doe@company.com",
    "groupName": "Marketing Team",
    "assignedBy": "system_auto"
  }
}
```

## 📡 Real-time Updates

Frontend sẽ nhận được notification qua WebSocket:
```javascript
socket.on('mailAssigned', (data) => {
  // data.mail - Mail data với assignment
  // data.category - DungHan/QuaHan/ReviewMail
  // data.status - mustRep/rep/chuaRep/daRep/pending/processed
  // → Tự động refresh UI
});
```

## ⚙️ Configuration

### Thời gian xử lý
```javascript
setTimeout(() => {
  // Auto-assign logic
}, 1000); // 1 second delay
```

### Folders được monitor
Chỉnh sửa array `autoAssignFolders` trong file watcher để thêm/bớt folder.

## 🔍 Troubleshooting

### Mail không được auto-assign?

**Kiểm tra:**
1. ✅ Server đang chạy? (`cd mail-server && npm start`)
2. ✅ Group có tồn tại trong `AssignmentData\Groups\`?
3. ✅ Sender email có trong `members` của group?
4. ✅ Group có `pic` và `picEmail`?
5. ✅ Mail chưa có `assignedTo` field?

**Xem log:**
```bash
# Server log sẽ hiển thị:
🎯 Auto-assigning mail from a@gmail.com to group leader: John Doe
✅ Valid Mail auto-assigned to: John Doe (Marketing Team)
💾 Saved auto-assigned mail data to C:\classifyMail\...
```

### Test thất bại?

**Chạy test debug:**
```bash
node test-auto-assign-all-folders.js
```

Xem output để biết folder nào fail và lý do.

## ✅ Benefits

1. 🚀 **Tự động hóa** - Không cần assign thủ công
2. ⚡ **Real-time** - Assign ngay khi mail tới
3. 🎯 **Chính xác** - Dựa trên group configuration
4. 📊 **Traceability** - Lưu lại `assignedBy: "system_auto"`
5. 🔄 **Scalable** - Hỗ trợ tất cả folder mail

## 🎉 Summary

✅ **Completed Features:**
- Auto-assign cho 6 folders (ValidMails, ExpiredMails, ReviewMails)
- Support exact email match và domain wildcard
- Real-time WebSocket notification
- Comprehensive test script
- Error handling và logging

✅ **Auto-assign được trigger khi:**
- Mail mới được tạo trong bất kỳ folder được monitor
- Mail chưa có assignment (`!mailData.assignedTo`)
- Sender email match với group member

✅ **Kết quả:**
Hệ thống tự động phân công PIC leader cho mail mới dựa trên sender email! 🎊
