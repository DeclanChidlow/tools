import { $, show, hide, escapeHtml } from "/assets/helpers.js";

const dom = {
	instanceUrl: $("instance-url"),
	email: $("email"),
	password: $("password"),
	fetchForm: $("fetch-token-form"),
	mfaContainer: $("mfa-container"),
	mfaForm: $("mfa-form"),
	mfaTicket: $("mfa-ticket"),
	mfaCode: $("mfa-code"),
	mfaLabel: $("mfa-label"),
	fetchOutput: $("fetch-output"),
	profileContainer: $("profile-container"),
};

function getApiUrl(endpoint) {
	const base = dom.instanceUrl.value.replace(/\/+$/, "");
	return `${base}/${endpoint.replace(/^\/+/, "")}`;
}

function displayResult(elementId, text, type) {
	const el = $(elementId);
	el.innerHTML = text;
	el.className = `output ${type}`;
	show(el);
}

async function handleApiResponse(response) {
	const contentType = response.headers.get("content-type");
	if (contentType && contentType.includes("application/json")) {
		return await response.json();
	}
	const text = await response.text();
	throw new Error(`Server error (${response.status}): ${text.substring(0, 120)}`);
}

function handleAuthSuccess(data) {
	const token = data.token || data.session?.token;
	if (!token) {
		displayResult("fetch-output", `Logged in, but token metadata object missing:\n${JSON.stringify(data)}`, "error");
		return;
	}

	displayResult("fetch-output", `SUCCESS! Session Token Generated:\n\n<code>${escapeHtml(token)}</code>`, "success");
	fetchUserProfile(token);
}

async function fetchUserProfile(token) {
	try {
		const response = await fetch(getApiUrl("users/@me"), {
			method: "GET",
			headers: {
				"X-Session-Token": token,
				"Accept": "application/json",
			},
		});

		if (!response.ok) {
			const errData = await handleApiResponse(response);
			console.error("Failed to grab self profile meta:", errData);
			return;
		}

		renderProfileCard(await response.json());
	} catch (err) {
		console.error("Network failure executing self profile lookup pipeline metrics:", err);
	}
}

function renderProfileCard(user) {
	const presence = user.status?.presence ?? "Invisible";
	const statusText = user.status?.text ?? "";

	dom.profileContainer.innerHTML = `
<pre>
${escapeHtml(user.username)}#${escapeHtml(String(user.discriminator || "Unknown"))}
User ID: ${escapeHtml(user._id)}
Status: ${escapeHtml(presence)}
${statusText ? `Status Text: ${escapeHtml(statusText)}` : ""}
</pre>
	`;
}

dom.fetchForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const outputId = "fetch-output";

	hide(dom.mfaContainer);
	dom.profileContainer.innerHTML = "";
	displayResult(outputId, "Authenticating...", "success");

	try {
		const response = await fetch(getApiUrl("auth/session/login"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: dom.email.value, password: dom.password.value }),
		});

		const data = await handleApiResponse(response);

		if (response.ok) {
			if (data.result === "MFA") {
				displayResult(outputId, `2FA Required.\nAllowed methods: ${data.allowed_methods.join(", ")}`, "mfa-prompt");

				dom.mfaTicket.value = data.ticket;
				dom.mfaLabel.textContent = `Enter code (${data.allowed_methods.join("/")}):`;
				show(dom.mfaContainer);
				dom.mfaCode.value = "";
				dom.mfaCode.focus();
			} else {
				handleAuthSuccess(data);
			}
		} else {
			displayResult(outputId, `Error [${response.status}]: ${data.error || JSON.stringify(data)}`, "error");
		}
	} catch (err) {
		displayResult(outputId, `Authentication Error: ${err.message}`, "error");
	}
});

dom.mfaForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const outputId = "fetch-output";

	displayResult(outputId, "Verifying 2FA code...", "success");

	try {
		const response = await fetch(getApiUrl("auth/session/login"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				mfa_ticket: dom.mfaTicket.value,
				mfa_response: { totp_code: dom.mfaCode.value.trim() },
			}),
		});

		const data = await handleApiResponse(response);

		if (response.ok) {
			hide(dom.mfaContainer);
			handleAuthSuccess(data);
		} else {
			displayResult(outputId, `2FA Error [${response.status}]: ${data.error || JSON.stringify(data)}`, "error");
		}
	} catch (err) {
		displayResult(outputId, `Error during 2FA: ${err.message}`, "error");
	}
});
