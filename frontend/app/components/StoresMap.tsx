import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Calculate distance between two coordinates using Haversine formula (returns km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Custom marker icon for user stores (green)
const userStoreIcon = new L.DivIcon({
  html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <svg style="width: 16px; height: 16px; transform: rotate(45deg); fill: white;" viewBox="0 0 24 24">
      <path d="M20,6h-2.18c0.11-0.31,0.18-0.65,0.18-1c0-1.66-1.34-3-3-3s-3,1.34-3,3h-2c0-1.66-1.34-3-3-3S4,3.34,4,5 c0,0.35,0.07,0.69,0.18,1H2C0.89,6,0,6.89,0,8v12c0,1.1,0.89,2,2,2h18c1.1,0,2-0.9,2-2V8C22,6.89,21.11,6,20,6z"/>
    </svg>
  </div>`,
  className: 'custom-marker-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Default marker for nearby stores (blue-gray)
const nearbyStoreIcon = new L.DivIcon({
  html: `<div style="background-color: #6b7280; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <svg style="width: 12px; height: 12px; transform: rotate(45deg); fill: white;" viewBox="0 0 24 24">
      <path d="M20,6h-2.18c0.11-0.31,0.18-0.65,0.18-1c0-1.66-1.34-3-3-3s-3,1.34-3,3h-2c0-1.66-1.34-3-3-3S4,3.34,4,5 c0,0.35,0.07,0.69,0.18,1H2C0.89,6,0,6.89,0,8v12c0,1.1,0.89,2,2,2h18c1.1,0,2-0.9,2-2V8C22,6.89,21.11,6,20,6z"/>
    </svg>
  </div>`,
  className: 'custom-marker-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

interface Store {
  id: string;
  storeName: string;
  ownerName: string;
  address: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

interface StoresMapProps {
  stores: Store[];
  onMarkerClick?: (storeId: string) => void;
}

interface NearbyStore {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
}

// Sample nearby stores (you can replace this with actual API calls)
const NEARBY_STORES: NearbyStore[] = [
  { id: "nearby-1", name: "7-Eleven Ermita", lat: 14.5875, lon: 120.9783, type: "convenience" },
  { id: "nearby-2", name: "Ministop Manila", lat: 14.5925, lon: 120.9890, type: "convenience" },
  { id: "nearby-3", name: "FamilyMart Malate", lat: 14.5765, lon: 120.9915, type: "convenience" },
  { id: "nearby-4", name: "Alfamart Paco", lat: 14.5845, lon: 121.0010, type: "grocery" },
  { id: "nearby-5", name: "Puregold Jr. Manila", lat: 14.6025, lon: 120.9965, type: "grocery" },
  { id: "nearby-6", name: "Sari-Sari Store", lat: 14.5950, lon: 120.9755, type: "sari-sari" },
  { id: "nearby-7", name: "SM Savemore Market", lat: 14.6105, lon: 120.9920, type: "grocery" },
  { id: "nearby-8", name: "Robinsons Supermarket", lat: 14.5955, lon: 121.0015, type: "grocery" },
  { id: "nearby-9", name: "Mercury Drug", lat: 14.5890, lon: 120.9835, type: "pharmacy" },
  { id: "nearby-10", name: "Watsons", lat: 14.6000, lon: 120.9900, type: "pharmacy" },
  // Quezon City area
  { id: "nearby-11", name: "7-Eleven QC", lat: 14.6685, lon: 121.0395, type: "convenience" },
  { id: "nearby-12", name: "Ministop Quezon Ave", lat: 14.6710, lon: 121.0460, type: "convenience" },
  { id: "nearby-13", name: "Puregold Kamuning", lat: 14.6625, lon: 121.0335, type: "grocery" },
  { id: "nearby-14", name: "Alfamart Roces", lat: 14.6720, lon: 121.0385, type: "grocery" },
  { id: "nearby-15", name: "Sari-Sari Store QC", lat: 14.6800, lon: 121.0500, type: "sari-sari" },
];

// Component to fit map bounds to all markers
function MapBounds({ stores, nearbyStores }: { stores: Store[]; nearbyStores: NearbyStore[] }) {
  const map = useMap();

  useEffect(() => {
    const storesWithCoords = stores.filter((s) => s.latitude && s.longitude);
    
    if (storesWithCoords.length > 0) {
      // Include both user stores and nearby stores in bounds
      const allPoints = [
        ...storesWithCoords.map((s) => [s.latitude!, s.longitude!] as [number, number]),
        ...nearbyStores.map((s) => [s.lat, s.lon] as [number, number])
      ];
      
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [stores, nearbyStores, map]);

  return null;
}

export default function StoresMap({ stores, onMarkerClick }: StoresMapProps) {
  const [showNearbyStores, setShowNearbyStores] = useState(true);
  const storesWithCoords = stores.filter((s) => s.latitude && s.longitude);

  // Default center (Philippines - Manila)
  const defaultCenter: [number, number] = [14.5995, 120.9842];
  const defaultZoom = 11;

  // Calculate center point from user stores or use default
  const centerPoint: [number, number] = useMemo(() => {
    if (storesWithCoords.length === 0) return defaultCenter;
    
    const avgLat = storesWithCoords.reduce((sum, s) => sum + s.latitude!, 0) / storesWithCoords.length;
    const avgLon = storesWithCoords.reduce((sum, s) => sum + s.longitude!, 0) / storesWithCoords.length;
    return [avgLat, avgLon];
  }, [storesWithCoords]);

  // Filter nearby stores to only show those within 5km of center point
  const nearbyStoresWithin5km = useMemo(() => {
    return NEARBY_STORES.filter((store) => {
      const distance = calculateDistance(centerPoint[0], centerPoint[1], store.lat, store.lon);
      return distance <= 5;
    });
  }, [centerPoint]);

  if (storesWithCoords.length === 0 && !showNearbyStores) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No stores with location data available</p>
          <p className="text-sm text-gray-500 mt-1">Store owners can add coordinates when creating their store</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Map Controls */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-sm text-gray-300">Your Stores ({storesWithCoords.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-sm text-gray-400">Nearby Stores (within 5km)</span>
          </div>
        </div>
        <button
          onClick={() => setShowNearbyStores(!showNearbyStores)}
          className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        >
          {showNearbyStores ? "Hide Nearby" : "Show Nearby"} {nearbyStoresWithin5km.length > 0 && `(${nearbyStoresWithin5km.length})`}
        </button>
      </div>

      <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
          
          <MapBounds stores={storesWithCoords} nearbyStores={showNearbyStores ? nearbyStoresWithin5km : []} />

          {/* User's stores with custom green markers and tooltips */}
          {storesWithCoords.map((store) => (
            <Marker
              key={store.id}
              position={[store.latitude!, store.longitude!]}
              icon={userStoreIcon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(store.id);
                  }
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -20]} permanent className="store-tooltip">
                <span className="font-semibold text-emerald-700">{store.storeName}</span>
              </Tooltip>
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">YOUR STORE</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{store.storeName}</h3>
                  <p className="text-sm text-gray-600 mb-1">by {store.ownerName}</p>
                  {store.address && (
                    <p className="text-xs text-gray-500 mb-2">📍 {store.address}</p>
                  )}
                  {store.description && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{store.description}</p>
                  )}
                  <a
                    href={`/store/${store.id}`}
                    className="text-sm text-emerald-600 hover:underline font-medium"
                  >
                    View Products →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Nearby stores with default markers (no permanent labels) - filtered within 5km */}
          {showNearbyStores && nearbyStoresWithin5km.map((store) => (
            <Marker
              key={store.id}
              position={[store.lat, store.lon]}
              icon={nearbyStoreIcon}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded">NEARBY</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{store.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{store.type.replace("-", " ")}</p>
                  <p className="text-xs text-gray-400 mt-1">Within 5km radius</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
