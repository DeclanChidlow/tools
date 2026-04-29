document.addEventListener("DOMContentLoaded", function () {
	const badgeList = document.getElementById("badge-list");
	const addBadgeButton = document.getElementById("add-badge");
	const badgeOutput = document.getElementById("badge-output");
	const copyButton = document.getElementById("copy-markdown");
	const copySuccess = document.getElementById("copy-success");

	const platforms = [
		{ id: "youtube", name: "YouTube", icon: ":01JPV770JV3K9RDJRMC3MD94YC:", urlPattern: "https://youtube.com/user/@" },
		{ id: "bsky", name: "Bluesky", icon: ":01JPV7A1JZDS2RQJ3QZ756J5SE:", urlPattern: "https://bsky.app/profile/" },
		{ id: "website", name: "Website", icon: ":01JPV8PPBFP6HFB76ENP6SJ06X:", urlPattern: "https://" },
		{ id: "github", name: "GitHub", icon: ":01JPV74QFZFZ1E793YKKE7WNCS:", urlPattern: "https://github.com/" },
		{ id: "gitlab", name: "GitLab", icon: ":01JPV7C7P0P93ESK193J29CBE0:", urlPattern: "https://gitlab.com/" },
		{ id: "codeberg", name: "Codeberg", icon: ":01JPV7F5XV3JQ7DQXAC7HDE3N2:", urlPattern: "https://codeberg.org/" },
		{ id: "unsplash", name: "Unsplash", icon: ":01JPV7JQFJ7HXZ5EPFPMAKB4KA:", urlPattern: "https://unsplash.com/@" },
		{ id: "codepen", name: "CodePen", icon: ":01JPV7GJXMYY2CR43GYJTQ5397:", urlPattern: "https://codepen.io/" },
		{ id: "pronounspage", name: "Pronouns.page", icon: ":01JKB8HD5Z0J2AKTDM1YTMC7DS:", urlPattern: "https://en.pronouns.page/@" },
		{ id: "twitch", name: "Twitch", icon: ":01JPV7QHGGCRPNJC4C12X9GAJK:", urlPattern: "https://twitch.tv/" },
		{ id: "pinterest", name: "Pinterest", icon: ":01JPV7T49MBVKM1H87X72PP9RX:", urlPattern: "https://pinterest.com/" },
		{ id: "discord", name: "Discord", icon: ":01JPV842PMKBNGDNA0S3M278ZS:", urlPattern: "https://discord.com/users/" },
		{ id: "instagram", name: "Instagram", icon: ":01JT5PP5J90G6WPZSBQVD7FKK0:", urlPattern: "https://www.instagram.com/" },
		{ id: "facebook", name: "Facebook", icon: ":01JT5PR872NMQXE1T1R2RH3VF6:", urlPattern: "https://www.facebook.com/" },
		{ id: "spotify", name: "Spotify", icon: ":01JT5Q1VYD75EGCJHZJ6FXP8W4:", urlPattern: "https://open.spotify.com/user/" },
		{ id: "tiktok", name: "TikTok", icon: ":01JT5Q55AB2W9TC02H6M6DAQK2:", urlPattern: "https://www.tiktok.com/@" },
		{ id: "spacehey", name: "SpaceHey", icon: ":01JW3F5GXJWSEKS3X1KX98CK0S:", urlPattern: "https://spacehey.com/profile?id=" },
		{ id: "reddit", name: "Reddit", icon: ":01JW4XQPENHF50ZXMTQTQ7GR25:", urlPattern: "https://www.reddit.com/user/" },
	];

	addBadgeButton.addEventListener("click", function () {
		addBadgeForm();
		updateOutput();
	});

	copyButton.addEventListener("click", function () {
		const markdown = badgeOutput.textContent;
		navigator.clipboard.writeText(markdown).then(() => {
			copySuccess.classList.add("show");
			setTimeout(() => {
				copySuccess.classList.remove("show");
			}, 2000);
		});
	});

	function addBadgeForm() {
		const badgeItem = document.createElement("div");
		badgeItem.className = "badge-item";

		const form = document.createElement("div");
		form.className = "badge-form";

		const input = document.createElement("input");
		input.type = "text";
		input.className = "badge-input";
		input.placeholder = "Enter username or full URL";
		input.addEventListener("input", updateOutput);

		const select = document.createElement("select");
		select.className = "badge-select";

		platforms.forEach((platform) => {
			const option = document.createElement("option");
			option.value = platform.id;
			option.textContent = platform.name;
			select.appendChild(option);
		});

		select.addEventListener("change", updateOutput);

		const removeButton = document.createElement("button");
		removeButton.className = "badge-button remove";
		removeButton.textContent = "Remove";
		removeButton.addEventListener("click", function () {
			badgeList.removeChild(badgeItem);
			updateOutput();
		});

		form.appendChild(input);
		form.appendChild(select);
		form.appendChild(removeButton);

		badgeItem.appendChild(form);
		badgeList.appendChild(badgeItem);
	}

	function updateOutput() {
		const badgeItems = document.querySelectorAll(".badge-item");
		let markdown = "";

		let badges = [];

		badgeItems.forEach((item) => {
			const input = item.querySelector(".badge-input").value;
			const platformId = item.querySelector(".badge-select").value;
			const platform = platforms.find((p) => p.id === platformId);

			if (input) {
				let username = input;
				let url = "";

				if (isValidURL(input)) {
					url = input;
					username = extractUsernameFromURL(input, platformId);
				} else {
					url = platform.urlPattern + username;
				}

				badges.push(`[${platform.icon}](${url} "${platform.name}")`);
			}
		});

		if (badges.length > 0) {
			markdown = "> ## " + badges.join(" ");
		}

		badgeOutput.textContent = markdown;
	}

	function isValidURL(str) {
		try {
			new URL(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	function extractUsernameFromURL(url, platformId) {
		try {
			const parsedUrl = new URL(url);
			const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

			switch (platformId) {
				case "youtube":
					return pathParts[1] || "user";
				case "github":
				case "twitch":
					return pathParts[0] || "";
				case "bsky":
					return pathParts[1] || "";
				case "linkedin":
					if (pathParts[0] === "in") {
						return pathParts[1] || "";
					}
					return pathParts[0] || "";
				default:
					return pathParts[pathParts.length - 1] || "";
			}
		} catch (e) {
			return "";
		}
	}

	addBadgeForm();
});
