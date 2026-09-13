import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const workbookPath = path.join(rootDir, "docs", "data_upt_kemenkes.xlsx");
const unitsOutPath = path.join(rootDir, "src", "data", "units.json");
const metadataOutPath = path.join(rootDir, "src", "data", "metadata.json");
const provincesOutPath = path.join(
	rootDir,
	"public",
	"data",
	"provinces.geojson",
);

const topoUrl =
	"https://code.highcharts.com/mapdata/countries/id/id-all.topo.json";

const unitTypeRules = [
	{ keyword: "poltekkes", type: "Poltekkes" },
	{ keyword: "balai besar", type: "Balai Besar" },
	{ keyword: "balai", type: "Balai" },
	{ keyword: "loka", type: "Loka" },
	{ keyword: "direktorat", type: "Direktorat" },
	{ keyword: "sekretariat", type: "Sekretariat" },
	{ keyword: "inspektorat", type: "Inspektorat" },
	{ keyword: "pusat", type: "Pusat" },
	{ keyword: "rumah sakit", type: "Rumah Sakit" },
];

const provinceCodeMap = {
	Aceh: "11",
	SumateraUtara: "12",
	SumateraBarat: "13",
	Riau: "14",
	Jambi: "15",
	SumateraSelatan: "16",
	Bengkulu: "17",
	Lampung: "18",
	KepulauanBangkaBelitung: "19",
	KepulauanRiau: "21",
	DKIJakarta: "31",
	JawaBarat: "32",
	JawaTengah: "33",
	DIYogyakarta: "34",
	JawaTimur: "35",
	Banten: "36",
	Bali: "51",
	NusaTenggaraBarat: "52",
	NusaTenggaraTimur: "53",
	KalimantanBarat: "61",
	KalimantanTengah: "62",
	KalimantanSelatan: "63",
	KalimantanTimur: "64",
	KalimantanUtara: "65",
	SulawesiUtara: "71",
	SulawesiTengah: "72",
	SulawesiSelatan: "73",
	SulawesiTenggara: "74",
	Gorontalo: "75",
	SulawesiBarat: "76",
	Maluku: "81",
	MalukuUtara: "82",
	PapuaBarat: "91",
	Papua: "94",
	PapuaSelatan: "93",
	PapuaTengah: "92",
	PapuaPegunungan: "95",
	PapuaBaratDaya: "96",
};

function cleanText(value) {
	return String(value ?? "")
		.replace(/\s+/g, " ")
		.trim();
}

function compactKey(value) {
	return cleanText(value).replace(/[^a-zA-Z0-9]/g, "");
}

function detectUnitType(name) {
	const lowered = cleanText(name).toLowerCase();
	for (const rule of unitTypeRules) {
		if (lowered.includes(rule.keyword)) {
			return rule.type;
		}
	}
	return "Lainnya";
}

function parseSource(sourceText) {
	const text = cleanText(sourceText);
	const urlMatch = text.match(/https?:\/\/[^\s),]+/i);
	const sourceUrl = urlMatch ? urlMatch[0] : "";
	const sourceLabel = sourceUrl
		? cleanText(text.replace(sourceUrl, "").replace(/[,-]$/, ""))
		: text;

	const lowered = text.toLowerCase();
	let verificationStatus = "verified";
	if (
		lowered.includes("belum ditemukan") ||
		lowered.includes("harap dilengkapi")
	) {
		verificationStatus = "needs_review";
	} else if (
		lowered.includes("wikipedia") ||
		lowered.includes("instagram") ||
		lowered.includes("tidak resmi")
	) {
		verificationStatus = "secondary_source";
	}

	return { sourceLabel, sourceUrl, verificationStatus };
}

async function ensureDirs() {
	await fs.mkdir(path.dirname(unitsOutPath), { recursive: true });
	await fs.mkdir(path.dirname(metadataOutPath), { recursive: true });
	await fs.mkdir(path.dirname(provincesOutPath), { recursive: true });
}

async function buildUnitsData() {
	const workbook = XLSX.readFile(workbookPath);
	const sheet =
		workbook.Sheets["Detail UPT"] || workbook.Sheets[workbook.SheetNames[0]];
	const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

	const units = rows
		.filter((row) => Number(row.No) > 0)
		.map((row, index) => {
			const name = cleanText(row["Nama Unit Kerja"]);
			const provinceName = cleanText(row.Provinsi);
			const source = parseSource(row.Sumber);
			const provinceCode = provinceCodeMap[compactKey(provinceName)] ?? "";
			let sourceLabel = source.sourceLabel;
			if (source.verificationStatus === "verified") {
				sourceLabel = "Portal Resmi";
			} else if (source.verificationStatus === "needs_review") {
				sourceLabel = "Belum ditemukan";
			}

			return {
				id: `unit-${String(index + 1).padStart(3, "0")}`,
				no: Number(row.No),
				name,
				parentEselonI: cleanText(row["Unit Eselon I"]),
				unitType: detectUnitType(name),
				address: cleanText(row["Alamat Kantor"]),
				provinceName,
				provinceCode,
				sourceLabel,
				sourceUrl: source.sourceUrl,
				verificationStatus: source.verificationStatus,
			};
		});

	const byProvince = units.reduce((acc, unit) => {
		acc[unit.provinceName] = (acc[unit.provinceName] ?? 0) + 1;
		return acc;
	}, {});

	const byEselon = units.reduce((acc, unit) => {
		acc[unit.parentEselonI] = (acc[unit.parentEselonI] ?? 0) + 1;
		return acc;
	}, {});

	const metadata = {
		productName: "Peta Persebaran Unit Kerja Kemenkes",
		totalUnits: units.length,
		totalProvincesWithData: Object.keys(byProvince).length,
		totalEselon: Object.keys(byEselon).length,
		totalUniqueAddresses: new Set(units.map((u) => u.address)).size,
		generatedAt: new Date().toISOString(),
		sourceWorkbook: "docs/data_upt_kemenkes.xlsx",
		byProvince,
		byEselon,
		notes: [
			"Data utama berasal dari workbook resmi kerja dan dapat diperbarui setelah verifikasi manual.",
			"Sebagian sumber masih perlu verifikasi tambahan.",
		],
	};

	await fs.writeFile(
		unitsOutPath,
		`${JSON.stringify(units, null, 2)}\n`,
		"utf8",
	);
	await fs.writeFile(
		metadataOutPath,
		`${JSON.stringify(metadata, null, 2)}\n`,
		"utf8",
	);
}

async function buildProvincesGeoJson() {
	const response = await fetch(topoUrl);
	if (!response.ok) {
		throw new Error(`Failed to fetch province topology: ${response.status}`);
	}

	const topology = await response.json();
	const objectKey = Object.keys(topology.objects)[0];
	const geo = feature(topology, topology.objects[objectKey]);

	const cleanedFeatures = geo.features.map((item) => ({
		type: "Feature",
		geometry: item.geometry,
		properties: {
			name: item.properties?.name ?? "",
			hcKey: item.properties?.["hc-key"] ?? "",
			postalCode: item.properties?.["postal-code"] ?? "",
		},
	}));

	const cleanedGeo = {
		type: "FeatureCollection",
		features: cleanedFeatures,
	};

	await fs.writeFile(
		provincesOutPath,
		`${JSON.stringify(cleanedGeo)}\n`,
		"utf8",
	);
}

async function main() {
	await ensureDirs();
	await buildUnitsData();
	await buildProvincesGeoJson();
	console.log("Data artifacts generated:");
	console.log(`- ${path.relative(rootDir, unitsOutPath)}`);
	console.log(`- ${path.relative(rootDir, metadataOutPath)}`);
	console.log(`- ${path.relative(rootDir, provincesOutPath)}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
