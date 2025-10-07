---
title: Feed Preview
description: Preview the contents of an RSS, Atom, or JSON feed.
canonical: "/feed-preview"
script: true
---

<div class="input-group">
    <input type="text" id="feed-url" placeholder="Enter RSS/Atom/JSON feed URL" />
    <button id="load-feed">Load Feed</button>
</div>

<div id="status" class="status" style="display: none"></div>
<div id="feed-output" class="readable"></div>
