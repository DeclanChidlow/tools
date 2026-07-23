/**
 * Shorthand for `document.getElementById`.
 * @param {string} id - The element's ID attribute.
 * @returns {HTMLElement|null}
 */
export function $(id) {
	return document.getElementById(id);
}

/**
 * Removes the `.hidden` class from an element, making it visible.
 * Accepts either an `HTMLElement` or a string ID.
 * @param {HTMLElement|string} el - The element or its ID.
 */
export function show(el) {
	if (typeof el === "string") el = $(el);
	if (el) el.classList.remove("hidden");
}

/**
 * Adds the `.hidden` class to an element, making it invisible.
 * Accepts either an `HTMLElement` or a string ID.
 * @param {HTMLElement|string} el - The element or its ID.
 */
export function hide(el) {
	if (typeof el === "string") el = $(el);
	if (el) el.classList.add("hidden");
}

/**
 * Toggles the `.hidden` class on an element.
 * Accepts either an `HTMLElement` or a string ID.
 * @param {HTMLElement|string} el - The element or its ID.
 */
export function toggle(el) {
	if (typeof el === "string") el = $(el);
	if (el) el.classList.toggle("hidden");
}

/**
 * Escapes a string so it can be safely inserted as HTML content.
 * Uses the browser's own text-to-HTML conversion for reliable escaping.
 * @param {string} str - The untrusted string to escape.
 * @returns {string} The HTML-escaped string.
 */
export function escapeHtml(str) {
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}

/**
 * Copies text to the system clipboard and briefly shows a feedback element.
 * @param {string} text - The text to copy.
 * @param {HTMLElement|string} [feedbackEl] - An element (or its ID) to show for 2 seconds after the copy succeeds.
 */
export function copyToClipboard(text, feedbackEl) {
	navigator.clipboard.writeText(text).then(() => {
		if (typeof feedbackEl === "string") feedbackEl = $(feedbackEl);
		if (feedbackEl) {
			show(feedbackEl);
			setTimeout(() => hide(feedbackEl), 2000);
		}
	});
}

/**
 * Runs a callback once the DOM is ready.
 * If the document has already loaded the callback fires immediately.
 * @param {() => void} fn - The function to run on DOM ready.
 */
export function ready(fn) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", fn);
	} else {
		fn();
	}
}
