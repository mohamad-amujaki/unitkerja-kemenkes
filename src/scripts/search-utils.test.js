import assert from "node:assert/strict";
import test from "node:test";

import { matchesAllSearchTerms, normalizeSearchText } from "./search-utils.js";

test("normalizeSearchText lowercases and normalizes spaces", () => {
	assert.equal(normalizeSearchText("  BIRO   Hukum  "), "biro hukum");
});

test("matchesAllSearchTerms matches exact words", () => {
	const text = "Biro Hukum Kementerian Kesehatan";
	assert.equal(matchesAllSearchTerms(text, "biro"), true);
	assert.equal(matchesAllSearchTerms(text, "hukum"), true);
	assert.equal(matchesAllSearchTerms(text, "biro hukum"), true);
});

test("matchesAllSearchTerms ignores repeated spaces in query", () => {
	const text = "Direktorat Teknologi Informasi";
	assert.equal(matchesAllSearchTerms(text, "  teknologi    informasi "), true);
});

test("matchesAllSearchTerms does not match partial words", () => {
	const text = "Jl. Angkasa IV, Kel. Birobuli Utara";
	assert.equal(matchesAllSearchTerms(text, "biro"), false);
	assert.equal(matchesAllSearchTerms(text, "birobuli"), true);
});

test("matchesAllSearchTerms returns true for empty query", () => {
	assert.equal(matchesAllSearchTerms("Any Text", ""), true);
});
