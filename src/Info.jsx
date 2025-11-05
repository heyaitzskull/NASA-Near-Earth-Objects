import { useLocation } from "react-router";

function InfoPage() {
  const location = useLocation();
  const { neo } = location.state;

  if (!neo) {
    return <p>No asteroid selected. Go back to the dashboard.</p>;
  }

  return (
    <div>
      <h1>Info: {neo.name}</h1>
      <p>
        <strong>Hazardous:</strong>{" "}
        {neo.is_potentially_hazardous_asteroid ? "Yes" : "No"}
      </p>
      <p>
        <strong>Approach Date:</strong>{" "}
        {neo.close_approach_data[0]?.close_approach_date_full}
      </p>
      <p>
        <strong>Miss Distance (km):</strong>{" "}
        {parseFloat(neo.close_approach_data[0]?.miss_distance.kilometers).toFixed(0)}
      </p>
      <p>
        <strong>Velocity (km/s):</strong>{" "}
        {parseFloat(
          neo.close_approach_data[0]?.relative_velocity.kilometers_per_second
        ).toFixed(2)}
      </p>
      {/* you can add more details here if you want */}
    </div>
  );
}

export default InfoPage;
