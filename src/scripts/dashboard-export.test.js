import assert from "node:assert/strict";
import test from "node:test";

import { toExportRows } from "./dashboard-export.js";

test("toExportRows menambahkan baris metadata dan data utama", () => {
	const rows = toExportRows({
		units: [
			{
				no: 1,
				name: "Biro Hukum",
				parentEselonI: "Setjen",
				provinceName: "DKI Jakarta",
				address: "Jakarta Pusat",
				sourceLabel: "Portal Resmi",
				sourceUrl: "https://www.kemkes.go.id",
			},
		],
		metadata: {
			generatedAt: "2026-09-13T00:00:00.000Z",
		},
		activeFilterSummary: "Provinsi: DKI Jakarta",
	});

	assert.equal(rows.length, 3);
	assert.equal(rows[0].No, "Metadata");
	assert.match(rows[0].Alamat, /Filter aktif: Provinsi: DKI Jakarta/);
	assert.equal(rows[2].No, 1);
	assert.equal(rows[2]["Unit Eselon I Unit Kerja"], "Setjen - Biro Hukum");
});
