
import { supabase } from "../db/supabaseClient.js";

// Haversine distance formula
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

export const getDeliveryRoute = async (req, res) => {
    try {
        // 1. Get Driver Location (Hub for now)
        const { data: driver, error: driverError } = await supabase
            .from('driver_locations')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        const hub = driver || { latitude: 55.9533, longitude: -3.1883 };

        const { orderIds } = req.query;

        // 2. Fetch Orders that need delivery
        let orderQuery = supabase
            .from('orders')
            .select(`
                order_id,
                order_status,
                total_amount,
                customers (name),
                addresses (*)
            `);

        if (orderIds) {
            const idList = orderIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            if (idList.length > 0) {
                orderQuery = orderQuery.in('order_id', idList);
            }
        } else {
            // Default: Only orders that still need delivery (DELIVERED and COMPLETED are excluded)
            orderQuery = orderQuery.in('order_status', ['DELIVERING', 'PAID', 'SHIPPED']);
        }

        const { data: orders, error: orderError } = await orderQuery;

        if (orderError) throw orderError;

        // Filter out those without coords
        const points = orders.filter(o => o.addresses?.latitude && o.addresses?.longitude);

        if (points.length === 0) {
            return res.json({
                hub,
                route: [],
                stats: { totalDistance: 0, estimatedTime: 0 }
            });
        }

        // 3. Optimize Route (Nearest Neighbor)
        let current = { latitude: hub.latitude, longitude: hub.longitude };
        let unvisited = [...points];
        let optimizedRoute = [];
        let totalDistance = 0;

        while (unvisited.length > 0) {
            let nearestIdx = -1;
            let minDist = Infinity;

            for (let i = 0; i < unvisited.length; i++) {
                const dist = getDistance(
                    current.latitude, current.longitude,
                    unvisited[i].addresses.latitude, unvisited[i].addresses.longitude
                );
                if (dist < minDist) {
                    minDist = dist;
                    nearestIdx = i;
                }
            }

            const nextStop = unvisited[nearestIdx];
            totalDistance += minDist;
            optimizedRoute.push(nextStop);
            current = { latitude: nextStop.addresses.latitude, longitude: nextStop.addresses.longitude };
            unvisited.splice(nearestIdx, 1);
        }

        // Estimated time: assuming average speed of 40 km/h in city
        const estimatedTime = (totalDistance / 40) * 60; // in minutes

        res.json({
            hub,
            route: optimizedRoute,
            stats: {
                totalDistance: totalDistance.toFixed(2),
                estimatedTime: Math.round(estimatedTime),
                stopCount: optimizedRoute.length
            }
        });

    } catch (error) {
        console.error("Route Optimization Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateDriverLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        const { data, error } = await supabase
            .from('driver_locations')
            .upsert({ driver_id: 1, latitude, longitude, updated_at: new Date() })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
