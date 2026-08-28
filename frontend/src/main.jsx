import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const initialFormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
};

function validateForm(values) {
  const nextErrors = {};

  if (!values.name.trim()) {
    nextErrors.name = 'Please enter your name.';
  }

  if (!values.company.trim()) {
    nextErrors.company = 'Please enter your company name.';
  }

  if (!values.email.trim()) {
    nextErrors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    nextErrors.email = 'Please provide a valid email address.';
  }

  const digitsOnly = values.phone.replace(/\D/g, '');
  if (!values.phone.trim()) {
    nextErrors.phone = 'Please enter your phone number.';
  } else if (digitsOnly.length < 10) {
    nextErrors.phone = 'Please enter a valid phone number.';
  }

  if (!values.message.trim()) {
    nextErrors.message = 'Tell us a little about your business challenge.';
  } else if (values.message.trim().length < 20) {
    nextErrors.message = 'Please share at least 20 characters about your challenge.';
  }

  return nextErrors;
}

async function submitLead(payload) {
  const response = await fetch(`${API_BASE_URL}/api/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : detail?.message || 'Something went wrong while submitting your request. Please try again.';
    throw new Error(message);
  }

  return data;
}

function getFollowupStatus(lead, followups, upcomingFollowups, selectedLead) {
  const leadFollowups =
    selectedLead?.id === lead.id
      ? followups
      : upcomingFollowups.filter((followup) => followup.lead_id === lead.id);

  if (leadFollowups.length === 0) {
    return 'No Follow-up';
  }

  if (leadFollowups.some((followup) => followup.status === 'SCHEDULED')) {
    return 'Scheduled';
  }

  if (leadFollowups.some((followup) => followup.status === 'SENT')) {
    return 'Sent';
  }

  return 'No Follow-up';
}

function getPriority(score) {
  if (typeof score !== 'number') {
    return '—';
  }

  if (score >= 80) {
    return 'HIGH';
  }

  if (score >= 50) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [followupsLoading, setFollowupsLoading] = useState(false);
  const [followupScheduledAt, setFollowupScheduledAt] = useState('');
  const [isSchedulingFollowup, setIsSchedulingFollowup] = useState(false);
  const [followupError, setFollowupError] = useState('');
  const [upcomingFollowups, setUpcomingFollowups] = useState([]);
  const [processingFollowupId, setProcessingFollowupId] = useState(null);
  const [upcomingFollowupsLoading, setUpcomingFollowupsLoading] = useState(true);
  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leads`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error('Failed to load leads.');
        }

        const sortedLeads = [...data].sort((a, b) => {
          const scoreA = a.qualification?.score ?? -1;
          const scoreB = b.qualification?.score ?? -1;
          return scoreB - scoreA;
        });

        setLeads(sortedLeads);
      } catch (requestError) {
        setError(requestError.message || 'Failed to load leads.');
      } finally {
        setIsLoading(false);
      }
    }

    loadLeads();
  }, []);

  useEffect(() => {
  if (!selectedLead) {
    setFollowups([]);
    return;
  }

  async function loadFollowups() {
    setFollowupsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/leads/${selectedLead.id}/followups`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to load follow-ups.');
      }

      setFollowups(data);
    } catch (requestError) {
      console.error(requestError);
      setFollowups([]);
    } finally {
      setFollowupsLoading(false);
    }
  }

  loadFollowups();
}, [selectedLead]);
useEffect(() => {
  async function loadUpcomingFollowups() {
    setUpcomingFollowupsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/followups/upcoming`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to load upcoming follow-ups.');
      }

      setUpcomingFollowups(data);
    } catch (requestError) {
      console.error(requestError);
      setUpcomingFollowups([]);
    } finally {
      setUpcomingFollowupsLoading(false);
    }
  }

  loadUpcomingFollowups();
}, []);
async function handleProcessFollowup(followupId) {
  setProcessingFollowupId(followupId);
  setFollowupError('');

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/followups/${followupId}/process`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail?.message || 'Failed to process follow-up.'
      );
    }

    const followupsResponse = await fetch(
      `${API_BASE_URL}/api/leads/${selectedLead.id}/followups`
    );

    const followupsData = await followupsResponse.json();

    if (!followupsResponse.ok) {
      throw new Error('Follow-up was processed but could not be reloaded.');
    }

    setFollowups(followupsData);
  } catch (requestError) {
    setFollowupError(
      requestError.message || 'Failed to process follow-up.'
    );
  } finally {
    setProcessingFollowupId(null);
  }
}
  async function handleScheduleFollowup() {
    if (!selectedLead || !followupScheduledAt) {
      setFollowupError('Please select a date and time.');
      return;
    }

    setIsSchedulingFollowup(true);
    setFollowupError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/leads/${selectedLead.id}/followups`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lead_id: selectedLead.id,
            channel: 'EMAIL',
            scheduled_at: followupScheduledAt,
            attempt_number: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail?.message || 'Failed to schedule follow-up.'
        );
      }

      const followupsResponse = await fetch(
        `${API_BASE_URL}/api/leads/${selectedLead.id}/followups`
      );

      const followupsData = await followupsResponse.json();

      if (!followupsResponse.ok) {
        throw new Error('Follow-up was created but could not be reloaded.');
      }

      setFollowups(followupsData);
      setFollowupScheduledAt('');
    } catch (requestError) {
      setFollowupError(
        requestError.message || 'Failed to schedule follow-up.'
      );
    } finally {
      setIsSchedulingFollowup(false);
    }
  }

  const totalLeads = leads.length;
  const highPriority = leads.filter(
    (lead) => getPriority(lead.qualification?.score) === 'HIGH'
  ).length;
  const mediumPriority = leads.filter(
    (lead) => getPriority(lead.qualification?.score) === 'MEDIUM'
  ).length;
  const lowPriority = leads.filter(
    (lead) => getPriority(lead.qualification?.score) === 'LOW'
  ).length;

  return (
    <main className="app-shell">
      <div className="page-shell" style={{ display: 'block', maxWidth: '1200px' }}>
        <section className="form-card" style={{ width: '100%' }}>
          <div className="form-header">
            <p className="form-kicker">HARBOURSTONE DEVELOPMENTS</p>
            <h2>Sales Dashboard</h2>
          </div>

          {isLoading && <p>Loading leads...</p>}

          {error && <p className="error-banner">{error}</p>}

          {!isLoading && !error && (
            <div className="lead-stats">
              <div className="lead-stat-card">
                <span>Total Leads</span>
                <strong>{totalLeads}</strong>
              </div>

              <div className="lead-stat-card">
                <span>High Priority</span>
                <strong>{highPriority}</strong>
              </div>

              <div className="lead-stat-card">
                <span>Medium Priority</span>
                <strong>{mediumPriority}</strong>
              </div>

              <div className="lead-stat-card">
                <span>Low Priority</span>
                <strong>{lowPriority}</strong>
              </div>
            </div>
            

          )}
          {!upcomingFollowupsLoading && upcomingFollowups.length > 0 && (
            <div className="lead-details-section" style={{ marginTop: '24px' }}>
              <span>Upcoming Follow-ups</span>

              {upcomingFollowups.map((followup) => {
                const lead = leads.find((item) => item.id === followup.lead_id);

                return (
                  <div key={followup.id} style={{ marginTop: '12px' }}>
                    <strong>{lead?.name ?? `Lead #${followup.lead_id}`}</strong>
                    <p>
                      {followup.channel} —{' '}
                      {new Date(followup.scheduled_at).toLocaleString()}
                    </p>
                    <p>Status: {followup.status}</p>
                    <p>Attempt: {followup.attempt_number}</p>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && !error && leads.length === 0 && (
            <p>No leads found.</p>
          )}

          {!isLoading && !error && leads.length > 0 && (
            <>
              <div className="lead-table-wrapper">
                <table className="lead-table">
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Company</th>
                      <th>Score</th>
                      <th>Priority</th>
                      <th>Temperature</th>
                      <th>Summary</th>
                      <th>Reasoning</th>
                      <th>Action Due</th>
                      <th>Follow-up</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leads.map((lead) => {
                      const priority = getPriority(lead.qualification?.score);
                      const temperature = lead.qualification?.temperature;
                      const followupStatus = getFollowupStatus(
                        lead,
                        followups,
                        upcomingFollowups,
                        selectedLead
                      );

                      return (
                        <tr
                          key={lead.id}
                          className={selectedLead?.id === lead.id ? 'selected-lead-row' : ''}
                          onClick={() => setSelectedLead(lead)}
                        >
                          <td>{lead.name}</td>
                          <td>{lead.company}</td>
                          <td>{lead.qualification?.score ?? '—'}</td>

                          <td>
                            {priority !== '—' ? (
                              <span className={`lead-badge priority-${priority.toLowerCase()}`}>
                                {priority}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td>
                            {temperature ? (
                              <span className={`lead-badge temperature-${temperature.toLowerCase()}`}>
                                {temperature}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td>{lead.qualification?.summary ?? '—'}</td>
                          <td>{lead.qualification?.reasoning ?? '—'}</td>
                          <td>{lead.qualification?.recommended_action ?? '—'}</td>

                          <td>
                            <span
                              className={`lead-badge followup-${followupStatus
                                .toLowerCase()
                                .replace(/\s+/g, '-')}`}
                            >
                              {followupStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedLead && (
                <div className="lead-details-panel">
                  <div className="lead-details-header">
                    <div>
                      <p className="form-kicker">Lead Details</p>
                      <h3>{selectedLead.name}</h3>
                    </div>

                    <button
                      type="button"
                      className="lead-details-close"
                      onClick={() => setSelectedLead(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="lead-details-grid">
                    <div>
                      <span>Company</span>
                      <strong>{selectedLead.company}</strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>{selectedLead.email}</strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>{selectedLead.phone}</strong>
                    </div>

                    <div>
                      <span>Source</span>
                      <strong>{selectedLead.source}</strong>
                    </div>

                    <div>
                      <span>Score</span>
                      <strong>{selectedLead.qualification?.score ?? '—'}</strong>
                    </div>

                    <div>
                      <span>Priority</span>
                      <strong>
                        {getPriority(selectedLead.qualification?.score)}
                      </strong>
                    </div>

                    <div>
                      <span>Temperature</span>
                      <strong>{selectedLead.qualification?.temperature ?? '—'}</strong>
                    </div>

                    <div>
                      <span>Status</span>
                      <strong>{selectedLead.status}</strong>
                    </div>
                  </div>

                  <div className="lead-details-section">
                    <span>Business Problem</span>
                    <p>{selectedLead.business_problem}</p>
                  </div>

                  <div className="lead-details-section">
                    <span>AI Summary</span>
                    <p>{selectedLead.qualification?.summary ?? '—'}</p>
                  </div>

                  <div className="lead-details-section">
                    <span>AI Reasoning</span>
                    <p>{selectedLead.qualification?.reasoning ?? '—'}</p>
                  </div>

                  <div className="lead-details-section">
                    <span>Recommended Action</span>
                    <p>{selectedLead.qualification?.recommended_action ?? '—'}</p>
                  </div>

                  <div className="lead-details-section">
                    <span>Follow-ups</span>

                    {followupsLoading && <p>Loading follow-ups...</p>}

                    {!followupsLoading && followups.length === 0 && (
                      <p>No follow-ups scheduled.</p>
                    )}

                    {!followupsLoading && followups.length > 0 && (
                      <div>
                        {followups.map((followup) => (
                          <div key={followup.id}>
                            <strong>{followup.channel}</strong>

                            <p>
                              Scheduled: {new Date(followup.scheduled_at).toLocaleString()}
                            </p>

                            <p>Status: {followup.status}</p>

                            <p>Attempt: {followup.attempt_number}</p>

                            {followup.status === 'SCHEDULED' && (
                              <button
                                type="button"
                                className="submit-button"
                                onClick={() => handleProcessFollowup(followup.id)}
                                disabled={processingFollowupId === followup.id}
                              >
                                {processingFollowupId === followup.id
                                  ? 'Sending...'
                                  : 'Send Now'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lead-details-section">
                    <span>Schedule Follow-up</span>

                    <input
                      type="datetime-local"
                      value={followupScheduledAt}
                      onChange={(event) => {
                        setFollowupScheduledAt(event.target.value);
                        setFollowupError('');
                      }}
                      disabled={isSchedulingFollowup}
                    />

                    <button
                      type="button"
                      className="submit-button"
                      onClick={handleScheduleFollowup}
                      disabled={isSchedulingFollowup}
                    >
                      {isSchedulingFollowup
                        ? 'Scheduling...'
                        : 'Schedule Follow-up'}
                    </button>

                    {followupError && (
                      <p className="error-banner">{followupError}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));

    if (submitError) {
      setSubmitError('');
    }

    if (isSubmitted) {
      setIsSubmitted(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError('');
      setIsSubmitted(false);
      return;
    }

    setErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await submitLead({
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        source: 'website',
      });

      setFormData(initialFormState);
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'We could not submit your request. Please try again.');
      setIsSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="page-shell">
        <section className="hero-panel">
          <p className="eyebrow">AI-powered automation for growing businesses</p>
          <h1>Turn repetitive work into revenue with LeadFlow Solutions.</h1>
          <p className="subtitle">
            We design automation systems that help teams respond faster, close more deals,
            and scale operations without adding more manual overhead.
          </p>

          <ul className="benefits" aria-label="Business benefits">
            <li>Faster lead response and follow-up</li>
            <li>Smarter workflows across sales and operations</li>
            <li>Clearer visibility into customer opportunities</li>
          </ul>
        </section>

        <section className="form-card" aria-labelledby="lead-form-title">
          <div className="form-header">
            <p className="form-kicker">Free automation assessment</p>
            <h2 id="lead-form-title">Request a strategy call</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-row">
              <label>
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  aria-invalid={Boolean(errors.name)}
                  disabled={isSubmitting}
                />
                {errors.name && <small className="error-text">{errors.name}</small>}
              </label>

              <label>
                <span>Company</span>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Acme Studio"
                  aria-invalid={Boolean(errors.company)}
                  disabled={isSubmitting}
                />
                {errors.company && <small className="error-text">{errors.company}</small>}
              </label>
            </div>

            <div className="field-row">
              <label>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@company.com"
                  aria-invalid={Boolean(errors.email)}
                  disabled={isSubmitting}
                />
                {errors.email && <small className="error-text">{errors.email}</small>}
              </label>

              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  aria-invalid={Boolean(errors.phone)}
                  disabled={isSubmitting}
                />
                {errors.phone && <small className="error-text">{errors.phone}</small>}
              </label>
            </div>

            <label className="full-width">
              <span>Business problem / message</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us about the bottlenecks, manual work, or customer experience issues you want to solve."
                aria-invalid={Boolean(errors.message)}
                disabled={isSubmitting}
              />
              {errors.message && <small className="error-text">{errors.message}</small>}
            </label>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Get My Free Assessment'}
            </button>

            {submitError && (
              <p className="error-banner" role="alert">
                {submitError}
              </p>
            )}

            {isSubmitted && (
              <p className="success-state" role="status" aria-live="polite">
                Thanks! Your request has been received. A LeadFlow strategist will reach out to
                schedule your free automation assessment.
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {window.location.pathname === '/admin' ? <AdminDashboard /> : <App />}
  </React.StrictMode>
);
