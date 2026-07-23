import { $, show, hide, copyToClipboard } from "/assets/helpers.js";

const dom = {
	tabs: document.querySelectorAll(".tab"),
	tabContents: document.querySelectorAll(".tab-content"),
	formatOptions: document.querySelectorAll(".format-option"),
	outputSection: $("output-section"),
	platformOutput: $("platform-output"),
	isoOutput: $("iso-output"),
	previewContent: $("preview-content"),
	dateInput: $("date-input"),
	timeInput: $("time-input"),
	timezoneSelect: $("timezone-select"),
	generateBtn: $("generate-btn"),
	naturalInput: $("natural-input"),
	naturalGenerateBtn: $("natural-generate-btn"),
	isoInput: $("iso-input"),
	isoGenerateBtn: $("iso-generate-btn"),
	platformCopyBtn: $("platform-copy-btn"),
	isoCopyBtn: $("iso-copy-btn"),
};

const now = new Date();
dom.dateInput.value = now.toISOString().split("T")[0];
dom.timeInput.value = now.toTimeString().substring(0, 5);

populateTimezones();

dom.tabs.forEach((tab) => {
	tab.addEventListener("click", () => {
		dom.tabs.forEach((t) => t.classList.remove("active"));
		dom.tabContents.forEach((tc) => tc.classList.remove("active"));

		tab.classList.add("active");
		const tabId = tab.getAttribute("data-tab") + "-tab";
		$(tabId).classList.add("active");
	});
});

dom.formatOptions.forEach((option) => {
	option.addEventListener("click", () => {
		dom.formatOptions.forEach((o) => o.classList.remove("selected"));
		option.classList.add("selected");
		updateOutputs();
	});
});

dom.generateBtn.addEventListener("click", () => {
	if (!dom.dateInput.value || !dom.timeInput.value) {
		alert("Please enter both date and time");
		return;
	}

	const timestamp = getTimestampFromInputs();
	displayOutputs(timestamp);
});

dom.naturalGenerateBtn.addEventListener("click", () => {
	if (!dom.naturalInput.value) {
		alert("Please enter a date/time description");
		return;
	}

	try {
		const timestamp = parseNaturalLanguage(dom.naturalInput.value);
		displayOutputs(timestamp);
	} catch (error) {
		alert("Could not parse the date/time. Please try a different format.");
	}
});

dom.isoGenerateBtn.addEventListener("click", () => {
	if (!dom.isoInput.value) {
		alert("Please enter a date/time in ISO format");
		return;
	}

	try {
		const timestamp = new Date(dom.isoInput.value).getTime() / 1000;
		displayOutputs(timestamp);
	} catch (error) {
		alert("Invalid ISO format. Please try again.");
	}
});

dom.platformCopyBtn.addEventListener("click", () => {
	copyToClipboard(dom.platformOutput.textContent, "platform-copied");
});

dom.isoCopyBtn.addEventListener("click", () => {
	copyToClipboard(dom.isoOutput.textContent, "iso-copied");
});

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
		dom.timezoneSelect.appendChild(option);
	});
}

function getTimestampFromInputs() {
	const dateTimeStr = `${dom.dateInput.value}T${dom.timeInput.value}:00`;
	let date;

	if (dom.timezoneSelect.value === "local") {
		date = new Date(dateTimeStr);
	} else {
		date = new Date(dateTimeStr + "Z");
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone: dom.timezoneSelect.value,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		}).formatToParts(date);

		const partsObj = {};
		parts.forEach((part) => {
			if (part.type !== "literal") {
				partsObj[part.type] = part.value;
			}
		});

		date = new Date(partsObj.year, parseInt(partsObj.month) - 1, partsObj.day, partsObj.hour === "24" ? 0 : partsObj.hour, partsObj.minute, partsObj.second);
	}

	return Math.floor(date.getTime() / 1000);
}

function parseNaturalLanguage(text) {
	let date = new Date();

	const parsedDate = new Date(text);
	if (!isNaN(parsedDate.getTime())) {
		return Math.floor(parsedDate.getTime() / 1000);
	}

	const tomorrow = /\btomorrow\b/i;
	const nextDay = /\bnext\s+(\w+)\b/i;
	const atTime = /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
	const justTime = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(\w+)?$/i;
	const datePattern = /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/;
	const monthDate = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/i;
	const timeZonePattern = /\b(est|cst|mst|pst|edt|cdt|mdt|pdt|utc|gmt)(?:[+-]\d+)?\b/i;

	if (tomorrow.test(text)) {
		date.setDate(date.getDate() + 1);
	}

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

			if (year < 100) {
				date.setFullYear(year + 2000);
			} else {
				date.setFullYear(year);
			}
		}
	}

	const dateMatch = text.match(datePattern);
	if (dateMatch) {
		const month = parseInt(dateMatch[1], 10) - 1;
		const day = parseInt(dateMatch[2], 10);

		date.setMonth(month);
		date.setDate(day);

		if (dateMatch[3]) {
			let year = parseInt(dateMatch[3], 10);
			if (year < 100) year += 2000;
			date.setFullYear(year);
		}
	}

	const timeMatch = text.match(atTime) || text.match(justTime);
	if (timeMatch) {
		let hours = parseInt(timeMatch[1], 10);
		const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
		const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

		if (ampm === "pm" && hours < 12) {
			hours += 12;
		} else if (ampm === "am" && hours === 12) {
			hours = 0;
		}

		date.setHours(hours);
		date.setMinutes(minutes);
		date.setSeconds(0);
	}

	const timezoneMatch = text.match(timeZonePattern);
	if (timezoneMatch) {
		const tz = timezoneMatch[1].toUpperCase();
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
			const localOffset = date.getTimezoneOffset() * 60000;
			const utcTime = date.getTime() + localOffset;
			const tzTime = utcTime + tzOffsets[tz] * 3600000;
			date = new Date(tzTime);
		}
	}

	return Math.floor(date.getTime() / 1000);
}

function displayOutputs(timestamp) {
	const selectedFormat = document.querySelector(".format-option.selected").getAttribute("data-format");

	dom.platformOutput.textContent = `<t:${timestamp}:${selectedFormat}>`;

	const isoDate = new Date(timestamp * 1000).toISOString();
	dom.isoOutput.textContent = `<${isoDate.replace("Z", "")}>`;

	updatePreview(timestamp, selectedFormat);

	show(dom.outputSection);
}

function updateOutputs() {
	const platformText = dom.platformOutput.textContent;
	if (!platformText) return;

	const timestamp = parseInt(platformText.match(/<t:(\d+):/)[1], 10);
	const selectedFormat = document.querySelector(".format-option.selected").getAttribute("data-format");

	dom.platformOutput.textContent = `<t:${timestamp}:${selectedFormat}>`;

	updatePreview(timestamp, selectedFormat);
}

function updatePreview(timestamp, format) {
	const date = new Date(timestamp * 1000);
	let formattedDate = "";

	switch (format) {
		case "t":
			formattedDate = date.toLocaleString(navigator.language, { hour: "numeric", minute: "numeric", hour12: true });
			break;
		case "T":
			formattedDate = date.toLocaleString(navigator.language, { hour: "numeric", minute: "numeric", hour12: false });
			break;
		case "d":
			formattedDate = date.toLocaleDateString(navigator.language, { month: "2-digit", day: "2-digit", year: "numeric" });
			break;
		case "D":
			formattedDate = date.toLocaleDateString(navigator.language, { month: "long", day: "numeric", year: "numeric" });
			break;
		case "f":
			formattedDate = date.toLocaleDateString(navigator.language, { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true });
			break;
		case "F":
			formattedDate = date.toLocaleDateString(navigator.language, { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true });
			break;
		case "R":
			formattedDate = formatRelativeTime(timestamp);
			break;
	}

	dom.previewContent.textContent = formattedDate;
}

function formatRelativeTime(timestamp) {
	const now = Math.floor(Date.now() / 1000);
	const diff = timestamp - now;
	const absDiff = Math.abs(diff);

	if (diff >= 0) {
		if (absDiff < 60) return "in a few seconds";
		if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)} minutes`;
		if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)} hours`;
		if (absDiff < 2592000) return `in ${Math.floor(absDiff / 86400)} days`;
		if (absDiff < 31536000) return `in ${Math.floor(absDiff / 2592000)} months`;
		return `in ${Math.floor(absDiff / 31536000)} years`;
	} else {
		if (absDiff < 60) return "a few seconds ago";
		if (absDiff < 3600) return `${Math.floor(absDiff / 60)} minutes ago`;
		if (absDiff < 86400) return `${Math.floor(absDiff / 3600)} hours ago`;
		if (absDiff < 2592000) return `${Math.floor(absDiff / 86400)} days ago`;
		if (absDiff < 31536000) return `${Math.floor(absDiff / 2592000)} months ago`;
		return `${Math.floor(absDiff / 31536000)} years ago`;
	}
}
