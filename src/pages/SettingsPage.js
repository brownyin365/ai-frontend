import React, { useState, useEffect } from 'react';
import { 
  FaSave, 
  FaTelegram, 
  FaWhatsapp, 
  FaRobot, 
  FaUserCog,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaIndustry,
  FaToggleOn,
  FaToggleOff,
  FaKey,
  FaDatabase,
  FaServer,
  FaShieldAlt,
  FaGlobe,
  FaClock
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getProfile, updateSettings, restartTelegram, restartWhatsApp, getWhatsAppStatus } from '../services/api';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    businessName: '',
    email: '',
    phone: '',
    industry: 'technology',
    autoReply: true,
    leadCollection: true,
    // Telegram settings
    telegramBot: '',
    telegramEnabled: false,
    // WhatsApp settings
    whatsappNumber: '',
    whatsappEnabled: false,
    twilioAccountSid: '',
    twilioAuthToken: '',
    // AI settings
    aiModel: 'gpt-3.5-turbo',
    aiTemperature: 0.7,
    openaiApiKey: '',
    // Business hours
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC'
    }
  });

  const industries = [
    { value: 'bank', label: '🏦 Banking' },
    { value: 'school', label: '🏫 School' },
    { value: 'hotel', label: '🏨 Hotel' },
    { value: 'ecommerce', label: '🛍️ E-commerce' },
    { value: 'immigration', label: '🌍 Immigration' },
    { value: 'technology', label: '💻 Technology' },
    { value: 'healthcare', label: '🏥 Healthcare' },
    { value: 'realestate', label: '🏠 Real Estate' },
    { value: 'other', label: '📌 Other' }
  ];

  const aiModels = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast & Cost-effective)' },
    { value: 'gpt-4', label: 'GPT-4 (More Capable)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Latest)' }
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Dubai', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'
  ];

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        setSettings({
          businessName: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          industry: data.industry || 'technology',
          autoReply: data.settings?.autoReply !== undefined ? data.settings.autoReply : true,
          leadCollection: data.settings?.leadCollection !== undefined ? data.settings.leadCollection : true,
          telegramBot: data.integrations?.telegram?.botToken || '',
          telegramEnabled: data.integrations?.telegram?.enabled || false,
          whatsappNumber: data.integrations?.whatsapp?.phoneNumber || '',
          whatsappEnabled: data.integrations?.whatsapp?.enabled || false,
          twilioAccountSid: data.integrations?.whatsapp?.accountSid || '',
          twilioAuthToken: data.integrations?.whatsapp?.authToken || '',
          aiModel: 'gpt-3.5-turbo',
          aiTemperature: 0.7,
          openaiApiKey: '',
          businessHours: data.settings?.businessHours || {
            start: '09:00',
            end: '17:00',
            timezone: 'UTC'
          }
        });
        toast.success('Settings loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      // Set default values
      setSettings({
        businessName: 'AI Support Agency',
        email: 'support@aisupport.com',
        phone: '+1 234 567 8900',
        industry: 'technology',
        autoReply: true,
        leadCollection: true,
        telegramBot: '',
        telegramEnabled: false,
        whatsappNumber: '',
        whatsappEnabled: false,
        twilioAccountSid: '',
        twilioAuthToken: '',
        aiModel: 'gpt-3.5-turbo',
        aiTemperature: 0.7,
        openaiApiKey: '',
        businessHours: {
          start: '09:00',
          end: '17:00',
          timezone: 'UTC'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Function to restart Telegram bot
  const restartTelegramBot = async () => {
    try {
      const response = await restartTelegram({
        botToken: settings.telegramBot,
        enabled: settings.telegramEnabled
      });
      
      if (response.data && response.data.success) {
        toast.success('Telegram bot restarted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error restarting Telegram bot:', error);
      toast.error('Failed to restart Telegram bot');
      return false;
    }
  };

  // Function to restart WhatsApp service
  const restartWhatsAppService = async () => {
    try {
      const response = await restartWhatsApp({
        accountSid: settings.twilioAccountSid,
        authToken: settings.twilioAuthToken,
        whatsappNumber: settings.whatsappNumber,
        enabled: settings.whatsappEnabled
      });
      
      if (response.data && response.data.success) {
        toast.success('WhatsApp service restarted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error restarting WhatsApp:', error);
      toast.error('Failed to restart WhatsApp service');
      return false;
    }
  };

  // Updated handleSubmit with both Telegram and WhatsApp restart
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        name: settings.businessName,
        email: settings.email,
        phone: settings.phone,
        industry: settings.industry,
        settings: {
          autoReply: settings.autoReply,
          leadCollection: settings.leadCollection,
          businessHours: settings.businessHours
        },
        integrations: {
          telegram: {
            enabled: settings.telegramEnabled,
            botToken: settings.telegramBot
          },
          whatsapp: {
            enabled: settings.whatsappEnabled,
            phoneNumber: settings.whatsappNumber,
            accountSid: settings.twilioAccountSid,
            authToken: settings.twilioAuthToken
          }
        }
      };

      const response = await updateSettings(updateData);
      
      if (response.data && response.data.success) {
        toast.success('Settings saved successfully!');
        
        // Handle Telegram restart
        if (settings.telegramEnabled && settings.telegramBot) {
          await restartTelegramBot();
        } else if (!settings.telegramEnabled) {
          try {
            await restartTelegram({ enabled: false });
            toast.info('Telegram bot stopped');
          } catch (stopError) {
            console.error('Error stopping Telegram bot:', stopError);
          }
        }
        
        // Handle WhatsApp restart
        if (settings.whatsappEnabled && settings.twilioAccountSid && settings.twilioAuthToken && settings.whatsappNumber) {
          await restartWhatsAppService();
        } else if (!settings.whatsappEnabled) {
          try {
            await restartWhatsApp({ enabled: false });
            toast.info('WhatsApp service stopped');
          } catch (stopError) {
            console.error('Error stopping WhatsApp service:', stopError);
          }
        }
        
        // Refresh settings
        await fetchSettings();
      } else {
        toast.error(response.data?.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSwitch = (name) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-subtitle">Configure your business settings and integrations</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary save-btn"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <FaSpinner className="spinner" /> Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          <FaUserCog /> Business
        </button>
        <button 
          className={`tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <FaTelegram /> Integrations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <FaRobot /> AI Settings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <FaShieldAlt /> Security
        </button>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Business Tab */}
        {activeTab === 'business' && (
          <div className="settings-section">
            <div className="section-header">
              <h3><FaBuilding /> Business Information</h3>
              <p>Update your business details and preferences</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Business Name <span className="required">*</span></label>
                <div className="input-with-icon">
                  <FaBuilding className="input-icon" />
                  <input
                    type="text"
                    name="businessName"
                    value={settings.businessName}
                    onChange={handleChange}
                    placeholder="Enter business name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone <span className="required">*</span></label>
                <div className="input-with-icon">
                  <FaPhone className="input-icon" />
                  <input
                    type="text"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Industry <span className="required">*</span></label>
                <div className="input-with-icon">
                  <FaIndustry className="input-icon" />
                  <select 
                    name="industry" 
                    value={settings.industry} 
                    onChange={handleChange}
                    required
                  >
                    {industries.map(ind => (
                      <option key={ind.value} value={ind.value}>
                        {ind.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-divider"></div>

            <div className="section-header">
              <h3><FaClock /> Business Hours</h3>
              <p>Set your business operating hours</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="businessHours.start"
                  value={settings.businessHours.start}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="businessHours.end"
                  value={settings.businessHours.end}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select
                  name="businessHours.timezone"
                  value={settings.businessHours.timezone}
                  onChange={handleChange}
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-divider"></div>

            <div className="section-header">
              <h3>Preferences</h3>
              <p>Configure your business preferences</p>
            </div>

            <div className="toggle-group">
              <div className="toggle-item">
                <div className="toggle-info">
                  <label>Auto-Reply</label>
                  <span>Automatically respond to customer messages</span>
                </div>
                <button 
                  type="button"
                  className={`toggle-switch ${settings.autoReply ? 'active' : ''}`}
                  onClick={() => toggleSwitch('autoReply')}
                >
                  {settings.autoReply ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <label>Lead Collection</label>
                  <span>Automatically capture leads from conversations</span>
                </div>
                <button 
                  type="button"
                  className={`toggle-switch ${settings.leadCollection ? 'active' : ''}`}
                  onClick={() => toggleSwitch('leadCollection')}
                >
                  {settings.leadCollection ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="settings-section">
            <div className="section-header">
              <h3><FaTelegram /> Telegram Integration</h3>
              <p>Connect your Telegram bot for automated customer support</p>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <label>Enable Telegram Bot</label>
                <span>Allow customers to reach you via Telegram</span>
              </div>
              <button 
                type="button"
                className={`toggle-switch ${settings.telegramEnabled ? 'active' : ''}`}
                onClick={() => toggleSwitch('telegramEnabled')}
              >
                {settings.telegramEnabled ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>

            <div className="form-group">
              <label>Bot Token</label>
              <div className="input-with-icon">
                <FaKey className="input-icon" />
                <input
                  type="password"
                  name="telegramBot"
                  value={settings.telegramBot}
                  onChange={handleChange}
                  placeholder="Enter your Telegram bot token"
                  disabled={!settings.telegramEnabled}
                />
              </div>
              <span className="field-hint">Get your bot token from <a href="https://t.me/botfather" target="_blank" rel="noopener noreferrer">@BotFather</a> on Telegram</span>
            </div>

            <div className="form-divider"></div>

            <div className="section-header">
              <h3><FaWhatsapp /> WhatsApp Integration</h3>
              <p>Connect your WhatsApp Business account</p>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <label>Enable WhatsApp Business</label>
                <span>Allow customers to reach you via WhatsApp</span>
              </div>
              <button 
                type="button"
                className={`toggle-switch ${settings.whatsappEnabled ? 'active' : ''}`}
                onClick={() => toggleSwitch('whatsappEnabled')}
              >
                {settings.whatsappEnabled ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>

            <div className="form-group">
              <label>Twilio Account SID</label>
              <div className="input-with-icon">
                <FaKey className="input-icon" />
                <input
                  type="text"
                  name="twilioAccountSid"
                  value={settings.twilioAccountSid}
                  onChange={handleChange}
                  placeholder="Enter Twilio Account SID"
                  disabled={!settings.whatsappEnabled}
                />
              </div>
              <span className="field-hint">Find this in your <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer">Twilio Console</a></span>
            </div>

            <div className="form-group">
              <label>Twilio Auth Token</label>
              <div className="input-with-icon">
                <FaKey className="input-icon" />
                <input
                  type="password"
                  name="twilioAuthToken"
                  value={settings.twilioAuthToken}
                  onChange={handleChange}
                  placeholder="Enter Twilio Auth Token"
                  disabled={!settings.whatsappEnabled}
                />
              </div>
              <span className="field-hint">Find this in your <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer">Twilio Console</a></span>
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <div className="input-with-icon">
                <FaPhone className="input-icon" />
                <input
                  type="text"
                  name="whatsappNumber"
                  value={settings.whatsappNumber}
                  onChange={handleChange}
                  placeholder="whatsapp:+14155238886"
                  disabled={!settings.whatsappEnabled}
                />
              </div>
              <span className="field-hint">Enter your WhatsApp Business phone number with country code</span>
            </div>
          </div>
        )}


        {/* Email Integration */}
{/* <div className="section-header">
  <h3><FaEnvelope /> Email Integration</h3>
  <p>Connect your email for AI-powered customer support</p>
</div>

<div className="toggle-item">
  <div className="toggle-info">
    <label>Enable Email Support</label>
    <span>Allow customers to receive AI responses via email</span>
  </div>
  <button 
    type="button"
    className={`toggle-switch ${settings.emailEnabled ? 'active' : ''}`}
    onClick={() => toggleSwitch('emailEnabled')}
  >
    {settings.emailEnabled ? <FaToggleOn /> : <FaToggleOff />}
  </button>
</div>

<div className="form-group">
  <label>Support Email</label>
  <div className="input-with-icon">
    <FaEnvelope className="input-icon" />
    <input
      type="email"
      name="emailSupportAddress"
      value={settings.emailSupportAddress || process.env.REACT_APP_EMAIL_SUPPORT}
      onChange={handleChange}
      placeholder="support@yourbusiness.com"
      disabled={!settings.emailEnabled}
    />
  </div>
  <span className="field-hint">This email will be used to send and receive customer support emails</span>
</div>

<div className="form-group">
  <label>Test Email</label>
  <div className="input-with-icon">
    <FaEnvelope className="input-icon" />
    <input
      type="email"
      name="testEmail"
      value={settings.testEmail || ''}
      onChange={handleChange}
      placeholder="test@example.com"
      disabled={!settings.emailEnabled}
    />
  </div>
  <button 
    type="button" 
    className="btn-secondary"
    onClick={async () => {
      if (!settings.testEmail) {
        toast.error('Please enter a test email address');
        return;
      }
      try {
        await sendTestEmail(settings.testEmail);
        toast.success('Test email sent!');
      } catch (error) {
        toast.error('Failed to send test email');
      }
    }}
    disabled={!settings.emailEnabled}
  >
    <FaEnvelope /> Send Test Email
  </button>
</div> */}



        {/* AI Settings Tab */}
        {activeTab === 'ai' && (
          <div className="settings-section">
            <div className="section-header">
              <h3><FaRobot /> AI Configuration</h3>
              <p>Configure your AI assistant settings</p>
            </div>

            <div className="form-group">
              <label>AI Model</label>
              <select 
                name="aiModel" 
                value={settings.aiModel} 
                onChange={handleChange}
              >
                {aiModels.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Temperature: <span className="temp-value">{settings.aiTemperature}</span></label>
              <div className="range-wrapper">
                <span className="range-label">Focused</span>
                <input
                  type="range"
                  name="aiTemperature"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.aiTemperature}
                  onChange={handleChange}
                  className="range-input"
                />
                <span className="range-label">Creative</span>
              </div>
              <span className="field-hint">Lower = More focused responses, Higher = More creative responses</span>
            </div>

            <div className="form-group">
              <label>OpenAI API Key</label>
              <div className="input-with-icon">
                <FaKey className="input-icon" />
                <input
                  type="password"
                  name="openaiApiKey"
                  value={settings.openaiApiKey}
                  onChange={handleChange}
                  placeholder="Enter your OpenAI API key"
                />
              </div>
              <span className="field-hint">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a></span>
            </div>

            <div className="ai-status">
              <div className="status-item">
                <span className="status-label">AI Status:</span>
                <span className="status-value active">
                  <FaCheck /> Connected
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Model:</span>
                <span className="status-value">{settings.aiModel}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Temperature:</span>
                <span className="status-value">{settings.aiTemperature}</span>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <div className="section-header">
              <h3><FaShieldAlt /> Security Settings</h3>
              <p>Manage your account security and API keys</p>
            </div>

            <div className="security-grid">
              <div className="security-card">
                <div className="security-icon"><FaKey /></div>
                <div className="security-info">
                  <h4>API Keys</h4>
                  <p>Manage your API keys for third-party integrations</p>
                  <button className="btn-secondary">Manage Keys</button>
                </div>
              </div>

              <div className="security-card">
                <div className="security-icon"><FaDatabase /></div>
                <div className="security-info">
                  <h4>Data Export</h4>
                  <p>Export all your business data</p>
                  <button className="btn-secondary">Export Data</button>
                </div>
              </div>

              <div className="security-card">
                <div className="security-icon"><FaServer /></div>
                <div className="security-info">
                  <h4>Backup</h4>
                  <p>Create a backup of your settings and data</p>
                  <button className="btn-secondary">Create Backup</button>
                </div>
              </div>

              <div className="security-card">
                <div className="security-icon"><FaGlobe /></div>
                <div className="security-info">
                  <h4>Webhooks</h4>
                  <p>Configure webhooks for external services</p>
                  <button className="btn-secondary">Configure</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary save-btn" disabled={saving}>
            {saving ? (
              <>
                <FaSpinner className="spinner" /> Saving...
              </>
            ) : (
              <>
                <FaSave /> Save All Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;