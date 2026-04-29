---
title: Transcribe
description: Transcribes audio via OpenAI's Whisper speech-to-text model.
---

<label>
    OpenAI API Key:
    <input type="password" id="apiKey" placeholder="sk-..." size="60" />
</label>

<label>
    Upload MP3 File:
    <input type="file" id="audioFile" accept=".mp3" />
</label>

<button onclick="transcribe()">Transcribe</button>

<hr>

<div id="output">
    <h2>Transcription</h2>
    <output id="transcription"></output>
</div>
