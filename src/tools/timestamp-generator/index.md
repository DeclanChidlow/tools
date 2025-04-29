---
title: Timestamp Generator
description: Generates timestamps ready for use on chat platforms such as Revolt and Discord.
canonical: "/timestamp-generator"
head: "<link rel='stylesheet' href='style.css'>"
---

<div class="tab-container">
    <button class="tab active" data-tab="standard">Standard</button>
    <button class="tab" data-tab="natural">Natural Language</button>
    <button class="tab" data-tab="iso">ISO Format</button>
</div>

<hr>

<div class="tab-content active" id="standard-tab">
    <div class="flex-row">
        <div style="flex: 1">
            <label for="date-input">Date</label>
            <input type="date" id="date-input" />
        </div>
        <div style="flex: 1">
            <label for="time-input">Time</label>
            <input type="time" id="time-input" />
        </div>
    </div>
    <div class="timezone-selector">
        <label for="timezone-select">Timezone</label>
        <select id="timezone-select"></select>
    </div>
    <button id="generate-btn">Generate Timestamp</button>
</div>

<div class="tab-content" id="natural-tab">
    <label for="natural-input">Enter a date/time in natural language</label>
    <input type="text" id="natural-input" placeholder="e.g. tomorrow at 3pm, next Tuesday at 2:30pm, etc." />
    <div class="examples">
        <h3>Examples</h3>
        <ul>
            <li>tomorrow at 3pm</li>
            <li>next Friday at 7pm</li>
            <li>July 15 at noon</li>
            <li>2pm EST</li>
            <li>09/15 6pm PDT</li>
        </ul>
    </div>
    <button id="natural-generate-btn">Generate Timestamp</button>
</div>

<div class="tab-content" id="iso-tab">
    <label for="iso-input">Enter date/time in ISO 8601 format</label>
    <input type="text" id="iso-input" placeholder="YYYY-MM-DDTHH:MM:SS±hh:mm (e.g. 2025-01-01T15:30:00-05:00)" />
    <button id="iso-generate-btn">Generate Timestamp</button>
</div>

<div class="output-section hidden" id="output-section">
    <h3>Format Style</h3>
    <div class="format-options">
        <div class="format-option" data-format="t">
            <div class="format-code">t</div>
            <div class="format-preview">1:30 PM</div>
        </div>
        <div class="format-option" data-format="T">
            <div class="format-code">T</div>
            <div class="format-preview">13:30</div>
        </div>
        <div class="format-option" data-format="d">
            <div class="format-code">d</div>
            <div class="format-preview">04/28/2025</div>
        </div>
        <div class="format-option" data-format="D">
            <div class="format-code">D</div>
            <div class="format-preview">April 28, 2025</div>
        </div>
        <div class="format-option selected" data-format="f">
            <div class="format-code">f</div>
            <div class="format-preview">April 28, 2025 1:30 PM</div>
        </div>
        <div class="format-option" data-format="F">
            <div class="format-code">F</div>
            <div class="format-preview">Monday, April 28, 2025 1:30 PM</div>
        </div>
        <div class="format-option" data-format="R">
            <div class="format-code">R</div>
            <div class="format-preview">in 2 hours</div>
        </div>
    </div>

    <h3>Revolt/Discord Timestamp</h3>
    <div class="output-container">
        <pre class="timestamp-output" id="discord-output"></pre>
        <button class="copy-btn" id="discord-copy-btn">Copy</button>
        <span class="copied hidden" id="discord-copied">Copied!</span>
    </div>

    <h3>ISO 8601 Format</h3>
    <div class="output-container">
        <pre class="timestamp-output" id="iso-output"></pre>
        <button class="copy-btn" id="iso-copy-btn">Copy</button>
        <span class="copied hidden" id="iso-copied">Copied!</span>
    </div>

    <h3>Chat Preview</h3>
    <div class="preview-container">
        <i class="preview-content" id="preview-content"></i>
    </div>
    </div>

<script type="module" src="script.js"></script>
