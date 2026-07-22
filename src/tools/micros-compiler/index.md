---
title: Micros Compiler
description: Fetches micro posts from Bluesky and the Fediverse and merges them.
---

<p>I use this for compiling my <a href="https://vale.rocks/micros">micros</a>. It is likely of little utility to anyone else. It compares recent posts across Bluesky and the Fediverse and if they're similiar it merges them. Octothorpes are turned into frontmatter tags.</p>
<br>

<div class="controls">
    <div>
        <div>
            <label for="bskyHandle">Bluesky Handle</label>
            <input type="text" id="bskyHandle" value="vale.rocks" />
        </div>
        <div>
            <label for="fediInstance">Fediverse Instance</label>
            <input type="text" id="fediInstance" value="fedi.vale.rocks" placeholder="instance.com" />
            <label for="fediUser">Handle</label>
            <input type="text" id="fediUser" value="vale" placeholder="username" />
        </div>
        </div>
    <button onclick="generate()">Fetch & Generate Micros</button>
</div>

<div id="status" class="status">Ready.</div>

<output id="output-container"></output>
