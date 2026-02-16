// Address Service using Postcodes.io (Free open data)
// Note: Postcodes.io provides location data (District, Ward, Region) but NOT street-level addresses.

export const findAddresses = async (postcode) => {
    // 1. Validate Input
    if (!postcode) return [];

    // precise check unnecessary as API handles it, but good for performance
    const cleanPostcode = postcode.replace(/\s+/g, '');
    if (cleanPostcode.length < 4) return []; // Outcodes can be short

    try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
        const data = await response.json();

        if (data.status === 200 && data.result) {
            const {
                admin_ward,
                admin_district,
                region,
                country,
                postcode: properPostcode
            } = data.result;

            // 2. Construct Address Parts
            // e.g. "Soho, Westminster, London, England, W1D 3QU"
            const parts = [
                admin_ward,
                admin_district,
                region,
                country,
                properPostcode
            ].filter(Boolean);

            // 3. Deduplicate and Join
            const uniqueString = [...new Set(parts)].join(", ");

            return [{
                label: uniqueString,
                latitude: data.result.latitude,
                longitude: data.result.longitude
            }];
        } else {
            // Postcode not found or invalid
            return [];
        }
    } catch (error) {
        console.error("Postcodes.io Lookup Error:", error);
        // Fallback or empty array so UI doesn't crash
        return [];
    }
};
