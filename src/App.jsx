import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import './App.css';
import { supabase } from './supabaseClient';
import AddPlayerForm from './AddPlayerForm'; // <--- 1. IMPORT the new component

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. MOVE fetchPlayers OUTSIDE useEffect and WRAP in useCallback ---
  // useCallback ensures the function identity is stable across re-renders
  // unless its dependencies (empty array here) change.
  const fetchPlayers = useCallback(async () => {
    setLoading(true); // Set loading true at the start of fetch
    setError(null);

    try {
      let { data, error: fetchError } = await supabase
        .from('players')
        .select('id, name, elo, games_played, wins, losses, draws')
        .order('elo', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }
      setPlayers(data || []);
    } catch (err) {
      console.error("Error fetching players:", err);
      setError(`Failed to load players: ${err.message}. Check RLS policies.`);
    } finally {
      setLoading(false); // Set loading false at the end
    }
  }, []); // Empty dependency array means this function is created once

  // --- 3. useEffect now calls the fetchPlayers function ---
  useEffect(() => {
    fetchPlayers(); // Call it on initial component mount
  }, [fetchPlayers]); // Dependency array includes fetchPlayers

  // --- 4. DEFINE the handler function to be passed down ---
  // This function will be called by AddPlayerForm after a successful add
  const handlePlayerAdded = () => {
    setMessageFromForm("Player added! Refreshing list..."); // Optional: show temp message
    fetchPlayers(); // Re-run the fetch function
  };

  // Optional: State to show messages triggered from the form
  const [messageFromForm, setMessageFromForm] = useState('');


  // --- Render the UI ---
  return (
    <div className="App">
      <h1>Office Chess Club Leaderboard</h1>

      {/* Show loading message only when fetching players */}
      {loading && <p>Loading players...</p>}

      {/* Show error message if fetch failed */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Optional: Display messages from child components */}
      {messageFromForm && <p style={{color: 'blue'}}>{messageFromForm}</p>}


      {/* Show player list table */}
      {/* Added !loading check here to prevent brief flash of table during load */}
      {!loading && !error && (
        <table border="1" style={{ width: '80%', margin: '20px auto', borderCollapse: 'collapse' }}>
          {/* ... (thead and tbody remain the same as before) ... */}
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
                <td colSpan="7">No players found. Add some using the form below!</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* --- 5. RENDER the AddPlayerForm component --- */}
      {/* Pass the handlePlayerAdded function as a prop */}
      <AddPlayerForm onPlayerAdded={handlePlayerAdded} />

      {/* Remove the old "Future Features" placeholder if you want */}
      {/* <div style={{ marginTop: '30px' }}> ... </div> */}

    </div>
  );
}

export default App;