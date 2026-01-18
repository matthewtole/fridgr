import { describe, it, expect, afterEach } from 'vitest'
import { getCameraErrorMessage, isCameraSupported } from './errors'

describe('getCameraErrorMessage', () => {
  it('returns a message for NotAllowedError', () => {
    const err = new DOMException('denied', 'NotAllowedError')
    expect(getCameraErrorMessage(err)).toContain('denied')
    expect(getCameraErrorMessage(err)).toContain('enter the barcode manually')
  })

  it('returns a message for NotFoundError', () => {
    const err = new DOMException('no camera', 'NotFoundError')
    expect(getCameraErrorMessage(err)).toContain('No camera')
    expect(getCameraErrorMessage(err)).toContain('enter the barcode manually')
  })

  it('returns a message for NotReadableError', () => {
    const err = new DOMException('in use', 'NotReadableError')
    expect(getCameraErrorMessage(err)).toContain('in use')
    expect(getCameraErrorMessage(err)).toContain('enter the barcode manually')
  })

  it('returns a message for SecurityError', () => {
    const err = new DOMException('insecure', 'SecurityError')
    expect(getCameraErrorMessage(err)).toContain('HTTPS')
    expect(getCameraErrorMessage(err)).toContain('enter the barcode manually')
  })

  it('returns a message for TypeError', () => {
    const err = new TypeError('mediaDevices undefined')
    expect(getCameraErrorMessage(err)).toContain('not supported')
    expect(getCameraErrorMessage(err)).toContain('barcode manually')
  })

  it('returns a message for AbortError', () => {
    const err = new DOMException('cancelled', 'AbortError')
    expect(getCameraErrorMessage(err)).toContain('cancelled')
    expect(getCameraErrorMessage(err)).toContain('enter the barcode manually')
  })

  it('returns the default message for an unknown error', () => {
    const err = new Error('something else')
    expect(getCameraErrorMessage(err)).toContain('Could not start the camera')
    expect(getCameraErrorMessage(err)).toContain('enter the barcode manually')
  })
})

describe('isCameraSupported', () => {
  const origNav = globalThis.navigator
  const origLoc = globalThis.location

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: origNav,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'location', {
      value: origLoc,
      writable: true,
      configurable: true,
    })
  })

  it('returns false when navigator.mediaDevices is absent', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { ...origNav, mediaDevices: undefined },
      writable: true,
      configurable: true,
    })
    expect(isCameraSupported()).toBe(false)
  })

  it('returns true when mediaDevices exists and protocol is https', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { mediaDevices: {} },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'location', {
      value: { protocol: 'https:', hostname: 'app.example.com' },
      writable: true,
      configurable: true,
    })
    expect(isCameraSupported()).toBe(true)
  })

  it('returns true for localhost over http', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { mediaDevices: {} },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'location', {
      value: { protocol: 'http:', hostname: 'localhost' },
      writable: true,
      configurable: true,
    })
    expect(isCameraSupported()).toBe(true)
  })
})
