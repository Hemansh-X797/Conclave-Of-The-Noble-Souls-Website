# `auth.md`

**Authentication Blueprint**
*Last updated: 2025-10-05*

## 🎯 Purpose

This document defines the authentication strategy for the application, covering methods for verifying user identities, issuing and validating credentials, session management, token security, and extensibility for future identity providers.

---

## 🔐 Authentication Modes

### 1. **Email + Password (Primary)**

* User signs up or logs in with email and password.
* Passwords are hashed using **Argon2id** (preferred) or **bcrypt**.
* Failed login attempt tracking with exponential backoff.

### 2. **OAuth2 / OIDC (Optional Providers)**

* Supported providers:

  * Google
  * GitHub
  * Apple
  * Microsoft
* All use **Authorization Code Flow with PKCE**.
* Tokens exchanged server-side only.
* User email and profile are fetched during first sign-in.

### 3. **Magic Link (Optional)**

* Send a single-use, time-limited login link to user email.
* Token embedded in the URL is short-lived (5–15 minutes).
* Can be used for passwordless login or recovery.

---

## 🔑 Credential Storage

* Passwords: Hashed using **Argon2id**, salted with 16+ byte random salt.
* Never store passwords in plain text.
* Sessions and refresh tokens stored in the database (encrypted if possible).
* All tokens use **JWT** with proper signature and expiration.

---

## 🔁 Session Management

### Access Token (Short-lived)

* Format: JWT (RS256 or ES256)
* TTL: 15–30 minutes
* Payload includes:

  * `sub` (User ID)
  * `iat`, `exp`
  * `roles` or `scopes`
* Stored in:

  * **Memory or HTTP-only secure cookie** (recommended)
  * Or Authorization header as `Bearer <token>`

### Refresh Token (Long-lived)

* Format: opaque UUID or JWT
* TTL: 7–30 days
* Rotation enabled (refresh-on-use)
* Stored in:

  * HTTP-only secure cookie (recommended)
  * DB blacklist if manually revoked

---

## ✅ Token Validation

* JWTs are verified using a **public/private key pair** (not shared secrets).
* Use a **JWT library** that validates:

  * Signature
  * Expiry
  * Issuer (`iss`)
  * Audience (`aud`)
* Re-check user status (e.g., banned or deleted) on refresh.

---

## 👤 User Identity Model

| Field        | Type     | Notes                             |
| ------------ | -------- | --------------------------------- |
| `id`         | UUID     | Primary key                       |
| `email`      | String   | Unique, indexed                   |
| `password`   | String   | Hashed and salted                 |
| `created_at` | DateTime | Timestamp                         |
| `last_login` | DateTime | For auditing                      |
| `provider`   | Enum     | `local`, `google`, `github`, etc. |
| `is_active`  | Boolean  | Soft-deletion flag                |
| `roles`      | Array    | Role-based access control         |

---

## 🧰 APIs

### `/auth/register` `POST`

* Accepts: `email`, `password`
* Returns: JWT access + refresh tokens

### `/auth/login` `POST`

* Accepts: `email`, `password`
* Returns: JWT access + refresh tokens

### `/auth/oauth/callback` `GET`

* Handles redirect from OAuth providers

### `/auth/magic-link` `POST`

* Sends email with login link

### `/auth/token/refresh` `POST`

* Rotates and issues new access + refresh tokens

### `/auth/logout` `POST`

* Invalidates refresh token (server-side)

---

## 🛡️ Security Considerations

* **Rate Limiting** on all auth endpoints
* **Account Lockout** after N failed logins
* **Device Fingerprinting** (optional) for token binding
* **2FA / MFA Support** (via TOTP or WebAuthn — optional)
* **Audit Logging** for login and token events

---

## 🔮 Extensibility

* Add support for:

  * SSO via SAML (enterprise)
  * Decentralized ID (DID) in the future
* Configurable TTLs and token formats
* Pluggable user metadata and roles

---

## 🧪 Testing Guidelines

| Test Scenario                  | Expected Result               |
| ------------------------------ | ----------------------------- |
| Register with valid data       | 201 Created, tokens returned  |
| Login with bad password        | 401 Unauthorized              |
| Refresh with expired token     | 401 or 403, forced re-login   |
| Use revoked refresh token      | 403 Forbidden, token rejected |
| OAuth callback with valid code | User logged in or registered  |

---

## 📚 Related Blueprints

* [access-control.md](./access-control.md)
* `roles.md`
* `users.md`
* `security.md`

---
