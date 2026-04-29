async function transcribe() {
	const apiKey = document.getElementById("apiKey").value;
	const fileInput = document.getElementById("audioFile");
	const transcriptionDiv = document.getElementById("transcription");
	transcriptionDiv.innerHTML = "⏳ Transcribing...";

	if (!apiKey || !fileInput.files.length) {
		alert("Please provide both API key and MP3 file.");
		return;
	}

	const formData = new FormData();
	formData.append("file", fileInput.files[0]);
	formData.append("model", "whisper-1");
	formData.append("response_format", "text");

	try {
		const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`Error: ${response.status} - ${errText}`);
		}

		const transcriptText = await response.text();

		transcriptionDiv.innerHTML = transcriptText;
	} catch (error) {
		transcriptionDiv.innerHTML = `<span style="color: red;">❌ ${error.message}</span>`;
	}
}

window.transcribe = transcribe;
