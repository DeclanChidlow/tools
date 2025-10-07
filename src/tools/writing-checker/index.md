---
title: Writing Checker
description: Grammar, spelling, and writing checking using Harper.
canonical: "/writing-checker"
head: "<link rel='stylesheet' href='./style.css'>"
---

<label for="dialect">English Dialect:</label>
<select id="dialect">
  <option value="australian">Australian</option>
  <option value="british">British</option>
  <option value="american">American</option>
  <option value="canadian">Canadian</option>
</select>

<div>
    <textarea id="inputfield"></textarea>

    <div class="info">
        <ul id="errorlist"></ul>
    </div>
</div>

<script type="module" src="./script.js"></script>
