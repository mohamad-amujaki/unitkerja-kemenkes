import { matchesAllSearchTerms } from "./search-utils.js";

export function getFilterOptions(units) {
	// Ambil nilai unik untuk dropdown, lalu urutkan agar tampil rapi.
	const provinces = [...new Set(units.map((item) => item.provinceName))].sort(
		(a, b) => a.localeCompare(b, "id"),
	);
	const eselons = [...new Set(units.map((item) => item.parentEselonI))].sort(
		(a, b) => a.localeCompare(b, "id"),
	);

	return { provinces, eselons };
}

export function filterUnits({
	units,
	province,
	eselon,
	mapRegion,
	search,
	resolveMapRegion,
}) {
	// Semua kondisi filter digabung di sini supaya alur penyaringan mudah diikuti.
	return units.filter((item) => {
		// Filter kategorikal (dropdown).
		if (province !== "all" && item.provinceName !== province) return false;
		if (eselon !== "all" && item.parentEselonI !== eselon) return false;
		if (
			mapRegion !== "all" &&
			resolveMapRegion(item.provinceName) !== mapRegion
		)
			return false;

		// Pencarian kata kunci (exact-word per term), misalnya "biro" tidak match "birobuli".
		const haystack = `${item.name} ${item.address} ${item.parentEselonI} ${item.provinceName} ${item.unitType}`;
		return matchesAllSearchTerms(haystack, search);
	});
}
