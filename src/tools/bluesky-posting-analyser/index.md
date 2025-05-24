---
title: Bluesky Posting Analyser
description: Analyses Bluesky posting patterns and engagement details.
canonical: "/bluesky-posting-analysera"
---

<div>
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

    <h2>Settings</h2>
    <div>
    	<label for="targetHandle">Target Bluesky Handle:</label>
    	<input type="text" id="targetHandle" placeholder="user.bsky.social">
    </div>
    <div>
    	<label for="postLimit">Number of posts to fetch (large amount of posts can take a long time):</label>
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

    <h3>Best Days to Post</h3>
    <div id="dayResults"></div>

    <h3>Best Hours to Post</h3>
    <div id="hourResults"></div>

    <h3>Post Statistics</h3>
    <div id="stats"></div>

</div>

<script src="script.js"></script>
