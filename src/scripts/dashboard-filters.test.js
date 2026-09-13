import assert from "node:assert/strict";
import test from "node:test";

import { filterUnits, getFilterOptions } from "./dashboard-filters.js";

const units = [
	{
		name: "Biro Hukum",
		address: "Jakarta Pusat",
		parentEselonI: "Setjen",
		provinceName: "DKI Jakarta",
		unitType: "Kantor Pusat",
	},
	{
		name: "RSUP Sardjito",
		address: "Sleman",
		parentEselonI: "Ditjen Yankes",
		provinceName: "DI Yogyakarta",
		unitType: "Rumah Sakit",
	},
	{
		name: "Loka Labkes",
		address: "Kel. Birobuli Utara, Palu",
		parentEselonI: "BKPK",
		provinceName: "Sulawesi Tengah",
		unitType: "UPT",
	},
];

const resolveMapRegion = (provinceName) => {
	if (provinceName === "DI Yogyakarta") return "Yogyakarta";
	if (provinceName === "DKI Jakarta") return "Jakarta Raya";
	return provinceName;
};

test("getFilterOptions returns sorted unique provinces and eselons", () => {
	const options = getFilterOptions(units);
	assert.deepEqual(options.provinces, [
		"DI Yogyakarta",
		"DKI Jakarta",
		"Sulawesi Tengah",
	]);
	assert.deepEqual(options.eselons, ["BKPK", "Ditjen Yankes", "Setjen"]);
});

test("filterUnits applies province and eselon filters", () => {
	const filtered = filterUnits({
		units,
		province: "DKI Jakarta",
		eselon: "Setjen",
		mapRegion: "all",
		search: "",
		resolveMapRegion,
	});

	assert.equal(filtered.length, 1);
	assert.equal(filtered[0].name, "Biro Hukum");
});

test("filterUnits applies map region aliases", () => {
	const filtered = filterUnits({
		units,
		province: "all",
		eselon: "all",
		mapRegion: "Yogyakarta",
		search: "",
		resolveMapRegion,
	});

	assert.equal(filtered.length, 1);
	assert.equal(filtered[0].name, "RSUP Sardjito");
});

test("filterUnits applies exact-word search", () => {
	const biroResults = filterUnits({
		units,
		province: "all",
		eselon: "all",
		mapRegion: "all",
		search: "biro",
		resolveMapRegion,
	});

	assert.equal(biroResults.length, 1);
	assert.equal(biroResults[0].name, "Biro Hukum");
});
