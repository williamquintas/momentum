import { BrowserRouter } from 'react-router-dom';

import { CookieConsent } from '@/components/common/CookieConsent';
import { InstallPrompt } from '@/components/common/InstallPrompt';
import { UpdateToast } from '@/components/common/UpdateToast';
import { PwaInstallProvider } from '@/contexts/PwaInstallContext';
import '@/i18n';
import { AppRoutes } from '@/routes';

/**
 * Main application component
 *
 * Provides routing context via BrowserRouter and renders application routes.
 * Route definitions are separated into @/routes for better organization.
 */
function App() {
  return (
    <BrowserRouter>
      <PwaInstallProvider>
        <UpdateToast />
        <AppRoutes />
        <InstallPrompt />
        <CookieConsent />
      </PwaInstallProvider>
    </BrowserRouter>
  );
}

export default App;
