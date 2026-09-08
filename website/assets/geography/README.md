# Utah service county outlines

Source: State of Utah, SGID / Utah Geospatial Resource Center, [Utah County Boundaries](https://gis.utah.gov/products/sgid/boundaries/county/). Retrieved September 6, 2026; source page reports July 2026 revision. These are administrative/cartographic boundaries, not survey or legal boundary determinations.

Service: https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/UtahCountyBoundaries/FeatureServer/0/query

Query: NAME IN ('SALT LAKE','UTAH','WEBER','DAVIS'); outFields=NAME,FIPS_STR; returnGeometry=true; outSR=26912; maxAllowableOffset=25; f=json.

The stored response retains projected NAD83 / UTM zone 12N geometry (meters). The service generalizes boundaries within 25 meters, below one rendered pixel at the displayed sizes. County boundaries include their lake areas, not merely the shoreline. `scripts/build-county-shapes.mjs` verifies all four county FIPS identifiers and the coordinate system, uniformly scales each outline, and reverses the vertical axis to keep grid north up. No geographic rotation, stretching, or generated approximation is used. Each county fits its own 200 × 160 viewport; the displayed outlines are explicitly not at a common scale. Rings are preserved with even-odd filling.

The current website uses `service-region.svg`, a connected map generated with one shared scale and origin for all four counties. Their relative sizes, offsets and adjacency are preserved, and labels appear in geographic north-to-south order. The individual county exports remain available as source derivatives but are no longer displayed. The map embeds Brookvale for crisp labels and has a descriptive alt text listing the four counties.

Run `node scripts/build-county-shapes.mjs` to regenerate all public SVG assets from the stored response. The site uses local static vectors; visitors make no GIS service requests.
