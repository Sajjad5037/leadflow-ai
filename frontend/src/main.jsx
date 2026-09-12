import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import heroPropertyImage from './assets/al-qaim-estate-hero-property.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const initialFormState = {
  name: '',
  profession: '',
  email: '',
  phone: '',
  message: '',
};

function validateForm(values) {
  const nextErrors = {};

  if (!values.name.trim()) {
    nextErrors.name = 'Please enter your name.';
  }

  if (!values.profession.trim()) {
    nextErrors.profession = 'Please enter your profession.';
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
    nextErrors.message = 'Tell us a little about your investment goals.';
  } else if (values.message.trim().length < 20) {
    nextErrors.message = 'Please share at least 20 characters about your investment goals.';
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

const MOCK_COMMAND_CENTER_KPIS = [
  { label: 'Total Leads', value: '128', detail: '+14 this month', tone: 'blue' },
  { label: 'Hot Leads', value: '24', detail: '8 need attention', tone: 'red' },
  { label: 'Active Opportunities', value: '42', detail: '£3.6m open value', tone: 'amber' },
  { label: 'Won Deals', value: '11', detail: '24.4% conversion', tone: 'green' },
  { label: 'Pipeline Value', value: '£4.8m', detail: '+12% vs last month', tone: 'cyan' },
];

const MOCK_PIPELINE_STAGES = [
  { name: 'New', count: 32, value: '£920k', progress: 100 },
  { name: 'Contacted', count: 26, value: '£780k', progress: 81 },
  { name: 'Qualified', count: 18, value: '£640k', progress: 56 },
  { name: 'Viewing / Appointment', count: 14, value: '£1.1m', progress: 44 },
  { name: 'Negotiation', count: 10, value: '£890k', progress: 31 },
  { name: 'Won', count: 11, value: '£510k', progress: 34 },
];

const MOCK_TEAM_PERFORMANCE = [
  { name: 'Amelia Hart', initials: 'AH', assigned: 31, active: 12, won: 4, conversion: '28%' },
  { name: 'Marcus Cole', initials: 'MC', assigned: 27, active: 10, won: 3, conversion: '24%' },
  { name: 'Priya Shah', initials: 'PS', assigned: 24, active: 9, won: 3, conversion: '27%' },
  { name: 'Daniel Reed', initials: 'DR', assigned: 22, active: 7, won: 1, conversion: '18%' },
];
const initialMockEmployees = [
    {
      id: 1,
      name: 'Amelia Hart',
      email: 'amelia.hart@example.com',
      role: 'Sales Agent',
    },
    {
      id: 2,
      name: 'Marcus Cole',
      email: 'marcus.cole@example.com',
      role: 'Sales Agent',
    },
    {
      id: 3,
      name: 'Priya Shah',
      email: 'priya.shah@example.com',
      role: 'Sales Agent',
    },
    {
      id: 4,
      name: 'Daniel Reed',
      email: 'daniel.reed@example.com',
      role: 'Sales Agent',
    },
  ];

const PROPERTY_TYPE_OPTIONS = ['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'HOUSE', 'OTHER'];
const PROPERTY_STATUS_OPTIONS = ['AVAILABLE', 'RESERVED', 'SOLD', 'OFF_MARKET'];

const initialPropertyFormState = {
  title: '',
  description: '',
  property_type: 'APARTMENT',
  status: 'AVAILABLE',
  price: '',
  currency: 'PKR',
  location: '',
  address: '',
  size_value: '',
  size_unit: '',
  bedrooms: '',
  bathrooms: '',
  is_featured: false,
};

function validatePropertyForm(values) {
  if (!values.title.trim()) {
    return 'Please enter a property title.';
  }

  if (!values.description.trim()) {
    return 'Please enter a property description.';
  }

  if (!PROPERTY_TYPE_OPTIONS.includes(values.property_type)) {
    return 'Please select a valid property type.';
  }

  if (!PROPERTY_STATUS_OPTIONS.includes(values.status)) {
    return 'Please select a valid status.';
  }

  if (!values.location.trim()) {
    return 'Please enter a property location.';
  }

  if (values.price === '' || Number.isNaN(Number(values.price)) || Number(values.price) < 0) {
    return 'Please enter a valid, non-negative price.';
  }

  if (
    values.size_value !== '' &&
    (Number.isNaN(Number(values.size_value)) || Number(values.size_value) < 0)
  ) {
    return 'Size must be a valid, non-negative number.';
  }

  if (
    values.bedrooms !== '' &&
    (Number.isNaN(Number(values.bedrooms)) || Number(values.bedrooms) < 0)
  ) {
    return 'Bedrooms must be a valid, non-negative number.';
  }

  if (
    values.bathrooms !== '' &&
    (Number.isNaN(Number(values.bathrooms)) || Number(values.bathrooms) < 0)
  ) {
    return 'Bathrooms must be a valid, non-negative number.';
  }

  return '';
}

function buildPropertyPayload(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    property_type: values.property_type,
    status: values.status,
    price: Number(values.price),
    currency: values.currency.trim() || 'PKR',
    location: values.location.trim(),
    address: values.address.trim() ? values.address.trim() : null,
    size_value: values.size_value !== '' ? Number(values.size_value) : null,
    size_unit: values.size_unit.trim() ? values.size_unit.trim() : null,
    bedrooms: values.bedrooms !== '' ? Number(values.bedrooms) : null,
    bathrooms: values.bathrooms !== '' ? Number(values.bathrooms) : null,
    is_featured: values.is_featured,
  };
}

function propertyToFormValues(property) {
  return {
    title: property.title ?? '',
    description: property.description ?? '',
    property_type: property.property_type ?? 'APARTMENT',
    status: property.status ?? 'AVAILABLE',
    price: property.price !== null && property.price !== undefined ? String(property.price) : '',
    currency: property.currency ?? 'PKR',
    location: property.location ?? '',
    address: property.address ?? '',
    size_value:
      property.size_value !== null && property.size_value !== undefined
        ? String(property.size_value)
        : '',
    size_unit: property.size_unit ?? '',
    bedrooms:
      property.bedrooms !== null && property.bedrooms !== undefined ? String(property.bedrooms) : '',
    bathrooms:
      property.bathrooms !== null && property.bathrooms !== undefined
        ? String(property.bathrooms)
        : '',
    is_featured: Boolean(property.is_featured),
  };
}

function getOrderedPropertyImages(property) {
  const images = property.images || [];
  const primaryImages = images.filter((image) => image.is_primary);
  const otherImages = images
    .filter((image) => !image.is_primary)
    .sort((a, b) => a.display_order - b.display_order);

  return [...primaryImages, ...otherImages];
}

function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('leads');
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState(initialMockEmployees);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
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
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState('');
  const [propertyForm, setPropertyForm] = useState(initialPropertyFormState);
  const [propertyFormError, setPropertyFormError] = useState('');
  const [propertyFormSubmitting, setPropertyFormSubmitting] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyView, setPropertyView] = useState('list');
  const [propertyImages, setPropertyImages] = useState([]);
  const [removedPropertyImageIds, setRemovedPropertyImageIds] = useState([]);
  const propertyFormRef = useRef(null);
  const propertyImageInputRef = useRef(null);

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
useEffect(() => {
  if (activeTab !== 'properties') {
    return;
  }

  async function loadProperties() {
    setPropertiesLoading(true);
    setPropertiesError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/properties`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to load properties.');
      }

      setProperties(data);
    } catch (requestError) {
      setPropertiesError(requestError.message || 'Failed to load properties.');
    } finally {
      setPropertiesLoading(false);
    }
  }

  loadProperties();
}, [activeTab]);
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
  function handleAddEmployee(event) {
    event.preventDefault();

    const name = newEmployeeName.trim();
    const email = newEmployeeEmail.trim();

    if (!name || !email) {
      return;
    }

    const newEmployee = {
      id: Date.now(),
      name,
      email,
      role: 'Sales Agent',
    };

    setEmployees((previousEmployees) => [
      ...previousEmployees,
      newEmployee,
    ]);

    setNewEmployeeName('');
    setNewEmployeeEmail('');
    setShowEmployeeForm(false);
  }

  function handlePropertyFieldChange(event) {
    const { name, value, type, checked } = event.target;

    setPropertyForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (propertyFormError) {
      setPropertyFormError('');
    }
  }

  function handlePropertyImagesChange(event) {
    const files = Array.from(event.target.files || []);

    setPropertyImages((previous) => [
      ...previous,
      ...files.map((file) => ({
        id: null,
        file,
        previewUrl: URL.createObjectURL(file),
        isExisting: false,
      })),
    ]);
  }

  function handleRemovePropertyImage(imageToRemove) {
    if (imageToRemove.isExisting && imageToRemove.id) {
      setRemovedPropertyImageIds((previous) => [
        ...previous,
        imageToRemove.id,
      ]);
    }

    setPropertyImages((previous) =>
      previous.filter((image) => image !== imageToRemove)
    );
  }

  async function handleSetPrimaryPropertyImage(imageToSetPrimary) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/properties/${editingProperty.id}/images/${imageToSetPrimary.id}/primary`,
        {
          method: 'PATCH',
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = data?.detail;
        const message =
          typeof detail === 'string'
            ? detail
            : detail?.message || 'Failed to set primary property image.';
        throw new Error(message);
      }

      setPropertyImages((previous) =>
        previous.map((image) =>
          image.isExisting
            ? { ...image, isPrimary: image.id === imageToSetPrimary.id }
            : image
        )
      );
    } catch (requestError) {
      setPropertyFormError(
        requestError.message || 'Failed to set primary property image.'
      );
    }
  }

  function resetPropertyForm() {
    setEditingProperty(null);
    setPropertyForm(initialPropertyFormState);
    setPropertyImages([]);
    setRemovedPropertyImageIds([]);
    setPropertyFormError('');
  }

  async function handleEditProperty(property) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/properties/${property.id}`
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = data?.detail;
        const message =
          typeof detail === 'string'
            ? detail
            : detail?.message || 'Failed to load property.';
        throw new Error(message);
      }

      setEditingProperty(data);
      setPropertyForm(propertyToFormValues(data));
      setPropertyImages(
        (data.images || []).map((image) => ({
          id: image.id,
          file: null,
          previewUrl: image.image_url,
          isExisting: true,
          isPrimary: image.is_primary,
        }))
      );
      setPropertyFormError('');
      setPropertyView('form');
      propertyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (requestError) {
      setPropertyFormError(
        requestError.message || 'Failed to load property.'
      );
    }
  }

  function handleCancelEditProperty() {
    resetPropertyForm();
    setPropertyView('list');
  }

  function handleShowAddPropertyForm() {
    resetPropertyForm();
    setPropertyView('form');
  }

  async function handlePropertySubmit(event) {
    event.preventDefault();

    const validationError = validatePropertyForm(propertyForm);

    if (validationError) {
      setPropertyFormError(validationError);
      return;
    }

    setPropertyFormSubmitting(true);
    setPropertyFormError('');

    const payload = buildPropertyPayload(propertyForm);
    const isEditing = Boolean(editingProperty);

    try {
      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/properties/${editingProperty.id}`
          : `${API_BASE_URL}/api/properties`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = data?.detail;
        const message =
          typeof detail === 'string'
            ? detail
            : detail?.message || 'Failed to save property.';
        throw new Error(message);
      }

      if (isEditing) {
        setProperties((previous) =>
          previous.map((item) => (item.id === data.id ? data : item))
        );
      } else {
        setProperties((previous) => [data, ...previous]);
      }

      for (const image of propertyImages) {
        if (image.isExisting || !image.file) {
          continue;
        }

        const formData = new FormData();
        formData.append('file', image.file);

        const imageResponse = await fetch(
          `${API_BASE_URL}/api/properties/${data.id}/images`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const imageData = await imageResponse.json().catch(() => null);

        if (!imageResponse.ok) {
          const detail = imageData?.detail;
          const message =
            typeof detail === 'string'
              ? detail
              : detail?.message || 'Failed to upload property image.';
          throw new Error(message);
        }
      }

      for (const imageId of removedPropertyImageIds) {
        const imageResponse = await fetch(
          `${API_BASE_URL}/api/properties/${data.id}/images/${imageId}`,
          {
            method: 'DELETE',
          }
        );

        const imageData = await imageResponse.json().catch(() => null);

        if (!imageResponse.ok) {
          const detail = imageData?.detail;
          const message =
            typeof detail === 'string'
              ? detail
              : detail?.message || 'Failed to delete property image.';
          throw new Error(message);
        }
      }

      resetPropertyForm();
      setPropertyView('list');
    } catch (requestError) {
      setPropertyFormError(requestError.message || 'Failed to save property.');
    } finally {
      setPropertyFormSubmitting(false);
    }
  }

  async function handleDeleteProperty(propertyId) {
    const confirmed = window.confirm('Are you sure you want to delete this property?');

    if (!confirmed) {
      return;
    }

    setPropertiesError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail?.message || 'Failed to delete property.');
      }

      setProperties((previous) => previous.filter((item) => item.id !== propertyId));

      if (editingProperty?.id === propertyId) {
        setEditingProperty(null);
        setPropertyForm(initialPropertyFormState);
      }
    } catch (requestError) {
      setPropertiesError(requestError.message || 'Failed to delete property.');
    }
  }

  async function handlePropertyStatusChange(propertyId, newStatus) {
    const previousProperties = properties;
    const targetProperty = properties.find((item) => item.id === propertyId);

    if (!targetProperty || targetProperty.status === newStatus) {
      return;
    }

    setProperties((current) =>
      current.map((item) => (item.id === propertyId ? { ...item, status: newStatus } : item))
    );
    setPropertiesError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/properties/${propertyId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail?.message || 'Failed to update property status.');
      }

      setProperties((current) =>
        current.map((item) => (item.id === propertyId ? data : item))
      );
    } catch (requestError) {
      setProperties(previousProperties);
      setPropertiesError(requestError.message || 'Failed to update property status.');
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
      <div className="page-shell admin-dashboard-shell" style={{ display: 'block', maxWidth: '1200px' }}>
        <section className="form-card" style={{ width: '100%' }}>
          <nav className="command-tabs" aria-label="Sales Command Center">
            <button
              type="button"
              className={activeTab === 'overview' ? 'command-tab active' : 'command-tab'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>

            <button
              type="button"
              className={activeTab === 'leads' ? 'command-tab active' : 'command-tab'}
              onClick={() => setActiveTab('leads')}
            >
              Leads
            </button>

            <button
              type="button"
              className={activeTab === 'pipeline' ? 'command-tab active' : 'command-tab'}
              onClick={() => setActiveTab('pipeline')}
            >
              Pipeline
            </button>

            <button
              type="button"
              className={activeTab === 'team' ? 'command-tab active' : 'command-tab'}
              onClick={() => setActiveTab('team')}
            >
              Team
            </button>

            <button
              type="button"
              className={activeTab === 'followups' ? 'command-tab active' : 'command-tab'}
              onClick={() => setActiveTab('followups')}
            >
              Follow-ups
            </button>

            <button
              type="button"
              className={activeTab === 'properties' ? 'command-tab active' : 'command-tab'}
              onClick={() => setActiveTab('properties')}
            >
              Manage Properties
            </button>
          </nav>
          <div className="form-header command-center-header">
            <div>
              <p className="form-kicker">HARBOURSTONE DEVELOPMENTS</p>
              <h2>Sales Command Center-Click on any lead to see its AI cmddetails</h2>
              <p className="command-center-subtitle">
                A focused view of pipeline health, opportunity movement, and team momentum.
              </p>
            </div>
            <span className="command-center-snapshot">Illustrative overview</span>
          </div>

          {activeTab === 'overview' && (
          <section className="command-center-overview" aria-label="Sales command center overview">
            <div className="command-kpi-grid">
              {MOCK_COMMAND_CENTER_KPIS.map((kpi) => (
                <article className={`command-kpi-card command-kpi-${kpi.tone}`} key={kpi.label}>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.detail}</small>
                </article>
              ))}
            </div>

            <div className="command-overview-grid">
              <section className="command-panel command-team-panel">
                <div className="command-section-heading">
                  <div>
                    <span>Team Performance</span>
                    <h3>Sales activity</h3>
                  </div>
                  <span className="lead-badge followup-sent">On track</span>
                </div>

                <div className="command-team-list">
                  {MOCK_TEAM_PERFORMANCE.map((member) => (
                    <article className="command-team-member" key={member.name}>
                      <div className="command-team-person">
                        <span className="command-team-avatar">{member.initials}</span>
                        <strong>{member.name}</strong>
                      </div>
                      <dl className="command-team-metrics">
                        <div>
                          <dt>Assigned</dt>
                          <dd>{member.assigned}</dd>
                        </div>
                        <div>
                          <dt>Active</dt>
                          <dd>{member.active}</dd>
                        </div>
                        <div>
                          <dt>Won</dt>
                          <dd>{member.won}</dd>
                        </div>
                        <div>
                          <dt>Conversion</dt>
                          <dd>{member.conversion}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
          )}

            {activeTab === 'team' && (
              <section className="command-panel">
                <div className="command-section-heading">
                  <div>
                    <span>Sales Team</span>
                    <h3>Team performance</h3>
                  </div>

                  <button
                    type="button"
                    className="command-add-button"
                    onClick={() => setShowEmployeeForm((current) => !current)}
                  >
                    {showEmployeeForm ? 'Cancel' : '+ Add Employee'}
                  </button>
                </div>
                {showEmployeeForm && (
                  <form className="command-employee-form" onSubmit={handleAddEmployee}>
                    <div>
                      <label htmlFor="employee-name">Name</label>
                      <input
                        id="employee-name"
                        type="text"
                        value={newEmployeeName}
                        onChange={(event) => setNewEmployeeName(event.target.value)}
                        placeholder="Employee name"
                      />
                    </div>

                    <div>
                      <label htmlFor="employee-email">Email</label>
                      <input
                        id="employee-email"
                        type="email"
                        value={newEmployeeEmail}
                        onChange={(event) => setNewEmployeeEmail(event.target.value)}
                        placeholder="Employee email"
                      />
                    </div>

                    <button type="submit" className="command-add-button">
                      Add Employee
                    </button>
                  </form>
                )}

                <div className="command-employee-list">
                  <div className="command-employee-list-heading">
                    <span>Team Members</span>
                    <small>{employees.length} members</small>
                  </div>

                  {employees.map((employee) => (
                    <div className="command-employee-member" key={employee.id}>
                      <span className="command-team-avatar">
                        {employee.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>

                      <div className="command-employee-info">
                        <strong>{employee.name}</strong>
                        <span>{employee.email}</span>
                      </div>

                      <span className="command-employee-role">
                        {employee.role}
                      </span>

                      <div className="command-employee-actions">
                        <button
                          type="button"
                          onClick={() => console.log('Edit employee:', employee.id)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => console.log('Delete employee:', employee.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                  </section>
                )}

                {activeTab === 'pipeline' && (
                  <section className="command-panel command-pipeline-panel">
                <div className="command-pipeline-grid">
                  {MOCK_PIPELINE_STAGES.map((stage) => (
                    <article className="command-pipeline-stage" key={stage.name}>
                      <div className="command-stage-heading">
                        <span>{stage.name}</span>
                        <strong>{stage.count}</strong>
                      </div>
                      <div className="command-stage-track" aria-hidden="true">
                        <span style={{ width: `${stage.progress}%` }} />
                      </div>
                      <small>{stage.value}</small>
                    </article>
                  ))}
                </div>
              </section>
          )}

          {activeTab === 'leads' && (
          <>
          <div className="live-dashboard-heading">
            <div>
              <span>Live Lead Operations</span>
              <h3>Lead activity</h3>
            </div>
            <span className="lead-badge followup-sent">API connected</span>
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
          </>
          )}

          {activeTab === 'properties' && (
            <section className="command-panel property-panel" aria-label="Manage Properties">
              <div className="command-section-heading">
                <div>
                  <span>Property Portfolio</span>
                  <h3>Manage Properties</h3>
                </div>
                <span className="lead-badge followup-sent">API connected</span>
              </div>

              <nav className="command-tabs property-view-tabs" aria-label="Manage Properties view">
                <button
                  type="button"
                  className={propertyView === 'list' ? 'command-tab active' : 'command-tab'}
                  onClick={handleCancelEditProperty}
                >
                  View Properties
                </button>

                <button
                  type="button"
                  className={propertyView === 'form' ? 'command-tab active' : 'command-tab'}
                  onClick={handleShowAddPropertyForm}
                >
                  Add Property
                </button>
              </nav>

              {propertyView === 'form' && (
              <form className="property-form" ref={propertyFormRef} onSubmit={handlePropertySubmit}>
                <h4>{editingProperty ? 'Edit Property' : 'Add Property'}</h4>

                <div className="property-form-grid">
                  <label>
                    <span>Title</span>
                    <input
                      type="text"
                      name="title"
                      value={propertyForm.title}
                      onChange={handlePropertyFieldChange}
                      placeholder="Sea View Apartment"
                      disabled={propertyFormSubmitting}
                    />
                  </label>

                  <label>
                    <span>Property Type</span>
                    <select
                      name="property_type"
                      value={propertyForm.property_type}
                      onChange={handlePropertyFieldChange}
                      disabled={propertyFormSubmitting}
                    >
                      {PROPERTY_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Status</span>
                    <select
                      name="status"
                      value={propertyForm.status}
                      onChange={handlePropertyFieldChange}
                      disabled={propertyFormSubmitting}
                    >
                      {PROPERTY_STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Price</span>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={propertyForm.price}
                      onChange={handlePropertyFieldChange}
                      placeholder="15000000"
                      disabled={propertyFormSubmitting}
                    />
                  </label>

                  <label>
                    <span>Currency</span>
                    <input
                      type="text"
                      name="currency"
                      value={propertyForm.currency}
                      onChange={handlePropertyFieldChange}
                      placeholder="PKR"
                      disabled={propertyFormSubmitting}
                    />
                  </label>

                  <label>
                    <span>Location</span>
                    <input
                      type="text"
                      name="location"
                      value={propertyForm.location}
                      onChange={handlePropertyFieldChange}
                      placeholder="Karachi"
                      disabled={propertyFormSubmitting}
                    />
                  </label>

                  <label>
                    <span>Size</span>
                    <input
                      type="number"
                      name="size_value"
                      min="0"
                      step="0.01"
                      value={propertyForm.size_value}
                      onChange={handlePropertyFieldChange}
                      placeholder="1800"
                      disabled={propertyFormSubmitting}
                    />
                  </label>

                  <label>
                    <span>Size Unit</span>
                    <input
                      type="text"
                      name="size_unit"
                      value={propertyForm.size_unit}
                      onChange={handlePropertyFieldChange}
                      placeholder="sqft"
                      disabled={propertyFormSubmitting}
                    />
                  </label>

                  <label>
                    <span>Bedrooms</span>
                    <input
                      type="number"
                      name="bedrooms"
                      min="0"
                      step="1"
                      value={propertyForm.bedrooms}
                      onChange={handlePropertyFieldChange}
                      placeholder="2"
                      disabled={propertyFormSubmitting}
                    />
                  </label>

                  <label>
                    <span>Bathrooms</span>
                    <input
                      type="number"
                      name="bathrooms"
                      min="0"
                      step="1"
                      value={propertyForm.bathrooms}
                      onChange={handlePropertyFieldChange}
                      placeholder="2"
                      disabled={propertyFormSubmitting}
                    />
                  </label>
                </div>

                <label className="full-width">
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={propertyForm.description}
                    onChange={handlePropertyFieldChange}
                    rows="4"
                    placeholder="Describe the property..."
                    disabled={propertyFormSubmitting}
                  />
                </label>

                <label className="full-width">
                  <span>Address</span>
                  <textarea
                    name="address"
                    value={propertyForm.address}
                    onChange={handlePropertyFieldChange}
                    rows="2"
                    placeholder="Optional street address"
                    disabled={propertyFormSubmitting}
                  />
                </label>

                <label className="full-width">
                  <span>Images</span>
                  <div className="property-file-input-row">
                    <input
                      ref={propertyImageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePropertyImagesChange}
                      disabled={propertyFormSubmitting}
                      className="property-file-input"
                    />

                    <button
                      type="button"
                      className="property-secondary-button"
                      onClick={() => propertyImageInputRef.current?.click()}
                      disabled={propertyFormSubmitting}
                    >
                      Choose Files
                    </button>

                    {propertyImages.some((image) => image.file) && (
                      <span className="property-file-input-filenames">
                        {propertyImages
                          .filter((image) => image.file)
                          .map((image) => image.file.name)
                          .join(', ')}
                      </span>
                    )}
                  </div>
                </label>

                {propertyImages.length > 0 && (
                  <div className="property-image-preview-list">
                    {propertyImages.map((image) => (
                      <div
                        key={image.id ?? image.previewUrl}
                        className="property-image-preview"
                      >
                        <img
                          src={image.previewUrl}
                          alt="Property preview"
                        />

                        <button
                          type="button"
                          className="property-image-remove-button"
                          onClick={() => handleRemovePropertyImage(image)}
                          aria-label="Remove property image"
                        >
                          ×
                        </button>

                        {image.isExisting && (
                          image.isPrimary ? (
                            <span className="property-image-primary-badge">✓ Primary</span>
                          ) : (
                            <button
                              type="button"
                              className="property-image-set-primary-button"
                              onClick={() => handleSetPrimaryPropertyImage(image)}
                            >
                              Set as Primary
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <label className="property-featured-field">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={propertyForm.is_featured}
                    onChange={handlePropertyFieldChange}
                    disabled={propertyFormSubmitting}
                  />
                  <span>Featured Property</span>
                </label>

                <div className="property-form-actions">
                  <button type="submit" className="submit-button" disabled={propertyFormSubmitting}>
                    {propertyFormSubmitting
                      ? 'Saving...'
                      : editingProperty
                        ? 'Save Changes'
                        : 'Add Property'}
                  </button>

                  {editingProperty && (
                    <button
                      type="button"
                      className="property-secondary-button"
                      onClick={handleCancelEditProperty}
                      disabled={propertyFormSubmitting}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {propertyFormError && <p className="error-banner">{propertyFormError}</p>}
              </form>
              )}

              {propertyView === 'list' && (
              <>
              {propertiesLoading && <p>Loading properties...</p>}

              {propertiesError && <p className="error-banner">{propertiesError}</p>}

              {!propertiesLoading && !propertiesError && properties.length === 0 && (
                <p>No properties found.</p>
              )}

              {!propertiesLoading && !propertiesError && properties.length > 0 && (
                <div className="property-table-wrapper">
                  <table className="property-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Bedrooms</th>
                        <th>Bathrooms</th>
                        <th>Featured</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {properties.map((property) => (
                        <tr key={property.id}>
                          <td>{property.title}</td>
                          <td>{property.property_type}</td>
                          <td>{property.location}</td>
                          <td>
                            {property.currency} {property.price}
                          </td>
                          <td className="property-status-cell">
                            <select
                              className={`property-status-select property-status-${property.status.toLowerCase()}`}
                              value={property.status}
                              onChange={(event) =>
                                handlePropertyStatusChange(property.id, event.target.value)
                              }
                            >
                              {PROPERTY_STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>{property.bedrooms ?? '—'}</td>
                          <td>{property.bathrooms ?? '—'}</td>
                          <td>
                            <span
                              className={`property-badge ${
                                property.is_featured
                                  ? 'property-badge-featured'
                                  : 'property-badge-not-featured'
                              }`}
                            >
                              {property.is_featured ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>
                            <div className="property-row-actions">
                              <button
                                type="button"
                                className="property-action-button"
                                onClick={() => handleEditProperty(property)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="property-action-button property-action-danger"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </>
              )}
            </section>
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
        company: formData.profession,
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
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand">
            <span className="site-brand-name">Al Qaim Estate</span>
            <span className="site-brand-subtitle">FOR REAL ESTATE BUSINESSES</span>
          </div>

          <nav className="site-nav" aria-label="Primary">
            <a className="site-nav-link" href="/">Home</a>
            <a className="site-nav-link" href="/properties">Properties</a>
            <a className="site-nav-link" href="/about">About Us</a>
          </nav>
        </div>
      </header>

      <main className="app-shell">
        <div className="page-shell">
          <section className="hero-panel" id="hero">
            <p className="eyebrow">REAL ESTATE INVESTMENT OPPORTUNITIES</p>
            <h1>Invest Less. <span className="hero-highlight">Earn More.</span> With Al Qaim Estate.</h1>
            <p className="subtitle">
              Put your capital to work with carefully selected real estate opportunities designed
              around your investment goals.
            </p>

            <ul className="benefits" aria-label="Business benefits">
              <li>Invest Smart — Explore opportunities selected for your investment goals</li>
              <li>Earn More — Put your available capital to work through real estate</li>
              <li>Grow Your Wealth — Build long-term value through strategic property investment</li>
            </ul>

            <div className="hero-image-wrap">
              <img
                className="hero-image"
                src={heroPropertyImage}
                alt="Modern luxury property represented by Al Qaim Estate"
              />
            </div>
          </section>

          <section className="form-card" aria-labelledby="lead-form-title">
            <div className="form-header">
              <p className="form-kicker">YOUR NEXT SMART INVESTMENT IS A CALL AWAY</p>
              <h2 id="lead-form-title">Request a Free Strategy Call</h2>
              <p>
                Tell us what you're looking for, and we'll help you explore opportunities that
                fit your investment goals.
              </p>
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
                    placeholder="Ahmad Khan"
                    aria-invalid={Boolean(errors.name)}
                    disabled={isSubmitting}
                  />
                  {errors.name && <small className="error-text">{errors.name}</small>}
                </label>

                <label>
                <span>Profession</span>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="Own Business"
                  aria-invalid={Boolean(errors.profession)}
                  disabled={isSubmitting}
                />
                {errors.profession && (
                  <small className="error-text">{errors.profession}</small>
                )}
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
                    placeholder="ahmadkhan786@gmail.com"
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
                    placeholder="03004112884"
                    aria-invalid={Boolean(errors.phone)}
                    disabled={isSubmitting}
                  />
                  {errors.phone && <small className="error-text">{errors.phone}</small>}
                </label>
              </div>

              <label className="full-width">
              <span>Investment Goals</span>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="13"
                style={{
                  minHeight: '220px',
                  resize: 'vertical',
                }}
                placeholder="Tell us what you're looking for, your approximate budget, and the type of property or investment opportunity you're interested in."
                aria-invalid={Boolean(errors.message)}
                disabled={isSubmitting}
              />

              {errors.message && (
                <small className="error-text">{errors.message}</small>
              )}
            </label>

              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Request My Free Strategy Call'}
              </button>

              {submitError && (
                <p className="error-banner" role="alert">
                  {submitError}
                </p>
              )}

              {isSubmitted && (
                <p className="success-state" role="status" aria-live="polite">
                  Thanks! Your request has been received. An Al Qaim Estate team member will reach out to
                  schedule your free strategy call.
                </p>
              )}
            </form>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="site-footer-name">Al Qaim Estate</p>
          <p>Office 12, Al Qaim Business Center</p>
          <p>Main Boulevard, Lahore, Pakistan</p>
          <p>+92 300 1234567</p>

          <div className="site-footer-social" aria-label="Al Qaim Estate on social media">
            <button type="button" className="site-footer-social-link" aria-label="Facebook" title="Facebook">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93v-1.9c0-.86.24-1.44 1.47-1.44h1.57V4.42c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.9v2.18H8v2.96h2.46V21h3.04z" />
              </svg>
            </button>

            <button type="button" className="site-footer-social-link" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zm4.55-5.74a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0zM20 8.05c-.05-1.06-.29-2-1.06-2.77-.77-.77-1.71-1-2.77-1.06C15.05 4.16 8.95 4.16 7.83 4.22c-1.06.05-2 .29-2.77 1.06-.77.77-1 1.71-1.06 2.77C4 9.17 4 15.27 4 15.27c.05 1.06.29 2 1.06 2.77.77.77 1.71 1 2.77 1.06 1.12.06 7.22.06 8.34 0 1.06-.05 2-.29 2.77-1.06.77-.77 1-1.71 1.06-2.77.06-1.12.06-7.22 0-8.34zM18.32 16.9a2.44 2.44 0 0 1-1.42 1.42c-.98.39-3.32.3-4.4.3s-3.42.09-4.4-.3a2.44 2.44 0 0 1-1.42-1.42c-.39-.98-.3-3.32-.3-4.4s-.09-3.42.3-4.4A2.44 2.44 0 0 1 8.1 6.68c.98-.39 3.32-.3 4.4-.3s3.42-.09 4.4.3a2.44 2.44 0 0 1 1.42 1.42c.39.98.3 3.32.3 4.4s.09 3.42-.3 4.4z" />
              </svg>
            </button>

            <button type="button" className="site-footer-social-link" aria-label="LinkedIn" title="LinkedIn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M6.94 8.5H4.06V20h2.88V8.5zM5.5 4c-.97 0-1.75.79-1.75 1.75 0 .96.78 1.75 1.75 1.75s1.75-.79 1.75-1.75C7.25 4.79 6.47 4 5.5 4zM20 13.4c0-3.06-1.63-4.49-3.81-4.49-1.76 0-2.54.97-2.98 1.65V8.5H10.34c.04.85 0 11.5 0 11.5h2.87v-6.42c0-.34.02-.69.12-.94.27-.69.89-1.4 1.93-1.4 1.36 0 1.91 1.03 1.91 2.55V20H20v-6.6z" />
              </svg>
            </button>

            <button type="button" className="site-footer-social-link" aria-label="YouTube" title="YouTube">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M21.6 7.6a2.75 2.75 0 0 0-1.94-1.95C18 5.2 12 5.2 12 5.2s-6 0-7.66.45A2.75 2.75 0 0 0 2.4 7.6 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .4 4.4 2.75 2.75 0 0 0 1.94 1.95c1.66.45 7.66.45 7.66.45s6 0 7.66-.45a2.75 2.75 0 0 0 1.94-1.95c.27-1.45.4-2.92.4-4.4a28.6 28.6 0 0 0-.4-4.4zM10 14.9V9.1l5.2 2.9-5.2 2.9z" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

const initialPropertyFiltersState = {
  minBudget: '',
  maxBudget: '',
  propertyType: '',
  location: '',
  bedrooms: '',
  status: '',
};

function PropertiesPage() {
  const [publicProperties, setPublicProperties] = useState([]);
  const [publicPropertiesLoading, setPublicPropertiesLoading] = useState(true);
  const [publicPropertiesError, setPublicPropertiesError] = useState('');
  const [propertyImageIndexes, setPropertyImageIndexes] = useState({});
  const [propertyFilters, setPropertyFilters] = useState(initialPropertyFiltersState);

  function handlePropertyFilterChange(event) {
    const { name, value } = event.target;

    setPropertyFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleClearPropertyFilters() {
    setPropertyFilters(initialPropertyFiltersState);
  }

  function showPreviousPropertyImage(propertyId, imageCount) {
    setPropertyImageIndexes((previous) => {
      const currentIndex = previous[propertyId] ?? 0;
      const nextIndex = (currentIndex - 1 + imageCount) % imageCount;
      return { ...previous, [propertyId]: nextIndex };
    });
  }

  function showNextPropertyImage(propertyId, imageCount) {
    setPropertyImageIndexes((previous) => {
      const currentIndex = previous[propertyId] ?? 0;
      const nextIndex = (currentIndex + 1) % imageCount;
      return { ...previous, [propertyId]: nextIndex };
    });
  }

  useEffect(() => {
    async function loadPublicProperties() {
      setPublicPropertiesLoading(true);
      setPublicPropertiesError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/properties`);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error('Failed to load properties.');
        }

        setPublicProperties(data || []);
      } catch (requestError) {
        setPublicPropertiesError(
          requestError.message || 'Failed to load properties.'
        );
      } finally {
        setPublicPropertiesLoading(false);
      }
    }

    loadPublicProperties();
  }, []);

  const propertyTypeOptions = [
    ...new Set(publicProperties.map((property) => property.property_type).filter(Boolean)),
  ];
  const locationOptions = [
    ...new Set(publicProperties.map((property) => property.location).filter(Boolean)),
  ];
  const statusOptions = [
    ...new Set(publicProperties.map((property) => property.status).filter(Boolean)),
  ];

  const filteredProperties = publicProperties.filter((property) => {
    if (
      propertyFilters.minBudget !== '' &&
      !(Number(property.price) >= Number(propertyFilters.minBudget))
    ) {
      return false;
    }

    if (
      propertyFilters.maxBudget !== '' &&
      !(Number(property.price) <= Number(propertyFilters.maxBudget))
    ) {
      return false;
    }

    if (
      propertyFilters.propertyType &&
      property.property_type !== propertyFilters.propertyType
    ) {
      return false;
    }

    if (propertyFilters.location && property.location !== propertyFilters.location) {
      return false;
    }

    if (propertyFilters.bedrooms !== '') {
      if (property.bedrooms === null || property.bedrooms === undefined) {
        return false;
      }

      if (!(property.bedrooms >= Number(propertyFilters.bedrooms))) {
        return false;
      }
    }

    if (propertyFilters.status && property.status !== propertyFilters.status) {
      return false;
    }

    return true;
  });

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand">
            <span className="site-brand-name">Al Qaim Estate</span>
            <span className="site-brand-subtitle">FOR REAL ESTATE BUSINESSES</span>
          </div>

          <nav className="site-nav" aria-label="Primary">
            <a className="site-nav-link" href="/">Home</a>
            <a className="site-nav-link" href="/properties">Properties</a>
            <a className="site-nav-link" href="/about">About Us</a>
          </nav>
        </div>
      </header>

      <main className="app-shell">
        <section className="public-properties-section">
          <p className="eyebrow">OUR PROPERTIES</p>
          <h2>Explore Our Property Opportunities</h2>

          {publicPropertiesLoading && <p>Loading properties...</p>}

          {!publicPropertiesLoading && publicPropertiesError && (
            <p className="error-banner">{publicPropertiesError}</p>
          )}

          {!publicPropertiesLoading &&
            !publicPropertiesError &&
            publicProperties.length === 0 && (
              <p>No properties available at the moment.</p>
            )}

          {!publicPropertiesLoading &&
            !publicPropertiesError &&
            publicProperties.length > 0 && (
              <>
                <div className="public-property-filters">
                  <div className="public-property-filter-field">
                    <label htmlFor="property-filter-min-budget">Minimum Budget</label>
                    <input
                      id="property-filter-min-budget"
                      type="number"
                      name="minBudget"
                      min="0"
                      value={propertyFilters.minBudget}
                      onChange={handlePropertyFilterChange}
                      placeholder="No minimum"
                    />
                  </div>

                  <div className="public-property-filter-field">
                    <label htmlFor="property-filter-max-budget">Maximum Budget</label>
                    <input
                      id="property-filter-max-budget"
                      type="number"
                      name="maxBudget"
                      min="0"
                      value={propertyFilters.maxBudget}
                      onChange={handlePropertyFilterChange}
                      placeholder="No maximum"
                    />
                  </div>

                  <div className="public-property-filter-field">
                    <label htmlFor="property-filter-type">Property Type</label>
                    <select
                      id="property-filter-type"
                      name="propertyType"
                      value={propertyFilters.propertyType}
                      onChange={handlePropertyFilterChange}
                    >
                      <option value="">All Property Types</option>
                      {propertyTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="public-property-filter-field">
                    <label htmlFor="property-filter-location">Location</label>
                    <select
                      id="property-filter-location"
                      name="location"
                      value={propertyFilters.location}
                      onChange={handlePropertyFilterChange}
                    >
                      <option value="">All Locations</option>
                      {locationOptions.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="public-property-filter-field">
                    <label htmlFor="property-filter-bedrooms">Bedrooms</label>
                    <select
                      id="property-filter-bedrooms"
                      name="bedrooms"
                      value={propertyFilters.bedrooms}
                      onChange={handlePropertyFilterChange}
                    >
                      <option value="">Any Bedrooms</option>
                      <option value="1">1+ Bedrooms</option>
                      <option value="2">2+ Bedrooms</option>
                      <option value="3">3+ Bedrooms</option>
                      <option value="4">4+ Bedrooms</option>
                    </select>
                  </div>

                  <div className="public-property-filter-field">
                    <label htmlFor="property-filter-status">Availability</label>
                    <select
                      id="property-filter-status"
                      name="status"
                      value={propertyFilters.status}
                      onChange={handlePropertyFilterChange}
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="public-property-filter-actions">
                    <button
                      type="button"
                      className="public-property-filter-clear-button"
                      onClick={handleClearPropertyFilters}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                <p className="public-property-results-count">
                  {filteredProperties.length}{' '}
                  {filteredProperties.length === 1 ? 'property' : 'properties'} found
                </p>

                {filteredProperties.length === 0 ? (
                  <p>No properties match your current filters.</p>
                ) : (
                  <ul className="public-properties-list">
                {filteredProperties.map((property) => (
                  <li className="public-property-item" key={property.id}>
                    {(() => {
                      const orderedImages = getOrderedPropertyImages(property);

                      if (orderedImages.length === 0) {
                        return null;
                      }

                      const currentIndex = propertyImageIndexes[property.id] ?? 0;
                      const currentImage =
                        orderedImages[currentIndex] || orderedImages[0];

                      return (
                        <div className="public-property-carousel">
                          <img
                            className="public-property-carousel-image"
                            src={currentImage.image_url}
                            alt={property.title}
                          />

                          {orderedImages.length > 1 && (
                            <>
                              <button
                                type="button"
                                className="public-property-carousel-button public-property-carousel-button-previous"
                                onClick={() =>
                                  showPreviousPropertyImage(
                                    property.id,
                                    orderedImages.length
                                  )
                                }
                                aria-label="Previous image"
                              >
                                ‹
                              </button>

                              <button
                                type="button"
                                className="public-property-carousel-button public-property-carousel-button-next"
                                onClick={() =>
                                  showNextPropertyImage(
                                    property.id,
                                    orderedImages.length
                                  )
                                }
                                aria-label="Next image"
                              >
                                ›
                              </button>

                              <div className="public-property-carousel-dots">
                                {orderedImages.map((image, index) => (
                                  <button
                                    type="button"
                                    key={image.id ?? index}
                                    className={`public-property-carousel-dot${
                                      index === currentIndex ? ' active' : ''
                                    }`}
                                    onClick={() =>
                                      setPropertyImageIndexes((previous) => ({
                                        ...previous,
                                        [property.id]: index,
                                      }))
                                    }
                                    aria-label={`Show image ${index + 1}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    <div className="public-property-body">
                      <h3 className="public-property-title">{property.title}</h3>
                      <p className="public-property-meta">{property.property_type}</p>
                      <p className="public-property-meta">{property.location}</p>
                      <p className="public-property-price">
                        {property.currency} {property.price}
                      </p>
                      <span className="public-property-status-badge">
                        {property.status}
                      </span>
                    </div>
                  </li>
                ))}
                  </ul>
                )}
              </>
            )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="site-footer-name">Al Qaim Estate</p>
          <p>Office 12, Al Qaim Business Center</p>
          <p>Main Boulevard, Lahore, Pakistan</p>
          <p>+92 300 1234567</p>

          <div className="site-footer-social" aria-label="Al Qaim Estate on social media">
            <button type="button" className="site-footer-social-link" aria-label="Facebook" title="Facebook">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93v-1.9c0-.86.24-1.44 1.47-1.44h1.57V4.42c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.9v2.18H8v2.96h2.46V21h3.04z" />
              </svg>
            </button>

            <button type="button" className="site-footer-social-link" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zm4.55-5.74a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0zM20 8.05c-.05-1.06-.29-2-1.06-2.77-.77-.77-1.71-1-2.77-1.06C15.05 4.16 8.95 4.16 7.83 4.22c-1.06.05-2 .29-2.77 1.06-.77.77-1 1.71-1.06 2.77C4 9.17 4 15.27 4 15.27c.05 1.06.29 2 1.06 2.77.77.77 1.71 1 2.77 1.06 1.12.06 7.22.06 8.34 0 1.06-.05 2-.29 2.77-1.06.77-.77 1-1.71 1.06-2.77.06-1.12.06-7.22 0-8.34zM18.32 16.9a2.44 2.44 0 0 1-1.42 1.42c-.98.39-3.32.3-4.4.3s-3.42.09-4.4-.3a2.44 2.44 0 0 1-1.42-1.42c-.39-.98-.3-3.32-.3-4.4s-.09-3.42.3-4.4A2.44 2.44 0 0 1 8.1 6.68c.98-.39 3.32-.3 4.4-.3s3.42-.09 4.4.3a2.44 2.44 0 0 1 1.42 1.42c.39.98.3 3.32.3 4.4s.09 3.42-.3 4.4z" />
              </svg>
            </button>

            <button type="button" className="site-footer-social-link" aria-label="LinkedIn" title="LinkedIn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M6.94 8.5H4.06V20h2.88V8.5zM5.5 4c-.97 0-1.75.79-1.75 1.75 0 .96.78 1.75 1.75 1.75s1.75-.79 1.75-1.75C7.25 4.79 6.47 4 5.5 4zM20 13.4c0-3.06-1.63-4.49-3.81-4.49-1.76 0-2.54.97-2.98 1.65V8.5H10.34c.04.85 0 11.5 0 11.5h2.87v-6.42c0-.34.02-.69.12-.94.27-.69.89-1.4 1.93-1.4 1.36 0 1.91 1.03 1.91 2.55V20H20v-6.6z" />
              </svg>
            </button>

            <button type="button" className="site-footer-social-link" aria-label="YouTube" title="YouTube">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M21.6 7.6a2.75 2.75 0 0 0-1.94-1.95C18 5.2 12 5.2 12 5.2s-6 0-7.66.45A2.75 2.75 0 0 0 2.4 7.6 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .4 4.4 2.75 2.75 0 0 0 1.94 1.95c1.66.45 7.66.45 7.66.45s6 0 7.66-.45a2.75 2.75 0 0 0 1.94-1.95c.27-1.45.4-2.92.4-4.4a28.6 28.6 0 0 0-.4-4.4zM10 14.9V9.1l5.2 2.9-5.2 2.9z" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand">
            <span className="site-brand-name">Al Qaim Estate</span>
            <span className="site-brand-subtitle">FOR REAL ESTATE BUSINESSES</span>
          </div>

          <nav className="site-nav" aria-label="Primary">
            <a className="site-nav-link" href="/">Home</a>
            <a className="site-nav-link" href="/properties">Properties</a>
            <a className="site-nav-link" href="/about">About Us</a>
          </nav>
        </div>
      </header>

      <main className="app-shell">
        <section className="about-section" id="about">
          <p className="eyebrow">ABOUT AL QAIM ESTATE</p>
          <h2 className="about-heading">Helping You Find the Right Real Estate Opportunity</h2>
          <p className="about-body">
            Al Qaim Estate connects investors and property buyers with carefully selected real
            estate opportunities. We focus on understanding what our clients are looking for and
            helping them explore properties that align with their budget, goals, and investment
            interests.
          </p>
          <p className="about-body">
            Our goal is to make the process of discovering and evaluating real estate
            opportunities simple, transparent, and straightforward — from the first conversation
            to finding an opportunity that feels right for you.
          </p>
          <a className="submit-button about-cta" href="/properties">Explore Properties</a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="site-footer-name">Al Qaim Estate</p>
          <p>Office 12, Al Qaim Business Center</p>
          <p>Main Boulevard, Lahore, Pakistan</p>
          <p>+92 300 1234567</p>

          <div className="site-footer-social" aria-label="Al Qaim Estate on social media">
            <button type="button" className="site-footer-social-link" aria-label="Facebook" title="Facebook">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93v-1.9c0-.86.24-1.44 1.47-1.44h1.57V4.42c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.9v2.18H8v2.96h2.46V21h3.04z" />
              </svg>
            </button>

            <button type="button" className="site-footer-social-link" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zm4.55-5.74a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0zM20 8.05c-.05-1.06-.29-2-1.06-2.77-.77-.77-1.71-1-2.77-1.06C15.05 4.16 8.95 4.16 7.83 4.22c-1.06.05-2 .29-2.77 1.06-.77.77-1 1.71-1.06 2.77C4 9.17 4 15.27 4 15.27c.05 1.06.29 2 1.06 2.77.77.77 1.71 1 2.77 1.06 1.12.06 7.22.06 8.34 0 1.06-.05 2-.29 2.77-1.06.77-.77 1-1.71 1.06-2.77.06-1.12.06-7.22 0-8.34zM18.32 16.9a2.44 2.44 0 0 1-1.42 1.42c-.98.39-3.32.3-4.4.3s-3.42.09-4.4-.3a2.44 2.44 0 0 1-1.42-1.42c-.39-.98-.3-3.32-.3-4.4s-.09-3.42.3-4.4A2.44 2.44 0 0 1 8.1 6.68c.98-.39 3.32-.3 4.4-.3s3.42-.09 4.4.3a2.44 2.44 0 0 1 1.42 1.42c.39.98.3 3.32.3 4.4s.09 3.42-.3 4.4z" />
              </svg>
            </button>

            <button type="button" className="site-footer-social-link" aria-label="LinkedIn" title="LinkedIn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M6.94 8.5H4.06V20h2.88V8.5zM5.5 4c-.97 0-1.75.79-1.75 1.75 0 .96.78 1.75 1.75 1.75s1.75-.79 1.75-1.75C7.25 4.79 6.47 4 5.5 4zM20 13.4c0-3.06-1.63-4.49-3.81-4.49-1.76 0-2.54.97-2.98 1.65V8.5H10.34c.04.85 0 11.5 0 11.5h2.87v-6.42c0-.34.02-.69.12-.94.27-.69.89-1.4 1.93-1.4 1.36 0 1.91 1.03 1.91 2.55V20H20v-6.6z" />
              </svg>
            </button>

            <button type="button" className="site-footer-social-link" aria-label="YouTube" title="YouTube">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M21.6 7.6a2.75 2.75 0 0 0-1.94-1.95C18 5.2 12 5.2 12 5.2s-6 0-7.66.45A2.75 2.75 0 0 0 2.4 7.6 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .4 4.4 2.75 2.75 0 0 0 1.94 1.95c1.66.45 7.66.45 7.66.45s6 0 7.66-.45a2.75 2.75 0 0 0 1.94-1.95c.27-1.45.4-2.92.4-4.4a28.6 28.6 0 0 0-.4-4.4zM10 14.9V9.1l5.2 2.9-5.2 2.9z" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {window.location.pathname === '/admin' ? (
      <AdminDashboard />
    ) : window.location.pathname === '/properties' ? (
      <PropertiesPage />
    ) : window.location.pathname === '/about' ? (
      <AboutPage />
    ) : (
      <App />
    )}
  </React.StrictMode>
);
