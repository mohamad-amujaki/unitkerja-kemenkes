export function normalizeSearchText(value) {
	return String(value || "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchesAllSearchTerms(rawText, rawQuery) {
	const text = normalizeSearchText(rawText);
	const query = normalizeSearchText(rawQuery);
	if (!query) return true;

	const terms = query.split(" ").filter(Boolean);
	return terms.every((term) => {
		const termRegex = new RegExp(`\\b${escapeRegExp(term)}\\b`, "u");
		return termRegex.test(text);
	});
}
