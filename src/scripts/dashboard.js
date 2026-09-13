import { gsap } from "gsap";
import {
	bindExportEvents,
	bindFilterEvents,
	bindStickyToolbar,
} from "./dashboard-events.js";
import { toExportRows } from "./dashboard-export.js";
import { filterUnits, getFilterOptions } from "./dashboard-filters.js";
import { resolveMapSelection } from "./dashboard-map-selection.js";
import { renderActiveFilters, renderStats } from "./dashboard-presenters.js";
import { createMapView } from "./map-view.js";
import { createTableView } from "./table-view.js";

const formatter = new Intl.NumberFormat("id-ID");
const defaultMapNote =
	"Catatan: beberapa provinsi hasil pemekaran Papua masih berbagi geometri peta pada dataset boundary saat ini.";

const mapProvinceAliases = {
	"DI Yogyakarta": "Yogyakarta",
	"DKI Jakarta": "Jakarta Raya",
	"Kepulauan Bangka Belitung": "Bangka-Belitung",
	"Nusa Tenggara Barat": "Nusa Tenggara Barat",
	"Papua Barat": "Irian Jaya Barat",
	"Papua Barat Daya": "Irian Jaya Barat",
	"Papua Selatan": "Papua",
	"Papua Tengah": "Papua",
	"Papua Pegunungan": "Papua",
};

// Fungsi debounce dipakai agar proses filter tidak dipanggil terus-menerus
// setiap user mengetik satu karakter. Ini membantu performa UI tetap ringan.
function debounce(callback, delay) {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => callback(...args), delay);
	};
}

function resolveMapRegion(provinceName) {
	return mapProvinceAliases[provinceName] ?? provinceName;
}

// Membuat link WhatsApp dengan template pesan agar user mudah melaporkan koreksi data.
function createWaLink(item) {
	const message = [
		"Halo, saya ingin mengoreksi data Unit Kerja Kemenkes berikut:",
		"",
		`Nama unit: ${item.name}`,
		`Provinsi: ${item.provinceName}`,
		"Field yang perlu dikoreksi: ",
		"Informasi yang benar: ",
		"Sumber pendukung: ",
	].join("\n");
	return `https://wa.me/6281315866766?text=${encodeURIComponent(message)}`;
}

export function initDashboard({ units, metadata }) {
	if (!Array.isArray(units) || units.length === 0) return;

	const shouldReduceMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	// Kumpulkan semua elemen DOM di satu objek supaya mudah dipakai ulang
	// dan tidak perlu memanggil getElementById berulang kali.
	const el = {
		provinceFilter: document.getElementById("province-filter"),
		eselonFilter: document.getElementById("eselon-filter"),
		searchFilter: document.getElementById("search-filter"),
		tableSearch: document.getElementById("table-search"),
		clearTableSearch: document.getElementById("clear-table-search"),
		pageSize: document.getElementById("page-size"),
		exportCsv: document.getElementById("export-csv"),
		exportXlsx: document.getElementById("export-xlsx"),
		resetFilter: document.getElementById("reset-filter"),
		mapResultCount: document.getElementById("map-result-count"),
		activeFilters: document.getElementById("active-filters"),
		resultCount: document.getElementById("result-count"),
		tableBody: document.getElementById("units-table-body"),
		paginationSummary: document.getElementById("pagination-summary"),
		paginationControls: document.getElementById("pagination-controls"),
		verificationSummary: document.getElementById("verification-summary"),
		mapNote: document.getElementById("map-note"),
		statUnit: document.getElementById("stat-total-unit"),
		statProvinsi: document.getElementById("stat-total-provinsi"),
		statEselon: document.getElementById("stat-total-eselon"),
		statAlamat: document.getElementById("stat-total-alamat"),
		legendList: document.getElementById("legend-list"),
		exportMenu: document.getElementById("export-menu"),
		filterToolbar: document.getElementById("filter-toolbar"),
		stickyTrigger: document.getElementById("toolbar-sticky-trigger"),
	};

	const state = {
		// allUnits: data mentah asli
		// filteredUnits: hasil data setelah filter/search diterapkan
		allUnits: units,
		filteredUnits: units,
		province: "all",
		eselon: "all",
		search: "",
		mapRegion: "all",
		page: 1,
		pageSize: 20,
	};

	let hasRenderedOnce = false;

	// Modul XLSX diload saat dibutuhkan saja (lazy load), jadi beban awal halaman lebih kecil.
	let xlsxModulePromise = null;
	async function getXlsx() {
		if (!xlsxModulePromise) xlsxModulePromise = import("xlsx");
		return xlsxModulePromise;
	}

	function setFilterOptions() {
		// Isi dropdown filter dari data unik yang tersedia di dataset.
		const { provinces, eselons } = getFilterOptions(state.allUnits);

		el.provinceFilter.innerHTML = `<option value="all">Semua Provinsi</option>${provinces
			.map((name) => `<option value="${name}">${name}</option>`)
			.join("")}`;
		el.eselonFilter.innerHTML = `<option value="all">Semua Eselon I</option>${eselons
			.map((name) => `<option value="${name}">${name}</option>`)
			.join("")}`;
	}

	function buildActiveFilterSummary() {
		// Ringkasan ini dipakai untuk metadata di file export,
		// supaya penerima file tahu filter apa yang aktif saat data diunduh.
		const labels = [];
		if (state.province !== "all") labels.push(`Provinsi: ${state.province}`);
		if (state.eselon !== "all") labels.push(`Eselon I: ${state.eselon}`);
		if (state.mapRegion !== "all")
			labels.push(`Wilayah peta: ${state.mapRegion}`);
		if (state.search) labels.push(`Cari: "${state.search}"`);
		return labels.join(" | ");
	}

	function syncUrlQuery() {
		// Simpan state filter ke query URL agar link bisa dibagikan
		// dan saat refresh state tetap sama.
		const params = new URLSearchParams();
		if (state.province !== "all") params.set("provinsi", state.province);
		if (state.eselon !== "all") params.set("eselon", state.eselon);
		if (state.search) params.set("q", state.search);
		if (state.mapRegion !== "all") params.set("map", state.mapRegion);
		if (state.pageSize !== 20) params.set("size", String(state.pageSize));
		if (state.page > 1) params.set("page", String(state.page));

		const query = params.toString();
		const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
		window.history.replaceState(null, "", nextUrl);
	}

	function hydrateStateFromUrl() {
		// Ambil state awal dari query URL.
		// Jika nilainya tidak valid, fallback ke default agar aplikasi tetap aman.
		const params = new URLSearchParams(window.location.search);
		const provinceParam = params.get("provinsi");
		const eselonParam = params.get("eselon");
		const searchParam = params.get("q");
		const mapParam = params.get("map");
		const sizeParam = Number(params.get("size"));
		const pageParam = Number(params.get("page"));

		const { provinces, eselons } = getFilterOptions(state.allUnits);

		state.province =
			provinceParam && provinces.includes(provinceParam)
				? provinceParam
				: "all";
		state.eselon =
			eselonParam && eselons.includes(eselonParam) ? eselonParam : "all";
		state.search = searchParam ? searchParam.trim() : "";
		state.mapRegion = mapParam ? mapParam.trim() : "all";
		state.pageSize = [10, 20, 50].includes(sizeParam) ? sizeParam : 20;
		state.page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

		el.provinceFilter.value = state.province;
		el.eselonFilter.value = state.eselon;
		el.pageSize.value = String(state.pageSize);
		syncSearchInputs(state.search);
	}

	function showInitialLoadingState() {
		// Tampilkan skeleton sementara data map/tabel belum selesai render pertama.
		const mapEl = document.getElementById("map");
		mapEl?.classList.add("map-skeleton");
		el.tableBody.innerHTML = Array.from({ length: 5 })
			.map(
				() =>
					'<tr class="border-t border-(--line)"><td colspan="5" class="px-3 py-3"><div class="skeleton-line"></div></td></tr>',
			)
			.join("");
	}

	function hideInitialLoadingState() {
		// Skeleton disembunyikan setelah render pertama selesai.
		const mapEl = document.getElementById("map");
		mapEl?.classList.remove("map-skeleton");
	}

	function applyFilters() {
		// Pusat logika penyaringan data berdasarkan state filter saat ini.
		state.filteredUnits = filterUnits({
			units: state.allUnits,
			province: state.province,
			eselon: state.eselon,
			mapRegion: state.mapRegion,
			search: state.search,
			resolveMapRegion,
		});
	}

	function syncSearchInputs(value) {
		// Input pencarian di toolbar dan tabel harus selalu sinkron nilainya.
		el.searchFilter.value = value;
		el.tableSearch.value = value;
	}

	const tableView = createTableView({
		el,
		state,
		formatter,
		shouldReduceMotion,
		createWaLink,
		// Saat user pindah halaman tabel, query URL ikut diperbarui.
		onPageChange: () => syncUrlQuery(),
	});

	const mapView = createMapView({
		mapElementId: "map",
		legendEl: el.legendList,
		formatter,
		resolveMapRegion,
		getFilteredUnits: () => state.filteredUnits,
		onRegionClick: (regionName) => {
			const selection = resolveMapSelection({
				allUnits: state.allUnits,
				resolveMapRegion,
				regionName,
			});

			applyStatePatch(selection.statePatch, { resetPage: true });
			if (selection.provinceFilterValue) {
				el.provinceFilter.value = selection.provinceFilterValue;
			}
			el.mapNote.textContent = selection.mapNote;
			refreshAll();
		},
	});

	async function exportFiltered(format) {
		// Data export mengikuti data yang sedang terlihat (filteredUnits).
		// Baris metadata juga ditambahkan agar file lepas konteks tetap bisa dipahami.
		const XLSX = await getXlsx();
		const rows = toExportRows({
			units: state.filteredUnits,
			metadata,
			activeFilterSummary: buildActiveFilterSummary(),
		});

		const sheet = XLSX.utils.json_to_sheet(rows);
		const now = new Date().toISOString().slice(0, 10);

		if (format === "csv") {
			const csv = XLSX.utils.sheet_to_csv(sheet);
			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `unit-kerja-kemenkes-${now}-filtered.csv`;
			anchor.click();
			URL.revokeObjectURL(url);
			return;
		}

		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, sheet, "Unit Kerja");
		XLSX.writeFile(workbook, `unit-kerja-kemenkes-${now}-filtered.xlsx`);
	}

	function closeExportMenu() {
		if (el.exportMenu?.open) el.exportMenu.open = false;
	}

	function refreshTableOnly() {
		// Dipakai saat hanya tampilan tabel yang berubah (mis. page size),
		// tanpa perlu render ulang map untuk efisiensi.
		tableView.clampCurrentPage();
		tableView.renderTable();
		tableView.renderPagination();
		syncUrlQuery();
	}

	function applyStatePatch(patch, { resetPage = false } = {}) {
		// Helper update state agar pola perubahan state konsisten di semua event.
		Object.assign(state, patch);
		if (resetPage) state.page = 1;
	}

	function applySearch(value) {
		// Pencarian memakai debounce supaya render tidak terlalu sering saat mengetik cepat.
		applyStatePatch({ search: value.trim() }, { resetPage: true });
		syncSearchInputs(state.search);
		debouncedRefreshAll();
	}

	async function refreshAll() {
		// Alur render utama: filter data -> render statistik/filter label -> render tabel -> render peta.
		try {
			applyFilters();
			tableView.clampCurrentPage();
			renderStats({ el, formatter, filteredUnits: state.filteredUnits });
			renderActiveFilters({ el, state });
			tableView.renderTable();
			tableView.renderPagination();
			await mapView.render();
			syncUrlQuery();
		} finally {
			if (!hasRenderedOnce) {
				hideInitialLoadingState();
				hasRenderedOnce = true;
			}
		}
	}

	const debouncedRefreshAll = debounce(() => {
		refreshAll();
	}, 180);

	bindFilterEvents({
		el,
		defaultMapNote,
		applyStatePatch,
		applySearch,
		syncSearchInputs,
		refreshAll,
		refreshTableOnly,
	});

	bindExportEvents({
		el,
		exportFiltered,
		closeExportMenu,
	});

	bindStickyToolbar({ el });

	setFilterOptions();
	hydrateStateFromUrl();
	showInitialLoadingState();
	refreshAll();

	if (!shouldReduceMotion) {
		gsap.fromTo(
			"[data-animate]",
			{ opacity: 0, y: 12 },
			{ opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.07 },
		);
	}
}
