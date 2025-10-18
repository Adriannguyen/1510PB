# 📊 Real-time Sync Flow Diagram

## 🔄 Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FILE SYSTEM CHANGES                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌──────────┐    ┌──────────┐    ┌──────────┐
            │   ADD    │    │  CHANGE  │    │  DELETE  │
            │   FILE   │    │   FILE   │    │   FILE   │
            └──────────┘    └──────────┘    └──────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
            ┌──────────────────────────────────────────┐
            │        CHOKIDAR FILE WATCHER             │
            │   (watching C:\classifyMail\)            │
            └──────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌──────────┐    ┌──────────┐    ┌──────────┐
            │  .on()   │    │  .on()   │    │  .on()   │
            │  "add"   │    │ "change" │    │ "unlink" │
            └──────────┘    └──────────┘    └──────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
            ┌──────────────────────────────────────────┐
            │   EMIT WEBSOCKET EVENT                   │
            │   broadcastToClients("mailsUpdated")     │
            │   {type, fileName, timestamp}            │
            └──────────────────────────────────────────┘
                                    │
                                    ▼
            ┌──────────────────────────────────────────┐
            │         WEBSOCKET (Socket.io)            │
            │         Port: 3002                       │
            └──────────────────────────────────────────┘
                                    │
                                    ▼
            ┌──────────────────────────────────────────┐
            │    FRONTEND SOCKET LISTENER              │
            │    socket.on("mailsUpdated", ...)        │
            └──────────────────────────────────────────┘
                                    │
                                    ▼
            ┌──────────────────────────────────────────┐
            │         TRIGGER loadData()               │
            │    (in useMailData.js hook)              │
            └──────────────────────────────────────────┘
                                    │
                                    ▼
            ┌──────────────────────────────────────────┐
            │       API CALL: GET /api/mails           │
            │       Fetch updated mail list            │
            └──────────────────────────────────────────┘
                                    │
                                    ▼
            ┌──────────────────────────────────────────┐
            │      BACKEND SCANS FILE SYSTEM           │
            │      scanMailDirectory()                 │
            └──────────────────────────────────────────┘
                                    │
                                    ▼
            ┌──────────────────────────────────────────┐
            │      RETURN UPDATED MAIL DATA            │
            │      JSON Array of all mails             │
            └──────────────────────────────────────────┘
                                    │
                                    ▼
            ┌──────────────────────────────────────────┐
            │      UPDATE REACT STATE                  │
            │      setMails(loadedMails)               │
            └──────────────────────────────────────────┘
                                    │
                                    ▼
            ┌──────────────────────────────────────────┐
            │      RE-RENDER UI COMPONENTS             │
            │      Dashboard, ValidMails, etc.         │
            └──────────────────────────────────────────┘
                                    │
                                    ▼
            ┌──────────────────────────────────────────┐
            │   ✅ USER SEES UPDATED MAIL LIST!        │
            │      (No F5 needed!)                     │
            └──────────────────────────────────────────┘
```

---

## 🎯 Event Types Detail

```
┌─────────────────────────────────────────────────────────────┐
│                    FILE ADDED                               │
├─────────────────────────────────────────────────────────────┤
│ Trigger: New .json file created in monitored folder         │
│ Chokidar: .on("add", filePath)                             │
│ Emit: mailsUpdated {type: "fileAdded"}                     │
│ Also: Check for auto-assignment                             │
│ Extra Emit: mailAssigned (if auto-assigned)                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   FILE CHANGED                              │
├─────────────────────────────────────────────────────────────┤
│ Trigger: Existing .json file modified                      │
│ Chokidar: .on("change", filePath)                          │
│ Emit: mailsUpdated {type: "fileChanged"}                   │
│ Delay: setTimeout(500ms) before checkForNewMails()         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   FILE DELETED                              │
├─────────────────────────────────────────────────────────────┤
│ Trigger: .json file removed from folder                    │
│ Chokidar: .on("unlink", filePath)                          │
│ Emit: mailsUpdated {type: "fileDeleted"}                   │
│ Delay: setTimeout(500ms) before checkForNewMails()         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 WebSocket Events

```
┌─────────────────────────────────────────────────────────────┐
│  EVENT: mailsUpdated                                        │
├─────────────────────────────────────────────────────────────┤
│  Payload: {                                                  │
│    type: "fileAdded" | "fileChanged" | "fileDeleted"        │
│          | "fileSystemChange",                              │
│    fileName: "MailName.json",                               │
│    timestamp: "2025-10-16T14:30:00.000Z"                    │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  EVENT: mailAssigned                                        │
├─────────────────────────────────────────────────────────────┤
│  Payload: {                                                  │
│    mail: {...},                                             │
│    fileName: "MailName.json",                               │
│    category: "DungHan" | "QuaHan" | "ReviewMail",          │
│    status: "mustRep" | "rep" | "chuaRep" | "daRep",        │
│    timestamp: Date                                          │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  EVENT: mailStatsUpdate                                     │
├─────────────────────────────────────────────────────────────┤
│  Payload: {                                                  │
│    totalMails: 120,                                         │
│    newMails: 5,                                             │
│    dungHanCount: 80,                                        │
│    quaHanCount: 40,                                         │
│    lastUpdate: Date                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  EVENT: newMailsDetected                                    │
├─────────────────────────────────────────────────────────────┤
│  Payload: {                                                  │
│    count: 3,                                                │
│    timestamp: Date,                                         │
│    shouldReload: false,                                     │
│    autoAssigned: 2                                          │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Layers

```
┌───────────────────────────────────────────────────────────────┐
│                     USER INTERACTION                          │
│  • Add file via Explorer                                      │
│  • Tool BE creates file                                       │
│  • Script generates file                                      │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                    FILE SYSTEM LAYER                          │
│  • C:\classifyMail\DungHan\mustRep\                          │
│  • C:\classifyMail\QuaHan\chuaRep\                           │
│  • ... (6 monitored folders)                                  │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                   FILE WATCHER LAYER                          │
│  • Chokidar (Node.js)                                         │
│  • Persistent watching                                        │
│  • Debounce & throttle                                        │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                   BACKEND LOGIC LAYER                         │
│  • Event detection                                            │
│  • Auto-assignment logic                                      │
│  • File validation                                            │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                 COMMUNICATION LAYER                           │
│  • WebSocket (Socket.io)                                      │
│  • Event emission                                             │
│  • REST API                                                   │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                              │
│  • React Hooks (useMailData)                                  │
│  • Socket.io Client                                           │
│  • State management                                           │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                      UI LAYER                                 │
│  • React Components                                           │
│  • Dashboard                                                  │
│  • Mail Lists                                                 │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                    USER SEES UPDATE                           │
│  ✅ Real-time, no F5 needed!                                  │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔄 Before vs After

### ❌ BEFORE (Manual Refresh Required)
```
Add File → File System → Chokidar (✓) → No Event (✗) 
                                              ↓
                                    Frontend Unaware (✗)
                                              ↓
                                    User Press F5 (😞)
                                              ↓
                                    Manual Reload (⏱️)
```

### ✅ AFTER (Automatic Real-time Sync)
```
Add File → File System → Chokidar (✓) → Emit Event (✓)
                                              ↓
                                    WebSocket Broadcast (✓)
                                              ↓
                                    Frontend Receives (✓)
                                              ↓
                                    Auto Reload Data (⚡)
                                              ↓
                                    UI Updates (🎉)
                                              ↓
                                    User Happy (😊)
```

---

## ⚡ Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│  OPTIMIZATION LAYER                                          │
├─────────────────────────────────────────────────────────────┤
│  1. Chokidar awaitWriteFinish: true                         │
│     → Prevents duplicate events during file write           │
│                                                              │
│  2. setTimeout debounce (500-1000ms)                        │
│     → Batches rapid changes                                 │
│                                                              │
│  3. Single API call per change                              │
│     → Efficient network usage                               │
│                                                              │
│  4. ignoreInitial: true                                     │
│     → Doesn't fire on startup scan                          │
│                                                              │
│  5. hasChanges check in scanMailDirectory()                 │
│     → Only updates if data actually changed                 │
└─────────────────────────────────────────────────────────────┘
```

---

**Visual documentation complete! 🎨**
