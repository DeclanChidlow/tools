import { $, show, hide } from "/assets/helpers.js";

const state = {
	colors: ["#ff0000", "#0000ff"],
	stops: [0, 100],
	useStops: false,
	angle: 90,
	mode: "auto",
	gradientType: "linear",
};

const dom = {
	apiUrl: $("api-url"),
	token: $("session-token"),
	serverId: $("server-id"),
	roleId: $("role-id"),
	modeRadios: document.getElementsByName("mode"),
	autoBuilder: $("auto-builder"),
	gradientType: $("gradient-type"),
	angleLabel: $("angle-label"),
	colourList: $("colour-list"),
	cssOutput: $("css-output"),
	previewText: $("preview-text"),
	submitBtn: $("submit-btn"),
	addColourStopBtn: $("add-colour-btn"),
	useStopsCb: $("use-stops"),
	angleInput: $("gradient-angle"),
};

function renderColorList() {
	dom.colourList.innerHTML = "";

	state.colors.forEach((color, index) => {
		const row = document.createElement("div");
		row.className = "colour-row";

		const colorInput = document.createElement("input");
		colorInput.type = "color";
		colorInput.value = color;
		colorInput.addEventListener("input", (e) => {
			state.colors[index] = e.target.value;
			generateCSS();
		});

		row.appendChild(colorInput);

		if (state.useStops) {
			const stopInput = document.createElement("input");
			stopInput.type = "number";
			stopInput.min = "0";
			stopInput.max = "100";
			stopInput.value = state.stops[index] || 0;
			stopInput.addEventListener("input", (e) => {
				state.stops[index] = e.target.value;
				generateCSS();
			});

			const percentageLabel = document.createElement("span");
			percentageLabel.textContent = "%";

			row.appendChild(stopInput);
			row.appendChild(percentageLabel);
		}

		if (state.colors.length > 1) {
			const removeBtn = document.createElement("button");
			removeBtn.textContent = "X";
			removeBtn.setAttribute("aria-label", "Remove colour");
			removeBtn.addEventListener("click", () => {
				state.colors.splice(index, 1);
				state.stops.splice(index, 1);
				renderColorList();
				generateCSS();
			});
			row.appendChild(removeBtn);
		}

		dom.colourList.appendChild(row);
	});
}

function generateCSS() {
	let css = "";

	if (state.mode === "auto") {
		if (state.colors.length > 1) {
			const parts = state.colors.map((color, i) => {
				return state.useStops ? `${color} ${state.stops[i]}%` : color;
			});
			const colorString = parts.join(", ");

			if (state.gradientType === "linear") {
				css = `linear-gradient(${state.angle}deg, ${colorString})`;
			} else if (state.gradientType === "radial") {
				css = `radial-gradient(circle, ${colorString})`;
			} else if (state.gradientType === "conic") {
				css = `conic-gradient(from ${state.angle}deg, ${colorString})`;
			}
		} else {
			css = state.colors[0] || "";
		}
		dom.cssOutput.value = css;
	} else {
		css = dom.cssOutput.value;
	}

	applyPreview(css);
}

function applyPreview(cssString) {
	dom.previewText.style.background = cssString;
}

async function submitRoleUpdate() {
	const baseUrl = dom.apiUrl.value.replace(/\/+$/, "");
	const token = dom.token.value.trim();
	const server = dom.serverId.value.trim();
	const role = dom.roleId.value.trim();
	const color = dom.cssOutput.value.trim();

	if (!baseUrl || !token || !server || !role || !color) {
		alert("Please fill in all target configuration fields and generate a valid colour.");
		return;
	}

	dom.submitBtn.textContent = "Updating...";
	dom.submitBtn.disabled = true;

	try {
		const response = await fetch(`${baseUrl}/servers/${server}/roles/${role}`, {
			method: "PATCH",
			headers: {
				"X-Session-Token": token,
				"Accept": "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ colour: color }),
		});

		if (response.ok) {
			alert("Role colour successfully updated!");
		} else {
			const errorData = await response.text();
			alert(`Error [${response.status}]: ${errorData.substring(0, 150)}`);
		}
	} catch (err) {
		alert(`Network Error: ${err.message}`);
	} finally {
		dom.submitBtn.textContent = "Update Role Colour";
		dom.submitBtn.disabled = false;
	}
}

dom.addColourStopBtn.addEventListener("click", () => {
	state.colors.push("#ffffff");
	state.stops.push(100);
	renderColorList();
	generateCSS();
});

dom.useStopsCb.addEventListener("change", (e) => {
	state.useStops = e.target.checked;
	renderColorList();
	generateCSS();
});

dom.angleInput.addEventListener("input", (e) => {
	state.angle = e.target.value;
	generateCSS();
});

dom.gradientType.addEventListener("change", (e) => {
	state.gradientType = e.target.value;

	if (state.gradientType === "radial") {
		hide(dom.angleLabel);
	} else {
		show(dom.angleLabel);
	}
	generateCSS();
});

dom.modeRadios.forEach((radio) => {
	radio.addEventListener("change", (e) => {
		state.mode = e.target.value;
		if (state.mode === "auto") {
			show(dom.autoBuilder);
			dom.cssOutput.disabled = true;
			generateCSS();
		} else {
			hide(dom.autoBuilder);
			dom.cssOutput.disabled = false;
		}
	});
});

dom.cssOutput.addEventListener("input", (e) => {
	if (state.mode === "manual") {
		applyPreview(e.target.value);
	}
});

dom.submitBtn.addEventListener("click", submitRoleUpdate);

renderColorList();
generateCSS();
