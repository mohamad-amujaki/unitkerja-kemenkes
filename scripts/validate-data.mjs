import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

const unitsPath = path.join(rootDir, "src", "data", "units.json");
const metadataPath = path.join(rootDir, "src", "data", "metadata.json");
const provincesPath = path.join(rootDir, "public", "data", "provinces.geojson");

const requiredFields = [
	"id",
	"no",
	"name",
	"parentEselonI",
	"unitType",
	"address",
	"provinceName",
	"provinceCode",
	"verificationStatus",
];

function toSetDuplicates(values) {
	const seen = new Set();
	const duplicate = new Set();
	for (const value of values) {
		if (seen.has(value)) duplicate.add(value);
		seen.add(value);
	}
	return [...duplicate];
}

function nonEmpty(value) {
	return value !== null && value !== undefined && String(value).trim() !== "";
}

async function readJson(filePath) {
	const text = await fs.readFile(filePath, "utf8");
	return JSON.parse(text);
}

async function main() {
	const errors = [];

	const [units, metadata, provinces] = await Promise.all([
		readJson(unitsPath),
		readJson(metadataPath),
		readJson(provincesPath),
	]);

	if (!Array.isArray(units) || units.length === 0) {
		errors.push("units.json harus berupa array dan tidak boleh kosong.");
	}

	if (!metadata || typeof metadata !== "object") {
		errors.push("metadata.json harus berupa object JSON valid.");
	}

	if (
		!provinces ||
		!Array.isArray(provinces.features) ||
		provinces.features.length === 0
	) {
		errors.push(
			"provinces.geojson harus memiliki FeatureCollection dengan features.",
		);
	}

	for (const [index, unit] of units.entries()) {
		for (const field of requiredFields) {
			if (!nonEmpty(unit[field])) {
				errors.push(`units.json baris ${index + 1} field '${field}' kosong.`);
			}
		}
	}

	const duplicateIds = toSetDuplicates(units.map((unit) => unit.id));
	if (duplicateIds.length > 0) {
		errors.push(
			`Ditemukan id duplikat: ${duplicateIds.slice(0, 5).join(", ")}`,
		);
	}

	const duplicateNos = toSetDuplicates(units.map((unit) => unit.no));
	if (duplicateNos.length > 0) {
		errors.push(
			`Ditemukan nomor urut duplikat: ${duplicateNos.slice(0, 5).join(", ")}`,
		);
	}

	const uniqueProvince = new Set(units.map((unit) => unit.provinceName)).size;
	const uniqueEselon = new Set(units.map((unit) => unit.parentEselonI)).size;
	const uniqueAddress = new Set(units.map((unit) => unit.address)).size;

	if (metadata.totalUnits !== units.length) {
		errors.push(
			`metadata.totalUnits (${metadata.totalUnits}) tidak sama dengan units.length (${units.length}).`,
		);
	}
	if (metadata.totalProvincesWithData !== uniqueProvince) {
		errors.push(
			`metadata.totalProvincesWithData (${metadata.totalProvincesWithData}) tidak sama dengan jumlah provinsi unik (${uniqueProvince}).`,
		);
	}
	if (metadata.totalEselon !== uniqueEselon) {
		errors.push(
			`metadata.totalEselon (${metadata.totalEselon}) tidak sama dengan eselon unik (${uniqueEselon}).`,
		);
	}
	if (metadata.totalUniqueAddresses !== uniqueAddress) {
		errors.push(
			`metadata.totalUniqueAddresses (${metadata.totalUniqueAddresses}) tidak sama dengan alamat unik (${uniqueAddress}).`,
		);
	}

	if (errors.length > 0) {
		console.error("Data validation failed:");
		for (const error of errors) {
			console.error(`- ${error}`);
		}
		process.exit(1);
	}

	console.log("Data validation passed.");
	console.log(`- Units: ${units.length}`);
	console.log(`- Provinces in data: ${uniqueProvince}`);
	console.log(`- Eselon in data: ${uniqueEselon}`);
	console.log(`- Geo features: ${provinces.features.length}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
