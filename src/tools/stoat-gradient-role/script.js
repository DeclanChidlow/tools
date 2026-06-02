const state = {
	colors: ["#ff0000", "#0000ff"],
	stops: [0, 100],
	useStops: false,
	angle: 90,
	mode: "auto",
};

const DOM = {
	apiUrl: document.getElementById("api-url"),
	token: document.getElementById("session-token"),
	serverId: document.getElementById("server-id"),
	roleId: document.getElementById("role-id"),
	modeRadios: document.getElementsByName("mode"),
	autoBuilder: document.getElementById("auto-builder"),
	colorList: document.getElementById("color-list"),
	cssOutput: document.getElementById("css-output"),
	previewText: document.getElementById("preview-text"),
	submitBtn: document.getElementById("submit-btn"),
	addColorStopBtn: document.getElementById("add-color-btn"),
	useStopsCb: document.getElementById("use-stops"),
	angleInput: document.getElementById("gradient-angle"),
};

function renderColorList() {
	DOM.colorList.innerHTML = "";

	state.colors.forEach((color, index) => {
		const row = document.createElement("div");
		row.className = "color-row";

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
			percentageLabel.innerText = "%";

			row.appendChild(stopInput);
			row.appendChild(percentageLabel);
		}

		if (state.colors.length > 1) {
			const removeBtn = document.createElement("button");
			removeBtn.innerText = "X";
			removeBtn.addEventListener("click", () => {
				state.colors.splice(index, 1);
				state.stops.splice(index, 1);
				renderColorList();
				generateCSS();
			});
			row.appendChild(removeBtn);
		}

		DOM.colorList.appendChild(row);
	});
}

function generateCSS() {
	let css = "";

	if (state.mode === "auto") {
		if (state.colors.length > 1) {
			css = `linear-gradient(${state.angle}deg, `;
			const parts = state.colors.map((color, i) => {
				return state.useStops ? `${color} ${state.stops[i]}%` : color;
			});
			css += parts.join(", ") + ")";
		} else {
			css = state.colors[0] || "";
		}
		DOM.cssOutput.value = css;
	} else {
		css = DOM.cssOutput.value;
	}

	applyPreview(css);
}

function applyPreview(cssString) {
	DOM.previewText.style.background = cssString;
	DOM.previewText.style.backgroundClip = "text";
	DOM.previewText.style.color = "transparent";
}

async function submitRoleUpdate() {
	const baseUrl = DOM.apiUrl.value.replace(/\/+$/, "");
	const token = DOM.token.value.trim();
	const server = DOM.serverId.value.trim();
	const role = DOM.roleId.value.trim();
	const color = DOM.cssOutput.value.trim();

	if (!baseUrl || !token || !server || !role || !color) {
		alert("Please fill in all target configuration fields and generate a valid color.");
		return;
	}

	DOM.submitBtn.innerText = "Updating...";
	DOM.submitBtn.disabled = true;

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
			alert("Role color successfully updated!");
		} else {
			const errorData = await response.text();
			alert(`Error [${response.status}]: ${errorData.substring(0, 150)}`);
		}
	} catch (err) {
		alert(`Network Error: ${err.message}`);
	} finally {
		DOM.submitBtn.innerText = "Update Role Color";
		DOM.submitBtn.disabled = false;
	}
}

DOM.addColorStopBtn.addEventListener("click", () => {
	state.colors.push("#ffffff");
	state.stops.push(100);
	renderColorList();
	generateCSS();
});

DOM.useStopsCb.addEventListener("change", (e) => {
	state.useStops = e.target.checked;
	renderColorList();
	generateCSS();
});

DOM.angleInput.addEventListener("input", (e) => {
	state.angle = e.target.value;
	generateCSS();
});

DOM.modeRadios.forEach((radio) => {
	radio.addEventListener("change", (e) => {
		state.mode = e.target.value;
		if (state.mode === "auto") {
			DOM.autoBuilder.classList.remove("hidden");
			DOM.cssOutput.disabled = true;
			generateCSS();
		} else {
			DOM.autoBuilder.classList.add("hidden");
			DOM.cssOutput.disabled = false;
		}
	});
});

DOM.cssOutput.addEventListener("input", (e) => {
	if (state.mode === "manual") {
		applyPreview(e.target.value);
	}
});

DOM.submitBtn.addEventListener("click", submitRoleUpdate);

renderColorList();
generateCSS();
