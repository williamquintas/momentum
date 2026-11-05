import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePwaUpdate } from '@/hooks/usePwaUpdate';

interface WorkerStub extends EventTarget {
  postMessage: ReturnType<typeof vi.fn>;
}

describe('usePwaUpdate', () => {
  let worker: WorkerStub;
  let registration: EventTarget & { waiting: WorkerStub | null; installing: WorkerStub | null };
  let serviceWorker: EventTarget & { ready: Promise<unknown>; controller: object | null };
  const reload = vi.fn();

  beforeEach(() => {
    worker = Object.assign(new EventTarget(), { postMessage: vi.fn() });
    registration = Object.assign(new EventTarget(), { waiting: worker, installing: null });
    serviceWorker = Object.assign(new EventTarget(), { ready: Promise.resolve(registration), controller: {} });
    vi.stubGlobal('navigator', { serviceWorker });
    vi.stubGlobal('location', { reload });
    reload.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should detect an already waiting update without reloading', async () => {
    const { result } = renderHook(usePwaUpdate);
    await waitFor(() => expect(result.current.updateAvailable).toBe(true));
    expect(worker.postMessage).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('should activate only after acceptance and reload once the worker controls the page', async () => {
    const { result } = renderHook(usePwaUpdate);
    await waitFor(() => expect(result.current.updateAvailable).toBe(true));
    await act(async () => result.current.updatedApp());
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(reload).not.toHaveBeenCalled();
    await act(async () => serviceWorker.dispatchEvent(new Event('controllerchange')));
    expect(reload).toHaveBeenCalledTimes(1);
    await act(async () => serviceWorker.dispatchEvent(new Event('controllerchange')));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('should preserve this tab when another tab activates the update', async () => {
    const { result } = renderHook(usePwaUpdate);
    await waitFor(() => expect(result.current.updateAvailable).toBe(true));
    await act(async () => serviceWorker.dispatchEvent(new Event('controllerchange')));
    expect(reload).not.toHaveBeenCalled();
  });

  it('should let this tab accept a reload after another tab activated the update', async () => {
    const { result } = renderHook(usePwaUpdate);
    await waitFor(() => expect(result.current.updateAvailable).toBe(true));
    registration.waiting = null;
    await act(async () => serviceWorker.dispatchEvent(new Event('controllerchange')));
    expect(reload).not.toHaveBeenCalled();
    await act(async () => result.current.updatedApp());
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('should detect a newly installed update', async () => {
    registration.waiting = null;
    const { result } = renderHook(usePwaUpdate);
    await act(async () => {
      await serviceWorker.ready;
    });
    expect(result.current.updateAvailable).toBe(false);
    await act(async () => {
      registration.installing = worker;
      registration.dispatchEvent(new Event('updatefound'));
      registration.waiting = worker;
      worker.dispatchEvent(new Event('statechange'));
    });
    expect(result.current.updateAvailable).toBe(true);
  });

  it('should not prompt for the first installation', async () => {
    serviceWorker.controller = null;
    const { result } = renderHook(usePwaUpdate);
    await act(async () => {
      await serviceWorker.ready;
    });
    expect(result.current.updateAvailable).toBe(false);
  });

  it('should ignore updates after unmount and remove listeners', async () => {
    registration.installing = worker;
    const registrationRemoval = vi.spyOn(registration, 'removeEventListener');
    const workerRemoval = vi.spyOn(worker, 'removeEventListener');
    const { result, unmount } = renderHook(usePwaUpdate);
    await waitFor(() => expect(result.current.updateAvailable).toBe(true));
    await act(async () => result.current.updatedApp());
    unmount();
    serviceWorker.dispatchEvent(new Event('controllerchange'));
    expect(reload).not.toHaveBeenCalled();
    expect(registrationRemoval).toHaveBeenCalledWith('updatefound', expect.any(Function));
    expect(workerRemoval).toHaveBeenCalledWith('statechange', expect.any(Function));
  });

  it('should tolerate registration failure or missing browser support', async () => {
    serviceWorker.ready = Promise.reject(new Error('Registration unavailable'));
    const { result, unmount } = renderHook(usePwaUpdate);
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.updateAvailable).toBe(false);
    unmount();
    vi.stubGlobal('navigator', {});
    const unsupported = renderHook(usePwaUpdate);
    await act(async () => unsupported.result.current.updatedApp());
    expect(reload).not.toHaveBeenCalled();
  });
});
