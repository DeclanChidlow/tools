document.addEventListener("DOMContentLoaded", function () {
	// Elements
	const tabs = document.querySelectorAll(".tab");
	const tabContents = document.querySelectorAll(".tab-content");
	const formatOptions = document.querySelectorAll(".format-option");
	const outputSection = document.getElementById("output-section");
	const discordOutput = document.getElementById("discord-output");
	const isoOutput = document.getElementById("iso-output");
	const previewContent = document.getElementById("preview-content");

	// Date/Time inputs
	const dateInput = document.getElementById("date-input");
	const timeInput = document.getElementById("time-input");
	const timezoneSelect = document.getElementById("timezone-select");
	const generateBtn = document.getElementById("generate-btn");

	// Natural language input
	const naturalInput = document.getElementById("natural-input");
	const naturalGenerateBtn = document.getElementById("natural-generate-btn");

	// ISO format input
	const isoInput = document.getElementById("iso-input");
	const isoGenerateBtn = document.getElementById("iso-generate-btn");

	// Copy buttons
	const discordCopyBtn = document.getElementById("discord-copy-btn");
	const isoCopyBtn = document.getElementById("iso-copy-btn");

	// Set default date and time
	const now = new Date();
	dateInput.value = now.toISOString().split("T")[0];
	timeInput.value = now.toTimeString().substring(0, 5);

	// Populate timezone select
	populateTimezones();

	// Tab switching
	tabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			tabs.forEach((t) => t.classList.remove("active"));
			tabContents.forEach((tc) => tc.classList.remove("active"));

			tab.classList.add("active");
			const tabId = tab.getAttribute("data-tab") + "-tab";
			document.getElementById(tabId).classList.add("active");
		});
	});

	// Format selection
	formatOptions.forEach((option) => {
		option.addEventListener("click", () => {
			formatOptions.forEach((o) => o.classList.remove("selected"));
			option.classList.add("selected");
			updateOutputs();
		});
	});

	// Generate timestamp button (Standard)
	generateBtn.addEventListener("click", () => {
		if (!dateInput.value || !timeInput.value) {
			alert("Please enter both date and time");
			return;
		}

		const timestamp = getTimestampFromInputs();
		displayOutputs(timestamp);
	});

	// Generate timestamp button (Natural)
	naturalGenerateBtn.addEventListener("click", () => {
		if (!naturalInput.value) {
			alert("Please enter a date/time description");
			return;
		}

		try {
			const timestamp = parseNaturalLanguage(naturalInput.value);
			displayOutputs(timestamp);
		} catch (error) {
			alert("Could not parse the date/time. Please try a different format.");
		}
	});

	// Generate timestamp button (ISO)
	isoGenerateBtn.addEventListener("click", () => {
		if (!isoInput.value) {
			alert("Please enter a date/time in ISO format");
			return;
		}

		try {
			const timestamp = new Date(isoInput.value).getTime() / 1000;
			displayOutputs(timestamp);
		} catch (error) {
			alert("Invalid ISO format. Please try again.");
		}
	});

	// Copy buttons
	discordCopyBtn.addEventListener("click", () => {
		copyToClipboard(discordOutput.textContent, "discord-copied");
	});

	isoCopyBtn.addEventListener("click", () => {
		copyToClipboard(isoOutput.textContent, "iso-copied");
	});

	// Functions
	function populateTimezones() {
		const timezones = [
			{ label: "Local Timezone", value: "local" },
			{ label: "UTC", value: "UTC" },
			{ label: "US Eastern (UTC-5/4)", value: "America/New_York" },
			{ label: "US Central (UTC-6/5)", value: "America/Chicago" },
			{ label: "US Mountain (UTC-7/6)", value: "America/Denver" },
			{ label: "US Pacific (UTC-8/7)", value: "America/Los_Angeles" },
			{ label: "UK (UTC+0/+1)", value: "Europe/London" },
			{ label: "Central Europe (UTC+1/+2)", value: "Europe/Berlin" },
			{ label: "Eastern Europe (UTC+2/+3)", value: "Europe/Helsinki" },
			{ label: "India (UTC+5:30)", value: "Asia/Kolkata" },
			{ label: "Japan (UTC+9)", value: "Asia/Tokyo" },
			{ label: "Australia Eastern (UTC+10/+11)", value: "Australia/Sydney" },
		];

		timezones.forEach((tz) => {
			const option = document.createElement("option");
			option.value = tz.value;
			option.textContent = tz.label;
			if (tz.value === "local") {
				option.selected = true;
			}
			timezoneSelect.appendChild(option);
		});
	}

	function getTimestampFromInputs() {
		const dateTimeStr = `${dateInput.value}T${timeInput.value}:00`;
		let date;

		if (timezoneSelect.value === "local") {
			date = new Date(dateTimeStr);
		} else {
			// Create date in the selected timezone
			date = new Date(dateTimeStr + "Z"); // Add Z to treat as UTC
			const options = { timeZone: timezoneSelect.value };

			// Get the time parts in the target timezone
			const parts = new Intl.DateTimeFormat("en-US", {
				timeZone: timezoneSelect.value,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			}).formatToParts(date);

			// Extract the parts
			const partsObj = {};
			parts.forEach((part) => {
				if (part.type !== "literal") {
					partsObj[part.type] = part.value;
				}
			});

			// Create the date using the extracted parts
			date = new Date(partsObj.year, parseInt(partsObj.month) - 1, partsObj.day, partsObj.hour === "24" ? 0 : partsObj.hour, partsObj.minute, partsObj.second);
		}

		return Math.floor(date.getTime() / 1000);
	}

	function parseNaturalLanguage(text) {
		let date = new Date();

		// Try to parse with built-in date parsing first
		const parsedDate = new Date(text);
		if (!isNaN(parsedDate.getTime())) {
			return Math.floor(parsedDate.getTime() / 1000);
		}

		// Simple patterns
		const tomorrow = /\btomorrow\b/i;
		const nextDay = /\bnext\s+(\w+)\b/i;
		const atTime = /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
		const justTime = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(\w+)?$/i;
		const datePattern = /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/;
		const monthDate = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/i;
		const timeZonePattern = /\b(est|cst|mst|pst|edt|cdt|mdt|pdt|utc|gmt)(?:[+-]\d+)?\b/i;

		// Handle "tomorrow"
		if (tomorrow.test(text)) {
			date.setDate(date.getDate() + 1);
		}

		// Handle "next day"
		const nextDayMatch = text.match(nextDay);
		if (nextDayMatch) {
			const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
			const dayName = nextDayMatch[1].toLowerCase();
			const dayIndex = days.indexOf(dayName);

			if (dayIndex !== -1) {
				const currentDay = date.getDay();
				let daysToAdd = dayIndex - currentDay;
				if (daysToAdd <= 0) daysToAdd += 7;
				date.setDate(date.getDate() + daysToAdd);
			}
		}

		// Handle month name and date
		const monthMatch = text.match(monthDate);
		if (monthMatch) {
			const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
			const monthName = monthMatch[1].toLowerCase();
			const monthIndex = months.indexOf(monthName);

			if (monthIndex !== -1) {
				const day = parseInt(monthMatch[2], 10);
				const year = monthMatch[3] ? parseInt(monthMatch[3], 10) : date.getFullYear();

				date.setMonth(monthIndex);
				date.setDate(day);

				// Handle two-digit year
				if (year < 100) {
					date.setFullYear(year + 2000);
				} else {
					date.setFullYear(year);
				}
			}
		}

		// Handle numeric date (MM/DD or MM/DD/YYYY)
		const dateMatch = text.match(datePattern);
		if (dateMatch) {
			// In US format, first number is month, second is day
			const month = parseInt(dateMatch[1], 10) - 1; // JS months are 0-indexed
			const day = parseInt(dateMatch[2], 10);

			// Set the date
			date.setMonth(month);
			date.setDate(day);

			// Set year if provided
			if (dateMatch[3]) {
				let year = parseInt(dateMatch[3], 10);
				if (year < 100) year += 2000;
				date.setFullYear(year);
			}
		}

		// Handle "at time"
		const timeMatch = text.match(atTime) || text.match(justTime);
		if (timeMatch) {
			let hours = parseInt(timeMatch[1], 10);
			const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
			const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

			// Handle AM/PM
			if (ampm === "pm" && hours < 12) {
				hours += 12;
			} else if (ampm === "am" && hours === 12) {
				hours = 0;
			}

			date.setHours(hours);
			date.setMinutes(minutes);
			date.setSeconds(0);
		}

		// Handle timezone
		const timezoneMatch = text.match(timeZonePattern);
		if (timezoneMatch) {
			const tz = timezoneMatch[1].toUpperCase();
			// Simple timezone offset mapping
			const tzOffsets = {
				EST: -5,
				EDT: -4,
				CST: -6,
				CDT: -5,
				MST: -7,
				MDT: -6,
				PST: -8,
				PDT: -7,
				UTC: 0,
				GMT: 0,
			};

			if (tzOffsets[tz] !== undefined) {
				// Convert to UTC timestamp
				const localOffset = date.getTimezoneOffset() * 60000; // local offset in milliseconds
				const utcTime = date.getTime() + localOffset; // local time in UTC

				// Apply timezone offset
				const tzTime = utcTime + tzOffsets[tz] * 3600000; // target timezone time
				date = new Date(tzTime);
			}
		}

		return Math.floor(date.getTime() / 1000);
	}

	function displayOutputs(timestamp) {
		const selectedFormat = document.querySelector(".format-option.selected").getAttribute("data-format");

		// Display discord format
		discordOutput.textContent = `<t:${timestamp}:${selectedFormat}>`;

		// Display ISO format
		const isoDate = new Date(timestamp * 1000).toISOString();
		isoOutput.textContent = `<${isoDate.replace("Z", "")}>`;

		// Update preview
		updatePreview(timestamp, selectedFormat);

		// Show output section if hidden
		outputSection.classList.remove("hidden");
	}

	function updateOutputs() {
		const discordText = discordOutput.textContent;
		if (!discordText) return;

		const timestamp = parseInt(discordText.match(/<t:(\d+):/)[1], 10);
		const selectedFormat = document.querySelector(".format-option.selected").getAttribute("data-format");

		// Update discord output
		discordOutput.textContent = `<t:${timestamp}:${selectedFormat}>`;

		// Update preview
		updatePreview(timestamp, selectedFormat);
	}

	function updatePreview(timestamp, format) {
		const date = new Date(timestamp * 1000);
		let formattedDate = "";

		switch (format) {
			case "t": // Short Time
				formattedDate = date.toLocaleString(navigator.language, {
					hour: "numeric",
					minute: "numeric",
					hour12: true,
				});
				break;
			case "T": // Long Time
				formattedDate = date.toLocaleString(navigator.language, {
					hour: "numeric",
					minute: "numeric",
					hour12: false,
				});
				break;
			case "d": // Short Date
				formattedDate = date.toLocaleDateString(navigator.language, {
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
				});
				break;
			case "D": // Long Date
				formattedDate = date.toLocaleDateString(navigator.language, {
					month: "long",
					day: "numeric",
					year: "numeric",
				});
				break;
			case "f": // Short Date/Time
				formattedDate = date.toLocaleDateString(navigator.language, {
					month: "long",
					day: "numeric",
					year: "numeric",
					hour: "numeric",
					minute: "numeric",
					hour12: true,
				});
				break;
			case "F": // Long Date/Time
				formattedDate = date.toLocaleDateString(navigator.language, {
					weekday: "long",
					month: "long",
					day: "numeric",
					year: "numeric",
					hour: "numeric",
					minute: "numeric",
					hour12: true,
				});
				break;
			case "R": // Relative
				formattedDate = formatRelativeTime(timestamp);
				break;
		}

		previewContent.textContent = formattedDate;
	}

	function formatRelativeTime(timestamp) {
		const now = Math.floor(Date.now() / 1000);
		const diff = timestamp - now;
		const absDiff = Math.abs(diff);

		if (diff >= 0) {
			// Future
			if (absDiff < 60) return "in a few seconds";
			if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)} minutes`;
			if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)} hours`;
			if (absDiff < 2592000) return `in ${Math.floor(absDiff / 86400)} days`;
			if (absDiff < 31536000) return `in ${Math.floor(absDiff / 2592000)} months`;
			return `in ${Math.floor(absDiff / 31536000)} years`;
		} else {
			// Past
			if (absDiff < 60) return "a few seconds ago";
			if (absDiff < 3600) return `${Math.floor(absDiff / 60)} minutes ago`;
			if (absDiff < 86400) return `${Math.floor(absDiff / 3600)} hours ago`;
			if (absDiff < 2592000) return `${Math.floor(absDiff / 86400)} days ago`;
			if (absDiff < 31536000) return `${Math.floor(absDiff / 2592000)} months ago`;
			return `${Math.floor(absDiff / 31536000)} years ago`;
		}
	}

	function copyToClipboard(text, copiedId) {
		navigator.clipboard.writeText(text).then(() => {
			const copiedElement = document.getElementById(copiedId);
			copiedElement.classList.remove("hidden");
			setTimeout(() => {
				copiedElement.classList.add("hidden");
			}, 2000);
		});
	}
});
