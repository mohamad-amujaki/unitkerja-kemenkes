export function bindFilterEvents({
	el,
	defaultMapNote,
	applyStatePatch,
	applySearch,
	syncSearchInputs,
	refreshAll,
	refreshTableOnly,
}) {
	// Event dropdown provinsi: reset filter wilayah peta lalu render ulang.
	el.provinceFilter.addEventListener("change", (event) => {
		applyStatePatch(
			{ province: event.target.value, mapRegion: "all" },
			{ resetPage: true },
		);
		refreshAll();
	});

	// Event dropdown eselon: update state lalu render ulang.
	el.eselonFilter.addEventListener("change", (event) => {
		applyStatePatch({ eselon: event.target.value }, { resetPage: true });
		refreshAll();
	});

	// Kedua input search mengarah ke fungsi yang sama agar perilakunya konsisten.
	el.searchFilter.addEventListener("input", (event) => {
		applySearch(event.target.value);
	});

	el.tableSearch.addEventListener("input", (event) => {
		applySearch(event.target.value);
	});

	// Tombol reset search hanya membersihkan keyword pencarian.
	el.clearTableSearch.addEventListener("click", () => {
		applyStatePatch({ search: "" }, { resetPage: true });
		syncSearchInputs("");
		refreshAll();
	});

	// Saat jumlah baris per halaman berubah, cukup render ulang tabel/paginasi.
	el.pageSize.addEventListener("change", (event) => {
		applyStatePatch(
			{ pageSize: Number(event.target.value) },
			{ resetPage: true },
		);
		refreshTableOnly();
	});

	// Reset mengembalikan semua filter ke nilai default awal.
	el.resetFilter.addEventListener("click", () => {
		applyStatePatch(
			{
				province: "all",
				eselon: "all",
				search: "",
				mapRegion: "all",
			},
			{ resetPage: true },
		);
		el.provinceFilter.value = "all";
		el.eselonFilter.value = "all";
		syncSearchInputs("");
		el.mapNote.textContent = defaultMapNote;
		refreshAll();
	});
}

export function bindExportEvents({ el, exportFiltered, closeExportMenu }) {
	// Ekspor CSV dan Excel memakai data hasil filter aktif.
	el.exportCsv.addEventListener("click", async () => {
		await exportFiltered("csv");
		closeExportMenu();
	});

	el.exportXlsx.addEventListener("click", async () => {
		await exportFiltered("xlsx");
		closeExportMenu();
	});

	// Tutup menu ekspor saat klik di luar area menu.
	document.addEventListener("click", (event) => {
		if (el.exportMenu && !el.exportMenu.contains(event.target)) {
			closeExportMenu();
		}
	});

	// Tombol Escape juga menutup menu ekspor untuk aksesibilitas.
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") closeExportMenu();
	});
}

export function bindStickyToolbar({ el }) {
	if (!el.stickyTrigger || !el.filterToolbar) return;

	// IntersectionObserver mendeteksi kapan toolbar harus berubah
	// dari posisi normal ke sticky (dan sebaliknya).
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				el.filterToolbar.style.position = "static";
				el.filterToolbar.classList.remove(
					"shadow-[0_14px_30px_-22px_rgba(17,35,26,0.85)]",
				);
			} else {
				el.filterToolbar.style.position = "";
				el.filterToolbar.classList.add(
					"shadow-[0_14px_30px_-22px_rgba(17,35,26,0.85)]",
				);
			}
		},
		{ rootMargin: "-64px 0px 0px 0px", threshold: 0 },
	);

	observer.observe(el.stickyTrigger);
}
