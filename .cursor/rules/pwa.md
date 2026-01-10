# Progressive Web App (PWA)

## Core PWA Requirements
- **Service Worker**: Required for offline functionality and caching
- **Web App Manifest**: Required for installability and app-like experience
- **HTTPS**: Required for service workers (localhost allowed for development)
- **Responsive Design**: Must work on all device sizes
- **Fast Loading**: Optimize initial load time

## Service Worker

### Registration
- Register service worker in main app entry point
- Check for service worker support before registration
- Handle service worker updates gracefully
- Show update notifications to users
- Use `navigator.serviceWorker.register()` with proper error handling

### Service Worker Lifecycle
- **Install**: Cache essential resources
- **Activate**: Clean up old caches
- **Fetch**: Intercept network requests
- **Message**: Handle communication with main thread

### Service Worker Updates
- Implement update checking mechanism
- Prompt users when updates are available
- Use `skipWaiting()` and `clients.claim()` appropriately
- Handle version conflicts gracefully
- Clear old caches on activation
- Example registration with update handling:
  ```typescript
  // utils/serviceWorkerRegistration.ts
  export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, prompt user
                showUpdateNotification();
              }
            });
          }
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
    return null;
  };
  ```

## Web App Manifest

### Required Fields
- `name`: Full app name
- `short_name`: Short name for home screen
- `start_url`: Entry point when launched
- `display`: Display mode (standalone, fullscreen, minimal-ui)
- `icons`: Multiple sizes (192x192, 512x512 minimum)
- `theme_color`: Theme color for browser UI
- `background_color`: Background color for splash screen

### Recommended Fields
- `description`: App description
- `categories`: App categories
- `orientation`: Preferred orientation
- `scope`: Navigation scope
- `lang`: Primary language
- `dir`: Text direction

### Advanced Manifest Features
- **Shortcuts**: Quick actions from home screen
  ```json
  {
    "shortcuts": [
      {
        "name": "Create Goal",
        "short_name": "New Goal",
        "description": "Quickly create a new goal",
        "url": "/goals/new",
        "icons": [{ "src": "/icons/shortcut-create.png", "sizes": "96x96" }]
      }
    ]
  }
  ```
- **Share Target**: Receive shared content from other apps
  ```json
  {
    "share_target": {
      "action": "/share",
      "method": "POST",
      "enctype": "multipart/form-data",
      "params": {
        "title": "title",
        "text": "text",
        "url": "url"
      }
    }
  }
  ```
- **Protocol Handlers**: Handle custom URL schemes
  ```json
  {
    "protocol_handlers": [
      {
        "protocol": "web+goals",
        "url": "/goals?action=%s"
      }
    ]
  }
  ```
- **Screenshots**: For app store listings and install prompts
- **iarc_rating_id**: Content rating for app stores

### Icon Requirements
- Provide icons in multiple sizes: 192x192, 512x512 (required)
- Additional sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 384x384
- Use PNG format with transparency support
- Ensure icons are high quality and recognizable
- Test icons on various devices

## Caching Strategies

### Cache-First Strategy
- Use for static assets (images, fonts, CSS, JS)
- Serve from cache, fallback to network
- Best for assets that rarely change

### Network-First Strategy
- Use for API calls and dynamic content
- Try network first, fallback to cache
- Best for data that needs to be fresh

### Stale-While-Revalidate Strategy
- Serve from cache immediately
- Update cache in background
- Best for content that can be slightly stale

### Cache Implementation
- Use Cache API for storing responses
- Implement cache versioning
- Set appropriate cache expiration
- Limit cache size to prevent storage issues
- Clean up old caches regularly

### Cache Categories
- **App Shell**: Core UI structure and styles
- **Static Assets**: Images, fonts, icons
- **API Responses**: Cached API data with expiration
- **Offline Pages**: Fallback pages for offline scenarios

### Cache Implementation Example
- Example service worker cache implementation:
  ```typescript
  // sw.js
  const CACHE_VERSION = 'v1';
  const CACHE_NAME = `goals-app-${CACHE_VERSION}`;
  const STATIC_CACHE = `${CACHE_NAME}-static`;
  const API_CACHE = `${CACHE_NAME}-api`;
  
  const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/static/css/main.css',
  ];
  
  // Install: Cache static assets
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
    );
    self.skipWaiting();
  });
  
  // Activate: Clean up old caches
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('goals-app-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
    );
    self.clients.claim();
  });
  
  // Fetch: Implement caching strategies
  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Cache-first for static assets
    if (STATIC_ASSETS.includes(url.pathname)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
    // Network-first for API calls
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkFirst(request, API_CACHE));
    }
    // Stale-while-revalidate for images
    else if (request.destination === 'image') {
      event.respondWith(staleWhileRevalidate(request));
    }
  });
  
  async function cacheFirst(request: Request, cacheName: string) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  }
  
  async function networkFirst(request: Request, cacheName: string) {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      throw error;
    }
  }
  
  async function staleWhileRevalidate(request: Request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request).then((response) => {
      cache.put(request, response.clone());
      return response;
    });
    return cached || fetchPromise;
  }
  ```

## Offline Functionality

### Offline Detection
- Detect online/offline status
- Show offline indicator to users
- Handle offline gracefully
- Queue actions for when online

### Offline Pages
- Provide offline fallback page
- Show cached content when available
- Display helpful offline message
- Guide users on what they can do offline

### Offline Data Handling
- Queue user actions when offline
- Sync data when connection restored
- Handle conflicts in synced data
- Show sync status to users
- Implement retry logic for failed syncs

## Background Sync API

### Background Sync Overview
- Sync data when connection is restored
- Queue actions for background execution
- Handle sync failures gracefully
- Support one-time and periodic sync

### One-Time Background Sync
- Register sync tags for one-time sync operations
- Sync when connection is available
- Example implementation:
  ```typescript
  // utils/backgroundSync.ts
  export const registerBackgroundSync = async (tag: string, data?: unknown) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      
      try {
        await registration.sync.register(tag);
        
        // Store data for sync
        if (data) {
          const syncData = await caches.open('sync-data');
          await syncData.put(tag, new Response(JSON.stringify(data)));
        }
        
        return true;
      } catch (error) {
        console.error('Background sync registration failed:', error);
        return false;
      }
    }
    return false;
  };
  
  // Service worker sync handler
  // sw.js
  self.addEventListener('sync', (event: SyncEvent) => {
    if (event.tag === 'sync-goals') {
      event.waitUntil(syncGoals());
    }
  });
  
  async function syncGoals() {
    const syncData = await caches.open('sync-data');
    const pendingGoals = await syncData.keys();
    
    for (const request of pendingGoals) {
      try {
        const response = await syncData.match(request);
        const data = await response?.json();
        
        // Sync to server
        const result = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (result.ok) {
          await syncData.delete(request);
        }
      } catch (error) {
        console.error('Sync failed for', request.url, error);
        // Will retry on next sync
      }
    }
  }
  ```

### Periodic Background Sync
- Schedule periodic sync operations
- Requires user permission
- Useful for refreshing data in background
- Example:
  ```typescript
  // utils/periodicSync.ts
  export const registerPeriodicSync = async (tag: string, minInterval: number) => {
    if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      
      try {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName,
        });
        
        if (status.state === 'granted') {
          await (registration as any).periodicSync.register(tag, {
            minInterval,
          });
          return true;
        }
      } catch (error) {
        console.error('Periodic sync registration failed:', error);
      }
    }
    return false;
  };
  
  // Service worker periodic sync handler
  // sw.js
  self.addEventListener('periodicsync', (event: any) => {
    if (event.tag === 'refresh-goals') {
      event.waitUntil(refreshGoalsData());
    }
  });
  ```

### Sync Conflict Resolution
- Handle conflicts when syncing offline changes
- Use last-write-wins or merge strategies
- Notify users of conflicts
- Example conflict resolution:
  ```typescript
  // utils/syncConflictResolution.ts
  export const resolveSyncConflict = (
    localData: unknown,
    serverData: unknown,
    strategy: 'last-write-wins' | 'merge' | 'user-choice'
  ) => {
    switch (strategy) {
      case 'last-write-wins':
        return serverData; // Server always wins
      case 'merge':
        return mergeData(localData, serverData);
      case 'user-choice':
        return promptUserForChoice(localData, serverData);
      default:
        return serverData;
    }
  };
  ```

## Push Notifications

### Notification Permissions
- Request notification permission from users
- Handle permission states (granted, denied, default)
- Respect user preferences
- Only request when contextually relevant
- Example permission request:
  ```typescript
  // hooks/useNotificationPermission.ts
  import { useState, useEffect } from 'react';
  
  type NotificationPermission = 'default' | 'granted' | 'denied';
  
  export const useNotificationPermission = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    
    useEffect(() => {
      if ('Notification' in window) {
        setPermission(Notification.permission as NotificationPermission);
      }
    }, []);
    
    const requestPermission = async (): Promise<boolean> => {
      if (!('Notification' in window)) {
        return false;
      }
      
      if (Notification.permission === 'granted') {
        return true;
      }
      
      if (Notification.permission === 'denied') {
        return false;
      }
      
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      return result === 'granted';
    };
    
    return { permission, requestPermission };
  };
  ```

### Push Subscription
- Subscribe to push notifications
- Store subscription on server
- Handle subscription updates
- Example push subscription:
  ```typescript
  // utils/pushSubscription.ts
  export const subscribeToPush = async (vapidPublicKey: string) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        
        // Send subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
        
        return subscription;
      } catch (error) {
        console.error('Push subscription failed:', error);
        throw error;
      }
    }
    throw new Error('Push notifications not supported');
  };
  
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  ```

### Service Worker Push Handler
- Handle push events in service worker
- Show notifications when app is closed
- Handle notification clicks
- Example push handler:
  ```typescript
  // sw.js
  self.addEventListener('push', (event: PushEvent) => {
    const data = event.data?.json() || {};
    const title = data.title || 'New Update';
    const options: NotificationOptions = {
      body: data.body || 'You have a new update',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'default',
      data: data.data,
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  // Handle notification clicks
  self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  });
  
  // Handle notification action clicks
  self.addEventListener('notificationclick', (event: NotificationEvent) => {
    if (event.action === 'view-goal') {
      const goalId = event.notification.data?.goalId;
      event.waitUntil(
        clients.openWindow(`/goals/${goalId}`)
      );
    }
  });
  ```

### Badge API
- Show badge count on app icon
- Update badge when notifications arrive
- Clear badge when notifications are read
- Example badge usage:
  ```typescript
  // utils/badge.ts
  export const setBadge = async (count: number) => {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        await (navigator as any).setAppBadge(count);
      } else {
        await (navigator as any).clearAppBadge();
      }
    }
  };
  
  // In service worker push handler
  // sw.js
  self.addEventListener('push', async (event: PushEvent) => {
    // Increment badge
    if ('setAppBadge' in self.registration) {
      const currentBadge = await (self.registration as any).getAppBadge();
      await (self.registration as any).setAppBadge((currentBadge || 0) + 1);
    }
    
    // Show notification...
  });
  ```

## Install Prompts

### Before Install Prompt
- Check if app is already installed
- Only show prompt after meaningful engagement
- Track user interactions before prompting
- Respect user's choice to dismiss

### Install Prompt Implementation
- Use `beforeinstallprompt` event
- Store event for later use
- Show custom install button/UI
- Call `prompt()` method on user action
- Handle install result

### Install Criteria
- App must be served over HTTPS
- Must have valid manifest
- Must have registered service worker
- User must have meaningful engagement
- Must not already be installed

## Performance Optimization

### Initial Load
- Minimize initial bundle size
- Use code splitting
- Lazy load non-critical resources
- Optimize images and assets
- Preload critical resources

### Runtime Performance
- Cache frequently accessed data
- Minimize network requests
- Use efficient caching strategies
- Optimize service worker logic
- Monitor performance metrics

### Resource Loading
- Preload critical resources
- Prefetch likely-needed resources
- Use resource hints (preconnect, dns-prefetch)
- Optimize image loading
- Minimize render-blocking resources

## Security Considerations

### HTTPS Requirement
- Always use HTTPS in production
- Service workers require secure context
- Use HTTPS for all API calls
- Validate SSL certificates

### Content Security Policy
- Configure CSP headers appropriately
- Allow service worker scripts
- Restrict inline scripts
- Validate external resources

### Data Storage
- Encrypt sensitive cached data
- Limit cache size
- Clear sensitive data on logout
- Validate cached data integrity

## Testing PWA Features

### Service Worker Testing
- Test service worker registration
- Test cache strategies
- Test offline scenarios
- Test update mechanisms
- Test error handling

### Manifest Testing
- Validate manifest JSON
- Test install prompts
- Test app icons on devices
- Test theme colors
- Test display modes

### Offline Testing
- Test with network throttling
- Test with offline mode
- Test sync functionality
- Test error recovery
- Test user experience

### Device Testing
- Test on mobile devices
- Test on tablets
- Test on desktop
- Test on different browsers
- Test install experience

### Automated PWA Testing

#### Lighthouse CI
- Integrate Lighthouse CI for automated PWA audits
- Set performance budgets
- Fail builds on PWA regressions
- Example Lighthouse CI configuration:
  ```yaml
  # .lighthouserc.js
  module.exports = {
    ci: {
      collect: {
        url: ['http://localhost:3000'],
        numberOfRuns: 3,
      },
      assert: {
        assertions: {
          'categories:performance': ['error', { minScore: 0.9 }],
          'categories:accessibility': ['error', { minScore: 0.9 }],
          'categories:best-practices': ['error', { minScore: 0.9 }],
          'categories:seo': ['error', { minScore: 0.9 }],
          'categories:pwa': ['error', { minScore: 0.9 }],
          'service-worker': 'error',
          'installable-manifest': 'error',
          'offline-start-url': 'error',
        },
      },
      upload: {
        target: 'temporary-public-storage',
      },
    },
  };
  ```

#### PWA Testing Tools
- **Workbox DevTools**: Debug service worker and caching
- **Chrome DevTools**: Application tab for service workers, caches, storage
- **Lighthouse**: PWA audit and scoring
- **WebPageTest**: Performance and PWA testing
- **PWA Builder**: Validate manifest and test installability

#### Testing Checklist
- [ ] Service worker registers successfully
- [ ] Service worker caches assets correctly
- [ ] App works offline
- [ ] Install prompt appears when criteria met
- [ ] App installs successfully
- [ ] Push notifications work (if implemented)
- [ ] Background sync works (if implemented)
- [ ] Cache updates correctly on app update
- [ ] Storage quota is managed properly
- [ ] All icons display correctly
- [ ] Manifest validates without errors
- [ ] App works in standalone mode
- [ ] Theme colors apply correctly
- [ ] App shortcuts work (if implemented)

## Integration with React

### Service Worker Registration
- Register in `index.tsx` or `App.tsx`
- Use React hooks for service worker state
- Handle service worker updates in React
- Show update notifications in UI

### Offline Detection Hook
- Create `useOnlineStatus` hook
- Update UI based on online status
- Show offline indicators
- Handle offline actions

### Install Prompt Hook
- Create `useInstallPrompt` hook
- Manage install prompt state
- Show install button conditionally
- Handle install flow

### Caching with React Query
- Integrate service worker caching with React Query
- Use React Query for offline data
- Sync cached data with server
- Handle cache invalidation

### React Hooks Examples

#### useOnlineStatus Hook
```typescript
// hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger sync when coming back online
        window.dispatchEvent(new Event('online'));
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);
  
  return { isOnline, wasOffline };
};
```

#### useInstallPrompt Hook
```typescript
// hooks/useInstallPrompt.ts
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };
    
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    return outcome === 'accepted';
  };
  
  return {
    isInstallable,
    isInstalled,
    promptInstall,
  };
};
```

#### useServiceWorker Hook
```typescript
// hooks/useServiceWorker.ts
import { useState, useEffect } from 'react';

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  installing: boolean;
  waiting: ServiceWorker | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    registration: null,
    updateAvailable: false,
    installing: false,
    waiting: null,
  });
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setState((prev) => ({ ...prev, registration }));
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            setState((prev) => ({ ...prev, installing: true }));
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState((prev) => ({
                  ...prev,
                  updateAvailable: true,
                  installing: false,
                  waiting: newWorker,
                }));
              } else if (newWorker.state === 'activated') {
                setState((prev) => ({
                  ...prev,
                  installing: false,
                  updateAvailable: false,
                }));
              }
            });
          }
        });
      });
      
      // Check for waiting service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);
  
  const updateServiceWorker = () => {
    if (state.waiting) {
      state.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };
  
  return {
    ...state,
    updateServiceWorker,
  };
};
```

#### useNotificationPermission Hook
```typescript
// hooks/useNotificationPermission.ts
import { useState, useEffect, useCallback } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);
  
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'denied') {
      return false;
    }
    
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermission);
    return result === 'granted';
  }, []);
  
  return {
    permission,
    isSupported,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    requestPermission,
  };
};
```

#### useBackgroundSync Hook
```typescript
// hooks/useBackgroundSync.ts
import { useState, useCallback } from 'react';

export const useBackgroundSync = () => {
  const [isSupported, setIsSupported] = useState(false);
  
  useState(() => {
    setIsSupported(
      'serviceWorker' in navigator &&
      'sync' in (window.ServiceWorkerRegistration.prototype || {})
    );
  });
  
  const registerSync = useCallback(async (tag: string, data?: unknown): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      
      if (data) {
        const syncCache = await caches.open('sync-data');
        await syncCache.put(
          tag,
          new Response(JSON.stringify(data))
        );
      }
      
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }, [isSupported]);
  
  return {
    isSupported,
    registerSync,
  };
};
```

## Best Practices

### User Experience
- Provide clear offline indicators
- Show sync status
- Handle errors gracefully
- Provide helpful error messages
- Guide users through offline experience

### Performance
- Minimize service worker size
- Use efficient caching strategies
- Limit cache storage
- Clean up unused caches
- Monitor performance metrics

### Maintenance
- Version service worker caches
- Update service worker regularly
- Test updates thoroughly
- Monitor service worker errors
- Keep manifest up to date

### Accessibility
- Ensure offline features are accessible
- Provide keyboard navigation
- Support screen readers
- Maintain focus management
- Test with assistive technologies

## Storage Management

### Storage Quota
- Monitor storage usage
- Estimate available quota
- Handle quota exceeded errors
- Implement storage cleanup
- Example quota management:
  ```typescript
  // utils/storageQuota.ts
  export const getStorageQuota = async (): Promise<{
    usage: number;
    quota: number;
    percentage: number;
  }> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      
      return {
        usage,
        quota,
        percentage: quota > 0 ? (usage / quota) * 100 : 0,
      };
    }
    
    return { usage: 0, quota: 0, percentage: 0 };
  };
  
  export const checkStorageQuota = async (requiredBytes: number): Promise<boolean> => {
    const { usage, quota } = await getStorageQuota();
    return (quota - usage) >= requiredBytes;
  };
  
  export const cleanupOldCaches = async (maxAge: number = 7 * 24 * 60 * 60 * 1000) => {
    const cacheNames = await caches.keys();
    const now = Date.now();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        const dateHeader = response?.headers.get('date');
        
        if (dateHeader) {
          const cacheDate = new Date(dateHeader).getTime();
          if (now - cacheDate > maxAge) {
            await cache.delete(request);
          }
        }
      }
    }
  };
  ```

### Cache Size Management
- Limit individual cache sizes
- Implement LRU (Least Recently Used) eviction
- Set maximum cache size per category
- Monitor cache growth
- Example cache size management:
  ```typescript
  // utils/cacheSizeManager.ts
  const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  
  export const enforceCacheSizeLimit = async (cacheName: string) => {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    const entries: Array<{ request: Request; size: number; timestamp: number }> = [];
    
    // Calculate sizes
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        const timestamp = parseInt(
          response.headers.get('sw-cache-timestamp') || '0'
        );
        entries.push({
          request,
          size: blob.size,
          timestamp,
        });
      }
    }
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest entries if over limit
    let totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    while (totalSize > MAX_CACHE_SIZE && entries.length > 0) {
      const entry = entries.shift()!;
      await cache.delete(entry.request);
      totalSize -= entry.size;
    }
  });
  ```

## Build Configuration

### Service Worker Generation
- Use Workbox or similar tool
- Generate service worker during build
- Inject cache names and versions
- Configure precaching
- Set up runtime caching

### Workbox Configuration
- Example Workbox configuration:
  ```typescript
  // workbox-config.js
  module.exports = {
    globDirectory: 'build/',
    globPatterns: [
      '**/*.{js,css,html,png,jpg,jpeg,svg,woff,woff2}',
    ],
    swDest: 'build/sw.js',
    swSrc: 'src/sw-template.js',
    injectionPoint: 'self.__WB_MANIFEST',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.example\.com\/api\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          networkTimeoutSeconds: 3,
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
        },
      },
    ],
  };
  ```
  
- Workbox service worker template:
  ```typescript
  // src/sw-template.js
  import { precacheAndRoute } from 'workbox-precaching';
  import { registerRoute } from 'workbox-routing';
  import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
  
  // Precache assets
  precacheAndRoute(self.__WB_MANIFEST);
  
  // Runtime caching routes
  // (Injected by Workbox based on workbox-config.js)
  ```

### Manifest Generation
- Generate manifest from configuration
- Include all required icons
- Validate manifest structure
- Include in build output
- Reference in HTML

### Build Tools
- Configure build to include PWA files
- Generate service worker
- Optimize assets for caching
- Include manifest in build
- Test PWA features in build output

### Update Strategies

#### Immediate Update Strategy
- Force immediate update on service worker change
- Use `skipWaiting()` and `clients.claim()`
- Best for critical updates
- Example:
  ```typescript
  // sw.js
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
    );
    self.skipWaiting(); // Force immediate activation
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
    );
    self.clients.claim(); // Take control immediately
  });
  ```

#### User-Prompted Update Strategy
- Notify user when update is available
- Let user choose when to update
- Best for non-critical updates
- Example:
  ```typescript
  // hooks/useServiceWorkerUpdate.ts
  export const useServiceWorkerUpdate = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    useEffect(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        });
      }
    }, []);
    
    const applyUpdate = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const worker = registration.waiting;
        
        if (worker) {
          setIsUpdating(true);
          worker.postMessage({ type: 'SKIP_WAITING' });
          
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') {
              window.location.reload();
            }
          });
        }
      }
    };
    
    return { updateAvailable, isUpdating, applyUpdate };
  };
  
  // In service worker
  // sw.js
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
  ```

#### Background Update Strategy
- Update in background without user notification
- Apply update on next page load
- Best for minor updates
- Example:
  ```typescript
  // sw.js
  self.addEventListener('install', (event) => {
    // Don't skip waiting - let old worker finish
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
    );
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      Promise.all([
        // Clean up old caches
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((name) => name !== CACHE_NAME)
              .map((name) => caches.delete(name))
          );
        }),
        // Claim clients when ready
        self.clients.claim(),
      ])
    );
  });
  ```

## Monitoring and Analytics

### Service Worker Metrics
- Track service worker registration
- Monitor cache hit rates
- Track offline usage
- Monitor update installations
- Measure performance impact

### User Analytics
- Track install rates
- Monitor offline usage patterns
- Track sync success rates
- Measure user engagement
- Analyze error rates

### Web APIs Integration

#### Web Share API
- Share content from app to other apps
- Receive shared content via Share Target
- Example Web Share:
  ```typescript
  // utils/webShare.ts
  export const shareContent = async (data: ShareData): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
        return false;
      }
    }
    return false;
  };
  
  // Usage
  await shareContent({
    title: 'My Goal Progress',
    text: 'Check out my goal progress!',
    url: '/goals/123',
  });
  ```

#### File System Access API
- Access files from user's device
- Save files to user's device
- Example file access:
  ```typescript
  // utils/fileAccess.ts
  export const saveFile = async (content: string, filename: string) => {
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'JSON files',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('File save failed:', error);
        }
        return false;
      }
    }
    // Fallback to download
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  };
  ```

#### Clipboard API
- Copy content to clipboard
- Read content from clipboard
- Example clipboard usage:
  ```typescript
  // utils/clipboard.ts
  export const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error('Clipboard write failed:', error);
        return false;
      }
    }
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (error) {
      document.body.removeChild(textArea);
      return false;
    }
  };
  
  export const readFromClipboard = async (): Promise<string | null> => {
    if (navigator.clipboard) {
      try {
        return await navigator.clipboard.readText();
      } catch (error) {
        console.error('Clipboard read failed:', error);
        return null;
      }
    }
    return null;
  };
  ```

## Error Handling

### Service Worker Errors
- Handle registration failures
- Handle cache errors
- Handle fetch errors
- Log errors appropriately
- Provide fallback behavior
- Example error handling:
  ```typescript
  // utils/serviceWorkerErrorHandling.ts
  export const registerServiceWorkerWithErrorHandling = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        registration.addEventListener('error', (event) => {
          console.error('Service worker error:', event);
          // Log to error tracking service
          logger.error('Service worker error', event.error, {
            scope: registration.scope,
          });
        });
        
        return registration;
      } catch (error) {
        // Registration failed - app will work without service worker
        logger.error('Service worker registration failed', error as Error);
        return null;
      }
    }
    return null;
  };
  
  // In service worker
  // sw.js
  self.addEventListener('error', (event) => {
    event.preventDefault();
    // Log error
    console.error('Service worker error:', event.error);
  });
  
  self.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    console.error('Unhandled rejection in service worker:', event.reason);
  });
  ```

### Cache Errors
- Handle quota exceeded errors
- Handle cache write failures
- Handle cache read failures
- Implement fallback strategies
- Example cache error handling:
  ```typescript
  // sw.js
  async function cacheWithErrorHandling(request: Request, response: Response) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Clean up old caches
        await cleanupOldCaches();
        // Retry
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        } catch (retryError) {
          console.error('Cache write failed after cleanup:', retryError);
          // Continue without caching
        }
      } else {
        console.error('Cache error:', error);
      }
    }
  }
  ```

### Network Errors
- Handle network failures gracefully
- Show appropriate error messages
- Provide retry mechanisms
- Queue failed requests
- Sync when connection restored
- Example network error handling:
  ```typescript
  // sw.js
  self.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        })
        .catch(async (error) => {
          // Try cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) {
              return offlinePage;
            }
          }
          
          // Return error response
          return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        })
    );
  });
  ```

### Permission Errors
- Handle notification permission denial
- Handle background sync permission issues
- Provide user guidance
- Example permission error handling:
  ```typescript
  // utils/permissionErrorHandling.ts
  export const handleNotificationPermissionError = (error: Error) => {
    if (error.name === 'NotAllowedError') {
      // Permission denied - show guidance to user
      showPermissionGuidance('notifications');
    } else if (error.name === 'NotSupportedError') {
      // Not supported - show fallback message
      showUnsupportedFeatureMessage('notifications');
    } else {
      logger.error('Notification permission error', error);
    }
  };
  ```

### Update Errors
- Handle service worker update failures
- Handle cache update conflicts
- Provide recovery mechanisms
- Example update error handling:
  ```typescript
  // utils/updateErrorHandling.ts
  export const handleServiceWorkerUpdateError = async (
    registration: ServiceWorkerRegistration,
    error: Error
  ) => {
    logger.error('Service worker update failed', error, {
      scope: registration.scope,
    });
    
    // Try to unregister and re-register
    try {
      await registration.unregister();
      await registerServiceWorker();
    } catch (recoveryError) {
      logger.error('Service worker recovery failed', recoveryError as Error);
      // Notify user that PWA features may not work
      showPWAFeatureWarning();
    }
  };
  ```

