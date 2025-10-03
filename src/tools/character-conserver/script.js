const textShortener = {
	conservativeReplacements: {
		// Typography improvements
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
		// Common symbol replacements
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
		// Number replacements
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
		"favorite": "fav",
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

	convertText: function (text, aggressive = false) {
		if (!text || typeof text !== "string") {
			throw new Error("Please provide valid text to convert");
		}

		let result = text;
		const replacements = aggressive ? { ...this.conservativeReplacements, ...this.aggressiveReplacements } : this.conservativeReplacements;

		for (const [original, replacement] of Object.entries(replacements)) {
			const isWord = /[a-zA-Z]/.test(original);

			if (isWord) {
				// Word replacement
				const regex = new RegExp("\\b" + original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
				result = result.replace(regex, replacement);
			} else {
				// Symbol replacement
				const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
				result = result.replace(regex, replacement);
			}
		}

		result = result.replace(/\s+/g, " ").trim();

		return result;
	},

	getCharacterCount: function (text) {
		return text.length;
	},

	getSavings: function (original, shortened) {
		const saved = original.length - shortened.length;
		return {
			originalLength: original.length,
			shortenedLength: shortened.length,
			charactersSaved: saved,
			percentageSaved: original.length > 0 ? Math.round((saved / original.length) * 100) : 0,
		};
	},

	previewBoth: function (text) {
		return {
			conservative: this.convertText(text, false),
			aggressive: this.convertText(text, true),
		};
	},
};

document.getElementById("convertBtn").addEventListener("click", function () {
	try {
		const originalText = document.getElementById("originalText").value;
		const aggressiveMode = document.getElementById("aggressiveMode").checked;
		const shortenedText = textShortener.convertText(originalText, aggressiveMode);
		const stats = textShortener.getSavings(originalText, shortenedText);

		document.getElementById("shortenedText").value = shortenedText;

		document.getElementById("stats").innerHTML = `
			<p><strong>Statistics:</strong></p>
			<p>Original: ${stats.originalLength} characters</p>
			<p>Shortened: ${stats.shortenedLength} characters</p>
			<p>Saved: ${stats.charactersSaved} characters (${stats.percentageSaved}%)</p>
		`;
	} catch (error) {
		document.getElementById("shortenedText").value = "Error: " + error.message;
		document.getElementById("stats").innerHTML = "";
		console.error("Conversion error:", error);
	}
});
