import React, { useEffect, useState, useRef } from "react";
import "./AddLocation.css";

const AddLocation = () => {
  const [locations, setLocations] = useState([]); // Store list of locations
  const effectRan = useRef(false);

  useEffect(() => {
    const getLocations = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/getlocationslist", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setLocations(data.locationslist || []); // Set locations list from response
      } catch (err) {
        console.log("Error fetching locations:", err);
      }
    };

    if (!effectRan.current) {
      getLocations();
      effectRan.current = true;
    }

    return () => {
      effectRan.current = true; // Cleanup
    };
  }, []);

  const addToLocations = async (e) => {
    e.preventDefault();

    const form = e.target;
    const city = form.city.value;
    const state = form.state.value;

    const locationData = { city, state };

    try {
      const res = await fetch("http://localhost:5000/admin/addlocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData), // Send JSON-encoded data
      });

      if (res.ok) {
        alert("Location Added Successfully");
        form.reset(); // Reset form fields
        setLocations((prev) => [...prev, locationData]); // Update local state
      } else {
        alert("Failed to Add Location");
      }
    } catch (err) {
      console.log("Error adding location:", err);
    }
  };

  return (
    <div id="al-container">
      <h1 id="al-title">Add Location</h1>
      <form id="al-form" onSubmit={addToLocations}>
        <label htmlFor="al-city">City:</label>
        <input
          type="text"
          id="al-city"
          name="city"
          placeholder="Enter the city name"
          required
        />

        <label htmlFor="al-state">State:</label>
        <input
          type="text"
          id="al-state"
          name="state"
          placeholder="Enter the state name"
          required
        />

        <button type="submit" id="al-submit-button">Add Location</button>
      </form>

      <h1 id="al-existing-title">Existing Locations</h1>
      {locations.length > 0 ? (
        <ul id="al-list">
          {locations.map((location, index) => (
            <li key={index} id={`al-location-${index}`}>
              <h3 id={`al-city-name-${index}`}>City: {location.city}</h3>
              <h3 id={`al-state-name-${index}`}>State: {location.state}</h3>
            </li>
          ))}
        </ul>
      ) : (
        <p id="al-no-locations-message">No Locations have been added yet</p>
      )}
    </div>
  );
};

export default AddLocation;
