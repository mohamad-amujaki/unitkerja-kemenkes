export function toExportRows({ units, metadata, activeFilterSummary }) {
	// generatedLabel dipakai agar user tahu timestamp data yang dipakai saat export.
	const generatedLabel = metadata?.generatedAt
		? new Date(metadata.generatedAt).toLocaleDateString("id-ID", {
				dateStyle: "long",
			})
		: "Tidak tersedia";

	const metadataRows = [
		// Dua baris awal berisi konteks file agar aman saat dibagikan di luar aplikasi.
		{
			No: "Metadata",
			"Unit Eselon I Unit Kerja":
				"Project independen, bukan produk resmi pemerintah dan tidak terafiliasi dengan Kemenkes.",
			Provinsi: `Update data: ${generatedLabel}`,
			Alamat: `Filter aktif: ${activeFilterSummary || "Semua data"}`,
			Sumber: "File ekspor ini untuk visualisasi publik.",
		},
		{
			No: "",
			"Unit Eselon I Unit Kerja": "",
			Provinsi: "",
			Alamat: "",
			Sumber: "",
		},
	];

	// Mapping ini menjadi "kontrak" format file export.
	// Jika urutan/label kolom berubah di sini, hasil CSV/XLSX juga ikut berubah.
	const dataRows = units.map((item) => ({
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

	return [...metadataRows, ...dataRows];
}
