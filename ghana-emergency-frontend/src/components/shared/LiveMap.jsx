import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not showing correctly in React
// This is a common issue with Leaflet and Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for different types
const getIcon = (type, color, status) => {
    const colorClasses = {
        teal: { bg: 'bg-teal-500' },
        rose: { bg: 'bg-rose-500' },
        amber: { bg: 'bg-amber-500' },
        blue: { bg: 'bg-blue-500' },
        primary: { bg: 'bg-primary' },
        orange: { bg: 'bg-orange-500' },
    };
    const c = colorClasses[color] || colorClasses.blue;
    
    const isMoving = status === 'DISPATCHED' || status === 'EN_ROUTE' || status === 'ACTIVE';

    const iconHtml = `
        <div class="relative w-10 h-10 flex items-center justify-center">
            <div class="absolute inset-0 ${c.bg} opacity-20 rounded-full ${isMoving ? 'animate-ping' : 'animate-pulse'}"></div>
            <div class="relative w-8 h-8 ${c.bg} rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg overflow-hidden ${isMoving ? 'scale-110 drop-shadow-xl' : ''}">
                <span class="material-symbols-outlined text-[18px]">
                    ${type === 'INCIDENT' ? 'emergency' : type === 'AMBULANCE' ? 'ambulance' : type === 'POLICE' ? 'local_police' : 'fire_truck'}
                </span>
            </div>
            ${isMoving ? `<div class="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border border-white rounded-full"></div>` : ''}
        </div>
    `;
    
    return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon tracking-icon-animated',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

// Component to handle auto-fitting the bounds of the map to markers
const SetBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers && markers.length > 0) {
            const group = new L.featureGroup(
                markers.map(m => L.marker([m.lat, m.lng]))
            );
            map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 15 });
        }
    }, [markers, map]);
    return null;
};

const LiveMap = ({ markers = [], center = [5.6037, -0.1870], className = "" }) => {
    return (
        <div className={`relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 ${className}`}>
            <style>
                {`
                /* Smoothly animate markers as they change positions */
                .tracking-icon-animated {
                    transition: transform 1.5s linear !important;
                }
                `}
            </style>
            <MapContainer 
                center={center} 
                zoom={13} 
                scrollWheelZoom={true}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {markers.map((marker, idx) => (
                    <Marker 
                        key={marker.id || idx} 
                        position={[marker.lat, marker.lng]}
                        icon={getIcon(marker.type || 'INCIDENT', marker.color || 'blue', marker.status)}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2 min-w-[150px]">
                                <h4 className="font-bold text-sm mb-1">{marker.title}</h4>
                                <p className="text-xs text-slate-500 mb-2">{marker.description}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase text-white ${marker.color === 'teal' ? 'bg-teal-500' : marker.color === 'rose' ? 'bg-rose-500' : marker.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                        {marker.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                
                {markers.length > 0 && <SetBounds markers={markers} />}
            </MapContainer>
            
            {/* Map Overlay for controls or legends */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl opacity-90">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Live Feed Nodes</p>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Incidents</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,26,127,0.5)]"></div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Fleet Units</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMap;
