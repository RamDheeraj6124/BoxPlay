import React, { useState, useEffect, useRef } from 'react';
import './ShopDashboard.css';
import { Pie } from "react-chartjs-2"; 
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'; 
import { useNavigate } from 'react-router-dom';
ChartJS.register(ArcElement, Tooltip, Legend);

const ShopDashboard = () => {
  const effectRan = useRef(false);
  const [state, setState] = useState({});
  const [daysPerWeek, setDaysPerWeek] = useState(0);
  const [daysArray, setDaysArray] = useState([]);
  const [timesArray, setTimesArray] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [groundRevenue, setGroundRevenue] = useState([]);
  const navigate = useNavigate();
  const [sportlist, getSportsList] = useState([]);
  const effectRan1 = useRef(false);
  const [city, setCity] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSports = async () => { 
      try { 
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/getsportslist`, { 
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        getSportsList(data.sportslist);
      } catch (err) {
        console.log(err);
      }
    };
  
    const checkShopSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/checkshopsession`, {
          credentials: 'include'
        });
  
        if (!response.ok) {
          navigate('/shoplogin');
        } else {
          const data = await response.json();
          console.log('Shop Data:', data);
          setState(data.shop);
          setCity(data.shop.city);
          setGrounds(data.shop.availablesports || []);
        }
  
        const revenueresponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/checkrevenue`, {
          method: 'GET',
          credentials: 'include'
        });
  
        if (revenueresponse.ok) {
          const revenueData = await revenueresponse.json();
          console.log(revenueData); 
          setGroundRevenue(revenueData.groundRevenues);
        } else {
          throw new Error("Expected JSON, but received: ");
        }
  
        if (city !== null) {
          const getcitieslist = await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/getcitieslist`, {
            method: 'GET',
            credentials: 'include'
          });
  
          if (getcitieslist.ok) {
            const data = await getcitieslist.json();
            setCities(data.cities);
          }                  
        }
  
      } catch (error) {
        console.error('Error fetching shop session:', error);
        alert('An error occurred while fetching shop session.');
      }finally{
        setLoading(false);
      }
    };
  
    if (!effectRan.current) {
      // Run both functions once
      getSports();
      checkShopSession();
      effectRan.current = true;
    }
  
    return () => {
      effectRan.current = false;
    };
  }, [navigate]);
  

const updatesubmit = async (e) => {
  e.preventDefault();
  const { shopname, address, cityobject,locationlink } = e.target.elements;

  try {
    const cityData = JSON.parse(cityobject.value);

    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/updateshop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shopname: shopname.value,
        address: address.value,
        cityobject: cityData,
        locationlink: locationlink.value
      }),
      credentials: 'include'
    });

    if (response.ok) {
      setState(prevState => ({
        ...prevState,
        shopname: shopname.value,
        address: address.value,
        city: cityData,
        locationlink: locationlink.value
      }));
      alert('Shop details updated successfully');
    } else {
      const error = await response.json();
      alert(`Update failed: ${error.msg}`);
    }
  } catch (error) {
    console.error('Error updating shop details:', error);
    alert('An error occurred while updating shop details.');
  }
};

  const handleDaysPerWeekChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) {
      value = 0;
    }
    if (value > 7) {
      value = 7;
    }
    setDaysPerWeek(value);
    setDaysArray(Array(value).fill(''));
    setTimesArray(Array(value).fill({ start: '', end: '' }));
  };

  const handleDayChange = (index, value) => {
    const updatedDays = [...daysArray];
    updatedDays[index] = value;
    setDaysArray(updatedDays);
  };

  const handleTimeChange = (index, type, value) => {
    const updatedTimes = [...timesArray];
    updatedTimes[index] = { ...updatedTimes[index], [type]: value };
    setTimesArray(updatedTimes);
  };

  const generateDayOptions = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map((day, index) => (
      <option key={index} value={day}>
        {day}
      </option>
    ));
  };
  const addGround = async (e) => {
    e.preventDefault();
    const form = e.target;
  
    // Prepare availability data
    const availability = daysArray.map((day, index) => ({
      day,
      times: [{ start: timesArray[index].start, end: timesArray[index].end }]
    }));
    const formData = new FormData(form);
    formData.append('availability', JSON.stringify(availability));
    const newGround = {
      sport: { name: form.selectsport.value },
      groundname: form.groundname.value,
      priceperhour: form.priceperhour.value,
      maxplayers: form.maxplayers.value,
      grounddimensions: {
        length: form.groundLength.value,
        width: form.groundwidth.value
      },
      facilities: form.facilities.value.split(',').map(facility => facility.trim()),
      surfacetype: form.surfaceType.value,
      availability: availability,
      status: 'Active',
      verify: false,
      appliedforverification: false
    };
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/addground`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
  
      if (response.ok) {
        // Handle image upload to display
        const imageFile = form.image.files[0];
        if (imageFile) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newGround.image = reader.result;
            newGround.getimage = reader.result;
  
            setGrounds(prevGrounds => {
              const updatedGrounds = [...prevGrounds, newGround];
              
              setState(prevState => ({
                ...prevState,
                availablesports: updatedGrounds
              }));
  
              return updatedGrounds;
            });
          };
          reader.readAsDataURL(imageFile);
        } else {
          // No image scenario
          setGrounds(prevGrounds => {
            const updatedGrounds = [...prevGrounds, newGround];
            
            setState(prevState => ({
              ...prevState,
              availablesports: updatedGrounds
            }));
  
            return updatedGrounds;
          });
        }
  
        // Reset form
        form.reset();
        setDaysPerWeek(0);
        setDaysArray([]);
        setTimesArray([]);
  
        alert('Ground added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error adding ground: ${errorData.msg || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding ground:', error);
      alert('An error occurred while adding the ground.');
    }
  };

  const applyingforverification = async (groundname) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/applyforverification`, {
        method: 'POST',
        body: JSON.stringify({ groundname }),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Applied Successfully');

        setGrounds(prevGrounds => 
          prevGrounds.map(ground => 
            ground.groundname === groundname 
              ? { ...ground, appliedforverification: true } 
              : ground
          )
        );
      } else {
        const error = await response.json();
        alert(`Failed to apply for verification: ${error.msg}`);
      }
    } catch (err) {
      console.log(err);
      alert('An error occurred while applying for verification.');
    }
  };

  const chartData = {
    labels: groundRevenue.map((sport) => sport.groundName),
    datasets: [{
        label: 'Ground Revenue',
        data: groundRevenue.map((sport) => sport.groundFee),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    }],
  };

  const shoplogout = async () => {
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/logout`, { credentials: 'include', method: 'POST' });
    navigate('/');
  };

  return (
    <div className="sd-shop-dashboard">
      <h1 className="sd-title">Shop Dashboard</h1>
      <div className='shophigh'>
        <h3 className="sd-email">Email: {state.email}</h3>
        <h3 className="sd-owner">Owner Name: {state.owner}</h3>
        <span className="logout" onClick={shoplogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </span>
      </div>
      <form className="sd-update-form" onSubmit={updatesubmit}>
        <label className="sd-label" htmlFor="shopname">Shop Name:</label>
        <input
          className="sd-input"
          type="text"
          name="shopname"
          id="shopname"
          placeholder="Shop Name"
          defaultValue={state.shopname}
          required
        />
        <label className="sd-label" htmlFor="address">Address:</label>
        <input
          className="sd-input"
          type="text"
          name="address"
          id="address"
          placeholder="Address"
          defaultValue={state.address}
          required
        />
        {cities.length > 0 ? (
          <>
          <label className="sd-label" htmlFor="city">City:</label>
          <select 
            className="sd-select" 
            name="cityobject" 
            id="city" 
            defaultValue={city && city.name && city.state ? `${city.name}, ${city.state.name}` : ''}  
            required
          >
            {cities.map((cityItem) => (
              <option 
                key={`${cityItem.name}-${cityItem.state?.name}`} 
                value={JSON.stringify(cityItem)}
              >
                {`${cityItem.name}, ${cityItem.state?.name || 'Unknown State'}`}
              </option>
            ))}
          </select>
          </>
        ) : (
          <p>No cities available</p>
        )}
          <div className="sd-location-link">
            <label className="sd-label" htmlFor="locationlink">Google Location Link:</label>
            <input
              className="sd-input"
              type="text"
              name="locationlink"
              id="locationlink"
              placeholder="Google Location Link"
              defaultValue={state?.locationlink}
              required
            />
          </div>

        <button className="sd-button" type="submit">Update Shop Details</button>
      </form>

      <form className="sd-add-ground-form" onSubmit={addGround}>
        <h2 className="sd-subtitle">Add Ground</h2>
        <label className="sd-label" htmlFor="selectsport">Select a sport:</label>
        <select className="sd-select" name="selectsport" id="selectsport">
          {sportlist.length > 0 ? (
            sportlist.map((sport) => (
              <option key={sport.name} value={sport.name}>{sport.name}</option>
            ))
          ) : (
            <option>No sports</option>
          )}
        </select>
        <label className="sd-label" htmlFor="groundname">Ground Name:</label>
        <input className="sd-input" type="text" name="groundname" id="groundname" placeholder="Ground Name" required />
        <label className="sd-label" htmlFor="priceperhour">Price Per Hour:</label>
        <input className="sd-input" type="number" name="priceperhour" id="priceperhour" placeholder="Price Per Hour" required />

        <label className="sd-label" htmlFor="maxplayers">Maximum Number of Players:</label>
        <input className="sd-input" type="number" name="maxplayers" id="maxplayers" placeholder="Maximum Number Of Players" required />

        <label className="sd-label" htmlFor="groundLength">Ground Length (meters):</label>
        <input className="sd-input" type="number" name="groundLength" id="groundLength" placeholder="Ground Length (meters)" required />

        <label className="sd-label" htmlFor="groundwidth">Ground Width (meters):</label>
        <input className="sd-input" type="number" name="groundwidth" id="groundwidth" placeholder="Ground Width (meters)" required />

        <label className="sd-label" htmlFor="facilities">Facilities Available:</label>
        <input className="sd-input" type="text" name="facilities" id="facilities" placeholder="Facilities Available" required />
        <label className="sd-label" htmlFor="surfaceType">Surface Type:</label>
        <select className="sd-select" name="surfaceType" id="surfaceType" required>
          <option value="Grass">Grass</option>
          <option value="Turf">Turf</option>
          <option value="Clay">Clay</option>
          <option value="Hard">Hard</option>
          <option value="Synthetic">Synthetic</option>
        </select>

        <label className="sd-label" htmlFor="image">Upload Ground Image:</label>
        <input className="sd-input" type="file" name="image" id="image" accept="image/*" required />

        <label className="sd-label" htmlFor="daysperweek">Days Available Per Week:</label>
        <input
          className="sd-input"
          type="number"
          name="daysperweek"
          id="daysperweek"
          placeholder="Days Per Week"
          required
          value={daysPerWeek}
          onChange={handleDaysPerWeekChange}
        />

{daysPerWeek && Array.from({ length: daysPerWeek }).map((_, index) => (
  <div key={index} className="sd-day-container">
    <label className="sd-label" htmlFor={`day-${index}`}>Day:</label>
    <select
      className="sd-select"
      name={`day-${index}`}
      id={`day-${index}`}
      value={daysArray[index] || ''}
      onChange={(e) => handleDayChange(index, e.target.value)}
      required
    >
      <option value="" disabled>Select Day</option>
      {generateDayOptions()}
    </select>
    
    <label className="sd-label" htmlFor={`start-time-${index}`}>Start Time:</label>
    <input
      className="sd-input"
      type="time"
      name={`start-time-${index}`}
      id={`start-time-${index}`}
      value={timesArray[index]?.start || ''}
      onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
      required
    />
    
    <label className="sd-label" htmlFor={`end-time-${index}`}>End Time:</label>
    <input
      className="sd-input"
      type="time"
      name={`end-time-${index}`}
      id={`end-time-${index}`}
      value={timesArray[index]?.end || ''}
      onChange={(e) => handleTimeChange(index, 'end', e.target.value)}  
      required
    />
  </div>
   ))}

        {daysPerWeek > 0 ? (
          <button className="sd-button" type="submit">Add Ground</button>
        ):(<p>Please select at least one day to add a ground</p>)
          
        }

      </form>

      <div className="sd-pie-chart">
        <h1>Shop's Revenue</h1>
        <Pie data={chartData} />
      </div>

      <ul className="sd-grounds-list">
        {Array.isArray(grounds) && grounds.length > 0 ? (
          grounds.map((ground, index) => (
            <li key={index} className="sd-ground-item">
              <h3>{ground.groundname || 'Unnamed Ground'}</h3>
              <p>Sport: {ground.sport?.name || 'Not Specified'}</p>
              <p>Price Per Hour: {ground.priceperhour}</p>
              <p>Max Players: {ground.maxplayers}</p>
              <p>Ground Dimensions: {ground.grounddimensions?.length || 'N/A'} x {ground.grounddimensions?.width || 'N/A'} meters</p>
              <p>Facilities: {ground.facilities ? ground.facilities.join(', ') : 'No facilities listed'}</p>
              <p>Surface Type: {ground.surfacetype}</p>
              <img
                src={ground.getimage || ground.image || 'default-image-path.jpg'} 
                alt={ground.groundname || 'Ground'}
                className="sd-ground-image"
              />
              <p>Status: {ground.status}</p>
              <p>Verification: {ground.verify ? 'Verified' : 'Not Verified'}</p>
              <p>Applied For Verification: {ground.appliedforverification ? 'Applied' : 'Not Applied'}</p>
              {!ground.verify && !ground.appliedforverification && (
                <button onClick={() => applyingforverification(ground.groundname)}>
                  Apply for Verification
                </button>
              )}
            </li>
          ))
        ) : (
          <li>No grounds available</li>
        )}
      </ul>
    </div>
  );
};

export default ShopDashboard;