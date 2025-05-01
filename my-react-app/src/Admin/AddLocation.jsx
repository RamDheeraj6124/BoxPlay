import React, { useEffect, useState, useRef } from "react";
import "./AddLocation.css";


const AddLocation = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const effectRan = useRef(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/getstateslist`);
        const data = await res.json();
        setStates(data.states);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };

    const fetchCities = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/getcitieslist`);
        const data = await res.json();
        setCities(data.cities);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    if (!effectRan.current) {
      fetchStates();
      fetchCities();
      effectRan.current = true;
    }

    return () => {
      effectRan.current = true; 
    };
  }, []);

  const addToStates = async (e) => {
    e.preventDefault();
    const stateName = e.target.state.value.trim();

    if (!stateName) {
      alert("State name cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/addstate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: stateName })
      });

      if (res.ok) {
        const newState = await res.json();
        setStates(prevStates => [...prevStates, newState.state]);
        alert("State added successfully");
        e.target.state.value = ''; // Clear input field
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error("Error adding state:", err);
    }
  };

  const addToCities = async (e) => {
    e.preventDefault();
    const cityName = e.target.city.value.trim();

    if (!selectedState) {
      alert("Please select a state.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/addcity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cityName, stateId: selectedState })
      });

      if (res.ok) {
        const newCity = await res.json();
        setCities(prevCities => [...prevCities, newCity.city]);
        alert("City added successfully");
        e.target.city.value = ''; // Clear input field
        setSelectedState(''); // Reset state selection
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error("Error adding city:", err);
    }
  };

  return (
    <div id="al-container">
      <h1>Add State</h1>
      <form onSubmit={addToStates}>
        <label>State:</label>
        <input type="text" name="state" placeholder="Enter state name" required />
        <button type="submit">Add State</button>
      </form>

      <h1>Add City</h1>
      <form onSubmit={addToCities}>
        <label>City:</label>
        <input type="text" name="city" placeholder="Enter city name" required />

        <label>Select State:</label>
        <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} required>
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state._id} value={state._id}>
              {state.name}
            </option>
          ))}
        </select>
        <button type="submit">Add City</button>
      </form>

      <h1>Existing Locations</h1>
      <ul>
        {states.map((state) => (
          <li key={state._id}>
            <h3>{state.name}</h3>
            <ul>
              {cities
                .filter((city) => city.state === state._id)
                .map((city) => (
                  <li key={city._id}>{city.name}</li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddLocation;