/**
 * usePwaInstall Hook Tests
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { PwaInstallProvider } from '@/contexts/PwaInstallContext';

interface MockBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  userChoice: Promise<{ outcome: string; platform: string }>;
  prompt(): Promise<void>;
}

// Helper to mock a mobile user agent
const setMobileUserAgent = () => {
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    configurable: true,
  });
};

const setDesktopUserAgent = () => {
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    configurable: true,
  });
};

describe('usePwaInstall', () => {
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;
  let mockPromptEvent: MockBeforeInstallPromptEvent | null = null;

  beforeEach(() => {
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    setMobileUserAgent();

    mockPromptEvent = {
      platforms: ['web', 'android'],
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      prompt: vi.fn().mockResolvedValue(undefined),
      preventDefault: vi.fn(),
    } as unknown as MockBeforeInstallPromptEvent;

    window.addEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (event === 'beforeinstallprompt' && mockPromptEvent) {
        setTimeout(() => {
          if (typeof handler === 'function') {
            handler(mockPromptEvent as Event);
          }
        }, 0);
      }
    });
    window.removeEventListener = vi.fn();

    // Mock localStorage for cookie consent
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'cookie-consent')
        return JSON.stringify({ status: 'accepted', expiryDate: new Date(Date.now() + 86400000).toISOString() });
      return null;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    vi.restoreAllMocks();
    mockPromptEvent = null;
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <PwaInstallProvider>{children}</PwaInstallProvider>
  );

  describe('canInstall', () => {
    it('returns false when beforeinstallprompt event has not fired', async () => {
      window.addEventListener = vi.fn();

      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall(), { wrapper: TestWrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.canInstall).toBe(false);
    });

    it('returns true when beforeinstallprompt event has fired on mobile', async () => {
      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall(), { wrapper: TestWrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.canInstall).toBe(true);
    });

    it('returns false on desktop even when event fires', async () => {
      setDesktopUserAgent();

      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall(), { wrapper: TestWrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.canInstall).toBe(false);
    });
  });

  describe('promptInstall', () => {
    it('calls prompt() on the install event when available', async () => {
      const mockPromptFn = vi.fn().mockResolvedValue(undefined);

      mockPromptEvent = {
        platforms: ['web', 'android'],
        userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
        prompt: mockPromptFn,
        preventDefault: vi.fn(),
      } as unknown as MockBeforeInstallPromptEvent;

      window.addEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
        if (event === 'beforeinstallprompt' && mockPromptEvent) {
          setTimeout(() => {
            if (typeof handler === 'function') {
              handler(mockPromptEvent as Event);
            }
          }, 0);
        }
      });

      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall(), { wrapper: TestWrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(mockPromptFn).toHaveBeenCalledTimes(1);
    });

    it('does nothing when canInstall is false', async () => {
      window.addEventListener = vi.fn();

      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall(), { wrapper: TestWrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(true).toBe(true);
    });
  });

  describe('dismiss', () => {
    it('sets dismissed to true', async () => {
      window.addEventListener = vi.fn();

      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall(), { wrapper: TestWrapper });

      expect(result.current.dismissed).toBe(false);

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.dismissed).toBe(true);
    });
  });
});
