---
title: BritCSS Converter
description: Converts British spellings to functional CSS.
canonical: "/britcss-converter"
script: true
---

<div>
    <h2>Enter British CSS:</h2>
    <textarea id="britishCss" rows="10" cols="50">
background-colour: black;
colour: white;
    </textarea>
    <button id="convertBtn">Convert</button>
</div>
    
<div>
    <h2>Standard CSS Output:</h2>
    <textarea id="standardCss" rows="10" cols="50" readonly></textarea>
</div>

<script src="https://cdn.jsdelivr.net/gh/DeclanChidlow/BritCSS/britcss.js"></script>
