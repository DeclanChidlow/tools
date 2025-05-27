---
title: Bluesky Posting Analyser
description: Analyses Bluesky posting patterns and engagement details.
canonical: "/bluesky-posting-analyser"
head: "<link rel='stylesheet' href='style.css'>"
---

<div>
    <div class="authentication">
        <h2>Authentication</h2>
        <div>
            <label for="authHandle">Your Bluesky Handle:</label>
            <input type="text" id="authHandle" placeholder="your-handle.bsky.social"/>
        </div>
        <div>
            <label for="appPassword">App Password:</label>
            <input type="password" id="appPassword" placeholder="xxxx-xxxx-xxxx-xxxx" />
        </div>
        <button onclick="authenticate()">Login</button>
        <div id="authStatus"></div>
    </div>
    <div class="fetch-settings">
        <h2>Fetch Settings</h2>
        <div>
            <label for="targetHandle">Target Bluesky Handle:</label>
            <input type="text" id="targetHandle" placeholder="user.bsky.social">
        </div>
        <div>
            <label for="postLimit">Number of posts to fetch (more posts take longer):</label>
            <select id="postLimit">
                <option value="25">25 posts</option>
                <option value="50">50 posts</option>
                <option value="100" selected>100 posts</option>
                <option value="200">200 posts</option>
                <option value="500">500 posts</option>
                <option value="1000">1000 posts</option>
            </select>
        </div>
        <div>
            <button onclick="analysePosts()" id="analyseBtn" disabled>Analyse Posts</button>
        </div>
    </div>

    <div id="loading" style="display: none">Loading posts...</div>
    <div id="error" style="display: none;"></div>

    <div id="results" style="display: none">
        <h2>Analysis Results</h2>
        <p>Details provided are based on the time posts were published, not when they received engagement.</p>

        <div class="results-section">
            <h3>Most Popular Days</h3>
            <div id="dayResults"></div>
        </div>

        <div class="results-section">
            <h3>Most Popular Hours</h3>
            <p>Times are provided in your local timezone.</p>
            <div id="hourResults"></div>
        </div>

        <div class="results-section">
            <h3>Post Statistics</h3>
            <div id="stats"></div>
        </div>
    </div>

</div>

<script src="script.js"></script>
