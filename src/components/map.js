import React, { useCallback, useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

const MAP_API_KEY = ""; // Replace with a valid API key

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const center = {
  lat: 40.7128,
  lng: -74.006,
};

const Map = () => {
  const [accessibleLocations, setAccessibleLocations] = useState([]);
  const [map, setMap] = useState(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onMapClick = (event) => {
    if (event.latLng)
      placeMarker({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  };

  const placeMarker = (location) => {
    if (!startMarker) {
      setStartMarker(location);
    } else if (!endMarker) {
      setEndMarker(location);
    } else {
      setEndMarker(location);
    }
  };

  const calculateRoute = () => {
    if (!startMarker || !endMarker) {
      alert("Please select both a starting and an ending location.");
      return;
    }
    setDirections({
      origin: startMarker,
      destination: endMarker,
      travelMode: "WALKING",
    });
  };

  useEffect(() => {
    if (!map) return;

    const placesService = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const request = {
      location: center,
      radius: 15000,
      keyword: "accessible restroom, ramp, entrance",
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setAccessibleLocations(results);
      } else {
        console.error("Error fetching accessible locations:", status);
      }
    });
  }, [map]);

  return (
    <LoadScript
      googleMapsApiKey={MAP_API_KEY}
      libraries={["places", "directions"]}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onClick={onMapClick}
      >
        {startMarker && <Marker position={startMarker} label="Start" />}
        {endMarker && <Marker position={endMarker} label="End" />}
        {accessibleLocations.map((location) => (
          <Marker
            key={location.place_id}
            position={{
              lat: location.geometry.location.lat(),
              lng: location.geometry.location.lng(),
            }}
            label={location.name}
          />
        ))}
        {directions && (
          <DirectionsService
            options={directions}
            callback={(result, status) => {
              if (status === "OK") {
                setDirectionsResponse(result);
              } else {
                console.error("Directions request failed due to ", status);
              }
            }}
          />
        )}
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}
      </GoogleMap>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button onClick={calculateRoute}>Get Directions</button>
      </div>
    </LoadScript>
  );
};

export default Map;
