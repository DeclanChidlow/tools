import QRCode from "https://esm.sh/qrcode";
import { $, show, hide } from "/assets/helpers.js";

const dom = {
	typeSelect: $("qrContentType"),
	sections: document.querySelectorAll(".type-group"),
	generateBtn: $("generateBtn"),
	canvas: $("qrCanvas"),
	rawString: $("qrRawString"),
	contrastWarning: $("contrastWarning"),
	downloadPngBtn: $("downloadPngBtn"),
	downloadJpegBtn: $("downloadJpegBtn"),
	downloadSvgBtn: $("downloadSvgBtn"),
	ecl: $("qrErrorCorrection"),
	margin: $("qrMargin"),
	fgColor: $("qrFgColor"),
	bgColor: $("qrBgColor"),
	width: $("qrWidth"),
};

dom.typeSelect.addEventListener("change", (e) => {
	dom.sections.forEach((sec) => hide(sec));
	const targetSection = $(`type-${e.target.value}`);
	if (targetSection) show(targetSection);
});

function getFormattedData() {
	const type = dom.typeSelect.value;

	switch (type) {
		case "url":
			return $("val-url").value.trim();
		case "text":
			return $("val-text").value;
		case "phone":
			const phoneNum = $("val-phone").value.trim();
			return phoneNum ? `tel:${phoneNum}` : "";
		case "geo":
			const lat = $("val-geo-lat").value.trim();
			const lon = $("val-geo-lon").value.trim();
			return lat && lon ? `geo:${lat},${lon}` : "";
		case "wifi":
			const ssid = $("val-wifi-ssid").value.replace(/([\\;:])/g, "\\$1");
			const pass = $("val-wifi-pass").value.replace(/([\\;:])/g, "\\$1");
			const enc = $("val-wifi-type").value;
			return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
		case "vcard":
			const fn = $("val-vc-first").value.trim();
			const ln = $("val-vc-last").value.trim();
			const phone = $("val-vc-phone").value.trim();
			const email = $("val-vc-email").value.trim();
			return `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn};;;\nFN:${fn} ${ln}\nTEL;TYPE=cell:${phone}\nEMAIL:${email}\nEND:VCARD`;
		case "email":
			const to = $("val-email-to").value.trim();
			const sub = $("val-email-sub").value;
			return `mailto:${to}?subject=${encodeURIComponent(sub)}`;
		case "sms":
			const smsNum = $("val-sms-phone").value.trim();
			const smsMsg = $("val-sms-msg").value;
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
			show(dom.contrastWarning);
		} else {
			hide(dom.contrastWarning);
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
