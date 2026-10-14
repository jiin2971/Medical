import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const facilitiesPath = path.join(projectRoot, 'public', 'data', 'facilities.geojson');
const currentPath = path.join(projectRoot, 'public', 'data', 'dong_current.csv');
const shouldClean = process.argv.includes('--clean');
const expectedFacilityCount = 696;

const [facilityText, currentText] = await Promise.all([
  readFile(facilitiesPath, 'utf8'),
  readFile(currentPath, 'utf8'),
]);
const facilities = JSON.parse(facilityText);
const { data: currentRows, errors } = Papa.parse(currentText, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: false,
});
if (errors.length > 0) {
  throw new Error(`dong_current.csv parsing failed: ${errors[0].message}`);
}

const currentByCode = new Map(
  currentRows.map((row) => [String(row.adm_cd ?? '').trim(), row]),
);
const isValidFacility = (feature) => {
  const properties = feature?.properties;
  const coordinates = feature?.geometry?.coordinates;
  const code = String(properties?.adm_cd ?? '').trim();
  return (
    feature?.geometry?.type === 'Point' &&
    Array.isArray(coordinates) &&
    coordinates.length >= 2 &&
    Number.isFinite(coordinates[0]) &&
    Number.isFinite(coordinates[1]) &&
    coordinates[0] >= 124 &&
    coordinates[0] <= 127.5 &&
    coordinates[1] >= 36.8 &&
    coordinates[1] <= 38 &&
    properties?.admin_join_ok === 1 &&
    currentByCode.has(code)
  );
};

const removed = facilities.features.filter((feature) => !isValidFacility(feature));
if (removed.length > 0 && !shouldClean) {
  throw new Error(
    `${removed.length} unmapped/invalid facility records remain. Run with --clean to remove them.`,
  );
}
if (removed.length > 0) {
  facilities.features = facilities.features.filter(isValidFacility);
  await writeFile(facilitiesPath, `${JSON.stringify(facilities)}\n`, 'utf8');
}
if (facilities.features.length !== expectedFacilityCount) {
  throw new Error(
    `Expected ${expectedFacilityCount} mapped facilities, found ${facilities.features.length}.`,
  );
}

const supplyByCode = new Map();
for (const feature of facilities.features) {
  const code = String(feature.properties.adm_cd).trim();
  supplyByCode.set(
    code,
    (supplyByCode.get(code) ?? 0) + Number(feature.properties.S ?? 0),
  );
}

for (const [code, row] of currentByCode) {
  const expectedSupply = Number(row.doc_S_in_dong);
  const calculatedSupply = supplyByCode.get(code) ?? 0;
  if (
    !Number.isFinite(expectedSupply) ||
    Math.abs(expectedSupply - calculatedSupply) > 1e-8
  ) {
    throw new Error(
      `${code} ${row.adm_nm}: doc_S_in_dong=${row.doc_S_in_dong}, facility S=${calculatedSupply}`,
    );
  }

  const population = Number(row.pop_total);
  const elderlyPopulation = Number(row.eld_65);
  const calculatedElderlyRatio = (elderlyPopulation / population) * 100;
  if (
    !Number.isFinite(calculatedElderlyRatio) ||
    Math.abs(Number(row.eld_ratio) - calculatedElderlyRatio) > 1e-8
  ) {
    throw new Error(
      `${code} ${row.adm_nm}: eld_ratio does not match eld_65 / pop_total.`,
    );
  }
}

console.log(
  `Validated ${facilities.features.length} mapped facilities across ${currentByCode.size} dongs; facility S and elderly ratios match the supplied dong table.`,
);
for (const feature of removed) {
  const { fid, fac_id, name, address, S, adm_cd } = feature.properties ?? {};
  console.log(
    `Removed fid=${fid}; fac_id=${fac_id}; name=${name}; address=${address}; S=${S}; adm_cd=${adm_cd ?? 'missing'}`,
  );
}
