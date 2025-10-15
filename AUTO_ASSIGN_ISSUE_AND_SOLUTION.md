# 🐛 VẤN ĐỀ AUTO-ASSIGN VÀ GIẢI PHÁP

## ❌ Vấn đề hiện tại

**File watcher KHÔNG phát hiện file mới!**

### Triệu chứng:
1. ✅ Button "Auto Assign" trong UI hoạt động TỐT
2. ❌ Khi tạo mail mới thủ công → KHÔNG tự động assign
3. ❌ Server log KHÔNG hiện "🔔 FILE ADD EVENT"
4. ❌ File watcher IS READY nhưng KHÔNG trigger

### Nguyên nhân:
Chokidar watcher có vấn đề với configuration hoặc Windows file system events.

## ✅ GIẢI PHÁP TẠM THỜI

Vì button auto-assign đã hoạt động, bạn có thể:

### Cách 1: Sử dụng Button Auto-Assign
1. Vào trang mail (ValidMails/ExpiredMails/ReviewMails)
2. Chọn (checkbox) các mail chưa assign
3. Click button "Auto Assign Selected"
4. ✅ Mail sẽ được assign ngay lập tức!

### Cách 2: API Endpoint
Gọi API để trigger auto-assign:

```javascript
fetch('http://localhost:3002/api/trigger-auto-assign', {
  method: 'POST'
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🔧 GIẢI PHÁP DÀI HẠN

### Option 1: Polling thay vì File Watcher

Thêm vào server.js:

```javascript
// Poll for new mails every 5 seconds
setInterval(() => {
  checkForNewMailsAndAutoAssign();
}, 5000);

function checkForNewMailsAndAutoAssign() {
  const foldersToCheck = [
    'DungHan/mustRep',
    'DungHan/rep',
    'QuaHan/chuaRep',
    'QuaHan/daRep',
    'ReviewMail/pending',
    'ReviewMail/processed'
  ];

  for (const folder of foldersToCheck) {
    const folderPath = path.join(MAIL_DATA_PATH, folder);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const mailData = readJsonFile(filePath);
      
      // Auto-assign if not assigned
      if (mailData && !mailData.assignedTo) {
        const updated = autoAssignLeaderBySenderGroup(mailData, filePath);
        if (updated.assignedTo) {
          console.log(`✅ Polling: Auto-assigned ${file}`);
        }
      }
    }
  }
}
```

### Option 2: Sử dụng fs.watch thay vì Chokidar

```javascript
const foldersToWatch = [
  path.join(MAIL_DATA_PATH, 'DungHan/mustRep'),
  path.join(MAIL_DATA_PATH, 'DungHan/rep'),
  // ... other folders
];

foldersToWatch.forEach(folder => {
  fs.watch(folder, (eventType, filename) => {
    if (eventType === 'rename' && filename && filename.endsWith('.json')) {
      const filePath = path.join(folder, filename);
      
      // Wait a bit for file to be fully written
      setTimeout(() => {
        const mailData = readJsonFile(filePath);
        if (mailData && !mailData.assignedTo) {
          autoAssignLeaderBySenderGroup(mailData, filePath);
        }
      }, 1000);
    }
  });
});
```

### Option 3: Auto-assign khi tạo mail qua API

Đã implement! Khi tạo mail qua API `/api/mails`, nó tự động assign.

```javascript
// Line ~1507 in server.js
mailData = autoAssignLeaderBySenderGroup(mailData, null);
```

## 📊 TEST HIỆN TẠI

### Test Button Auto-Assign:
```bash
# Tạo mail mới mà KHÔNG có assignedTo
$mail = @{
  id='test-manual-123'
  Subject='Test Manual Assign'
  From='a@gmail.com'
  Date=@('2025-10-09','20:00')
  Type='To'
  Status='New'
}
$mail | ConvertTo-Json | Out-File "C:\classifyMail\DungHan\mustRep\test-manual-123.json"

# Sau đó vào UI:
# 1. Refresh trang
# 2. Chọn mail vừa tạo
# 3. Click "Auto Assign Selected"
# 4. ✅ Mail được assign!
```

## 🎯 KHUYẾN NGHỊ

**GIẢI PHÁP TỐT NHẤT:**

Implement **Polling mechanism** vì:
- ✅ Reliable trên mọi OS
- ✅ Không phụ thuộc file system events
- ✅ Đơn giản, dễ debug
- ✅ Performance OK (check mỗi 5-10 giây)

Kết hợp với:
- ✅ Auto-assign khi tạo mail qua API (đã có)
- ✅ Button manual auto-assign trong UI (đã có)

## 📝 IMPLEMENTATION

Tôi sẽ tạo file patch để add polling:

```javascript
// Add này vào cuối phần watcher setup trong server.js

// Fallback: Poll for unassigned mails every 10 seconds
let pollingInterval = setInterval(() => {
  autoAssignUnassignedMails();
}, 10000);

function autoAssignUnassignedMails() {
  const folders = [
    {path: 'DungHan/mustRep', cat: 'DungHan', status: 'mustRep'},
    {path: 'DungHan/rep', cat: 'DungHan', status: 'rep'},
    {path: 'QuaHan/chuaRep', cat: 'QuaHan', status: 'chuaRep'},
    {path: 'QuaHan/daRep', cat: 'QuaHan', status: 'daRep'},
    {path: 'ReviewMail/pending', cat: 'ReviewMail', status: 'pending'},
    {path: 'ReviewMail/processed', cat: 'ReviewMail', status: 'processed'}
  ];

  let assignedCount = 0;

  for (const folder of folders) {
    const folderPath = path.join(MAIL_DATA_PATH, folder.path);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      try {
        const filePath = path.join(folderPath, file);
        const mailData = readJsonFile(filePath);
        
        if (mailData && !mailData.assignedTo) {
          const updated = autoAssignLeaderBySenderGroup(mailData, filePath);
          
          if (updated.assignedTo) {
            assignedCount++;
            console.log(`🔄 Polling: Auto-assigned ${file} to ${updated.assignedTo.picName}`);
            
            // Broadcast to clients
            broadcastToClients("mailAssigned", {
              mail: updated,
              fileName: file,
              category: folder.cat,
              status: folder.status,
              timestamp: new Date()
            });
          }
        }
      } catch (error) {
        // Silent fail for individual files
      }
    }
  }

  if (assignedCount > 0) {
    console.log(`✅ Polling: Auto-assigned ${assignedCount} mail(s)`);
    checkForNewMails(); // Update stats
  }
}

// Cleanup on server shutdown
process.on('SIGTERM', () => {
  clearInterval(pollingInterval);
});
```

Bạn có muốn tôi implement polling mechanism này không? 🤔
