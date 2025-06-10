import React, { useState } from 'react';
import './App.css';

const JOBS = [
  {
    id: '1',
    title: 'Software Engineer',
    type: 'Full-time',
    description: 'Develop and maintain software applications.'
  },
  {
    id: '2',
    title: 'Product Manager',
    type: 'Part-time',
    description: 'Oversee product development and strategy.'
  },
  {
    id: '3',
    title: 'Data Analyst',
    type: 'Contract',
    description: 'Analyze data trends to inform business decisions.'
  },
  {
    id: '4',
    title: 'UX Designer',
    type: 'Full-time',
    description: 'Design user interfaces and improve user experience.'
  }
];

function App() {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [theme, setTheme] = useState('light');

  const filteredJobs = JOBS.filter(job =>
    job.title.toLowerCase().includes(query.toLowerCase()) &&
    (selectedType === 'All' || job.type === selectedType)
  );

  const toggleTheme = () =>
    setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className={`app ${theme}`}>
      <div className="container">
        <div className="header">
          <h1 className="title">Job Search</h1>
          <button className="button" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
        <input
          className="input"
          placeholder="Search jobs..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="controls">
          <select
            className="select"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            {['All', 'Full-time', 'Part-time', 'Contract'].map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button className="button" onClick={() => setQuery('')}>Clear</button>
        </div>
        {filteredJobs.length > 0 ? (
          <ul className="jobs">
            {filteredJobs.map(job => (
              <li key={job.id} className="job-card">
                <div className="job-title">{job.title}</div>
                <div className="job-type">{job.type}</div>
                <div className="job-desc">{job.description}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">No results</p>
        )}
      </div>
    </div>
  );
}

export default App;
