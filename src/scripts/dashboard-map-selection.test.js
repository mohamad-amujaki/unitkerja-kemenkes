import assert from "node:assert/strict";
import test from "node:test";

import { resolveMapSelection } from "./dashboard-map-selection.js";

const allUnits = [
	{ provinceName: "DKI Jakarta" },
	{ provinceName: "Papua Selatan" },
	{ provinceName: "Papua Tengah" },
];

const resolveMapRegion = (provinceName) => {
	if (provinceName === "DKI Jakarta") return "Jakarta Raya";
	if (provinceName === "Papua Selatan" || provinceName === "Papua Tengah")
		return "Papua";
	return provinceName;
};

test("returns direct province filter for single province match", () => {
	const result = resolveMapSelection({
		allUnits,
		resolveMapRegion,
		regionName: "Jakarta Raya",
	});

	assert.deepEqual(result.statePatch, {
		province: "DKI Jakarta",
		mapRegion: "all",
	});
	assert.equal(result.provinceFilterValue, "DKI Jakarta");
	assert.equal(result.mapNote, "Filter diterapkan dari peta: DKI Jakarta.");
});

test("returns mapRegion filter when one region maps to multiple provinces", () => {
	const result = resolveMapSelection({
		allUnits,
		resolveMapRegion,
		regionName: "Papua",
	});

	assert.deepEqual(result.statePatch, { mapRegion: "Papua", province: "all" });
	assert.equal(result.provinceFilterValue, "all");
	assert.equal(
		result.mapNote,
		"Wilayah peta Papua mencakup Papua Selatan, Papua Tengah. Filter wilayah peta diterapkan.",
	);
});

test("returns no-data note when region has no mapped units", () => {
	const result = resolveMapSelection({
		allUnits,
		resolveMapRegion,
		regionName: "Kalimantan Utara",
	});

	assert.deepEqual(result.statePatch, { mapRegion: "Kalimantan Utara" });
	assert.equal(result.provinceFilterValue, undefined);
	assert.equal(
		result.mapNote,
		"Wilayah peta Kalimantan Utara tidak memiliki data unit kerja pada filter saat ini.",
	);
});
