# 🔑 Password Reset Flow Diagram

## Admin Password Reset Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER FORGETS PASSWORD                             │
│                                                                       │
│  👤 User: "I can't login, I forgot my password!"                    │
│  📧 Email/Call/Message → Admin                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN VERIFICATION                                 │
│                                                                       │
│  🔍 Admin verifies user identity:                                    │
│      • Username                                                       │
│      • Email                                                          │
│      • Full Name                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN ACTION                                       │
│                                                                       │
│  1. Navigate to: Assignment > Users tab                              │
│  2. Find user in table                                               │
│  3. Click: 🔑 Reset Password button                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  SYSTEM PROCESSING                                    │
│                                                                       │
│  ⚙️  generateRandomPassword()                                        │
│      → "aB3$xK9%mP" (10 chars)                                       │
│                                                                       │
│  🔄 API PUT /api/users/by-id/{userId}                                │
│      → Update password (hashed)                                      │
│                                                                       │
│  💾 Database: passwordHash, passwordSalt updated                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MODAL DISPLAY                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ✅ Password Reset Successful                                │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  User Information:                                           │   │
│  │  • Username: john_doe                                        │   │
│  │  • Full Name: John Doe                                       │   │
│  │  • Email: john@example.com                                   │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  🔒 New Password:                                   │    │   │
│  │  │  ┌──────────────────────┬────────┐                 │    │   │
│  │  │  │  aB3$xK9%mP          │  📋   │                 │    │   │
│  │  │  └──────────────────────┴────────┘                 │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │                                                              │   │
│  │  ⚠️  Important: Copy and send to user securely!            │   │
│  │                                                              │   │
│  │  [📋 Copy Password]  [Close]                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN COPIES PASSWORD                              │
│                                                                       │
│  📋 Click "Copy Password" button                                     │
│  ✅ "Password copied to clipboard!"                                  │
│                                                                       │
│  Clipboard: "aB3$xK9%mP"                                             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ADMIN SENDS TO USER SECURELY                             │
│                                                                       │
│  Options:                                                             │
│  📧 Private Email                                                     │
│  💬 Private Message                                                   │
│  📱 SMS (if secure)                                                   │
│  ☎️  Phone call (read it out)                                        │
│                                                                       │
│  ❌ DON'T: Public chat, group message, sticky note                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER RECEIVES PASSWORD                             │
│                                                                       │
│  👤 User receives email/message                                      │
│  📝 Copies password: "aB3$xK9%mP"                                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER LOGS IN                                       │
│                                                                       │
│  🌐 Opens login page                                                 │
│  👤 Enters username                                                   │
│  🔑 Pastes password: "aB3$xK9%mP"                                    │
│  ✅ Click Login                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUCCESS! 🎉                                       │
│                                                                       │
│  ✅ User successfully logged in                                      │
│  🏠 Redirected to Dashboard                                          │
│  💡 Reminder: Change password in Profile                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technical Flow

```
┌──────────────────┐
│  Users Table UI  │
│                  │
│  [🔑][✏️][🗑️]   │
└──────────────────┘
         │
         │ onClick
         ▼
┌────────────────────────────┐
│ handleResetPassword(user)  │
└────────────────────────────┘
         │
         ├─► generateRandomPassword()
         │   └─► "aB3$xK9%mP"
         │
         ├─► setNewGeneratedPassword(password)
         ├─► setResetPasswordUser(user)
         │
         ├─► API Call
         │   └─► PUT /api/users/by-id/{id}
         │       ├─► Body: { password: newPassword, ...userInfo }
         │       ├─► Backend: hashPassword()
         │       └─► Database: UPDATE userData
         │
         ├─► setResetPasswordModal(true)
         └─► loadUsers() // Refresh

┌────────────────────────────┐
│  Reset Password Modal      │
│  ┌──────────────────────┐  │
│  │ User Info            │  │
│  │ • Username           │  │
│  │ • Full Name          │  │
│  │ • Email              │  │
│  ├──────────────────────┤  │
│  │ New Password         │  │
│  │ [aB3$xK9%mP] [📋]   │  │
│  ├──────────────────────┤  │
│  │ ⚠️ Warning           │  │
│  ├──────────────────────┤  │
│  │ [Copy] [Close]       │  │
│  └──────────────────────┘  │
└────────────────────────────┘
         │
         │ Copy button
         ▼
┌──────────────────────────────┐
│ navigator.clipboard          │
│   .writeText(password)       │
│                              │
│ ✅ Copied to clipboard!      │
└──────────────────────────────┘
```

---

## Security Flow

```
┌───────────────────────┐
│  Plain Password       │
│  "aB3$xK9%mP"        │
└───────────────────────┘
          │
          │ Sent to Backend
          ▼
┌───────────────────────┐
│  hashPassword()       │
│  • Generate salt      │
│  • pbkdf2Sync()      │
│  • 1000 iterations    │
│  • sha512 hash        │
└───────────────────────┘
          │
          ▼
┌───────────────────────────────────────┐
│  Database Storage                     │
│  ┌─────────────────────────────────┐ │
│  │ passwordHash:                   │ │
│  │ "5f4dcc3b5aa765d61d8327deb882..." │ │
│  │                                  │ │
│  │ passwordSalt:                   │ │
│  │ "random123abc456def..."         │ │
│  └─────────────────────────────────┘ │
└───────────────────────────────────────┘

❌ Original password "aB3$xK9%mP" CANNOT be retrieved!
✅ Only verification possible with verifyPassword()
```

---

## User Flow Comparison

### ❌ Before (Without Feature):

```
User forgets password
         │
         ▼
Contacts Admin
         │
         ▼
Admin: "Sorry, I can't see your password"
         │
         ▼
Admin manually creates new user account
         │
         ▼
User loses all history/data
         │
         ▼
😞 Bad experience
```

### ✅ After (With Feature):

```
User forgets password
         │
         ▼
Contacts Admin
         │
         ▼
Admin clicks Reset Password (1 click)
         │
         ▼
Copies and sends new password (1 minute)
         │
         ▼
User logs in successfully
         │
         ▼
😊 Great experience!
```

---

## Button Layout in Users Table

```
┌────────────────────────────────────────────────────────────────────────┐
│ User Info        │ Email            │ Status  │ Admin │ Actions        │
├────────────────────────────────────────────────────────────────────────┤
│ 👤 John Doe      │ john@example.com │ Active  │ User  │ [🔑][✏️][🗑️]  │
│    @john_doe     │                  │         │       │                │
├────────────────────────────────────────────────────────────────────────┤
│ 👤 Jane Smith    │ jane@example.com │ Active  │ Admin │ [🔑][✏️][❌]  │
│    @jane_smith   │                  │         │       │ (Delete disabled)│
└────────────────────────────────────────────────────────────────────────┘

Actions:
• 🔑 Reset Password (Blue/Info)   - Click to reset password
• ✏️  Edit User (Yellow/Warning)   - Click to edit user details
• 🗑️  Delete User (Red/Danger)    - Click to delete user
```

---

## Modal Component Structure

```
Modal (resetPasswordModal)
├── ModalHeader
│   └── "🔑 Password Reset Successful"
│
├── ModalBody
│   ├── Success Alert (Green)
│   │   └── "✅ Password has been reset successfully!"
│   │
│   ├── User Information Section
│   │   ├── Username (Badge)
│   │   ├── Full Name
│   │   └── Email
│   │
│   ├── Password Display Section (Blue border)
│   │   ├── Title: "🔒 New Password:"
│   │   ├── Code block: Password
│   │   └── Copy button (📋)
│   │
│   └── Warning Alert (Yellow)
│       └── "⚠️ Copy and send to user securely!"
│
└── ModalFooter
    ├── Copy Password Button (Blue)
    └── Close Button (Gray)
```

---

## State Management Flow

```
Component State:
├── resetPasswordModal: boolean
│   └── Controls modal visibility
│
├── resetPasswordUser: object | null
│   ├── username
│   ├── email
│   ├── fullName
│   ├── isAdmin
│   └── isActive
│
└── newGeneratedPassword: string
    └── Plain text password (10 chars)

State Changes:
1. Click Reset → Generate password
2. API success → Open modal
3. Click Copy → Copy to clipboard
4. Click Close → Clear state
```

---

## Password Generation Algorithm

```
function generateRandomPassword() {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyz
                   ABCDEFGHIJKLMNOPQRSTUVWXYZ
                   0123456789
                   !@#$%";

  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

Examples:
• "aB3$xK9%mP"
• "P@ssw0rd1!"
• "Xy7#mK2@Qz"
• "L9$nM3%pR1"
```

---

## Error Handling Flow

```
Try Reset Password
        │
        ├─► API Call Failed?
        │   ├─► Network Error
        │   │   └─► Show: "Failed to connect to server"
        │   │
        │   ├─► 400 Bad Request
        │   │   └─► Show: "Invalid user data"
        │   │
        │   ├─► 404 Not Found
        │   │   └─► Show: "User not found"
        │   │
        │   └─► 500 Server Error
        │       └─► Show: "Server error, try again"
        │
        ├─► Success?
        │   └─► Show Modal
        │
        └─► Finally
            └─► loadUsers() // Refresh table
```

---

## Complete Feature Summary

```
╔══════════════════════════════════════════════════════════════╗
║                   PASSWORD RESET FEATURE                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  PURPOSE:                                                     ║
║  • Help users who forgot passwords                           ║
║  • No "Forget Password" button needed                        ║
║  • Admin-managed password recovery                           ║
║                                                               ║
║  COMPONENTS:                                                  ║
║  ✅ Reset Password Button (🔑)                               ║
║  ✅ Password Generator Function                              ║
║  ✅ Reset Password Handler                                   ║
║  ✅ Beautiful Modal UI                                       ║
║  ✅ Copy to Clipboard Feature                                ║
║                                                               ║
║  SECURITY:                                                    ║
║  🔒 10-char random passwords                                 ║
║  🔒 Hashed storage (pbkdf2)                                  ║
║  🔒 One-time display                                         ║
║  🔒 Admin-only access                                        ║
║                                                               ║
║  BENEFITS:                                                    ║
║  🚀 Fast recovery (< 5 minutes)                              ║
║  👥 Better user experience                                    ║
║  🔐 Maintains security                                       ║
║  📱 Mobile-friendly UI                                       ║
║                                                               ║
╚══════════════════════════════════════════════════════════════╝
```

**Feature is production-ready! 🎉**
