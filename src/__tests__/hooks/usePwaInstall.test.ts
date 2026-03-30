/**
 * usePwaInstall Hook Tests
 *
 * Tests for the usePwaInstall React hook for PWA installation
 */

import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock the beforeinstallprompt event interface
interface MockBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  userChoice: Promise<{ outcome: string; platform: string }>;
  prompt(): Promise<void>;
}

describe('usePwaInstall', () => {
  // Store original window properties
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;
  let mockPromptEvent: MockBeforeInstallPromptEvent | null = null;

  beforeEach(() => {
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    // Create mock prompt event with preventDefault
    mockPromptEvent = {
      platforms: ['web', 'android'],
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      prompt: vi.fn().mockResolvedValue(undefined),
      preventDefault: vi.fn(),
    } as unknown as MockBeforeInstallPromptEvent;

    // Mock event listener to directly trigger the handler
    window.addEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (event === 'beforeinstallprompt' && mockPromptEvent) {
        // Immediately call the handler with the mock event
        setTimeout(() => {
          if (typeof handler === 'function') {
            handler(mockPromptEvent as Event);
          }
        }, 0);
      }
    });
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    vi.restoreAllMocks();
    mockPromptEvent = null;
  });

  describe('isInstallable', () => {
    it('returns false when beforeinstallprompt event has not fired', async () => {
      // Temporarily override to not fire the event
      window.addEventListener = vi.fn();

      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall());

      // Wait for hook to initialize
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // Initially, before the event fires, isInstallable should be false
      expect(result.current.isInstallable).toBe(false);
    });

    it('returns true when beforeinstallprompt event has fired with a valid prompt', async () => {
      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall());

      // Wait for the async event handler to fire
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // After the event fires, isInstallable should be true
      expect(result.current.isInstallable).toBe(true);
    });
  });

  describe('deferredPrompt', () => {
    it('is null initially', async () => {
      // Temporarily override to not fire the event
      window.addEventListener = vi.fn();

      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.deferredPrompt).toBe(null);
    });

    it('contains the event after beforeinstallprompt fires', async () => {
      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall());

      // Wait for the async event handler to fire
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // After the event fires, deferredPrompt should contain the event
      expect(result.current.deferredPrompt).not.toBe(null);
    });
  });

  describe('handleInstall', () => {
    it('calls prompt() on deferredPrompt when available', async () => {
      const mockPromptFn = vi.fn().mockResolvedValue(undefined);

      // Re-create mock with spy
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
      const { result } = renderHook(() => usePwaInstall());

      // Wait for the event to fire
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Now call handleInstall
      await act(async () => {
        await result.current.handleInstall();
      });

      // prompt() should have been called
      expect(mockPromptFn).toHaveBeenCalledTimes(1);
    });

    it('does nothing when deferredPrompt is null', async () => {
      // Prevent event from firing
      window.addEventListener = vi.fn();

      const { usePwaInstall } = await import('@/hooks/usePwaInstall');
      const { result } = renderHook(() => usePwaInstall());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // Call handleInstall when deferredPrompt is null - should not throw
      await act(async () => {
        await result.current.handleInstall();
      });

      // Should complete without errors
      expect(true).toBe(true);
    });
  });
});
