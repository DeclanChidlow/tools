document.addEventListener("DOMContentLoaded", function () {
	const feedUrlInput = document.getElementById("feed-url");
	const loadFeedButton = document.getElementById("load-feed");
	const feedOutput = document.getElementById("feed-output");
	const statusDiv = document.getElementById("status");

	loadFeedButton.addEventListener("click", function () {
		const feedUrl = feedUrlInput.value.trim();

		if (!feedUrl) {
			showStatus("Please enter a feed URL", "error");
			return;
		}

		loadFeed(feedUrl);
	});

	function loadFeed(url) {
		showStatus("Loading feed...", "loading");
		feedOutput.innerHTML = "";

		fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.text();
			})
			.then((text) => {
				parseFeed(text, url);
			})
			.catch((error) => {
				if (error.name === "TypeError") {
					showStatus("CORS Error: The requested feed does not allow direct access from other domains. Please ensure the server has proper CORS headers open.", "error");
				} else {
					showStatus("Error loading feed: " + error.message, "error");
				}
				console.error("Fetch error:", error);
			});
	}

	function parseFeed(text) {
		try {
			try {
				const jsonFeed = JSON.parse(text);
				if (jsonFeed.version && jsonFeed.version.startsWith("https://jsonfeed.org/version/")) {
					displayJsonFeed(jsonFeed);
					return;
				}
			} catch (e) {}

			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(text, "text/xml");

			if (xmlDoc.getElementsByTagName("rss").length > 0) {
				displayRssFeed(xmlDoc);
			} else if (xmlDoc.getElementsByTagName("feed").length > 0) {
				displayAtomFeed(xmlDoc);
			} else if (xmlDoc.getElementsByTagName("rdf:RDF").length > 0) {
				displayRdfFeed(xmlDoc);
			} else {
				showStatus("Unsupported feed format", "error");
			}
		} catch (error) {
			showStatus("Error parsing feed: " + error.message, "error");
		}
	}

	function displayRssFeed(xmlDoc) {
		const channel = xmlDoc.getElementsByTagName("channel")[0];
		const items = xmlDoc.getElementsByTagName("item");

		if (!channel || items.length === 0) {
			showStatus("Invalid RSS feed format", "error");
			return;
		}

		const title = getElementText(channel, "title");
		const description = getElementText(channel, "description");
		const link = getElementText(channel, "link");
		const lastBuildDate = getElementText(channel, "lastBuildDate") || getElementText(channel, "pubDate");

		displayFeedInfo(title, description, link, lastBuildDate, "RSS");

		const entriesDiv = document.createElement("div");
		entriesDiv.className = "entries";

		for (let i = 0; i < Math.min(items.length, 10); i++) {
			const item = items[i];
			const itemTitle = getElementText(item, "title");
			const itemLink = getElementText(item, "link");
			const itemDate = getElementText(item, "pubDate");
			const itemDesc = getElementText(item, "description");

			entriesDiv.appendChild(createEntryElement(itemTitle, itemLink, itemDate, itemDesc));
		}

		feedOutput.appendChild(entriesDiv);
		hideStatus();
	}

	function displayAtomFeed(xmlDoc) {
		const feed = xmlDoc.getElementsByTagName("feed")[0];
		const entries = xmlDoc.getElementsByTagName("entry");

		if (!feed || entries.length === 0) {
			showStatus("Invalid Atom feed format", "error");
			return;
		}

		const title = getElementText(feed, "title");
		const subtitle = getElementText(feed, "subtitle");
		const link = getLinkHref(feed);
		const updated = getElementText(feed, "updated");

		displayFeedInfo(title, subtitle, link, updated, "Atom");

		const entriesDiv = document.createElement("div");
		entriesDiv.className = "entries";

		for (let i = 0; i < Math.min(entries.length, 10); i++) {
			const entry = entries[i];
			const entryTitle = getElementText(entry, "title");
			const entryLink = getLinkHref(entry);
			const entryDate = getElementText(entry, "updated") || getElementText(entry, "published");
			const entryContent = getElementText(entry, "content") || getElementText(entry, "summary");

			entriesDiv.appendChild(createEntryElement(entryTitle, entryLink, entryDate, entryContent));
		}

		feedOutput.appendChild(entriesDiv);
		hideStatus();
	}

	function displayRdfFeed(xmlDoc) {
		const channel = xmlDoc.getElementsByTagName("channel")[0];
		const items = xmlDoc.getElementsByTagName("item");

		if (!channel || items.length === 0) {
			showStatus("Invalid RDF feed format", "error");
			return;
		}

		const title = getElementText(channel, "title");
		const description = getElementText(channel, "description");
		const link = getElementText(channel, "link");
		const date = getElementText(channel, "dc:date");

		displayFeedInfo(title, description, link, date, "RDF");

		const entriesDiv = document.createElement("div");
		entriesDiv.className = "entries";

		for (let i = 0; i < Math.min(items.length, 10); i++) {
			const item = items[i];
			const itemTitle = getElementText(item, "title");
			const itemLink = getElementText(item, "link");
			const itemDate = getElementText(item, "dc:date");
			const itemDesc = getElementText(item, "description");

			entriesDiv.appendChild(createEntryElement(itemTitle, itemLink, itemDate, itemDesc));
		}

		feedOutput.appendChild(entriesDiv);
		hideStatus();
	}

	function displayJsonFeed(jsonFeed) {
		const title = jsonFeed.title || "Untitled Feed";
		const description = jsonFeed.description || "";
		const link = jsonFeed.home_page_url || "";
		const items = jsonFeed.items || [];

		displayFeedInfo(title, description, link, null, "JSON");

		const entriesDiv = document.createElement("div");
		entriesDiv.className = "entries";

		for (let i = 0; i < Math.min(items.length, 10); i++) {
			const item = items[i];
			const itemTitle = item.title || "Untitled";
			const itemLink = item.url || "";
			const itemDate = item.date_published || "";
			const itemContent = item.content_html || item.content_text || "";

			entriesDiv.appendChild(createEntryElement(itemTitle, itemLink, itemDate, itemContent));
		}

		feedOutput.appendChild(entriesDiv);
		hideStatus();
	}

	function displayFeedInfo(title, description, link, date, format) {
		const feedInfoDiv = document.createElement("div");
		feedInfoDiv.className = "feed-info";

		const titleElement = document.createElement("h2");
		titleElement.className = "feed-title";

		const titleText = document.createTextNode(title || "Untitled Feed");
		titleElement.appendChild(titleText);

		const formatBadge = document.createElement("span");
		formatBadge.className = "format-badge";
		formatBadge.textContent = format;
		titleElement.appendChild(formatBadge);

		feedInfoDiv.appendChild(titleElement);

		if (description) {
			const descElement = document.createElement("div");
			descElement.className = "feed-description";
			descElement.textContent = description;
			feedInfoDiv.appendChild(descElement);
		}

		const metaDiv = document.createElement("div");
		metaDiv.className = "feed-meta";

		if (link) {
			const linkElement = document.createElement("a");
			linkElement.href = link;
			linkElement.textContent = "Visit Website";
			linkElement.target = "_blank";
			metaDiv.appendChild(linkElement);
		}

		if (date) {
			if (link) {
				metaDiv.appendChild(document.createTextNode(" • "));
			}
			const dateText = document.createTextNode("Updated: " + formatDate(date));
			metaDiv.appendChild(dateText);
		}

		feedInfoDiv.appendChild(metaDiv);
		feedOutput.appendChild(feedInfoDiv);
		hideStatus();
	}

	function createEntryElement(title, link, date, content) {
		const entryDiv = document.createElement("div");
		entryDiv.className = "entry";

		const titleElement = document.createElement("h3");
		titleElement.className = "entry-title";
		const titleLink = document.createElement("a");
		titleLink.href = link;
		titleLink.textContent = title;
		titleLink.target = "_blank";
		titleElement.appendChild(titleLink);
		entryDiv.appendChild(titleElement);

		if (date) {
			const dateElement = document.createElement("div");
			dateElement.className = "entry-date";
			dateElement.textContent = formatDate(date);
			entryDiv.appendChild(dateElement);
		}

		if (content) {
			const contentElement = document.createElement("div");
			contentElement.className = "entry-content";
			contentElement.innerHTML = content;
			entryDiv.appendChild(contentElement);
		}

		return entryDiv;
	}

	function getElementText(parent, tagName) {
		const element = parent.getElementsByTagName(tagName)[0];
		return element ? element.textContent : "";
	}

	function getLinkHref(parent) {
		const link = parent.getElementsByTagName("link")[0];
		return link ? link.getAttribute("href") || link.textContent : "";
	}

	function formatDate(dateString) {
		const date = new Date(dateString);
		return isNaN(date.getTime()) ? "" : date.toLocaleString();
	}

	function showStatus(message, type) {
		statusDiv.textContent = message;
		statusDiv.className = `status ${type}`;
		statusDiv.style.display = "block";
	}

	function hideStatus() {
		statusDiv.style.display = "none";
	}
});
