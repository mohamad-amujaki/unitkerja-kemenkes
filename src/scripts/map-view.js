import L from "leaflet";

function getMapColor(value) {
	if (value >= 16) return "#2d705c";
	if (value >= 8) return "#5d9d85";
	if (value >= 4) return "#8fbea8";
	if (value >= 2) return "#bdd8ca";
	if (value >= 1) return "#d9e9e0";
	return "#edf4f0";
}

/**
 * Manages map rendering only:
 * - geojson fetch and cache
 * - map color repaint from filtered data
 * - tooltip and click event callback
 */
export function createMapView({
	mapElementId,
	legendEl,
	formatter,
	resolveMapRegion,
	getFilteredUnits,
	onRegionClick,
}) {
	const map = L.map(mapElementId, {
		zoomControl: false,
		attributionControl: true,
		scrollWheelZoom: false,
	});
	L.control.zoom({ position: "bottomright" }).addTo(map);

	let provinceGeoJson = null;
	let provinceLayer = null;
	let didFitBounds = false;

	function countByMapRegion(data) {
		return data.reduce((acc, unit) => {
			const region = resolveMapRegion(unit.provinceName);
			acc[region] = (acc[region] ?? 0) + 1;
			return acc;
		}, {});
	}

	function renderLegend(maxValue) {
		const bins = [0, 1, 3, 7, 15, Math.max(16, maxValue)];
		const colors = [
			"#edf4f0",
			"#d9e9e0",
			"#bdd8ca",
			"#8fbea8",
			"#5d9d85",
			"#2d705c",
		];

		legendEl.innerHTML = bins
			.map((value, index) => {
				const next = bins[index + 1];
				if (next === undefined) return "";
				return `<li class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full border border-(--line)" style="background:${colors[index]}"></span><span>${value} - ${next - 1} unit</span></li>`;
			})
			.join("");
	}

	async function ensureGeoJson() {
		if (provinceGeoJson) return provinceGeoJson;
		provinceGeoJson = await fetch("/data/provinces.geojson").then((res) =>
			res.json(),
		);
		return provinceGeoJson;
	}

	async function render() {
		const geo = await ensureGeoJson();
		const mapCounts = countByMapRegion(getFilteredUnits());
		const maxValue = Math.max(...Object.values(mapCounts), 0);
		renderLegend(maxValue);

		if (provinceLayer) {
			provinceLayer.remove();
		}

		provinceLayer = L.geoJSON(geo, {
			style: (feature) => {
				const regionName = feature.properties?.name || "";
				const total = mapCounts[regionName] ?? 0;
				return {
					fillColor: getMapColor(total),
					weight: 1,
					color: "#6d8d80",
					fillOpacity: 0.9,
				};
			},
			onEachFeature: (feature, layer) => {
				const regionName = feature.properties?.name || "";
				const total = mapCounts[regionName] ?? 0;

				layer.bindTooltip(`${regionName}: ${formatter.format(total)} unit`, {
					sticky: true,
				});

				layer.on("click", () => onRegionClick(regionName));
			},
		}).addTo(map);

		if (!didFitBounds) {
			map.fitBounds(provinceLayer.getBounds(), { padding: [8, 8] });
			didFitBounds = true;
		}
	}

	return { render };
}
