let postsData = [];
let authToken = null;
let authDid = null;

async function authenticate() {
	const handle = document.getElementById("authHandle").value.trim();
	const password = document.getElementById("appPassword").value.trim();

	if (!handle || !password) {
		setAuthStatus("Please enter both handle and app password", "error");
		return;
	}

	setAuthStatus("Authenticating...", "info");

	try {
		const identifier = handle.includes(".") ? handle : handle + ".bsky.social";

		const response = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				identifier: identifier,
				password: password,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || `Authentication failed (${response.status})`);
		}

		const data = await response.json();
		authToken = data.accessJwt;
		authDid = data.did;

		setAuthStatus(`Authenticated as ${data.handle}`, "success");
		document.getElementById("analyseBtn").disabled = false;
	} catch (error) {
		setAuthStatus(`Authentication failed: ${error.message}`, "error");
		authToken = null;
		authDid = null;
		document.getElementById("analyseBtn").disabled = true;
	}
}

function setAuthStatus(message, type) {
	const statusEl = document.getElementById("authStatus");
	statusEl.textContent = message;
	statusEl.style.color = type === "success" ? "var(--green_" : type === "error" ? "var(--red)" : "var(--blue)";
}

async function analysePosts() {
	const handle = document.getElementById("targetHandle").value.trim();
	if (!handle) {
		showError("Please enter a target Bluesky handle");
		return;
	}

	if (!authToken) {
		showError("Please authenticate first");
		return;
	}

	showLoading(true);
	hideError();
	hideResults();

	try {
		await fetchPosts(handle);
		if (postsData.length === 0) {
			showError("No posts found for this user");
			return;
		}

		await fetchEngagementData();

		analysePostingPatterns();
		showResults();
	} catch (error) {
		showError("Error fetching posts: " + error.message);
	} finally {
		showLoading(false);
	}
}

async function fetchPosts(handle) {
	try {
		const identifier = handle.includes(".") ? handle : handle + ".bsky.social";

		const resolveResponse = await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${identifier}`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		});

		if (!resolveResponse.ok) {
			throw new Error(`Could not resolve handle: ${resolveResponse.status}`);
		}

		const resolveData = await resolveResponse.json();
		const userDid = resolveData.did;

		const postLimit = parseInt(document.getElementById("postLimit").value);

		// For large requests, we may need to paginate
		postsData = [];
		let cursor = null;
		let fetchedCount = 0;
		const batchSize = Math.min(postLimit, 100);

		while (fetchedCount < postLimit) {
			const remainingPosts = postLimit - fetchedCount;
			const currentLimit = Math.min(remainingPosts, batchSize);

			let url = `https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=${userDid}&collection=app.bsky.feed.post&limit=${currentLimit}`;
			if (cursor) {
				url += `&cursor=${cursor}`;
			}

			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch posts: ${response.status}`);
			}

			const data = await response.json();

			const batch = data.records.map((record) => ({
				createdAt: record.value.createdAt,
				text: record.value.text || "",
				uri: record.uri,
				cid: record.cid,
				likes: 0,
				reposts: 0,
				replies: 0,
			}));

			postsData = postsData.concat(batch);
			fetchedCount += batch.length;

			// Check if there are more posts to fetch
			if (data.cursor && fetchedCount < postLimit) {
				cursor = data.cursor;
				await new Promise((resolve) => setTimeout(resolve, 100));
			} else {
				break;
			}
		}
	} catch (error) {
		throw new Error(`Failed to fetch posts: ${error.message}`);
	}
}

async function fetchEngagementData() {
	// Batch fetch engagement data for posts
	const batchSize = 10;
	const batches = [];

	for (let i = 0; i < postsData.length; i += batchSize) {
		batches.push(postsData.slice(i, i + batchSize));
	}

	for (const batch of batches) {
		await Promise.all(
			batch.map(async (post) => {
				try {
					// Get post thread to get reply count and engagement
					const threadResponse = await fetch(`https://bsky.social/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(post.uri)}`, {
						headers: {
							Authorization: `Bearer ${authToken}`,
						},
					});

					if (threadResponse.ok) {
						const threadData = await threadResponse.json();
						const postData = threadData.thread.post;

						post.likes = postData.likeCount || 0;
						post.reposts = postData.repostCount || 0;
						post.replies = postData.replyCount || 0;
					}
				} catch (error) {
					console.warn(`Failed to fetch engagement for post: ${error.message}`);
					// Keep default values of 0
				}
			}),
		);

		await new Promise((resolve) => setTimeout(resolve, 100));
	}
}

function analysePostingPatterns() {
	const dayStats = {};
	const hourStats = {};
	const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	// Initialise stats
	for (let i = 0; i < 7; i++) {
		dayStats[dayNames[i]] = { posts: 0, totalEngagement: 0, avgEngagement: 0 };
	}
	for (let i = 0; i < 24; i++) {
		hourStats[i] = { posts: 0, totalEngagement: 0, avgEngagement: 0 };
	}

	// Analyse each post
	postsData.forEach((post) => {
		const date = new Date(post.createdAt);
		const dayOfWeek = dayNames[date.getDay()];
		const hour = date.getHours();
		const engagement = post.likes + post.reposts + post.replies;

		dayStats[dayOfWeek].posts++;
		dayStats[dayOfWeek].totalEngagement += engagement;

		hourStats[hour].posts++;
		hourStats[hour].totalEngagement += engagement;
	});

	// Calculate averages
	Object.keys(dayStats).forEach((day) => {
		if (dayStats[day].posts > 0) {
			dayStats[day].avgEngagement = dayStats[day].totalEngagement / dayStats[day].posts;
		}
	});

	Object.keys(hourStats).forEach((hour) => {
		if (hourStats[hour].posts > 0) {
			hourStats[hour].avgEngagement = hourStats[hour].totalEngagement / hourStats[hour].posts;
		}
	});

	displayDayResults(dayStats);
	displayHourResults(hourStats);
	displayStats();
}

function displayDayResults(dayStats) {
	const sortedDays = Object.entries(dayStats)
		.sort(([, a], [, b]) => b.avgEngagement - a.avgEngagement)
		.filter(([, stats]) => stats.posts > 0);

	let html = '<table border="1"><tr><th>Day</th><th>Posts</th><th>Avg Engagement</th><th>Total Engagement</th></tr>';

	sortedDays.forEach(([day, stats]) => {
		html += `<tr>
                    <td><strong>${day}</strong></td>
                    <td>${stats.posts}</td>
                    <td>${stats.avgEngagement.toFixed(1)}</td>
                    <td>${stats.totalEngagement}</td>
                </tr>`;
	});

	html += "</table>";
	document.getElementById("dayResults").innerHTML = html;
}

function displayHourResults(hourStats) {
	const sortedHours = Object.entries(hourStats)
		.sort(([, a], [, b]) => b.avgEngagement - a.avgEngagement)
		.filter(([, stats]) => stats.posts > 0);

	let html = '<table border="1"><tr><th>Hour</th><th>Posts</th><th>Avg Engagement</th><th>Total Engagement</th></tr>';

	sortedHours.slice(0, 10).forEach(([hour, stats]) => {
		const displayHour = `${hour.toString().padStart(2, "0")}:00`;

		html += `<tr>
                    <td><strong>${displayHour}</strong></td>
                    <td>${stats.posts}</td>
                    <td>${stats.avgEngagement.toFixed(1)}</td>
                    <td>${stats.totalEngagement}</td>
                </tr>`;
	});

	html += "</table>";
	document.getElementById("hourResults").innerHTML = html;
}

function displayStats() {
	const totalPosts = postsData.length;
	const totalLikes = postsData.reduce((sum, post) => sum + post.likes, 0);
	const totalReposts = postsData.reduce((sum, post) => sum + post.reposts, 0);
	const totalReplies = postsData.reduce((sum, post) => sum + post.replies, 0);
	const avgEngagement = totalPosts > 0 ? (totalLikes + totalReposts + totalReplies) / totalPosts : 0;

	const html = `
                <p><strong>Total Posts Analysed:</strong> ${totalPosts}</p>
                <p><strong>Total Likes:</strong> ${totalLikes}</p>
                <p><strong>Total Reposts:</strong> ${totalReposts}</p>
                <p><strong>Total Replies:</strong> ${totalReplies}</p>
                <p><strong>Average Engagement per Post:</strong> ${avgEngagement.toFixed(1)}</p>
            `;

	document.getElementById("stats").innerHTML = html;
}

function showLoading(show) {
	document.getElementById("loading").style.display = show ? "block" : "none";
}

function showError(message) {
	document.getElementById("error").innerHTML = message.replace(/\n/g, "<br>");
	document.getElementById("error").style.display = "block";
}

function hideError() {
	document.getElementById("error").style.display = "none";
}

function showResults() {
	document.getElementById("results").style.display = "block";
}

function hideResults() {
	document.getElementById("results").style.display = "none";
}
