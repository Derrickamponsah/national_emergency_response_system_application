// Haversine formula to calculate distance between two coordinates
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Find the nearest available responder to an incident
function findNearestResponder(incidentLat, incidentLon, responders) {
    if (!responders || responders.length === 0) {
        return null;
    }

    let nearest = null;
    let minDistance = Infinity;

    responders.forEach(responder => {
        if (responder.is_available) {
            const distance = haversine(incidentLat, incidentLon, responder.latitude, responder.longitude);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = { ...responder, distance: distance.toFixed(2) };
            }
        }
    });

    return nearest;
}

module.exports = { haversine, findNearestResponder };
