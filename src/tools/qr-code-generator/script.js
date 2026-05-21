import QRCode from "https://esm.sh/qrcode";

const dom = {
	typeSelect: document.getElementById("qrContentType"),
	sections: document.querySelectorAll(".type-group"),
	generateBtn: document.getElementById("generateBtn"),
	canvas: document.getElementById("qrCanvas"),
	rawString: document.getElementById("qrRawString"),
	contrastWarning: document.getElementById("contrastWarning"),

	downloadPngBtn: document.getElementById("downloadPngBtn"),
	downloadJpegBtn: document.getElementById("downloadJpegBtn"),
	downloadSvgBtn: document.getElementById("downloadSvgBtn"),

	ecl: document.getElementById("qrErrorCorrection"),
	margin: document.getElementById("qrMargin"),
	fgColor: document.getElementById("qrFgColor"),
	bgColor: document.getElementById("qrBgColor"),
	width: document.getElementById("qrWidth"),
};

dom.typeSelect.addEventListener("change", (e) => {
	dom.sections.forEach((sec) => sec.classList.add("hidden"));
	const targetSection = document.getElementById(`type-${e.target.value}`);
	if (targetSection) targetSection.classList.remove("hidden");
});

function getFormattedData() {
	const type = dom.typeSelect.value;

	switch (type) {
		case "url":
			return document.getElementById("val-url").value.trim();
		case "text":
			return document.getElementById("val-text").value;
		case "phone":
			const phoneNum = document.getElementById("val-phone").value.trim();
			return phoneNum ? `tel:${phoneNum}` : "";
		case "geo":
			const lat = document.getElementById("val-geo-lat").value.trim();
			const lon = document.getElementById("val-geo-lon").value.trim();
			return lat && lon ? `geo:${lat},${lon}` : "";
		case "wifi":
			const ssid = document.getElementById("val-wifi-ssid").value.replace(/([\\;:])/g, "\\$1");
			const pass = document.getElementById("val-wifi-pass").value.replace(/([\\;:])/g, "\\$1");
			const enc = document.getElementById("val-wifi-type").value;
			return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
		case "vcard":
			const fn = document.getElementById("val-vc-first").value.trim();
			const ln = document.getElementById("val-vc-last").value.trim();
			const phone = document.getElementById("val-vc-phone").value.trim();
			const email = document.getElementById("val-vc-email").value.trim();
			return `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn};;;\nFN:${fn} ${ln}\nTEL;TYPE=cell:${phone}\nEMAIL:${email}\nEND:VCARD`;
		case "email":
			const to = document.getElementById("val-email-to").value.trim();
			const sub = document.getElementById("val-email-sub").value;
			return `mailto:${to}?subject=${encodeURIComponent(sub)}`;
		case "sms":
			const smsNum = document.getElementById("val-sms-phone").value.trim();
			const smsMsg = document.getElementById("val-sms-msg").value;
			return `smsto:${smsNum}:${smsMsg}`;
		default:
			return "";
	}
}

function hexToRgb(hex) {
	const num = parseInt(hex.replace("#", ""), 16);
	return {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255,
	};
}

function getLuminance(rgb) {
	const a = [rgb.r, rgb.g, rgb.b].map((v) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function checkContrast(color1Hex, color2Hex) {
	const lum1 = getLuminance(hexToRgb(color1Hex));
	const lum2 = getLuminance(hexToRgb(color2Hex));
	const brightest = Math.max(lum1, lum2);
	const darkest = Math.min(lum1, lum2);
	return (brightest + 0.05) / (darkest + 0.05);
}

function getQrOptions() {
	return {
		errorCorrectionLevel: dom.ecl.value,
		margin: parseInt(dom.margin.value, 10) || 0,
		width: parseInt(dom.width.value, 10) || 300,
		color: {
			dark: dom.fgColor.value + "FF",
			light: dom.bgColor.value + "FF",
		},
	};
}

function setDownloadButtonsState(disabled) {
	dom.downloadPngBtn.disabled = disabled;
	dom.downloadJpegBtn.disabled = disabled;
	dom.downloadSvgBtn.disabled = disabled;
}

dom.generateBtn.addEventListener("click", async () => {
	try {
		const data = getFormattedData();
		if (!data) throw new Error("Please enter data to encode.");

		dom.rawString.textContent = data;

		const ratio = checkContrast(dom.fgColor.value, dom.bgColor.value);
		if (ratio < 3.0) {
			dom.contrastWarning.classList.remove("hidden");
		} else {
			dom.contrastWarning.classList.add("hidden");
		}

		await QRCode.toCanvas(dom.canvas, data, getQrOptions());
		setDownloadButtonsState(false);
	} catch (error) {
		console.error(error);
		alert("Failed to generate: " + error.message);
	}
});

dom.downloadPngBtn.addEventListener("click", () => {
	const link = document.createElement("a");
	link.download = `qrcode-${dom.typeSelect.value}.png`;
	link.href = dom.canvas.toDataURL("image/png");
	link.click();
});

dom.downloadJpegBtn.addEventListener("click", () => {
	const link = document.createElement("a");
	link.download = `qrcode-${dom.typeSelect.value}.jpg`;
	link.href = dom.canvas.toDataURL("image/jpeg", 0.9);
	link.click();
});

dom.downloadSvgBtn.addEventListener("click", async () => {
	const data = getFormattedData();
	if (!data) return;

	const link = document.createElement("a");
	link.download = `qrcode-${dom.typeSelect.value}.svg`;

	try {
		const svgString = await QRCode.toString(data, { ...getQrOptions(), type: "svg" });
		const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
		link.href = URL.createObjectURL(blob);
		link.click();
		setTimeout(() => URL.revokeObjectURL(link.href), 100);
	} catch (error) {
		console.error("SVG generation failed:", error);
	}
});
