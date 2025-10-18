# 📋 Real-time Sync - Quick Reference Card

## 🚀 ONE-LINER SUMMARY
**Thêm file vào folder → Mail hiển thị ngay lập tức (KHÔNG cần F5!)**

---

## ⚡ Quick Test (30 giây)

```bash
# 1. Start (if not running)
cd mail-server && npm start  # Terminal 1
npm start                    # Terminal 2

# 2. Add test file
echo {"Subject":"Quick Test","From":"test@test.com","Type":"To","Date":["2025-10-16","14:00"]} > "C:\classifyMail\DungHan\mustRep\QuickTest.json"

# 3. Check browser → ✅ Mail xuất hiện tự động!
```

---

## 📁 Monitored Folders

| Path | Description |
|------|-------------|
| `DungHan\mustRep` | Valid - Must Reply |
| `DungHan\rep` | Valid - Replied |
| `QuaHan\chuaRep` | Expired - Not Replied |
| `QuaHan\daRep` | Expired - Replied |
| `ReviewMail\pending` | Review - Pending |
| `ReviewMail\processed` | Review - Processed |

---

## 🔍 How to Verify It's Working

### Backend Console:
```
✅ 🔔 FILE ADD EVENT: C:\classifyMail\...
✅ 📁 ✅ MATCHED! New Valid Mail file detected
```

### Frontend Console:
```
✅ 🔄 Mails updated: {type: "fileAdded", ...}
✅ ✅ Đã load X mail từ C:\classifyMail\
```

### UI:
```
✅ Mail appears automatically
✅ No F5 needed
✅ Instant update
```

---

## 🎯 What Works

| Action | Result |
|--------|--------|
| ➕ Add file manually | ✅ Auto-show |
| ✏️ Edit file | ✅ Auto-update |
| 🗑️ Delete file | ✅ Auto-remove |
| 🔧 Tool BE adds file | ✅ Auto-show |
| 📋 Copy-paste files | ✅ Auto-show all |
| 🔄 Move between folders | ✅ Auto-update |

---

## 📡 Events Emitted

```javascript
// Backend → Frontend via WebSocket

mailsUpdated     // File add/change/delete
mailAssigned     // Auto-assignment complete
mailStatsUpdate  // Statistics changed
newMailsDetected // New mails found
```

---

## 🔧 Key Files Modified

| File | What Changed |
|------|--------------|
| `mail-server/server.js` | ➕ Emit `mailsUpdated` events |
| `src/hooks/useMailData.js` | ➕ Listen to events & auto-reload |

---

## 🧪 Test Commands

### Automated Test:
```bash
node test-realtime-sync.js
```

### Manual PowerShell Test:
```powershell
# Add
$mail = @{Subject="Test";From="test@test.com";Type="To";Date=@("2025-10-16","14:00")} | ConvertTo-Json
$mail | Out-File "C:\classifyMail\DungHan\mustRep\PSTest.json"

# Delete
Remove-Item "C:\classifyMail\DungHan\mustRep\PSTest.json"
```

---

## 🐛 Troubleshooting 101

### Problem: UI not updating

**Check 1**: Backend running? → `cd mail-server && npm start`  
**Check 2**: Frontend running? → `npm start`  
**Check 3**: WebSocket connected? → See "Socket connected" in console  
**Check 4**: File in correct folder? → Must be in monitored folders  
**Check 5**: Valid JSON? → Check file format  

### Quick Fix:
```bash
# Restart everything
Ctrl+C on both terminals
cd mail-server && npm start  # Terminal 1
npm start                    # Terminal 2
Hard refresh browser (Ctrl+Shift+R)
```

---

## 📊 Console Logs Cheat Sheet

### ✅ GOOD (Working):
```
Backend:
  🔔 FILE ADD EVENT
  📁 ✅ MATCHED!
  ✅ SUCCESS! Auto-assigned

Frontend:
  🔄 Mails updated
  ✅ Đã load X mail
```

### ❌ BAD (Not Working):
```
Backend:
  ❌ Error reading file
  ⚠️  File not found
  
Frontend:
  ❌ Failed to fetch
  ERR_CONNECTION_REFUSED
```

---

## 💡 Pro Tips

- ✅ Backend **MUST** run before frontend for real-time to work
- ✅ Port 3002 must be free for backend
- ✅ WebSocket needs both servers running
- ✅ File format matters - must be valid JSON
- ✅ Auto-assign only works if sender has matching group

---

## 📚 Full Docs

- 📖 `REALTIME_FILE_SYNC_FIX.md` - Technical details
- 📖 `HUONG_DAN_FIX_REALTIME.md` - Vietnamese guide
- 📖 `REALTIME_SYNC_SUMMARY.md` - Implementation summary
- 📖 `REALTIME_FLOW_DIAGRAM.md` - Visual diagrams
- 📖 `TEST_CHECKLIST_REALTIME.md` - Full test checklist

---

## ✨ The Magic Behind It

```
File Change → Chokidar → WebSocket → Frontend → UI Update
              (500ms)     (instant)   (instant)   (instant)
              
Total time: ~500ms = FEELS INSTANT! ⚡
```

---

## 🎉 Bottom Line

**NO MORE F5 NEEDED!**

Just add files to folders and watch the magic happen! ✨

---

**Print this card and keep it handy! 📌**
