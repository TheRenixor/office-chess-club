import { useState, useEffect } from 'react';
import './App.css'; // Basic styling
import { supabase } from './supabaseClient'; // Import the client

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect runs code after the component mounts (displays)
  useEffect(() => {
    // Define an async function to fetch data
    async function fetchPlayers() {
      setLoading(true);
      setError(null); // Reset error on new fetch

      try {
        // Use the supabase client to fetch data
        // Make sure you enabled RLS and have a SELECT policy on 'players' for 'anon' role
        let { data, error: fetchError } = await supabase
          .from('players') // Select the 'players' table
          .select('id, name, elo, games_played, wins, losses, draws') // Specify columns you want
          .order('elo', { ascending: false }); // Order by Elo, highest first

        if (fetchError) {
          // If Supabase returned an error, throw it to the catch block
          throw fetchError;
        }

        // If data is successfully fetched, update the state
        setPlayers(data || []); // Use data or an empty array if data is null

      } catch (err) {
        // Catch any errors during the fetch process
        console.error("Error fetching players:", err);
        // Set a user-friendly error message
        setError(`Failed to load players: ${err.message}. Check RLS policies.`);
      } finally {
        // This runs whether fetch succeeded or failed
        setLoading(false); // Set loading to false
      }
    }

    // Call the function to fetch players
    fetchPlayers();

  }, []); // The empty array [] means this effect runs only once when the component first loads

  // --- Render the UI ---
  return (
    <div className="App">
      <h1>Office Chess Club Leaderboard</h1>

      {/* Show loading message */}
      {loading && <p>Loading players...</p>}

      {/* Show error message if fetch failed */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show player list if not loading and no error */}
      {!loading && !error && (
        <table border="1" style={{ width: '80%', margin: '20px auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Elo</th>
              <th>Played</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Draws</th>
            </tr>
          </thead>
          <tbody>
            {players.length > 0 ? (
              players.map((player, index) => (
                <tr key={player.id}>
                  <td>{index + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.elo ?? 'N/A'}</td>
                  <td>{player.games_played ?? 0}</td>
                  <td>{player.wins ?? 0}</td>
                  <td>{player.losses ?? 0}</td>
                  <td>{player.draws ?? 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No players found. Add some to Supabase!</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* TODO: Add forms for adding players and matches later */}
      <div style={{ marginTop: '30px' }}>
         <h2>Future Features</h2>
         <p>(Add components for these later)</p>
         <ul>
            <li>Add New Player Form</li>
            <li>Submit Match Result Form</li>
            <li>View Tournaments</li>
         </ul>
      </div>
    </div>
  );
}

export default App;