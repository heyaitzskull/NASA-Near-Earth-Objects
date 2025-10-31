import { useEffect, useState } from 'react';
import './App.css';
//hi

function App() {
  const [data, setData] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [hazardous, setHazardous] = useState('');
  const [searched, setSearched] = useState([]);
  const apiKey = import.meta.env.VITE_API_KEY;

  const options = [
    { value: '', label: 'All' },
    { value: 'hazardous', label: 'Hazardous' },
    { value: 'non-hazardous', label: 'Non-Hazardous' },
  ];

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const allNEOs = [];

      // Fetch ~3 months of data (12 weeks)
      for (let i = 0; i < 12; i++) {
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - i * 7);
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);

        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        const response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${apiKey}`
        );
        const result = await response.json();
        const neos = Object.values(result.near_earth_objects || {}).flat();
        allNEOs.push(...neos);
      }

      setData(allNEOs);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchRecentData = async () => {
    try {
      const today = new Date();
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);

      const startDate = oneWeekAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const response = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`
      );

      const result = await response.json();
      const allNEOs = Object.values(result.near_earth_objects || {}).flat();

      const sortedRecent = allNEOs.sort(
        (a, b) =>
          new Date(b.close_approach_data[0]?.close_approach_date_full) -
          new Date(a.close_approach_data[0]?.close_approach_date_full)
      );

      setRecent(sortedRecent);
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchRecentData();
  }, []);

  const fetchSearchData = (nameParam, hazardParam) => {
    if (!nameParam && !hazardParam) {
      setSearched([]);
      return;
    }

    const filtered = data.filter((neo) => {
      const nameMatch = !nameParam || neo.name.toLowerCase().includes(nameParam.toLowerCase());
      const hazardMatch =
        !hazardParam ||
        (hazardParam === 'hazardous' && neo.is_potentially_hazardous_asteroid) ||
        (hazardParam === 'non-hazardous' && !neo.is_potentially_hazardous_asteroid);

      return nameMatch && hazardMatch;
    });

    setSearched(filtered);
  };

  const totalNEOs = data.length;
  const hazardousCount = data.filter((neo) => neo.is_potentially_hazardous_asteroid).length;
  const closestMissDistance = data.length
    ? Math.min(
        ...data
          .map((neo) => parseFloat(neo.close_approach_data[0]?.miss_distance.kilometers))
          .filter((val) => !isNaN(val))
      ).toFixed(0)
    : 'N/A';

  return (
    <div className="App">
      <h1>NASA Near-Earth Objects Dashboard</h1>

      {/* Summary Stats Section */}
      {!loading && data.length > 0 && (
        <div className="summary-stats">
          <div className="stat-card">
            <h3>Total Objects</h3>
            <p>{totalNEOs.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Hazardous Objects</h3>
            <p>{hazardousCount.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Closest Miss (km)</h3>
            <p>{closestMissDistance.toLocaleString()}</p>
          </div>
        </div>
      )}

      <label>
        Search by Name:{' '}
        <input
          placeholder="ex: 2023 FT5"
          name="searchName"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            fetchSearchData(e.target.value, hazardous);
          }}
        />
      </label>

      <label>
        Filter by Hazardous:{' '}
        <select
          value={hazardous}
          onChange={(e) => {
            setHazardous(e.target.value);
            fetchSearchData(name, e.target.value);
          }}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {loading ? (
        <p>Loading data...</p>
      ) : (name || hazardous) ? (
        searched.length > 0 ? (
          <>
            <h3>Search Results</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Approach Date</th>
                  <th>Miss Distance (km)</th>
                  <th>Velocity (km/s)</th>
                  <th>Hazardous?</th>
                </tr>
              </thead>
              <tbody>
                {searched.map((neo, idx) => (
                  <tr key={idx}>
                    <td>{neo.name}</td>
                    <td>{neo.close_approach_data[0]?.close_approach_date_full}</td>
                    <td>
                      {parseFloat(
                        neo.close_approach_data[0]?.miss_distance.kilometers
                      ).toFixed(0)}
                    </td>
                    <td>
                      {parseFloat(
                        neo.close_approach_data[0]?.relative_velocity.kilometers_per_second
                      ).toFixed(2)}
                    </td>
                    <td>{neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p style={{ marginTop: '20px', fontWeight: 'bold' }}>No matching objects found.</p>
        )
      ) : (
        <>
          <div className="stats">
            <p>Displaying Recent Encounters From Past Week</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Approach Date</th>
                <th>Miss Distance (km)</th>
                <th>Velocity (km/s)</th>
                <th>Hazardous?</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((neo, idx) => (
                <tr key={idx}>
                  <td>{neo.name}</td>
                  <td>{neo.close_approach_data[0]?.close_approach_date_full}</td>
                  <td>
                    {parseFloat(
                      neo.close_approach_data[0]?.miss_distance.kilometers
                    ).toFixed(0)}
                  </td>
                  <td>
                    {parseFloat(
                      neo.close_approach_data[0]?.relative_velocity.kilometers_per_second
                    ).toFixed(2)}
                  </td>
                  <td>{neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
