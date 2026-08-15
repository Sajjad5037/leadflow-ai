import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leadflow-ai-production-e5f0.up.railway.app';

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
    <App />
  </React.StrictMode>
);
