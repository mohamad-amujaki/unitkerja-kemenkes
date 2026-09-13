export function toExportRows(units) {
	// Mapping ini menjadi "kontrak" format file export.
	// Jika urutan/label kolom berubah di sini, hasil CSV/XLSX juga ikut berubah.
	return units.map((item) => ({
		No: item.no,
		// Gabungkan Eselon I dan nama unit agar ringkas saat dibuka di spreadsheet.
		"Unit Eselon I Unit Kerja": `${item.parentEselonI} - ${item.name}`,
		Provinsi: item.provinceName,
		Alamat: item.address,
		// Kolom sumber tetap disertakan di file export meskipun tidak ditampilkan di tabel UI.
		Sumber: item.sourceUrl
			? `${item.sourceLabel} ${item.sourceUrl}`.trim()
			: item.sourceLabel,
	}));
}
