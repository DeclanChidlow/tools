import { $, escapeHtml } from "/assets/helpers.js";

const dom = {
	convertBtn: $("convertBtn"),
	originalText: $("originalText"),
	aggressiveMode: $("aggressiveMode"),
	shortenedText: $("shortenedText"),
	stats: $("stats"),
};

const textShortener = {
	conservativeReplacements: {
		"...": "…",
		"--": "—",
		"->": "→",
		"<-": "←",
		"<=": "≤",
		">=": "≥",
		"!=": "≠",
		"+-": "±",
		"!?": "‽",
		"?!": "‽",
		"(c)": "©",
		"(r)": "®",
		"(tm)": "™",
		"1/2": "½",
		"1/3": "⅓",
		"2/3": "⅔",
		"1/4": "¼",
		"3/4": "¾",
		"1/8": "⅛",
		"3/8": "⅜",
		"5/8": "⅝",
		"7/8": "⅞",
		" degrees": "°",
		" degree": "°",
		"degrees ": "° ",
		"degree ": "° ",
		" and ": " & ",
		" at ": " @ ",
		" percent": "%",
		" per cent": "%",
		"percent ": "% ",
		"per cent ": "% ",
		" first": " 1st",
		" second": " 2nd",
		" third": " 3rd",
		" fourth": " 4th",
		" fifth": " 5th",
		" sixth": " 6th",
		" seventh": " 7th",
		" eighth": " 8th",
		" ninth": " 9th",
		" tenth": " 10th",
	},

	aggressiveReplacements: {
		"with": "w/",
		"without": "w/o",
		"because": "bc",
		"before": "b4",
		"for": "4",
		"to": "2",
		"too": "2",
		"you": "u",
		"your": "ur",
		"you're": "ur",
		"are": "r",
		"through": "thru",
		"tonight": "2nite",
		"tomorrow": "2moro",
		"today": "2day",
		"between": "b/w",
		"about": "abt",
		"people": "ppl",
		"something": "sth",
		"someone": "s1",
		"anyone": "any1",
		"everyone": "every1",
		"nothing": "nth",
		"everything": "evryth",
		"probably": "prob",
		"definitely": "def",
		"awesome": "awsm",
		"amazing": "amzg",
		"literally": "lit",
		"seriously": "srsly",
		"please": "pls",
		"thanks": "thx",
		"thank you": "ty",
		"see you": "cu",
		"talk to you later": "ttyl",
		"be right back": "brb",
		"laughing out loud": "lol",
		"oh my god": "omg",
		"by the way": "btw",
		"for your information": "fyi",
		"in my opinion": "imo",
		"in my humble opinion": "imho",
		"as far as I know": "afaik",
		"to be honest": "tbh",
		"what the heck": "wth",
		"what the hell": "wtf",
		"i don't know": "idk",
		"never mind": "nvm",
		"message": "msg",
		"picture": "pic",
		"follow": "flw",
		"favourite": "fav",
		"versus": "vs",
		"against": "vs",
		"should": "shld",
		"would": "wld",
		"could": "cld",
		"right": "rt",
		"great": "gr8",
		"later": "l8r",
		"mate": "m8",
		"wait": "w8",
		"hate": "h8",
		"appreciate": "apprec8",
		"activate": "activ8",
		"create": "cre8",
	},

	convertText(text, aggressive = false) {
		if (!text || typeof text !== "string") {
			throw new Error("Please provide valid text to convert");
		}

		let result = text;
		const replacements = aggressive ? { ...this.conservativeReplacements, ...this.aggressiveReplacements } : this.conservativeReplacements;

		for (const [original, replacement] of Object.entries(replacements)) {
			const isWord = /[a-zA-Z]/.test(original);

			if (isWord) {
				const regex = new RegExp("\\b" + original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
				result = result.replace(regex, replacement);
			} else {
				const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
				result = result.replace(regex, replacement);
			}
		}

		return result.replace(/\s+/g, " ").trim();
	},

	getSavings(original, shortened) {
		const saved = original.length - shortened.length;
		return {
			charactersSaved: saved,
			percentageSaved: original.length > 0 ? Math.round((saved / original.length) * 100) : 0,
		};
	},
};

dom.convertBtn.addEventListener("click", function () {
	try {
		const originalText = dom.originalText.value;
		const shortenedText = textShortener.convertText(originalText, dom.aggressiveMode.checked);
		const stats = textShortener.getSavings(originalText, shortenedText);

		dom.shortenedText.value = shortenedText;

		dom.stats.innerHTML = `
			<p><strong>Statistics:</strong></p>
			<p>Original: ${originalText.length} characters</p>
			<p>Shortened: ${shortenedText.length} characters</p>
			<p>Saved: ${stats.charactersSaved} characters (${stats.percentageSaved}%)</p>
		`;
	} catch (error) {
		dom.shortenedText.value = "Error: " + error.message;
		dom.stats.innerHTML = "";
		console.error("Conversion error:", error);
	}
});
