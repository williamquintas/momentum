import { Navigate } from 'react-router-dom';

/**
 * HomePage Component
 *
 * Redirects users to the main Goals page, which is the primary entry point
 * for Momentum.
 *
 * Future enhancement: This could be replaced with a dashboard showing
 * overview metrics, recent goals, and quick actions.
 */
export const HomePage = () => {
  return <Navigate to="/goals" replace />;
};
