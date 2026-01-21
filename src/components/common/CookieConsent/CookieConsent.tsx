/**
 * CookieConsent Component
 *
 * Cookie consent banner for GDPR compliance.
 * Displays a banner on first visit and stores user preference in localStorage.
 *
 * Features:
 * - Shows banner on first visit only
 * - Stores consent preference in localStorage
 * - Opt-in/opt-out functionality
 * - Respects user preference across sessions
 * - Clears non-essential data on rejection
 * - Only shows if localStorage is available
 */

import { useEffect, useState } from 'react';

import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Space, message } from 'antd';

import { clearNonEssentialStorage, getCookieConsent, saveCookieConsent } from '@/utils/cookieConsent';

/**
 * CookieConsent Component
 */
export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has been given
    const consent = getCookieConsent();
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    saveCookieConsent('accepted');
    setShowBanner(false);
    void message.success('Cookie consent accepted. Your preferences will be saved.');
  };

  const handleReject = () => {
    // Save rejection status first
    saveCookieConsent('rejected');

    // Clear all non-essential localStorage data
    clearNonEssentialStorage();

    setShowBanner(false);

    // Show info message about limited functionality
    void message.info({
      content:
        'Only necessary cookies enabled. Your preferences and goals will not be saved between sessions. You can change this in settings.',
      duration: 6,
    });
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Alert
      message="Cookie Consent"
      description={
        <div>
          <p style={{ marginBottom: 12 }}>
            We use cookies and local storage to enhance your experience, analyze site usage, and assist in our marketing
            efforts. By clicking &quot;Accept&quot;, you consent to our use of cookies and local storage. Click
            &quot;Necessary Only&quot; to use only essential functionality.
          </p>
          <Space>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleAccept}>
              Accept
            </Button>
            <Button icon={<CloseCircleOutlined />} onClick={handleReject}>
              Necessary Only
            </Button>
          </Space>
        </div>
      }
      type="info"
      closable={false}
      showIcon
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '600px',
        width: 'calc(100% - 48px)',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    />
  );
};
