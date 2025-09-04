
import { useState } from 'react';
import axios from 'axios';

export default function Onboard() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    availability: '',
    skills: '',
    consent: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('You must consent to identity verification.');
      return;
    }

    try {
      await axios.post('/api/onboard', formData);
      alert('Submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Submission failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Full Name" onChange={handleChange} required />
      <input name="address" placeholder="Address" onChange={handleChange} required />
      <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
      <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
      <input name="availability" placeholder="Availability" onChange={handleChange} />
      <input name="skills" placeholder="Skills (comma-separated)" onChange={handleChange} />
      <label>
        <input type="checkbox" name="consent" onChange={handleChange} />
        I consent to identity verification via Square
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
