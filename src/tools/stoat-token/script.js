function getApiUrl(endpoint) {
	const base = document.getElementById("instance-url").value.replace(/\/+$/, "");
	return `${base}/${endpoint.replace(/^\/+/, "")}`;
}

function displayResult(elementId, text, type) {
	const el = document.getElementById(elementId);
	el.innerHTML = text;
	el.className = `output ${type}`;
	el.style.display = "block";
}

async function handleApiResponse(response) {
	const contentType = response.headers.get("content-type");
	if (contentType && contentType.includes("application/json")) {
		return await response.json();
	} else {
		const text = await response.text();
		throw new Error(`Server error (${response.status}): ${text.substring(0, 120)}`);
	}
}

document.getElementById("fetch-token-form").addEventListener("submit", async (e) => {
	e.preventDefault();
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
	const outputId = "fetch-output";

	document.getElementById("mfa-container").classList.add("hidden");
	document.getElementById("profile-container").innerHTML = "";
	displayResult(outputId, "Authenticating...", "success");

	try {
		const response = await fetch(getApiUrl("auth/session/login"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await handleApiResponse(response);

		if (response.ok) {
			if (data.result === "MFA") {
				displayResult(outputId, `2FA Required.\nAllowed methods: ${data.allowed_methods.join(", ")}`, "mfa-prompt");

				document.getElementById("mfa-ticket").value = data.ticket;
				document.getElementById("mfa-label").innerText = `Enter code (${data.allowed_methods.join("/")}):`;
				document.getElementById("mfa-container").classList.remove("hidden");
				document.getElementById("mfa-code").value = "";
				document.getElementById("mfa-code").focus();
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

document.getElementById("mfa-form").addEventListener("submit", async (e) => {
	e.preventDefault();
	const ticket = document.getElementById("mfa-ticket").value;
	const code = document.getElementById("mfa-code").value.trim();
	const outputId = "fetch-output";

	displayResult(outputId, "Verifying 2FA code...", "success");

	try {
		const response = await fetch(getApiUrl("auth/session/login"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				mfa_ticket: ticket,
				mfa_response: { totp_code: code },
			}),
		});

		const data = await handleApiResponse(response);

		if (response.ok) {
			document.getElementById("mfa-container").classList.add("hidden");
			handleAuthSuccess(data);
		} else {
			displayResult(outputId, `2FA Error [${response.status}]: ${data.error || JSON.stringify(data)}`, "error");
		}
	} catch (err) {
		displayResult(outputId, `Error during 2FA: ${err.message}`, "error");
	}
});

function handleAuthSuccess(data) {
	const token = data.token || data.session?.token;
	if (!token) {
		displayResult("fetch-output", `Logged in, but token metadata object missing:\n${JSON.stringify(data)}`, "error");
		return;
	}

	displayResult("fetch-output", `SUCCESS! Session Token Generated:\n\n<code>${token}</code>`, "success");
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

		const profile = await response.json();
		renderProfileCard(profile);
	} catch (err) {
		console.error("Network failure executing self profile lookup pipeline metrics:", err);
	}
}

function renderProfileCard(user) {
	const container = document.getElementById("profile-container");

	const presence = user.status && user.status.presence ? user.status.presence : "Invisible";
	const statusText = user.status && user.status.text ? user.status.text : "";

	container.innerHTML = `
<pre>
${user.username}#${user.discriminator || "Unknown"}
User ID: ${user._id}
Status: ${presence}
${statusText ? `Status Text: ${statusText}` : ""}
</pre>
	`;
}
