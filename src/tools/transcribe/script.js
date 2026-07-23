import { $ } from "/assets/helpers.js";

const dom = {
	apiKey: $("apiKey"),
	audioFile: $("audioFile"),
	transcription: $("transcription"),
};

async function transcribe() {
	dom.transcription.innerHTML = "⏳ Transcribing...";

	if (!dom.apiKey.value || !dom.audioFile.files.length) {
		alert("Please provide both API key and MP3 file.");
		return;
	}

	const formData = new FormData();
	formData.append("file", dom.audioFile.files[0]);
	formData.append("model", "whisper-1");
	formData.append("response_format", "text");

	try {
		const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${dom.apiKey.value}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`Error: ${response.status} - ${errText}`);
		}

		dom.transcription.textContent = await response.text();
	} catch (error) {
		dom.transcription.innerHTML = `<span class="error">❌ ${error.message}</span>`;
	}
}

window.transcribe = transcribe;
