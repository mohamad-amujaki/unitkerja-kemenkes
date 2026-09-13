export function resolveMapSelection({
	allUnits,
	resolveMapRegion,
	regionName,
}) {
	// Cari semua provinsi data yang termasuk ke wilayah peta yang diklik user.
	const matchProvinces = [
		...new Set(
			allUnits
				.filter((item) => resolveMapRegion(item.provinceName) === regionName)
				.map((item) => item.provinceName),
		),
	];

	if (matchProvinces.length === 1) {
		// Jika hanya satu provinsi, kita langsung set filter provinsi.
		return {
			statePatch: { province: matchProvinces[0], mapRegion: "all" },
			provinceFilterValue: matchProvinces[0],
			mapNote: `Filter diterapkan dari peta: ${matchProvinces[0]}.`,
		};
	}

	if (matchProvinces.length > 1) {
		// Jika satu region mewakili beberapa provinsi (alias peta),
		// gunakan filter mapRegion agar hasil tetap akurat.
		return {
			statePatch: { mapRegion: regionName, province: "all" },
			provinceFilterValue: "all",
			mapNote: `Wilayah peta ${regionName} mencakup ${matchProvinces.join(", ")}. Filter wilayah peta diterapkan.`,
		};
	}

	// Jika tidak ada data yang cocok untuk region ini, tampilkan catatan informatif.
	return {
		statePatch: { mapRegion: regionName },
		mapNote: `Wilayah peta ${regionName} tidak memiliki data unit kerja pada filter saat ini.`,
	};
}
