const dom = {
	convertBtn: document.getElementById("convertBtn"),
	britishCss: document.getElementById("britishCss"),
	standardCss: document.getElementById("standardCss"),
};

dom.convertBtn.addEventListener("click", function () {
	try {
		dom.standardCss.value = britCSS.convertCSS(dom.britishCss.value);
	} catch (error) {
		dom.standardCss.value = "Error: " + error.message;
		console.error("Conversion error:", error);
	}
});
