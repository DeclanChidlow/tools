(function () {
	const formatSize = (bytes) => {
		if (!bytes || bytes === 0) return "Unknown";
		const units = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${units[i]}`;
	};

	const parseXML = (text) => {
		const parser = new DOMParser();
		const xml = parser.parseFromString(text, "text/xml");
		const parseError = xml.querySelector("parsererror");
		if (parseError) throw new Error("Invalid XML format.");

		const isRSS = xml.querySelector("rss") !== null;
		const isAtom = xml.querySelector("feed") !== null;

		let type = "Unknown XML";
		if (isRSS) type = "RSS";
		if (isAtom) type = "Atom";

		const hasAudio = xml.querySelector('enclosure[type^="audio/"]') !== null;
		const hasItunes = xml.querySelector("*|summary, *|author") !== null;

		const items = [];
		if (isRSS) {
			xml.querySelectorAll("item").forEach((el) => {
				const link = el.querySelector("link")?.textContent;
				const guid = el.querySelector("guid")?.textContent;
				const isLinkExternal = guid && guid.startsWith("http") && guid !== link;

				items.push({
					title: el.querySelector("title")?.textContent || "Untitled",
					url: isLinkExternal ? guid : link,
					external_url: isLinkExternal ? link : null,
					content: el.querySelector("description")?.textContent || "No description provided.",
					date: el.querySelector("pubDate")?.textContent,
				});
			});
		} else if (isAtom) {
			xml.querySelectorAll("entry").forEach((el) => {
				const link = el.querySelector("link[rel='alternate']")?.getAttribute("href") || el.querySelector("link")?.getAttribute("href");
				const related = el.querySelector("link[rel='related']")?.getAttribute("href");

				items.push({
					title: el.querySelector("title")?.textContent || "Untitled",
					url: link,
					external_url: related,
					content: el.querySelector("content")?.textContent || el.querySelector("summary")?.textContent || "No content.",
					date: el.querySelector("updated")?.textContent,
				});
			});
		}

		return { type, isPodcast: hasAudio || hasItunes, items };
	};

	const parseJSON = (text) => {
		const json = JSON.parse(text);
		if (json.version?.includes("jsonfeed")) {
			const items = json.items.map((item) => ({
				title: item.title || "Untitled",
				url: item.url,
				external_url: item.external_url,
				content: item.content_html || item.content_text || item.summary,
				date: item.date_published,
			}));
			const isPodcast = json.items.some((i) => i.attachments?.some((a) => a.mime_type?.startsWith("audio/")));
			return { type: "JSON Feed", isPodcast, items };
		}
		throw new Error("Not a standard JSON Feed.");
	};

	const init = () => {
		const btn = document.getElementById("load-feed");
		const urlInput = document.getElementById("feed-url");
		const status = document.getElementById("status");
		const output = document.getElementById("feed-output");

		if (!btn || !urlInput || !status || !output) return;

		btn.addEventListener("click", async () => {
			const url = urlInput.value.trim();
			if (!url) return;

			status.style.display = "block";
			status.innerHTML = "Fetching...";
			status.className = "status";
			output.innerHTML = "";

			try {
				const response = await fetch(url);

				if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

				const blob = await response.blob();
				const fileSize = blob.size;
				const text = await blob.text();

				let data;
				// Determine format
				if (text.trim().startsWith("{")) {
					data = parseJSON(text);
				} else {
					data = parseXML(text);
				}

				status.style.display = "none";

				let html = `
                    <h2>Details</h2>
					<table>
						<thead><tr><th>Diagnostic</th><th>Value</th></tr></thead>
						<tr><th>Type</th><td>${data.type}</td></tr>
						<tr><th>Podcast</th><td>${data.isPodcast ? "🎙️ Yes" : "No"}</td></tr>
						<tr><th>File Size</th><td>${formatSize(fileSize)}</td></tr>
						<tr><th>Item Count</th><td>${data.items.length}</td></tr>
					</table>
                    <h2>Recent Items</h2>
                `;

				data.items.forEach((item) => {
					const isExternal = !!item.external_url;
					const displayUrl = item.external_url || item.url;

					html += `
                        <article>
                            <h3>
                                <a href="${displayUrl}" target="_blank" rel="noopener">${item.title}</a>
                                ${isExternal ? "<small>EXTERNAL LINK</small>" : ""}
                            </h3>
                            <div>${item.date ? new Date(item.date).toLocaleString() : "No date"}</div>
                            <details>
                                <summary>Show Content Preview</summary>
								${item.content}
                            </details>
                        </article>
                    `;
				});

				output.innerHTML = html;
			} catch (err) {
				status.style.display = "block";
				status.className = "status error";
				if (err.message.includes("Failed to fetch")) {
					status.innerHTML = `<strong>CORS Error:</strong> The server at this URL does not allow browser-based fetching. You may need a CORS proxy.`;
				} else {
					status.innerHTML = `<strong>Error:</strong> ${err.message}`;
				}
			}
		});
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
