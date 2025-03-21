document.getElementById("convertBtn").addEventListener("click", function () {
	try {
		const britishCss = document.getElementById("britishCss").value;
		const standardCss = britCSS.convertCSS(britishCss);
		document.getElementById("standardCss").value = standardCss;
	} catch (error) {
		document.getElementById("standardCss").value = "Error: " + error.message;
		console.error("Conversion error:", error);
	}
});
