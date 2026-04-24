import { useState } from 'react';
import './App.css';

function App() {
  const [inputData, setInputData] = useState('[\n  "A->B", "A->C", "B->D", "C->E", "E->F",\n  "X->Y", "Y->Z", "Z->X",\n  "P->Q", "Q->R",\n  "G->H", "G->H", "G->I",\n  "hello", "1->2", "A->"\n]');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);
      let parsedData;
      
      try {
          parsedData = JSON.parse(inputData);
          if (!Array.isArray(parsedData)) {
             if (parsedData.data && Array.isArray(parsedData.data)) {
                 parsedData = parsedData.data;
             } else {
                 throw new Error("Input must be a JSON array or object with a 'data' array");
             }
          }
      } catch(e) {
          parsedData = inputData.split(/[\n,]/)
            .map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''))
            .filter(s => s.length > 0);
      }
      
      const res = await fetch("http://localhost:3000/bfhl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: parsedData })
      });

      if (!res.ok) {
        throw new Error("API Call failed with status " + res.status);
      }

      const resData = await res.json();
      setResponse(resData);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Node Graph Analyzer</h1>
        <p>Parse hierarchical data and discover hidden trees and cycles.</p>
      </div>

      <div className="input-section">
        <textarea 
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder='Enter JSON array like ["A->B", "A->C"] or comma separated strings...'
        ></textarea>
        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? "Processing..." : "Analyze Nodes"}
        </button>
      </div>

      {error && (
        <div className="error-msg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="results-section">
          <h2>Analysis Results</h2>
          
          <div className="grid">
            <div className="card">
              <h3>User Info</h3>
              <div className="data-row">
                <span className="label">User ID</span>
                <span className="value">{response.user_id}</span>
              </div>
              <div className="data-row">
                <span className="label">Email</span>
                <span className="value">{response.email_id}</span>
              </div>
              <div className="data-row">
                <span className="label">Roll Number</span>
                <span className="value">{response.college_roll_number}</span>
              </div>
            </div>

            <div className="card">
              <h3>Summary</h3>
              <div className="data-row">
                <span className="label">Total Trees</span>
                <span className="value">{response.summary?.total_trees || 0}</span>
              </div>
              <div className="data-row">
                <span className="label">Total Cycles</span>
                <span className="value">{response.summary?.total_cycles || 0}</span>
              </div>
              <div className="data-row">
                <span className="label">Largest Tree Root</span>
                <span className="value">{response.summary?.largest_tree_root || "N/A"}</span>
              </div>
            </div>

            <div className="card">
              <h3>Data Quality</h3>
              <div className="data-row">
                <span className="label">Invalid Entries</span>
                <span className="value">{response.invalid_entries?.length || 0}</span>
              </div>
              <div className="data-row">
                <span className="label">Duplicate Edges</span>
                <span className="value">{response.duplicate_edges?.length || 0}</span>
              </div>
              <div style={{marginTop: '1rem'}}>
                {response.invalid_entries?.map((err, i) => (
                  <span key={i} className="badge error">{err}</span>
                ))}
              </div>
              <div>
                {response.duplicate_edges?.map((err, i) => (
                  <span key={i} className="badge">{err}</span>
                ))}
              </div>
            </div>
          </div>

          <h3>Hierarchies Discovered</h3>
          <div className="grid" style={{marginTop: '1rem'}}>
            {response.hierarchies?.map((h, index) => (
              <div key={index} className="card" style={{borderColor: h.has_cycle ? 'var(--error)' : 'var(--success)'}}>
                <h3>Root: {h.root} {h.has_cycle && <span style={{color: 'var(--error)', fontSize: '0.9rem'}}>(Cycle Detected)</span>}</h3>
                {!h.has_cycle && (
                  <div className="data-row">
                    <span className="label">Depth</span>
                    <span className="value">{h.depth}</span>
                  </div>
                )}
                <div className="tree-view">
                  {JSON.stringify(h.tree, null, 2)}
                </div>
              </div>
            ))}
            {(!response.hierarchies || response.hierarchies.length === 0) && (
              <div className="card">No hierarchies found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
