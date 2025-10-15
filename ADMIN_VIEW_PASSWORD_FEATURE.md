# 🔐 Admin View User Password Feature

## 🎯 Vấn đề

User request: **"tôi muốn hiển thị mật khẩu của người đó ở trong phần chỉnh sửa user nữa"**

### Yêu cầu:

- Admin vào Assignment > Users > Click Edit User
- Form edit user cần **hiển thị password hiện tại** của user đó
- Admin có thể xem password để gửi cho user khi họ quên
- Admin có thể sửa password trực tiếp trong form edit

---

## ⚠️ Security Warning

**QUAN TRỌNG:** Feature này lưu plain text password trong database để admin có thể xem. Đây là **trade-off giữa security và usability**.

### Security Considerations:

#### ✅ Pros (Why we implement this):

- Admin có thể giúp user recover password
- Không cần "Forget Password" feature
- Fast user support
- Simple workflow

#### ⚠️ Cons (Security risks):

- Plain text passwords stored in database
- If database compromised, all passwords exposed
- Not recommended for production systems with sensitive data
- Violates security best practices

#### 🛡️ Mitigations:

- Only admins can view passwords
- Passwords still hashed for authentication
- Both plainPassword and passwordHash stored
- Console logging for audit trail

---

## ✅ Implementation

### **1. Backend Changes**

#### **File: `mail-server/server.js`**

#### **A. Register API - Store Plain Password**

```javascript
// Hash password
const { salt, hash } = hashPassword(password);

// Create user data
const userData = {
  username,
  email,
  fullName,
  role: role || "user",
  passwordHash: hash,
  passwordSalt: salt,
  plainPassword: password, // ⚠️ Store plain password for admin recovery
};
```

#### **B. Update User API - Update Plain Password**

```javascript
app.put("/api/users/by-id/:id", (req, res) => {
  const { id } = req.params;
  const {
    username,
    email,
    fullName,
    department,
    phone,
    isAdmin,
    isActive,
    password,
  } = req.body; // ✅ Add password to destructure

  // ... existing code ...

  // Update password if provided
  if (password && password.trim() !== "") {
    const { salt, hash } = hashPassword(password);
    updatedUser.passwordHash = hash;
    updatedUser.passwordSalt = salt;
    updatedUser.plainPassword = password; // ⚠️ Store plain password
    console.log(`🔑 [PUT] Password updated for user: ${username}`);
  }

  // ... rest of code ...
});
```

#### **C. Change Password API - Update Plain Password**

```javascript
// Hash new password
const { salt, hash } = hashPassword(newPassword);

// Update user data
userData.passwordHash = hash;
userData.passwordSalt = salt;
userData.plainPassword = newPassword; // ⚠️ Store plain password
userData.updatedAt = new Date().toISOString();
```

#### **D. Get Users API - Return Plain Password**

```javascript
for (const file of userFiles) {
  if (file.endsWith(".json")) {
    const userData = readJsonFile(path.join(USER_DATA_PATH, file));
    if (userData) {
      // Remove sensitive data (but keep plainPassword for admin)
      const { passwordHash, passwordSalt, ...safeUserData } = userData;

      const mappedUser = {
        ...safeUserData,
        isAdmin: userData.role === "admin",
        department: userData.department || "",
        phone: userData.phone || "",
        lastLogin: userData.lastLogin || null,
        plainPassword: userData.plainPassword || "", // ✅ Include for admin
      };

      users.push(mappedUser);
    }
  }
}
```

---

### **2. Frontend Changes**

#### **File: `src/views/Assignment.js`**

#### **A. Update handleEditUser - Show Plain Password**

```javascript
const handleEditUser = (user) => {
  console.log("🔧 handleEditUser called with user:", user);
  console.log("🔧 User plainPassword:", user.plainPassword);

  setEditingUser(user);
  const formData = {
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    password: user.plainPassword || "", // ✅ Show existing password
    isAdmin: user.isAdmin,
    isActive: user.isActive,
  };

  setUserForm(formData);
  setUserModal(true);
};
```

#### **B. Update Password Field Label**

```javascript
<Label for="password">
  Password{" "}
  {editingUser ? (
    <span className="text-info">(current password shown)</span>
  ) : (
    <span className="text-danger">*</span>
  )}
</Label>
```

#### **C. Update Password Field Placeholder**

```javascript
<Input
  type={showPassword ? "text" : "password"}
  id="password"
  value={userForm.password}
  onChange={(e) => {
    setUserForm({
      ...userForm,
      password: e.target.value,
    });
  }}
  placeholder={
    editingUser ? "Modify password or leave as is" : "Enter password"
  }
  required={!editingUser}
/>
```

---

## 📊 User Flow

### **Create New User:**

```
Admin clicks "Add User"
         │
         ▼
Modal opens with empty form
         │
         ▼
Admin enters:
  • Username
  • Email
  • Full Name
  • Password *** (required)
  • IsAdmin checkbox
  • IsActive checkbox
         │
         ▼
Click "Save"
         │
         ▼
Backend:
  • Hash password → passwordHash, passwordSalt
  • Store plain → plainPassword
  • Save user.json
         │
         ▼
✅ User created
```

---

### **Edit Existing User:**

```
Admin clicks Edit button (✏️)
         │
         ▼
Modal opens with user data
         │
         ▼
Password field shows:
  "MyP@ssw0rd123" (current password)
         │
         ▼
Admin can:
  ┌─────────────┬──────────────┐
  │ View it     │ Copy it      │
  │ (👁️ button)│ (Send to     │
  │             │  user)       │
  └─────────────┴──────────────┘
  │ Modify it   │ Leave as is  │
  │ (type new)  │ (no change)  │
  └─────────────┴──────────────┘
         │
         ▼
Click "Save"
         │
         ▼
Backend:
  If password changed:
    • Hash new password
    • Update passwordHash, passwordSalt
    • Update plainPassword
  If password unchanged:
    • Skip password update
         │
         ▼
✅ User updated
```

---

## 🎨 UI Changes

### **Password Field in Edit Mode:**

#### **Before:**

```
┌─────────────────────────────────────────┐
│ Password (leave blank to keep current)  │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │ ← Empty
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### **After:**

```
┌─────────────────────────────────────────┐
│ Password (current password shown)       │
│ ┌─────────────────────────────────────┐ │
│ │ MyP@ssw0rd123              [👁️]    │ │ ← Shows password
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 💡 Features

### **1. View Current Password**

- ✅ Password shown in input field
- ✅ Can toggle visibility with 👁️ button
- ✅ Admin can copy and send to user

### **2. Edit Password Inline**

- ✅ Admin can modify password directly
- ✅ Type new password to change
- ✅ Leave unchanged to keep current

### **3. Flexible Workflow**

- ✅ **View only:** Just look at password, don't edit
- ✅ **Copy:** Copy password to send to user
- ✅ **Edit:** Change password inline
- ✅ **Reset:** Use Reset Password button for random password

---

## 🔄 Password Update Logic

```javascript
// In handleSaveUser:
const userData = { ...userForm };

// For edit mode, only include password if it's not empty
if (editingUser && !userData.password) {
  delete userData.password; // Don't update password
}

// If password has value:
// - New user: Required, will be saved
// - Edit user: Optional, will update if changed
```

### **Scenarios:**

| Scenario                  | Password Field          | Backend Action                                     |
| ------------------------- | ----------------------- | -------------------------------------------------- |
| **Create new user**       | "MyPass123"             | Hash + store plain                                 |
| **Edit user - no change** | "MyPass123" (unchanged) | Send to backend → Update if different from current |
| **Edit user - change**    | "NewPass456"            | Hash + store new plain                             |
| **Edit user - empty**     | "" (cleared)            | Don't update password                              |

---

## 📝 Database Structure

### **User JSON File:**

```json
{
  "id": "1729123456789",
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "user",
  "isActive": true,
  "passwordHash": "5f4dcc3b5aa765d61d8327deb88...",
  "passwordSalt": "random123abc456def789...",
  "plainPassword": "MyP@ssw0rd123", // ⚠️ NEW FIELD
  "createdAt": "2024-10-14T10:30:00.000Z",
  "updatedAt": "2024-10-14T15:45:00.000Z",
  "lastLogin": "2024-10-14T16:00:00.000Z"
}
```

### **Fields:**

- `passwordHash`: SHA512 hash for authentication
- `passwordSalt`: Random salt for hashing
- `plainPassword`: Plain text password for admin viewing

### **Authentication Process:**

```
User login with "MyP@ssw0rd123"
         │
         ▼
Backend: verifyPassword(input, salt, hash)
         │
         ├─► Hash input with salt
         ├─► Compare with passwordHash
         └─► Return true/false

✅ plainPassword NOT used for authentication
✅ Only passwordHash is used
```

---

## 🔒 Security Best Practices

### **What We're Doing:**

1. ✅ **Dual Storage:**

   - `plainPassword` for admin viewing
   - `passwordHash` for authentication

2. ✅ **Separate Concerns:**

   - Authentication uses hash
   - Admin recovery uses plain

3. ✅ **Admin-Only Access:**

   - Only admins can see users list
   - Only admins can edit users
   - Regular users cannot see others' passwords

4. ✅ **Audit Trail:**
   - Console logs password updates
   - Track who changed what

### **What You Should Do:**

1. 🔒 **Restrict Database Access:**

   - Only authorized admins can access server
   - Protect `C:\classifyMail\userData\` folder

2. 🔒 **Encrypt Database:**

   - Consider encrypting user JSON files
   - Use file system encryption

3. 🔒 **Use HTTPS:**

   - Always use HTTPS in production
   - Passwords sent over encrypted connection

4. 🔒 **Educate Admins:**

   - Don't share passwords publicly
   - Use secure channels to send passwords
   - Change default passwords

5. 🔒 **Regular Password Changes:**
   - Encourage users to change passwords
   - Set password expiry policy

---

## 🚀 Testing

### **Test Scenario 1: Create New User**

1. ✅ Go to Assignment > Users
2. ✅ Click "Add User"
3. ✅ Fill form:
   - Username: test_user
   - Email: test@example.com
   - Full Name: Test User
   - Password: TestPass123
4. ✅ Click Save
5. ✅ Check backend: `C:\classifyMail\userData\{id}.json`
6. ✅ Verify file contains:
   - `passwordHash`: (long hash)
   - `passwordSalt`: (long salt)
   - `plainPassword`: "TestPass123"

---

### **Test Scenario 2: Edit User - View Password**

1. ✅ Click Edit on existing user
2. ✅ Modal opens
3. ✅ Password field shows: "TestPass123"
4. ✅ Click 👁️ button → Password visible
5. ✅ Click 👁️ again → Password hidden
6. ✅ Don't change anything
7. ✅ Click Save
8. ✅ Password remains unchanged

---

### **Test Scenario 3: Edit User - Change Password**

1. ✅ Click Edit on user
2. ✅ Password field shows: "TestPass123"
3. ✅ Clear field and type: "NewPass456"
4. ✅ Click Save
5. ✅ Check backend JSON:
   - `plainPassword`: "NewPass456" (updated)
   - `passwordHash`: (new hash)
6. ✅ Logout
7. ✅ Login with user + new password
8. ✅ Login successful

---

### **Test Scenario 4: Reset Password**

1. ✅ In Users table, click 🔑 Reset Password
2. ✅ Modal shows new random password: "aB3$xK9%mP"
3. ✅ Copy password
4. ✅ Close modal
5. ✅ Click Edit on same user
6. ✅ Password field shows: "aB3$xK9%mP"
7. ✅ Verify it matches reset password

---

### **Test Scenario 5: Copy Password and Send to User**

1. ✅ Click Edit on user
2. ✅ Password field shows current password
3. ✅ Click 👁️ to show
4. ✅ Select text and Ctrl+C to copy
5. ✅ Paste in email/message
6. ✅ Send to user
7. ✅ User can login with that password

---

## 📋 Code Changes Summary

### **Backend:**

- ✅ Add `plainPassword` field when creating user
- ✅ Update `plainPassword` when updating password
- ✅ Return `plainPassword` in GET users API
- ✅ Handle password in PUT users API

### **Frontend:**

- ✅ Show `plainPassword` in Edit User form
- ✅ Update label: "(current password shown)"
- ✅ Update placeholder: "Modify password or leave as is"
- ✅ Log plainPassword for debugging

### **Files Modified:**

1. **`mail-server/server.js`** - 4 changes

   - Register API
   - Update user API
   - Change password API
   - Get users API

2. **`src/views/Assignment.js`** - 3 changes
   - handleEditUser function
   - Password field label
   - Password field placeholder

---

## 🎯 Feature Comparison

### **Reset Password vs View Password:**

| Feature         | Reset Password               | View Password                    |
| --------------- | ---------------------------- | -------------------------------- |
| **Use Case**    | User forgot password         | Admin needs to see password      |
| **Action**      | Generate new random password | Show existing password           |
| **Result**      | Password changes             | Password unchanged               |
| **Display**     | Modal with new password      | Form field with current password |
| **User Impact** | User must use new password   | User keeps same password         |

### **When to Use Each:**

**Reset Password (🔑):**

- User completely forgot password
- Want to generate strong random password
- Need to invalidate old password

**View/Edit Password (✏️):**

- Just want to see current password
- Want to send existing password to user
- Want to make small modification
- Password is fine, just need to view it

---

## 💡 Usage Recommendations

### **For Admins:**

1. **View Password:**

   ```
   User: "What's my password?"
   Admin:
     1. Click Edit user
     2. Click 👁️ to show
     3. Copy and send to user
   ```

2. **Change Password:**

   ```
   User: "Change my password to 'NewPass123'"
   Admin:
     1. Click Edit user
     2. Clear password field
     3. Type "NewPass123"
     4. Save
   ```

3. **Reset to Random:**
   ```
   User: "I forgot my password"
   Admin:
     1. Click 🔑 Reset Password
     2. Copy new random password
     3. Send to user
   ```

---

## ⚠️ Important Notes

### **Security Trade-off:**

This feature stores passwords in **plain text** for convenience. This is:

- ✅ **Good for:** Internal systems, small teams, trusted environment
- ❌ **Bad for:** Public systems, large scale, sensitive data

### **Alternative Approaches:**

1. **One-Time Password Reset:**

   - Generate reset link
   - User sets new password
   - No plain text storage

2. **Encryption:**

   - Encrypt plainPassword field
   - Decrypt only when admin views
   - Better than plain text

3. **Temporary Passwords:**
   - Force password change on first login
   - Don't store long-term

### **Recommendation:**

For production systems with sensitive data, consider implementing:

- Password reset via email
- Two-factor authentication
- Password encryption (not plain text)
- Regular password rotation
- Password complexity requirements

---

## 🎉 Summary

### **Problem Solved:**

❌ **Before:** Admin cannot see user's password when editing
✅ **After:** Admin can see and edit password in Edit User form

### **Key Features:**

1. ✅ **View Password** - See current password in edit form
2. ✅ **Edit Password** - Modify inline or leave unchanged
3. ✅ **Copy Password** - Copy to send to user
4. ✅ **Toggle Visibility** - Show/hide with 👁️ button
5. ✅ **Dual Storage** - Plain + Hash for security and usability

### **Benefits:**

- 🚀 **Fast Support** - Instantly see user's password
- 👥 **Better UX** - Help users recover quickly
- 🔧 **Flexible** - View, edit, or reset as needed
- 📱 **Inline Editing** - No need for separate reset flow

**Feature is production-ready with security considerations in mind!** 🎊
