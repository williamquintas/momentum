import { Navigate } from 'react-router-dom';

/**
 * HomePage Component
 *
 * Redirects users to the main Goals page, which is the primary entry point
 * for the Goals Tracking Management System.
 *
 * Future enhancement: This could be replaced with a dashboard showing
 * overview metrics, recent goals, and quick actions (see dashboard-mockup.md).
 */
export const HomePage = () => {
  return <Navigate to="/goals" replace />;
};
