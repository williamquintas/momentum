/**
 * useNetworkStatus Hook Tests
 *
 * Tests for the useNetworkStatus React hook for detecting online/offline state
 */

import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('useNetworkStatus', () => {
  // Store original navigator.onLine and event listeners
  let originalOnLine: boolean;
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;

  beforeEach(() => {
    originalOnLine = navigator.onLine;
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    // Mock event listeners
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();

    // Default to online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: originalOnLine,
    });
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    vi.restoreAllMocks();
  });

  it('returns isOnline as true when navigator.onLine is true', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });

    const { useNetworkStatus } = await import('@/hooks/useNetworkStatus');
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('returns isOnline as false when navigator.onLine is false', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    });

    const { useNetworkStatus } = await import('@/hooks/useNetworkStatus');
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('adds event listeners for online and offline events on mount', async () => {
    const { useNetworkStatus } = await import('@/hooks/useNetworkStatus');
    renderHook(() => useNetworkStatus());

    const addEventListenerMock = window.addEventListener as ReturnType<typeof vi.fn>;

    // Check that online event listener was added
    expect(addEventListenerMock).toHaveBeenCalledWith('online', expect.any(Function));

    // Check that offline event listener was added
    expect(addEventListenerMock).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('removes event listeners on unmount', async () => {
    const { useNetworkStatus } = await import('@/hooks/useNetworkStatus');
    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    const removeEventListenerMock = window.removeEventListener as ReturnType<typeof vi.fn>;

    expect(removeEventListenerMock).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerMock).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('updates isOnline to true when online event fires', async () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    });

    const { useNetworkStatus } = await import('@/hooks/useNetworkStatus');
    const { result } = renderHook(() => useNetworkStatus());

    // Initially should be offline
    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);

    // Find and trigger the online handler
    const addEventListenerMock = window.addEventListener as ReturnType<typeof vi.fn>;
    const onlineHandler = addEventListenerMock.mock.calls.filter((call: unknown[]) => call[0] === 'online')[0]?.[1] as
      | EventListener
      | undefined;

    if (onlineHandler) {
      // Simulate going online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: true,
      });

      act(() => {
        (onlineHandler as () => void)();
      });

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    }
  });

  it('updates isOnline to false when offline event fires', async () => {
    // Start online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });

    const { useNetworkStatus } = await import('@/hooks/useNetworkStatus');
    const { result } = renderHook(() => useNetworkStatus());

    // Initially should be online
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);

    // Find and trigger the offline handler
    const addEventListenerMock = window.addEventListener as ReturnType<typeof vi.fn>;
    const offlineHandler = addEventListenerMock.mock.calls.filter(
      (call: unknown[]) => call[0] === 'offline'
    )[0]?.[1] as EventListener | undefined;

    if (offlineHandler) {
      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      });

      act(() => {
        (offlineHandler as () => void)();
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    }
  });
});
