export function $(id) {
	return document.getElementById(id);
}

export function show(el) {
	if (typeof el === "string") el = $(el);
	if (el) el.classList.remove("hidden");
}

export function hide(el) {
	if (typeof el === "string") el = $(el);
	if (el) el.classList.add("hidden");
}

export function toggle(el) {
	if (typeof el === "string") el = $(el);
	if (el) el.classList.toggle("hidden");
}

export function escapeHtml(str) {
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}

export function copyToClipboard(text, feedbackEl) {
	navigator.clipboard.writeText(text).then(() => {
		if (typeof feedbackEl === "string") feedbackEl = $(feedbackEl);
		if (feedbackEl) {
			show(feedbackEl);
			setTimeout(() => hide(feedbackEl), 2000);
		}
	});
}

export function ready(fn) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", fn);
	} else {
		fn();
	}
}
