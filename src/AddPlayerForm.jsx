import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Import Supabase client

// Accept onPlayerAdded prop function to notify App when a player is added
function AddPlayerForm({ onPlayerAdded }) {
  // State for form inputs
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [playerElo, setPlayerElo] = useState(''); // Optional, starting Elo

  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // To show success/error messages

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default page reload on form submit
    setMessage(''); // Clear previous messages

    if (!playerName.trim()) {
      setMessage('Player name is required.');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for Supabase
      const playerData = {
        name: playerName.trim(),
        // Add email only if provided
        ...(playerEmail.trim() && { email: playerEmail.trim() }),
        // Add elo only if provided and is a valid number, otherwise default (e.g., 1200)
        elo: playerElo && !isNaN(parseInt(playerElo, 10)) ? parseInt(playerElo, 10) : 1200,
        // You might want to add defaults for other fields like is_active: true here
        is_active: true,
        // games_played, wins, losses, draws usually start at 0
        games_played: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        // joined_date could be set automatically by Supabase (using default now()) or here
      };

      // Insert data into the 'players' table
      // Make sure you have INSERT RLS policy enabled for 'anon' role on 'players' table
      const { data, error } = await supabase
        .from('players')
        .insert([playerData]) // insert expects an array of objects
        .select(); // Optionally select the inserted data back

      if (error) {
        throw error; // Throw error to the catch block
      }

      // If successful:
      setMessage(`Player "${playerName}" added successfully!`);
      setPlayerName(''); // Clear form fields
      setPlayerEmail('');
      setPlayerElo('');

      // --- IMPORTANT ---
      // Call the function passed down from App to trigger a refresh of the player list
      if (onPlayerAdded) {
        onPlayerAdded();
      }
      // ---------------

    } catch (error) {
      console.error('Error adding player:', error);
      setMessage(`Failed to add player: ${error.message}`);
    } finally {
      setLoading(false); // Set loading to false whether success or error
    }
  };

  // Render the form
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '30px', backgroundColor: '#f9f9f9' }}>
      <h2>Add New Player</h2>
      <form onSubmit={handleSubmit}>
        {/* Player Name Input */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="playerName" style={{ marginRight: '10px' }}>Name:* </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required // Basic HTML5 validation
            disabled={loading} // Disable input while loading
          />
        </div>

        {/* Player Email Input */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="playerEmail" style={{ marginRight: '10px' }}>Email: </label>
          <input
            type="email"
            id="playerEmail"
            value={playerEmail}
            onChange={(e) => setPlayerEmail(e.target.value)}
            disabled={loading}
          />
        </div>

         {/* Player Elo Input */}
         <div style={{ marginBottom: '15px' }}>
          <label htmlFor="playerElo" style={{ marginRight: '10px' }}>Starting Elo (optional, default 1200): </label>
          <input
            type="number"
            id="playerElo"
            value={playerElo}
            placeholder="1200"
            onChange={(e) => setPlayerElo(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Player'}
        </button>
      </form>

      {/* Display Success/Error Messages */}
      {message && (
        <p style={{ marginTop: '15px', color: message.startsWith('Failed') ? 'red' : 'green' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AddPlayerForm;