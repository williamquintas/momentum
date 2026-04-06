import { lazy, Suspense } from 'react';

import { Spin } from 'antd';
import { Routes, Route } from 'react-router-dom';

import { MainLayout } from '@/layouts/MainLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Lazy load route components for code splitting
const HomePage = lazy(() => import('@/pages/HomePage').then((module) => ({ default: module.HomePage })));
const GoalsPage = lazy(() => import('@/pages/GoalsPage').then((module) => ({ default: module.GoalsPage })));
const GoalDetailPage = lazy(() =>
  import('@/pages/GoalDetailPage').then((module) => ({
    default: module.GoalDetailPage,
  }))
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  }))
);
const NotificationsPage = lazy(() =>
  import('@/pages/NotificationsPage').then((module) => ({
    default: module.NotificationsPage,
  }))
);

// Loading fallback component using Ant Design Spin
const RouteLoadingFallback = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <Spin size="large" />
  </div>
);

/**
 * Application routes configuration
 *
 * Routes are lazy-loaded for code splitting and performance optimization.
 * All routes are nested under MainLayout for consistent layout structure.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="goals"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <GoalsPage />
            </Suspense>
          }
        />
        <Route
          path="goals/:id"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <GoalDetailPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <NotificationsPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
