---
title: Stoat Token Generator
description: Generates user account tokens for users on Stoat.
tags: ["Stoat"]
---

<div>
    <h2>Account Details</h2>
    <form id="fetch-token-form">
        <label for="instance-url">Stoat Instance API URL</label>
        <input type="url" id="instance-url" value="https://api.stoat.chat" placeholder="https://api.stoat.chat" />

        <label for="email">Email Address</label>
        <input type="email" id="email" required placeholder="email@example.com" />

        <label for="password">Password</label>
        <input type="password" id="password" required placeholder="*******" />

        <button type="submit" id="submit-credentials">Submit Details</button>
    </form>


    <div id="mfa-container" class="hidden">
        <hr>
        <h3>2FA Verification Required</h3>
        <form id="mfa-form">
            <input type="hidden" id="mfa-ticket" />

            <label id="mfa-label" for="mfa-code">Enter Code:</label>
            <input type="text" id="mfa-code" required placeholder="123456" autocomplete="one-time-code" />

            <button type="submit">Submit Code</button>
        </form>
    </div>

    <div id="fetch-output" class="output hidden"></div>
    <div id="profile-container"></div>

</div>
