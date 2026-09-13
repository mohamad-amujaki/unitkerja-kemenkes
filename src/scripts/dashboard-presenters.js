export function renderStats({ el, formatter, filteredUnits }) {
	const total = filteredUnits.length;
	const provinces = new Set(filteredUnits.map((item) => item.provinceName))
		.size;
	const eselons = new Set(filteredUnits.map((item) => item.parentEselonI)).size;
	const addresses = new Set(filteredUnits.map((item) => item.address)).size;

	el.statUnit.textContent = formatter.format(total);
	el.statProvinsi.textContent = formatter.format(provinces);
	el.statEselon.textContent = formatter.format(eselons);
	el.statAlamat.textContent = formatter.format(addresses);
	el.resultCount.textContent = `${formatter.format(total)} hasil`;
	el.mapResultCount.textContent = `${formatter.format(total)} hasil`;

	const reviewCount = filteredUnits.filter(
		(item) => item.verificationStatus !== "verified",
	).length;
	el.verificationSummary.textContent =
		reviewCount > 0
			? `${formatter.format(reviewCount)} data butuh verifikasi tambahan`
			: "Semua data terlabel terverifikasi";
}

export function renderActiveFilters({ el, state }) {
	const labels = [
		`Provinsi: ${state.province === "all" ? "Semua" : state.province}`,
		`Eselon I: ${state.eselon === "all" ? "Semua" : state.eselon}`,
	];
	if (state.search) labels.push(`Cari: "${state.search}"`);
	if (state.mapRegion !== "all")
		labels.push(`Wilayah peta: ${state.mapRegion}`);
	el.activeFilters.textContent = labels.join("  ·  ");
}
