export function normalizeSearchText(value) {
	// Menyamakan format teks agar proses pencarian konsisten:
	// - lowercase
	// - spasi ganda diringkas
	// - spasi depan/belakang dihapus
	return String(value || "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

function escapeRegExp(value) {
	// Escape karakter regex agar keyword user diperlakukan sebagai teks biasa,
	// bukan sebagai pola regex khusus.
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getSearchTerms(rawQuery) {
	// Pecah query menjadi daftar kata kunci.
	const query = normalizeSearchText(rawQuery);
	if (!query) return [];
	return query.split(" ").filter(Boolean);
}

export function getWholeWordRegex(term, flags = "u") {
	// Regex batas kata (word boundary) dipakai agar "biro"
	// tidak match ke kata "birobuli".
	return new RegExp(`\\b${escapeRegExp(term)}\\b`, flags);
}

export function matchesAllSearchTerms(rawText, rawQuery) {
	// Semua keyword wajib match (AND search), bukan salah satu saja.
	const text = normalizeSearchText(rawText);
	const terms = getSearchTerms(rawQuery);
	if (terms.length === 0) return true;

	return terms.every((term) => {
		const termRegex = getWholeWordRegex(term, "u");
		return termRegex.test(text);
	});
}
