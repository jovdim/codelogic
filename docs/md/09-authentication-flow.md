# 9. Logging In

How sign-up, login, and passwords work.

## Sign Up

Someone fills the register form on the site. The info goes to the server. The server:

1. Checks that the email isn't already used.
2. Checks that the username isn't already used.
3. Checks that the password is strong enough.
4. Checks that the two password fields match.
5. Creates the user account (with a random avatar 1–5).
6. Sends an email with a confirmation link.

The user can't log in yet. They need to click the link first.

## Confirm Email

When they click the link in their email, their browser opens `/verify-email?token=...`. The site sends the token to the server. The server checks:

- Is the token real?
- Has it been used already?
- Has it expired? (It lasts 24 hours.)

If all good, the account is marked as verified and they can log in.

If they didn't get the email, there's a **Resend** button on the login page. It has a 60-second cooldown so it can't be spammed.

## Log In

The user types their email and password. The server checks:

1. Does this email exist?
2. Does the password match?
3. Is the account active (not deleted)?
4. Is the email verified?

If all yes, the server sends back two tokens:

- **Access token** — works for 60 minutes. Used on every request.
- **Refresh token** — works for 7 days. Used to get a new access token when the old one expires.

The website saves both in the browser's local storage.

## Staying Logged In

After login, every request to the server includes the access token. When it expires, the website:

1. Automatically uses the refresh token to ask for a fresh access token.
2. Retries the failed request.

If the refresh token is also expired, the user is sent to the login page.

## Log Out

The refresh token is sent to the server and marked as "no longer valid". Both tokens are cleared from the browser.

## Forgot Password

1. User enters their email on the forgot-password page.
2. Server sends them a reset link. It lasts 1 hour.
3. They click the link. The page shows a "new password" form.
4. They set the new password. The link becomes useless after that.

Note: if the email isn't registered, the server still shows a success message. This is on purpose — it stops attackers from figuring out who has an account.

## Change Password (while logged in)

In Settings → Password. The user types their current password plus their new one twice. The server checks the current password and updates it.

## Delete Account

In Settings → Account. The user types their password and the word `DELETE`. The account is marked inactive (soft delete) — the data isn't wiped, but they can no longer log in.

## Live Checks During Sign Up

While the user types on the register page:

- The site asks the server after each keystroke whether the email or username is free.
- This gives instant feedback ("Username is already taken").
