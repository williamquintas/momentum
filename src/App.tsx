import { BrowserRouter } from 'react-router-dom';

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
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
