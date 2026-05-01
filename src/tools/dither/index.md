---
title: Dither
description: Intentionally apply noise to simulate a broader color palette.
tags: ["design"]
---

<div class="container"> 
    <div class="controls">
        <div class="control-group">
            <label>1. Input Image</label>
            <input type="file" id="upload" accept="image/*" />
        </div>

        <div class="control-group">
            <label>Output Width</label>
            <input type="number" id="width-input" value="320" min="1" />
        </div>

        <hr style="border-color: #444; margin: 15px 0" />

        <div class="control-group">
            <label>2. Palette</label>
            <select id="palette-select">
                <option value="bw">1-Bit Black & White</option>
                <option value="gb">GameBoy (4 Greens)</option>
                <option value="cga1">CGA 1 (Mag/Cyn/Wht/Blk)</option>
                <option value="cga2">CGA 2 (Red/Grn/Yel/Blk)</option>
                <option value="mac">Macintosh (B/W)</option>
                <option value="pico8">Pico-8 (16 Colors)</option>
                <option value="web">Web Safe (216 Colors)</option>
                <option value="rgb">Full RGB (Channel Quant)</option>
            </select>
        </div>

        <div class="control-group">
            <label>Algorithm</label>
            <select id="algo-select">
                <optgroup label="Error Diffusion">
                    <option value="floyd">Floyd-Steinberg</option>
                    <option value="atkinson">Atkinson</option>
                    <option value="sierra">Sierra Lite</option>
                    <option value="burkes">Burkes</option>
                    <option value="stucki">Stucki</option>
                    <option value="jjn">Jarvis, Judice, Ninke</option>
                </optgroup>
                <optgroup label="Ordered Dither">
                    <option value="bayer4">Ordered (Bayer 4x4)</option>
                    <option value="bayer8">Ordered (Bayer 8x8)</option>
                    <option value="blue">Blue Noise</option>
                </optgroup>
                <optgroup label="Flat">
                    <option value="none">Nearest (No Dither)</option>
                </optgroup>
            </select>
        </div>

        <div class="control-group">
            <label>Pre-Process</label>
            <select id="color-mode">
                <option value="color">Normal (Color)</option>
                <option value="gray">Grayscale</option>
            </select>
        </div>

        <div class="control-group">
            <div class="row">
                <label>Dither Amount</label>
                <span id="amount-val" class="val-display">1.0</span>
            </div>
            <input type="range" id="dither-amount" min="0" max="1" step="0.05" value="1.0" />
        </div>

        <hr style="border-color: #444; margin: 15px 0" />

        <div class="control-group">
            <label>Export Format</label>
            <select id="export-format">
                <option value="image/png">PNG</option>
                <option value="image/gif">GIF</option>
                <option value="image/webp">WebP</option>
                <option value="image/jpeg">JPEG</option>
            </select>
        </div>

        <button id="process-btn">Update Preview</button>
        <button id="download-btn" class="secondary">Download Image</button>

    </div>

    <div class="preview">
        <div id="drop-zone">Drag & Drop Image Here</div>
        <canvas id="canvas"></canvas>
    </div>

</div>
