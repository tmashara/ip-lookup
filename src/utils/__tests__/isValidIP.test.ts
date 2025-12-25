import { describe, it, expect } from 'vitest'
import { isValidIP } from '../isValidIP'

describe('isValidIP', () => {
  describe('IPv4 validation', () => {
    it.each([
      '192.168.1.1',
      '8.8.8.8',
      '10.0.0.1',
      '172.16.0.1',
      '0.0.0.0',
      '255.255.255.255',
    ])('should return true for valid IPv4: %s', (ip) => {
      expect(isValidIP(ip)).toBe(true)
    })

    it.each([
      '256.1.1.1',
      '1.256.1.1',
      '1.1.256.1',
      '1.1.1.256',
      '999.999.999.999',
    ])('should return false for IPv4 with octets > 255: %s', (ip) => {
      expect(isValidIP(ip)).toBe(false)
    })

    it.each([
      '192.168.1',
      '192.168.1.1.1',
      '192.168..1',
      '192.168.1.',
      '.192.168.1.1',
    ])('should return false for malformed IPv4: %s', (ip) => {
      expect(isValidIP(ip)).toBe(false)
    })
  })

  describe('IPv6 validation', () => {
    it.each([
      '2001:4860:4860::8888',
      '2001:4860:4860::8844',
      'fe80::1',
      '::1',
      '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      '2001:db8:85a3::8a2e:370:7334',
    ])('should return true for valid IPv6: %s', (ip) => {
      expect(isValidIP(ip)).toBe(true)
    })

    it.each([
      'gggg::1',
      '2001:4860:4860:::8888',
      '2001:4860:4860:8888',
      ':::',
    ])('should return false for malformed IPv6: %s', (ip) => {
      expect(isValidIP(ip)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it.each([
      ['', 'empty string'],
      ['not-an-ip', 'non-IP string'],
      ['hello.world', 'domain-like string'],
      ['abc.def.ghi.jkl', 'IP-like non-numeric string'],
      ['192.168.1.1a', 'IPv4 with letter'],
      ['192.168.1.1 ', 'IPv4 with trailing space'],
      [' 192.168.1.1', 'IPv4 with leading space'],
    ])('should return false for %s: %s', (ip) => {
      expect(isValidIP(ip)).toBe(false)
    })
  })
})