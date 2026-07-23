import { $ } from "/assets/helpers.js";

const dom = {
	bskyHandle: $("bskyHandle"),
	fediInstance: $("fediInstance"),
	fediUser: $("fediUser"),
	status: $("status"),
	outputContainer: $("output-container"),
};

const log = (msg) => (dom.status.textContent = msg);

function levenshtein(a, b) {
	const matrix = [];
	for (let i = 0; i <= b.length; i++) matrix[i] = [i];
	for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
			}
		}
	}
	return matrix[b.length][a.length];
}

function cleanTextForCompare(text) {
	return text
		.toLowerCase()
		.replace(/https?:\/\/[^\s]+/g, "")
		.replace(/[^a-z0-9]/g, "");
}

function isMatch(textA, textB) {
	const cleanA = cleanTextForCompare(textA);
	const cleanB = cleanTextForCompare(textB);
	if (cleanA === cleanB) return true;
	if (!cleanA || !cleanB) return false;
	const dist = levenshtein(cleanA, cleanB);
	const longer = Math.max(cleanA.length, cleanB.length);
	return dist / longer < 0.2;
}

function turndown(html) {
	let tmp = document.createElement("div");
	tmp.innerHTML = html;
	tmp.querySelectorAll("a").forEach((a) => {
		const href = a.getAttribute("href");
		if (a.classList.contains("hashtag") || a.classList.contains("mention")) {
			a.replaceWith(a.textContent);
		} else {
			a.replaceWith(`[${a.textContent}](${href})`);
		}
	});
	tmp.querySelectorAll("p").forEach((p) => {
		p.append(document.createTextNode("\n\n"));
	});
	tmp.querySelectorAll("br").forEach((br) => {
		br.replaceWith("\n");
	});
	return tmp.textContent.trim();
}

function renderBlueskyMarkdown(record) {
	if (!record.facets) return record.text;
	let text = record.text;
	let facets = record.facets.sort((a, b) => b.index.byteStart - a.index.byteStart);
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	const bytes = encoder.encode(text);
	let chunks = [];
	let lastPos = bytes.length;
	for (let facet of facets) {
		const start = facet.index.byteStart;
		const end = facet.index.byteEnd;
		if (end < lastPos) {
			chunks.unshift(decoder.decode(bytes.slice(end, lastPos)));
		}
		const facetBytes = bytes.slice(start, end);
		const facetText = decoder.decode(facetBytes);
		const link = facet.features.find((f) => f.$type === "app.bsky.richtext.facet#link");
		if (link) {
			chunks.unshift(`[${facetText}](${link.uri})`);
		} else {
			chunks.unshift(facetText);
		}
		lastPos = start;
	}
	if (lastPos > 0) {
		chunks.unshift(decoder.decode(bytes.slice(0, lastPos)));
	}
	return chunks.join("");
}

async function fetchBluesky(handle) {
	log("Resolving Bluesky handle...");
	const resolve = await fetch(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`).then((r) => r.json());
	const did = resolve.did;
	log("Fetching Bluesky feed...");
	const feed = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${did}&limit=20`).then((r) => r.json());
	const posts = [];
	for (let item of feed.feed) {
		if (item.reason && item.reason.$type === "app.bsky.feed.defs#reasonRepost") continue;
		if (item.post.author.did !== did) continue;

		const record = item.post.record;
		if (!record.text && !item.post.embed) continue;
		let images = [];
		if (item.post.embed && item.post.embed.images) {
			images = item.post.embed.images.map((img) => ({ url: img.fullsize, alt: img.alt }));
		}
		const replyRoot = item.reply && item.reply.root ? item.reply.root.uri : null;
		const replyParent = item.reply && item.reply.parent ? item.reply.parent.uri : null;
		let isSelfReply = false;
		if (item.reply && item.reply.parent && item.reply.parent.author) {
			isSelfReply = item.reply.parent.author.did === did;
		}
		if (item.reply && !isSelfReply) continue;
		posts.push({
			id: item.post.uri,
			cid: item.post.cid,
			text: renderBlueskyMarkdown(record),
			rawText: record.text,
			images: images,
			createdAt: new Date(record.createdAt),
			url: `${handle}/post/${item.post.uri.split("/").pop()}`,
			replyRoot: replyRoot,
			replyParent: replyParent,
			platform: "bluesky",
		});
	}
	return posts;
}

async function fetchFedi(instance, username) {
	log(`Looking up Fedi ID for ${username}...`);
	const lookup = await fetch(`https://${instance}/api/v1/accounts/lookup?acct=${username}`).then((r) => r.json());
	const id = lookup.id;
	log("Fetching Fedi statuses...");
	const statuses = await fetch(`https://${instance}/api/v1/accounts/${id}/statuses?limit=20&exclude_reblogs=true`).then((r) => r.json());
	const filteredStatuses = statuses.filter((s) => {
		if (!s.in_reply_to_id) return true;
		return s.in_reply_to_account_id === id;
	});
	return filteredStatuses.map((s) => {
		let images = s.media_attachments.filter((m) => m.type === "image").map((m) => ({ url: m.url, alt: m.description || "" }));
		return {
			id: s.id,
			text: turndown(s.content),
			rawText: s.content,
			images: images,
			createdAt: new Date(s.created_at),
			url: s.id,
			replyToId: s.in_reply_to_id,
			platform: "fedi",
		};
	});
}

function threadPosts(posts) {
	posts.sort((a, b) => a.createdAt - b.createdAt);
	const threaded = [];
	const processedIds = new Set();
	const idMap = new Map(posts.map((p) => [p.id, p]));
	posts.forEach((p) => {
		if (processedIds.has(p.id)) return;
		let parentId = p.platform === "bluesky" ? p.replyParent : p.replyToId;
		if (!parentId || !idMap.has(parentId)) {
			let thread = { ...p };
			processedIds.add(p.id);
			let currentId = p.id;
			let hasChild = true;
			while (hasChild) {
				let child = posts.find((candidate) => {
					let cParent = candidate.platform === "bluesky" ? candidate.replyParent : candidate.replyToId;
					return cParent === currentId && !processedIds.has(candidate.id);
				});
				if (child) {
					thread.text += "\n\n" + child.text;
					thread.images = [...thread.images, ...child.images];
					processedIds.add(child.id);
					currentId = child.id;
				} else {
					hasChild = false;
				}
			}
			threaded.push(thread);
		}
	});
	return threaded.sort((a, b) => b.createdAt - a.createdAt);
}

function formatTimestampId(date) {
	const pad = (num) => String(num).padStart(2, "0");
	const y = date.getUTCFullYear();
	const m = pad(date.getUTCMonth() + 1);
	const d = pad(date.getUTCDate());
	const hh = pad(date.getUTCHours());
	const mm = pad(date.getUTCMinutes());
	return `${y}${m}${d}-${hh}${mm}`;
}

async function generate() {
	dom.outputContainer.innerHTML = "";
	log("Fetching...");

	try {
		const [bskyRaw, fediRaw] = await Promise.all([fetchBluesky(dom.bskyHandle.value), fetchFedi(dom.fediInstance.value, dom.fediUser.value)]);
		log("Processing threads...");
		const bskyThreads = threadPosts(bskyRaw);
		const fediThreads = threadPosts(fediRaw);
		log("Merging platforms...");

		const merged = [];
		const bskyUsed = new Set();

		fediThreads.forEach((fItem) => {
			let matchIndex = -1;
			for (let i = 0; i < bskyThreads.length; i++) {
				if (bskyUsed.has(i)) continue;
				if (isMatch(fItem.text, bskyThreads[i].text)) {
					matchIndex = i;
					break;
				}
			}
			if (matchIndex > -1) {
				const bItem = bskyThreads[matchIndex];
				bskyUsed.add(matchIndex);
				const finalText = fItem.text.length >= bItem.text.length ? fItem.text : bItem.text;
				const finalImages = fItem.images.length > 0 ? fItem.images : bItem.images;
				merged.push({ text: finalText, images: finalImages, fediLink: fItem.url, bskyLink: bItem.url, timestamp: fItem.createdAt });
			} else {
				merged.push({ text: fItem.text, images: fItem.images, fediLink: fItem.url, bskyLink: null, timestamp: fItem.createdAt });
			}
		});

		bskyThreads.forEach((bItem, i) => {
			if (!bskyUsed.has(i)) {
				merged.push({ text: bItem.text, images: bItem.images, fediLink: null, bskyLink: bItem.url, timestamp: bItem.createdAt });
			}
		});

		merged.sort((a, b) => b.timestamp - a.timestamp);

		log("Formatting output...");

		merged.forEach((item) => {
			const tagMatches = item.text.match(/#[a-zA-Z0-9_]+/g) || [];
			const tags = [...new Set(tagMatches.map((t) => t.substring(1)))];
			const tsId = formatTimestampId(item.timestamp);

			let postMarkdown = "---\n";
			if (item.fediLink) postMarkdown += `fedi_link: ${item.fediLink}\n`;
			if (item.bskyLink) postMarkdown += `bsky_link: ${item.bskyLink}\n`;
			if (tags.length) postMarkdown += `tags: [${tags.join(", ")}]\n`;
			postMarkdown += "---\n\n";
			postMarkdown += item.text + "\n\n";

			if (item.images.length > 0) {
				item.images.forEach((img) => {
					postMarkdown += `![${img.alt || ""}](${img.url})\n\n`;
				});
			}

			const block = document.createElement("div");
			block.className = "post-block";

			const header = document.createElement("h2");
			header.className = "post-header";
			header.textContent = tsId;

			const area = document.createElement("textarea");
			area.value = postMarkdown.trim();

			block.appendChild(header);
			block.appendChild(area);
			dom.outputContainer.appendChild(block);
		});

		log("Done!");
	} catch (e) {
		console.error(e);
		log("Error: " + e.message);
	}
}

window.generate = generate;
