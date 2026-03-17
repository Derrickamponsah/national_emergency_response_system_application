# Ghana Regions Reference Guide

This document outlines Ghana's 16 administrative regions used throughout the Emergency Response and Dispatch Coordination Platform.

## Complete List of Regions

| Region | Capital | Major Cities | Sample Coordinates |
|--------|---------|--------------|-------------------|
| **Greater Accra** | Accra | Accra, Tema, Kasoa | 5.345, -0.186 |
| **Ashanti** | Kumasi | Kumasi, Obuasi, Mampong | 6.694, -1.624 |
| **Western** | Sekondi-Takoradi | Takoradi, Sekondi, Tarkwa | 4.884, -1.756 |
| **Central** | Cape Coast | Cape Coast, Senya Beraku, Elmina | 5.109, -1.244 |
| **Eastern** | Koforidua | Koforidua, Begoro, Suhum | 6.099, -0.344 |
| **Northern** | Tamale | Tamale, Yendi, Savelugu | 9.377, -0.839 |
| **Bono** | Sunyani | Sunyani, Wenchi, Dormaa | 6.353, -2.328 |
| **Bono East** | Techiman | Techiman, Kintampo, Atebubu | 7.381, -1.020 |
| **Ahafo** | Goaso | Goaso, Bechem, Duayaw Nkwanta | 6.744, -2.436 |
| **Oti** | Dambai | Dambai, Nalerigu, Nkwanta | 8.500, -0.800 |
| **Savannah** | Damongo | Damongo, Buipe, Mole | 8.000, -2.000 |
| **North East** | Nalerigu | Nalerigu, Bawku, Bolgatanga | 10.300, -0.900 |
| **Upper East** | Bolgatanga | Bolgatanga, Navrongo, Bawku | 10.789, -0.848 |
| **Upper West** | Wa | Wa, Lawra, Nandom | 10.064, -2.508 |
| **Volta** | Ho | Ho, Keta, Akatsi | 6.614, 0.482 |
| **Western North** | Sefwi Wiawso | Sefwi Wiawso, Juaso, Bibiani | 5.908, -2.325 |

## Regions Used in Sample Data

### Current Implementation (Analytics Service & Microservices)

**Incident Events (Analytics):**
- Greater Accra - 4 incidents
- Ashanti - 1 incident
- Western - 1 incident
- Volta - 1 incident
- Northern - 1 incident
- Central - 1 incident
- Eastern - 1 incident
- Upper East - 1 incident
- Upper West - 1 incident

**Total: 10 sample incidents across 9 regions**

### Hospital Bed Statistics

| Hospital | Region | Beds |
|----------|--------|------|
| Accra Central Hospital | Greater Accra | 150 |
| Korle Bu Teaching Hospital | Greater Accra | 500 |
| Komfo Anokye Teaching Hospital | Ashanti | 450 |

### Responder Deployment

| Responder | Type | Region |
|-----------|------|--------|
| Accra Central Hospital | HOSPITAL | Greater Accra |
| Komfo Anokye Teaching Hospital | HOSPITAL | Ashanti |
| Takoradi Central Police Station | POLICE | Western |
| Tamale Fire Station | FIRE_STATION | Northern |

### Incident Service

**Responders by Region:**
- Greater Accra: 3 Hospitals, 2 Police Stations, 2 Fire Stations
- Ashanti: 1 Hospital, 1 Police Station, 1 Fire Station
- Western: 1 Police Station
- Northern: 1 Fire Station

**Incidents by Region:**
- Greater Accra: 3 incidents
- Ashanti: 2 incidents
- Western: 1 incident
- Central: 1 incident
- Northern: 1 incident
- Eastern: 1 incident

### Dispatch Service

**Vehicles by Region:**

| Region | Ambulances | Fire Trucks | Police Cars |
|--------|-----------|------------|-----------|
| Greater Accra | 2 | 1 | 2 |
| Ashanti | 1 | 1 | 1 |
| Western | 1 | 1 | 1 |
| Northern | 0 | 1 | 0 |

## Coordinate System

The platform uses standard GPS coordinates:
- **Latitude:** 4.7 - 11.2 (North-South range of Ghana)
- **Longitude:** -3.5 - 1.1 (West-East range of Ghana)

### Sample Coordinates Reference

```
Greater Accra:    5.345, -0.186
Ashanti:          6.694, -1.624
Western:          4.884, -1.756
Central:          5.109, -1.244
Eastern:          6.099, -0.344
Northern:         9.377, -0.839
Bono:             6.353, -2.328
Bono East:        7.381, -1.020
Ahafo:            6.744, -2.436
Oti:              8.500, -0.800
Savannah:         8.000, -2.000
North East:       10.300, -0.900
Upper East:       10.789, -0.848
Upper West:       10.064, -2.508
Volta:            6.614, 0.482
Western North:    5.908, -2.325
```

## Database Column Schema

All microservices include a `region VARCHAR(100)` field in relevant tables:

| Service | Table | Region Column |
|---------|-------|---|
| Incident | incidents | region |
| Incident | responders | region |
| Dispatch | vehicles | region |
| Analytics | incident_events | region |
| Analytics | hospital_bed_statistics | region |
| Analytics | responder_deployment_metrics | region |
| Analytics | resource_utilization | region |

## Upcoming Updates

Future enhancements will include:
- Expand sample data to all 16 regions
- Regional emergency response headquarter mapping
- Region-specific resource allocation strategies
- Cross-region incident coordination protocols
- Regional performance analytics and dashboards

## Notes

- Greater Accra is the primary focus in current sample data as the capital region
- Ashanti region is the secondary focus (second-largest urban center)
- Regional references are case-sensitive: "Greater Accra" not "greater accra"
- All coordinates are in decimal degrees format (WGS84)
- Regional boundaries do not include maritime zones
