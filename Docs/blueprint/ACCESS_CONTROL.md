# 🛡️ Access Control System – *Conclave of the Noble Souls*

## 📌 Overview

This document defines the **role-based access control (RBAC)** system used in the Discord server:
**🧱 Server Name:** `Conclave of the Noble Souls`
**🧾 Server ID:** `1368124846760001546`

It provides:

* **Permission levels**
* **Permission definitions**
* **Role-based mappings**
* **Utility functions** to check permissions programmatically

---

## 🗂️ Permission Levels

Each role corresponds to a numerical permission level. Higher numbers represent more powerful roles.

| Level | Role                 | Description        |
| ----- | -------------------- | ------------------ |
| 100   | `Owner`              | Full control       |
| 90    | `Board of Directors` | Core executives    |
| 80    | `Head Admin`         | Technical control  |
| 70    | `Administrator`      | Management staff   |
| 60    | `Head Mod`           | Senior moderation  |
| 50    | `Moderator`          | General moderation |
| 40    | `VIP`                | Premium users      |
| 10    | `Member`             | Standard member    |
| 0     | `Guest`              | No special roles   |

---

## 🔐 Permission Definitions

Permissions are grouped into logical domains:

### Server Management

* `manage_server`
* `manage_channels`
* `manage_roles`
* `view_audit_log`
* `manage_webhooks`
* `manage_emojis`

### Moderation

* `ban_members`
* `kick_members`
* `timeout_members`
* `manage_messages`
* `manage_nicknames`
* `view_mod_logs`
* `create_warnings`

### Content

* `send_messages`
* `embed_links`
* `attach_files`
* `add_reactions`
* `use_external_emojis`
* `mention_everyone`

### Voice

* `connect`
* `speak`
* `mute_members`
* `deafen_members`
* `move_members`

### Special Features

* `create_events`
* `manage_events`
* `create_polls`
* `use_slash_commands`

### Website Permissions

* `access_dashboard`
* `edit_profile`
* `view_analytics`
* `manage_content`
* `access_api`

### Pathways

* `access_gaming`
* `access_lorebound`
* `access_productive`
* `access_news`

### Premium

* `custom_color`
* `priority_support`
* `exclusive_channels`
* `early_access`

---

## 🧩 Role-Based Permission Mapping

### 👑 Owner (`1369566988128751750`)

* Has all permissions (`*`)

### 🧠 Board of Directors (`1369197369161154560`)

* High-level server and content management

### 🧱 Head Administrator (`1396459118025375784`)

* Server and event management

### 🔧 Administrator (`1370702703616856074`)

* Moderation, channel management

### 🛡️ Head Mod (`1409148504026120293`)

* Full moderation suite

### 🧹 Moderator (`1408079849377107989`)

* Basic moderation capabilities

### 🏅 VIP / Boosters (`1404790723751968883`)

* Access to premium features

### 🎮 Gaming Pathway (`1395703399760265226`)

* `access_gaming`

### 🌙 Lorebound Pathway (`1397498835919442033`)

* `access_lorebound`

### 💼 Productive Pathway (`1409444816189788171`)

* `access_productive`

### 📰 News Pathway (`1395703930587189321`)

* `access_news`

### ⚜️ Noble Soul (Base Member) (`1397497084793458691`)

* Messaging, reactions, voice, profile editing

---

## 🔧 Utility Functions

### `hasPermission(userRoles, permission)`

Returns `true` if user has the permission.

### `hasAnyPermission(userRoles, permissions[])`

Checks if user has **at least one** of the listed permissions.

### `hasAllPermissions(userRoles, permissions[])`

Checks if user has **all** listed permissions.

### `getUserPermissions(userRoles)`

Returns full list of permissions the user has.

### `getPermissionLevel(userRoles)`

Returns the user's **numeric permission level** (e.g. 70 for Admin).

### `canModerate(actorRoles, targetRoles)`

Returns `true` if the actor can moderate the target (i.e., has higher level).

### `isStaff(userRoles)`

Checks if user is part of staff roles.

### `isVIP(userRoles)`

Checks if user is VIP.

### `getAccessiblePathways(userRoles)`

Returns list of accessible pathways: `['gaming', 'lorebound', 'productive', 'news']`.

### `checkAccess(userRoles, requiredPermissions, requireAll = false)`

Returns `{ allowed: true/false, message: '...' }` based on permission check.

---

## 🧪 Example Usage

```ts
const userRoles = ['1408079849377107989']; // Moderator
const canBan = hasPermission(userRoles, PERMISSIONS.BAN_MEMBERS); // true
const perms = getUserPermissions(userRoles); // returns all their permissions
```

```ts
const check = checkAccess(userRoles, [PERMISSIONS.BAN_MEMBERS, PERMISSIONS.KICK_MEMBERS]);
// => { allowed: true, message: 'Access granted' }
```

---

## ✅ Staff Role IDs Reference

| Role Name          | ID                  |
| ------------------ | ------------------- |
| Owner              | 1369566988128751750 |
| Board of Directors | 1369197369161154560 |
| Head Administrator | 1396459118025375784 |
| Administrator      | 1370702703616856074 |
| Head Mod           | 1409148504026120293 |
| Moderator          | 1408079849377107989 |
| VIP                | 1404790723751968883 |

---

## 🔚 Notes

* All permissions are string-based constants for maintainability.
* The wildcard `'*'` grants full permissions.
* Permission hierarchy ensures secure moderation.
* Integrates easily into web dashboards and bots.

---
