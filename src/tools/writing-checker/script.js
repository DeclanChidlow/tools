import { WorkerLinter, binaryInlined, Dialect } from "https://unpkg.com/harper.js@0.65.0/dist/harper.js";

const dialectSelect = document.getElementById("dialect");
const inputField = document.getElementById("inputfield");
const errorList = document.getElementById("errorlist");

const dialectMap = {
	american: Dialect.American,
	australian: Dialect.Australian,
	british: Dialect.British,
	canadian: Dialect.Canadian,
};

let linter = new WorkerLinter({
	binary: binaryInlined,
	dialect: dialectMap[dialectSelect.value],
});

async function onInput(e) {
	const lints = await linter.lint(e.target.value);
	const fragment = document.createDocumentFragment();

	for (const lint of lints) {
		const item = document.createElement("li");
		item.textContent = lint.message();
		fragment.appendChild(item);
	}

	errorList.replaceChildren(fragment);
}

dialectSelect.addEventListener("change", async (e) => {
	linter = new WorkerLinter({
		binary: binaryInlined,
		dialect: dialectMap[e.target.value],
	});

	if (inputField.value) {
		await onInput({ target: inputField });
	}
});

inputField.addEventListener("input", onInput);

onInput({ target: inputField });
