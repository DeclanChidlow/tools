---
title: Character Conserver
description: Shrinks down the number of characters in any given text by substituting shorter equivalents. 
canonical: "./character-conserver"
---

<label for="originalText">Original Text:</label><br>
<textarea id="originalText" rows="6" cols="60" placeholder="Enter your text here..."></textarea>

<input type="checkbox" id="aggressiveMode">
<label for="aggressiveMode">Aggressive mode (text speak and abbreviations)</label>

<button id="convertBtn">Convert Text</button><br>

<label for="shortenedText">Shortened Text:</label><br>
<textarea id="shortenedText" rows="6" cols="60" readonly></textarea>

<div id="stats"></div>

<script type="module" src="./script.js"></script>
