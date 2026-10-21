import React, { useState } from 'react';
import { profile } from '../../content/profile';

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Inquiry via NJ-OS] ${name}`);
    const body = encodeURIComponent(
      `Hello Nishant,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n[Transmitted via NJ-OS Command Center]`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="contact-container">
      <div className="os-module-header">
        <div className="os-module-title-group">
          <h2>07 // TRANSMISSION PROTOCOL</h2>
          <p>COMMUNICATION CHANNELS</p>
        </div>
      </div>

      <div className="contact-grid">
        <div className="contact-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontSize: '1.25rem' }}>
            Direct Message Transmission
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Compose a direct dispatch. Submitting opens your native mail client formatted with routing metadata.
          </p>

          <form className="contact-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="contact-name">SENDER IDENTITY / NAME</label>
              <input
                id="contact-name"
                type="text"
                className="form-input"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">RETURN ADDRESS / EMAIL</label>
              <input
                id="contact-email"
                type="email"
                className="form-input"
                placeholder="contact@organization.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-msg">TRANSMISSION CONTENT</label>
              <textarea
                id="contact-msg"
                className="form-textarea"
                placeholder="Brief project scope, engineering opportunity, or technical inquiry..."
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button type="submit" className="os-btn os-btn-primary" style={{ marginTop: '0.5rem' }}>
              TRANSMIT VIA MAIL CLIENT ↗
            </button>
          </form>
        </div>

        <div className="contact-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontSize: '1.25rem' }}>
            Contact Details
          </h3>

          <div className="contact-channels">
            <div className="channel-link" style={{ justifyContent: 'space-between' }}>
              <div className="channel-info">
                <span className="channel-title">Direct Email</span>
                <span className="channel-val">{profile.email}</span>
              </div>
              <button
                type="button"
                className="os-btn os-btn-subtle"
                onClick={handleCopyEmail}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
              >
                {copied ? '✓ COPIED' : 'COPY'}
              </button>
            </div>

            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="channel-link"
            >
              <div className="channel-info">
                <span className="channel-title">GitHub Profile</span>
                <span className="channel-val">github.com/jainnishant779</span>
              </div>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>↗</span>
            </a>

            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="channel-link"
            >
              <div className="channel-info">
                <span className="channel-title">LinkedIn Connection</span>
                <span className="channel-val">linkedin.com/in/nishujain02</span>
              </div>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>↗</span>
            </a>

            <div className="dossier-notice" style={{ marginTop: '1rem' }}>
              <strong>LOCATION:</strong> {profile.location}
              <br />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Timezone: IST (UTC +5:30)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
