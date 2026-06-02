---
title: Stoat Gradient Role
description: Allows setting server roles to have gradients on Stoat.
tags: ["Stoat"]
---

<div>
	<h2>Target Configuration</h2>
	<div>
		<label for="api-url">Stoat Instance API URL</label>
		<input type="url" id="api-url" value="https://api.stoat.chat" />
	</div>
	<div>
		<label for="session-token">Session Token <a href="https://automod.vale.rocks/blog/getting-your-stoat-token">(guide)</a></label>
		<input type="password" id="session-token" />
	</div>
	<div>
		<label for="server-id">Server ID</label>
		<input type="text" id="server-id" />
	</div>
	<div>
		<label for="role-id">Role ID</label>
		<input type="text" id="role-id" />
	</div>

	<hr>

	<h2>Gradient Builder</h2>
	<div class="gradient-builder">
		<div>
			<input type="radio" id="auto" name="mode" value="auto" checked />
			<label for="auto"> Auto Builder</label>
		</div>
		<div>
			<input type="radio" id="manual" name="mode" value="manual" />
			<label for="manual"> Manual CSS</label>
		</div>
		<div id="auto-builder">
			<div>
				<input type="checkbox" id="use-stops" />
				<label for="use-stops">Enable Custom Stops</label>
			</div>
			<label>Angle (°): <input type="number" id="gradient-angle" value="90" /></label>
			<div id="color-list"></div>
			<button id="add-color-btn">Add Colour</button>
		</div>
		<div class="form-group">
			<label for="css-output">CSS String Output:</label>
			<input type="text" id="css-output" disabled />
		</div>
	</div>

	<hr>

	<h2>Preview</h2>
	<div class="preview-box">
		<span id="preview-text">Example Username</span>
	</div>

	<button id="submit-btn">Update Role Colour</button>
</div>
