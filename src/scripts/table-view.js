import { gsap } from "gsap";

/**
 * Create all behaviors related to the table:
 * - pagination
 * - table rows rendering
 * - empty state
 */
export function createTableView({
	el,
	state,
	formatter,
	shouldReduceMotion,
	createWaLink,
}) {
	function renderUnitCell(item) {
		return `
      <td class="px-3 py-3">
        <p class="font-medium text-(--ink)">${item.parentEselonI}</p>
        <p class="mt-0.5 text-(--ink-muted)">${item.name}</p>
      </td>
    `;
	}

	function renderRow(item) {
		// Satu fungsi untuk merender satu baris tabel,
		// supaya struktur kolom mudah dirawat saat ada perubahan.
		return `
      <tr class="border-t border-(--line) align-top">
        <td class="px-3 py-3 text-(--ink-muted)">${item.no}</td>
        ${renderUnitCell(item)}
        <td class="px-3 py-3 text-(--ink-muted)">${item.provinceName}</td>
        <td class="px-3 py-3 text-(--ink-muted)">${item.address}</td>
        <td class="px-3 py-3">
          <a class="inline-flex rounded-lg border border-(--brand-2) px-2 py-1 text-xs font-semibold text-(--brand-1) transition hover:bg-(--surface-soft)" href="${createWaLink(item)}" target="_blank" rel="noreferrer noopener">Laporkan</a>
        </td>
      </tr>
    `;
	}

	function getTotalPages() {
		// Minimal selalu 1 halaman, meskipun data kosong.
		return Math.max(1, Math.ceil(state.filteredUnits.length / state.pageSize));
	}

	function clampCurrentPage() {
		state.page = Math.min(Math.max(1, state.page), getTotalPages());
	}

	function getPageRows() {
		// Ambil potongan data sesuai halaman aktif.
		const start = (state.page - 1) * state.pageSize;
		return state.filteredUnits.slice(start, start + state.pageSize);
	}

	function renderPagination() {
		// Hitung ringkasan rentang data yang tampil di halaman saat ini.
		const total = state.filteredUnits.length;
		const totalPages = getTotalPages();
		const start = total === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
		const end = Math.min(total, state.page * state.pageSize);

		el.paginationSummary.textContent = `Menampilkan ${formatter.format(start)}-${formatter.format(end)} dari ${formatter.format(total)}`;

		const from = Math.max(1, state.page - 2);
		const to = Math.min(totalPages, state.page + 2);
		const pageButtons = [];

		for (let i = from; i <= to; i += 1) {
			// Buat tombol angka halaman di sekitar halaman aktif.
			pageButtons.push(`
        <button data-page="${i}" class="rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
					i === state.page
						? "border-(--brand-2) bg-(--brand-2) text-white"
						: "border-(--line) bg-white text-(--ink-muted) hover:bg-(--surface-soft)"
				}">${i}</button>
      `);
		}

		el.paginationControls.innerHTML = `
      <button data-page="prev" class="rounded-md border border-(--line) bg-white px-2.5 py-1.5 text-xs font-semibold text-(--ink-muted) transition hover:bg-(--surface-soft) disabled:cursor-not-allowed disabled:opacity-50" ${
				state.page <= 1 ? "disabled" : ""
			}>Sebelumnya</button>
      ${pageButtons.join("")}
      <button data-page="next" class="rounded-md border border-(--line) bg-white px-2.5 py-1.5 text-xs font-semibold text-(--ink-muted) transition hover:bg-(--surface-soft) disabled:cursor-not-allowed disabled:opacity-50" ${
				state.page >= totalPages ? "disabled" : ""
			}>Berikutnya</button>
    `;
	}

	function renderTable() {
		const pageRows = getPageRows();

		if (pageRows.length === 0) {
			// Empty state saat tidak ada hasil filter.
			el.tableBody.innerHTML =
				'<tr><td colspan="5" class="px-3 py-8 text-center text-sm text-(--ink-muted)">Tidak ada data yang sesuai dengan filter atau pencarian.</td></tr>';
			return;
		}

		el.tableBody.innerHTML = pageRows.map((item) => renderRow(item)).join("");

		if (!shouldReduceMotion) {
			gsap.fromTo(
				"#units-table-body tr",
				{ opacity: 0, y: 8 },
				{
					opacity: 1,
					y: 0,
					duration: 0.24,
					ease: "power2.out",
					stagger: 0.012,
				},
			);
		}
	}

	// Satu event handler untuk semua tombol pagination.
	el.paginationControls.addEventListener("click", (event) => {
		const target = event.target.closest("button[data-page]");
		if (!target || target.disabled) return;

		const pageToken = target.dataset.page;
		if (pageToken === "prev") state.page -= 1;
		else if (pageToken === "next") state.page += 1;
		else state.page = Number(pageToken);

		clampCurrentPage();
		renderTable();
		renderPagination();
	});

	return {
		clampCurrentPage,
		renderTable,
		renderPagination,
	};
}
