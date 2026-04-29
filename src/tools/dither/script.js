const STATE = {
	img: null,
	blueNoise: null,
};

// Pre-defined Palettes (RGB arrays)
const PALETTES = {
	bw: [
		[0, 0, 0],
		[255, 255, 255],
	],
	mac: [
		[0, 0, 0],
		[255, 255, 255],
	],
	gb: [
		[15, 56, 15],
		[48, 98, 48],
		[139, 172, 15],
		[155, 188, 15],
	],
	cga1: [
		[0, 0, 0],
		[85, 255, 255],
		[255, 85, 255],
		[255, 255, 255],
	],
	cga2: [
		[0, 0, 0],
		[85, 255, 85],
		[255, 85, 85],
		[255, 255, 85],
	],
	pico8: [
		[0, 0, 0],
		[29, 43, 83],
		[126, 37, 83],
		[0, 135, 81],
		[171, 82, 54],
		[95, 87, 79],
		[194, 195, 199],
		[255, 241, 232],
		[255, 0, 77],
		[255, 163, 0],
		[255, 236, 39],
		[0, 228, 54],
		[41, 173, 255],
		[131, 118, 156],
		[255, 119, 168],
		[255, 204, 170],
	],
};

// Bayer Matrices
const BAYER_4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
];

const BAYER_8 = [
	[0, 32, 8, 40, 2, 34, 10, 42],
	[48, 16, 56, 24, 50, 18, 58, 26],
	[12, 44, 4, 36, 14, 46, 6, 38],
	[60, 28, 52, 20, 62, 30, 54, 22],
	[3, 35, 11, 43, 1, 33, 9, 41],
	[51, 19, 59, 27, 49, 17, 57, 25],
	[15, 47, 7, 39, 13, 45, 5, 37],
	[63, 31, 55, 23, 61, 29, 53, 21],
];

const BLUE_NOISE_URI =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAADFBMVEIAAAAA/wD///8A/wD/G+8JAAAABHRSTlP/AP8A/6C9cd0AAAB/SURBVHja7ZUxDkAwDIU/4w08A2M3jsE1eAYOwdiN0zAkWlVqpY76pU+2gwZDv2c/2+D366r9FqAOmH5/sLwfoBcwA8wA6wVwF8wA64UB1Av4F8wA8wX8C2aA+QJmwQwwX8AsmAHWC5gFM8B8AbNgBpgvYBbMAPMFzIIZYL6AWbAD3C966w5lYVz6+AAAAABJRU5ErkJggg==";

const bnImg = new Image();
bnImg.src = BLUE_NOISE_URI;
bnImg.onload = () => (STATE.blueNoise = bnImg);

const ui = {
	upload: document.getElementById("upload"),
	width: document.getElementById("width-input"),
	palette: document.getElementById("palette-select"),
	algo: document.getElementById("algo-select"),
	colorMode: document.getElementById("color-mode"),
	amount: document.getElementById("dither-amount"),
	amountVal: document.getElementById("amount-val"),
	format: document.getElementById("export-format"),
	btn: document.getElementById("process-btn"),
	dl: document.getElementById("download-btn"),
	canvas: document.getElementById("canvas"),
	drop: document.getElementById("drop-zone"),
};

// --- Events ---
ui.upload.addEventListener("change", (e) => loadFile(e.target.files[0]));
ui.btn.addEventListener("click", process);
ui.amount.addEventListener("input", (e) => (ui.amountVal.innerText = e.target.value));
ui.dl.addEventListener("click", downloadOutput);

// Drag & Drop
ui.drop.addEventListener("dragover", (e) => {
	e.preventDefault();
	ui.drop.classList.add("hover");
});
ui.drop.addEventListener("dragleave", () => ui.drop.classList.remove("hover"));
ui.drop.addEventListener("drop", (e) => {
	e.preventDefault();
	ui.drop.classList.remove("hover");
	loadFile(e.dataTransfer.files[0]);
});

function loadFile(file) {
	if (!file) return;
	const reader = new FileReader();
	reader.onload = (e) => {
		const img = new Image();
		img.onload = () => {
			STATE.img = img;
			process();
		};
		img.src = e.target.result;
	};
	reader.readAsDataURL(file);
}

// --- Core Processing ---
function process() {
	if (!STATE.img) return;

	const width = parseInt(ui.width.value) || 320;
	const scale = width / STATE.img.width;
	const height = Math.floor(STATE.img.height * scale);

	ui.canvas.width = width;
	ui.canvas.height = height;
	const ctx = ui.canvas.getContext("2d");

	// Draw resized image
	ctx.drawImage(STATE.img, 0, 0, width, height);

	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;

	// BUG FIX: Use a Float32 buffer so error diffusion doesn't prematurely clamp to 0-255
	const floatData = new Float32Array(data);

	// Params
	const algo = ui.algo.value;
	const palId = ui.palette.value;
	const isGray = ui.colorMode.value === "gray";
	const amount = parseFloat(ui.amount.value);

	// Prepare Blue Noise Data
	let bnData = null;
	if (algo === "blue" && STATE.blueNoise) {
		const bnCanvas = document.createElement("canvas");
		bnCanvas.width = 64;
		bnCanvas.height = 64;
		const bnCtx = bnCanvas.getContext("2d");
		bnCtx.drawImage(STATE.blueNoise, 0, 0);
		bnData = bnCtx.getImageData(0, 0, 64, 64).data;
	}

	// --- Dithering Loop ---
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;

			// 1. Get current pixel color from our float buffer
			let r = floatData[i];
			let g = floatData[i + 1];
			let b = floatData[i + 2];

			// 2. Pre-process: Grayscale
			if (isGray) {
				const luma = 0.299 * r + 0.587 * g + 0.114 * b;
				r = g = b = luma;
			}

			// 3. Apply Ordered Dither Modifier
			if (algo === "bayer4") {
				const mod = (BAYER_4[y % 4][x % 4] / 16 - 0.5) * 255 * amount;
				r += mod;
				g += mod;
				b += mod;
			} else if (algo === "bayer8") {
				const mod = (BAYER_8[y % 8][x % 8] / 64 - 0.5) * 255 * amount;
				r += mod;
				g += mod;
				b += mod;
			} else if (algo === "blue" && bnData) {
				const bx = x % 64;
				const by = y % 64;
				const bi = (by * 64 + bx) * 4;
				const noiseVal = bnData[bi];
				const mod = (noiseVal / 255 - 0.5) * 255 * amount;
				r += mod;
				g += mod;
				b += mod;
			}

			// 4. Quantize
			let newR, newG, newB;

			if (palId === "rgb") {
				const stepSize = 255 / 5;
				newR = Math.round(r / stepSize) * stepSize;
				newG = Math.round(g / stepSize) * stepSize;
				newB = Math.round(b / stepSize) * stepSize;
			} else if (palId === "web") {
				newR = Math.round(r / 51) * 51;
				newG = Math.round(g / 51) * 51;
				newB = Math.round(b / 51) * 51;
			} else {
				const closest = findClosestColor(r, g, b, PALETTES[palId]);
				newR = closest[0];
				newG = closest[1];
				newB = closest[2];
			}

			newR = Math.max(0, Math.min(255, newR));
			newG = Math.max(0, Math.min(255, newG));
			newB = Math.max(0, Math.min(255, newB));

			// 5. Write Pixel to final clamp buffer
			data[i] = newR;
			data[i + 1] = newG;
			data[i + 2] = newB;
			data[i + 3] = 255;

			// 6. Error Diffusion
			if (["floyd", "atkinson", "sierra", "burkes", "stucki", "jjn"].includes(algo)) {
				// Diffuse the un-clamped original against the clamped target
				const errR = (r - newR) * amount;
				const errG = (g - newG) * amount;
				const errB = (b - newB) * amount;

				if (algo === "floyd") {
					distribute(floatData, x, y, width, height, errR, errG, errB, [
						[1, 0, 7 / 16],
						[-1, 1, 3 / 16],
						[0, 1, 5 / 16],
						[1, 1, 1 / 16],
					]);
				} else if (algo === "atkinson") {
					distribute(floatData, x, y, width, height, errR, errG, errB, [
						[1, 0, 1 / 8],
						[2, 0, 1 / 8],
						[-1, 1, 1 / 8],
						[0, 1, 1 / 8],
						[1, 1, 1 / 8],
						[0, 2, 1 / 8],
					]);
				} else if (algo === "sierra") {
					distribute(floatData, x, y, width, height, errR, errG, errB, [
						[1, 0, 2 / 4],
						[-1, 1, 1 / 4],
						[0, 1, 1 / 4],
					]);
				} else if (algo === "burkes") {
					distribute(floatData, x, y, width, height, errR, errG, errB, [
						[1, 0, 8 / 32],
						[2, 0, 4 / 32],
						[-2, 1, 2 / 32],
						[-1, 1, 4 / 32],
						[0, 1, 8 / 32],
						[1, 1, 4 / 32],
						[2, 1, 2 / 32],
					]);
				} else if (algo === "stucki") {
					distribute(floatData, x, y, width, height, errR, errG, errB, [
						[1, 0, 8 / 42],
						[2, 0, 4 / 42],
						[-2, 1, 2 / 42],
						[-1, 1, 4 / 42],
						[0, 1, 8 / 42],
						[1, 1, 4 / 42],
						[2, 1, 2 / 42],
						[-2, 2, 1 / 42],
						[-1, 2, 2 / 42],
						[0, 2, 4 / 42],
						[1, 2, 2 / 42],
						[2, 2, 1 / 42],
					]);
				} else if (algo === "jjn") {
					distribute(floatData, x, y, width, height, errR, errG, errB, [
						[1, 0, 7 / 48],
						[2, 0, 5 / 48],
						[-2, 1, 3 / 48],
						[-1, 1, 5 / 48],
						[0, 1, 7 / 48],
						[1, 1, 5 / 48],
						[2, 1, 3 / 48],
						[-2, 2, 1 / 48],
						[-1, 2, 3 / 48],
						[0, 2, 5 / 48],
						[1, 2, 3 / 48],
						[2, 2, 1 / 48],
					]);
				}
			}
		}
	}

	ctx.putImageData(imageData, 0, 0);
}

// --- Helpers ---
function findClosestColor(r, g, b, palette) {
	let minDist = Infinity;
	let closest = palette[0];
	for (let col of palette) {
		const d = (r - col[0]) ** 2 + (g - col[1]) ** 2 + (b - col[2]) ** 2;
		if (d < minDist) {
			minDist = d;
			closest = col;
		}
	}
	return closest;
}

function distribute(floatData, x, y, width, height, er, eg, eb, kernel) {
	for (let k of kernel) {
		const nx = x + k[0];
		const ny = y + k[1];
		if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
			const ni = (ny * width + nx) * 4;
			const factor = k[2];
			floatData[ni] += er * factor;
			floatData[ni + 1] += eg * factor;
			floatData[ni + 2] += eb * factor;
		}
	}
}

function downloadOutput() {
	if (!STATE.img) return;

	const format = ui.format.value;
	const link = document.createElement("a");

	// Handle custom GIF generation
	if (format === "image/gif") {
		if (typeof omggif === "undefined") {
			alert("GIF export requires omggif library to load. Please check internet connection.");
			return;
		}

		const width = ui.canvas.width;
		const height = ui.canvas.height;
		const ctx = ui.canvas.getContext("2d");
		const imgData = ctx.getImageData(0, 0, width, height).data;

		const palette = [];
		const paletteMap = new Map();
		const indices = new Uint8Array(width * height);

		// Build palette array and mapping dynamically
		for (let i = 0, p = 0; i < imgData.length; i += 4, p++) {
			const r = imgData[i];
			const g = imgData[i + 1];
			const b = imgData[i + 2];
			const hexColor = (r << 16) | (g << 8) | b;

			let idx = paletteMap.get(hexColor);
			if (idx === undefined) {
				if (palette.length < 256) {
					idx = palette.length;
					palette.push(hexColor);
					paletteMap.set(hexColor, idx);
				} else {
					idx = 0; // Fallback if image has >256 colors
				}
			}
			indices[p] = idx;
		}

		// Pad palette length to powers of 2 for strict GIF compliance
		let palSize = 2;
		while (palSize < palette.length) palSize *= 2;
		while (palette.length < palSize) palette.push(0);

		// Buffer needs extra room for headers
		const buffer = new Uint8Array(width * height + 1024 + palette.length * 3);
		const gif = new omggif.GifWriter(buffer, width, height, { palette: palette });
		gif.addFrame(0, 0, width, height, indices);

		const blob = new Blob([buffer.slice(0, gif.end())], { type: "image/gif" });
		link.href = URL.createObjectURL(blob);
		link.download = "dithered.gif";
	} else {
		// Native format support (PNG, WEBP, JPEG)
		link.href = ui.canvas.toDataURL(format, 1.0);
		const ext = format.split("/")[1];
		link.download = `dithered.${ext}`;
	}

	link.click();
}
