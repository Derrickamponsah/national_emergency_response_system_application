/**
 * Vehicle Type Mapping Utility
 * Maps incident types to appropriate vehicle types and their properties
 */

export const VEHICLE_MAPPINGS = {
    MEDICAL: {
        type: 'AMBULANCE',
        label: 'Ambulance',
        icon: 'local_hospital',
        color: 'blue',
        description: 'Medical Emergency Response Vehicle',
        services: ['Patient Transport', 'First Aid', 'Life Support']
    },
    FIRE: {
        type: 'FIRE_TRUCK',
        label: 'Fire Brigade Truck',
        icon: 'fire_truck',
        color: 'orange',
        description: 'Fire and Rescue Response Vehicle',
        services: ['Fire Suppression', 'Rescue Operations', 'Hazmat Response']
    },
    CRIME: {
        type: 'POLICE_CAR',
        label: 'Police Vehicle',
        icon: 'local_police',
        color: 'indigo',
        description: 'Law Enforcement Response Vehicle',
        services: ['Security Response', 'Investigation', 'Evidence Collection']
    },
    ROAD_ACCIDENT: {
        type: 'AMBULANCE', // Road accidents prioritize medical response
        label: 'Ambulance',
        icon: 'local_hospital',
        color: 'blue',
        description: 'Medical Emergency Response Vehicle',
        services: ['Patient Transport', 'First Aid', 'Life Support'],
        secondaryType: 'POLICE_CAR', // May also dispatch police for traffic management
        secondaryLabel: 'Police (Traffic Management)'
    }
};

export const INCIDENT_TYPES = {
    MEDICAL: 'MEDICAL',
    FIRE: 'FIRE',
    CRIME: 'CRIME',
    ROAD_ACCIDENT: 'ROAD_ACCIDENT'
};

/**
 * Get vehicle type for a given incident type
 * @param {string} incidentType - The incident type (MEDICAL, FIRE, CRIME, ROAD_ACCIDENT)
 * @returns {string} The vehicle type to dispatch
 */
export const getVehicleTypeForIncident = (incidentType) => {
    return VEHICLE_MAPPINGS[incidentType]?.type || 'AMBULANCE';
};

/**
 * Get all vehicle mapping info for an incident
 * @param {string} incidentType - The incident type
 * @returns {object} Complete mapping configuration
 */
export const getIncidentVehicleMapping = (incidentType) => {
    return VEHICLE_MAPPINGS[incidentType] || VEHICLE_MAPPINGS.MEDICAL;
};

/**
 * Get vehicle icon for incident type
 * @param {string} incidentType - The incident type
 * @returns {string} Material icon name
 */
export const getVehicleIconForIncident = (incidentType) => {
    return VEHICLE_MAPPINGS[incidentType]?.icon || 'directions_car';
};

/**
 * Get vehicle color for incident type
 * @param {string} incidentType - The incident type
 * @returns {string} Tailwind color name
 */
export const getVehicleColorForIncident = (incidentType) => {
    return VEHICLE_MAPPINGS[incidentType]?.color || 'slate';
};

/**
 * Get vehicle label for incident type (human-readable)
 * @param {string} incidentType - The incident type
 * @returns {string} Human-readable vehicle label
 */
export const getVehicleLabelForIncident = (incidentType) => {
    return VEHICLE_MAPPINGS[incidentType]?.label || 'Emergency Vehicle';
};

/**
 * Get all incident types
 * @returns {array} Array of incident type objects with labels
 */
export const getAllIncidentTypes = () => {
    return [
        { type: 'MEDICAL', label: 'Medical Emergency', icon: 'local_hospital', color: 'blue' },
        { type: 'FIRE', label: 'Fire Emergency', icon: 'fire_truck', color: 'orange' },
        { type: 'CRIME', label: 'Crime/Security Issue', icon: 'local_police', color: 'indigo' },
        { type: 'ROAD_ACCIDENT', label: 'Road Accident', icon: 'directions_car', color: 'amber' }
    ];
};

/**
 * Format vehicle info for display
 * @param {string} incidentType - The incident type
 * @returns {object} Formatted object with display properties
 */
export const formatVehicleForDisplay = (incidentType) => {
    const mapping = VEHICLE_MAPPINGS[incidentType];
    if (!mapping) return VEHICLE_MAPPINGS.MEDICAL;

    return {
        vehicleType: mapping.type,
        displayLabel: mapping.label,
        icon: mapping.icon,
        color: mapping.color,
        description: mapping.description,
        services: mapping.services,
        secondaryType: mapping.secondaryType,
        secondaryLabel: mapping.secondaryLabel
    };
};

export default {
    VEHICLE_MAPPINGS,
    INCIDENT_TYPES,
    getVehicleTypeForIncident,
    getIncidentVehicleMapping,
    getVehicleIconForIncident,
    getVehicleColorForIncident,
    getVehicleLabelForIncident,
    getAllIncidentTypes,
    formatVehicleForDisplay
};
