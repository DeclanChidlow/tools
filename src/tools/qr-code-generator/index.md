---
title: QR Code Generator
description: Generate highly customisable QR codes instantly.
---

<div class="qr-generator-wrapper">
    <form>
        <h2>Configure</h2>
        <div class="form-group">
            <label for="qrContentType">Data Type</label>
            <select id="qrContentType">
                <option value="url">URL / Website</option>
                <option value="text">Plain Text</option>
                <option value="phone">Phone Call</option>
                <option value="geo">Geo-location</option>
                <option value="wifi">WiFi Network</option>
                <option value="vcard">Contact (vCard)</option>
                <option value="email">Email Address</option>
                <option value="sms">SMS Message</option>
            </select>
        </div>
        <div class="input-sections" id="inputSections">
            <div id="type-url" class="type-group">
                <label>Website URL</label>
                <input type="url" id="val-url" placeholder="https://example.com" value="https://example.com">
            </div>
            <div id="type-text" class="type-group hidden">
                <label>Text Content</label>
                <textarea id="val-text" rows="3" placeholder="Enter your text here..."></textarea>
            </div>
            <div id="type-phone" class="type-group hidden">
                <label>Phone Number</label>
                <input type="tel" id="val-phone" placeholder="+61 412 345 678">
            </div>
            <div id="type-geo" class="type-group hidden">
                <div class="form-row">
                    <div class="form-group">
                        <label>Latitude</label>
                        <input type="number" id="val-geo-lat" step="any" placeholder="-31.9505">
                    </div>
                    <div class="form-group">
                        <label>Longitude</label>
                        <input type="number" id="val-geo-lon" step="any" placeholder="115.8605">
                    </div>
                </div>
            </div>
            <div id="type-wifi" class="type-group hidden">
                <label>Network Name (SSID)</label>
                <input type="text" id="val-wifi-ssid" placeholder="MyWiFiNetwork">
                <label>Password</label>
                <input type="text" id="val-wifi-pass" placeholder="Password">
                <label>Encryption</label>
                <select id="val-wifi-type">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                </select>
            </div>
            <div id="type-vcard" class="type-group hidden">
                <label>First Name</label>
                <input type="text" id="val-vc-first" placeholder="Jane">
                <label>Last Name</label>
                <input type="text" id="val-vc-last" placeholder="Doe">
                <label>Phone Number</label>
                <input type="tel" id="val-vc-phone" placeholder="+61 412 345 678">
                <label>Email</label>
                <input type="email" id="val-vc-email" placeholder="jane@example.com">
            </div>
            <div id="type-email" class="type-group hidden">
                <label>To Address</label>
                <input type="email" id="val-email-to" placeholder="hello@example.com">
                <label>Subject</label>
                <input type="text" id="val-email-sub" placeholder="Hello">
            </div>
            <div id="type-sms" class="type-group hidden">
                <label>Phone Number</label>
                <input type="tel" id="val-sms-phone" placeholder="+61 412 345 678">
                <label>Pre-filled Message</label>
                <textarea id="val-sms-msg" rows="2" placeholder="G'day, I'm interested in..."></textarea>
            </div>
        </div>
        <hr>
        <div class="form-row">
            <div class="form-group">
                <label title="Higher levels survive more damage">Error Correction</label>
                <select id="qrErrorCorrection">
                    <option value="L">Low (~7%)</option>
                    <option value="M" selected>Medium (~15%)</option>
                    <option value="Q">Quartile (~25%)</option>
                    <option value="H">High (~30%)</option>
                </select>
            </div>
            <div class="form-group">
                <label title="Gap around the edge">Margin (Quiet Zone)</label>
                <input type="number" id="qrMargin" min="0" max="10" value="4">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Module Colour</label>
                <input type="color" id="qrFgColor" value="#000000">
            </div>
            <div class="form-group">
                <label>Background Colour</label>
                <input type="color" id="qrBgColor" value="#ffffff">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Output Width (px)</label>
                <input type="number" id="qrWidth" min="100" max="2000" value="300" step="10">
            </div>
        </div>
        <button type="button" id="generateBtn">Generate QR Code</button>
    </form>
    <div class="output-pane">
        <h2>Output</h2>
        <div class="canvas-container">
            <canvas id="qrCanvas"></canvas>
        </div>
        
        <div id="contrastWarning" class="warning-banner hidden">
            ⚠️ <strong>Low Contrast Warning:</strong> The colour separation between your module and background is low. Scanning hardware might struggle to read this code.
        </div>

        <div class="form-group raw-string-box">
            <label>Encoded Raw Text Content</label>
            <pre><code id="qrRawString">No data generated yet...</code></pre>
        </div>

        <div class="download-actions-grid">
            <button id="downloadPngBtn" class="download-action" disabled>Download PNG</button>
            <button id="downloadJpegBtn" class="download-action" disabled>Download JPEG</button>
            <button id="downloadSvgBtn" class="download-action" disabled>Download SVG</button>
        </div>
    </div>
</div>
