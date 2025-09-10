import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        setPosition(marker.getLatLng());
      }
    },
  };

  return (
    <Marker
      draggable={true}
      position={position}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
}

function ClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
}

export default function MapLocationPicker({ 
  onLocationSelect,
  initialPosition = [26.8467, 80.9462] // Default to Lucknow
}) {
  const [position, setPosition] = useState({
    lat: initialPosition[0],
    lng: initialPosition[1]
  });
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinCode, setPinCode] = useState('');

  // Reverse geocode to get address from coordinates
  const fetchAddress = async (lat, lng) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      const displayName = data.display_name || '';
      setAddress(displayName);
      
      // Extract pin code if available
      const extractedPinCode = data.address?.postcode || '';
      setPinCode(extractedPinCode);
      
      // Return full address details
      return {
        fullAddress: displayName,
        pinCode: extractedPinCode,
        addressComponents: data.address
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress('');
      setPinCode('');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const addressData = await fetchAddress(position.lat, position.lng);
      if (addressData && onLocationSelect) {
        onLocationSelect({
          lat: position.lat,
          lng: position.lng,
          address: addressData.fullAddress,
          pinCode: addressData.pinCode,
          addressData: addressData.addressComponents
        });
      }
    };
    loadInitialData();
  }, []);

  const handlePositionChange = async (newPosition) => {
    setPosition(newPosition);
    const addressData = await fetchAddress(newPosition.lat, newPosition.lng);
    
    if (onLocationSelect && addressData) {
      onLocationSelect({
        lat: newPosition.lat,
        lng: newPosition.lng,
        address: addressData.fullAddress,
        pinCode: addressData.pinCode,
        addressData: addressData.addressComponents
      });
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Getting your current location...");
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        
        toast.success("Location found!");
        handlePositionChange(newPos);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Could not get your current location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please enable it in your browser settings.";
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Use My Current Location
        </button>
        
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading address...
            </span>
          ) : address ? (
            <span>{address}</span>
          ) : (
            <span>Select a location on the map</span>
          )}
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler setPosition={handlePositionChange} />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>

      {/* <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">
            Latitude
          </label>
          <input
            type="text"
            value={position.lat.toFixed(6)}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">
            Longitude
          </label>
          <input
            type="text"
            value={position.lng.toFixed(6)}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div> */}
      
      {/* Debug output - you can remove this in production */}
      {/* <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-2">Location Data (debug):</h3>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify({
            coordinates: { lat: position.lat, lng: position.lng },
            address,
            pinCode,
            loading
          }, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}