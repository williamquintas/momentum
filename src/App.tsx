import { BrowserRouter } from 'react-router-dom';

import { UpdateToast } from '@/components/common/UpdateToast';
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
      <UpdateToast />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
