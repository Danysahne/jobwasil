import React, { useState } from 'react';
import './App.css';

const JOBS = [
  { id: '1', title: 'Software Engineer' },
  { id: '2', title: 'Product Manager' },
  { id: '3', title: 'Data Analyst' }
];

function App() {
  const [query, setQuery] = useState('');
  const filteredJobs = JOBS.filter(job =>
    job.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container">
      <h1 className="title">Job Search</h1>
      <input
        className="input"
        placeholder="Search jobs..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {filteredJobs.length > 0 ? (
        <ul className="jobs">
          {filteredJobs.map(job => (
            <li key={job.id} className="job">
              {job.title}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">No results</p>
      )}
    </div>
  );
}

export default App;
