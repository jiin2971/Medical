# Data cleaning and validation

## Healthcare facilities

Removed one facility that could not be joined to an Incheon administrative dong from `public/data/facilities.geojson`:

- `fid`: 697
- `fac_id`: `JDU4MTI3MSM1MSMkMiMkMCMkMDAkNDgxMTkxIzIxIyQxIyQxIyQ4MiQzNjEyMjIjNzEjJDEjJDgjJDgz`
- Name: 365플러스의원
- Address: 인천광역시 서구 이음3로 145, JK타워 305~307호 (당하동)
- Supply value `S`: 1
- Join status: no `adm_cd` / no mapped administrative dong

The active facility collection now has 696 records, all joined to one of the 156 dong codes. The remaining records sum to `S = 1,214`; this matches the sum of `doc_S_in_dong` in `dong_current.csv` and the per-dong `S` totals match for all 156 dongs. The source already excluded the unjoined facility from its per-dong supply totals, so removing it does not change those supplied metrics.

Elderly ratios are calculated from each dong's `eld_65 / pop_total * 100` and are independent of the facility join. The existing ratios were checked against that calculation and were left unchanged.

Run `node scripts/cleanFacilities.mjs` from `project/` to check the active data. Add `--clean` to remove records that lack a valid Incheon dong join before validating the facility supply and elderly-ratio metrics.
