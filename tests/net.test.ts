import { describe, expect, it } from 'vitest';
import { slim, pack, unpack } from '../src/game/net/link';

const sdp = ['v=0', 'a=candidate:1 1 udp 2113937151 abcd.local 5000 typ host', 'a=candidate:2 1 tcp 1518280447 10.0.0.2 9 typ host tcptype active',
  'a=candidate:3 1 udp 2113937151 fe80::1 5001 typ host', 'a=candidate:4 1 udp 1677729535 1.2.3.4 5002 typ srflx raddr 0.0.0.0 rport 0', 'a=fingerprint:sha-256 AA'].join('\r\n') + '\r\n';

describe('pairing codes', () => {
  it('keeps public IPv6, the public address and the relay even when many local candidates come first', () => {
    const many = ['v=0', 'a=candidate:1 1 udp 2113937151 a.local 1 typ host', 'a=candidate:2 1 udp 2113937151 b.local 2 typ host', 'a=candidate:3 1 udp 2113937151 c.local 3 typ host',
      'a=candidate:4 1 udp 2113937151 2401:4900:1::7 4 typ host', 'a=candidate:5 1 udp 1677729535 49.1.2.3 5 typ srflx raddr 0.0.0.0 rport 0',
      'a=candidate:6 1 udp 41885439 13.9.9.9 6 typ relay raddr 0.0.0.0 rport 0', 'a=candidate:7 1 udp 2113937151 fd00::5 7 typ host', 'a=fingerprint:sha-256 AA'].join('\r\n') + '\r\n';
    const o = slim(many);
    expect(o).toContain('49.1.2.3'); expect(o).toContain('13.9.9.9'); expect(o).not.toContain('fd00::5');
    expect((o.match(/typ host/g) ?? []).length).toBeLessThanOrEqual(2);
    expect(o.indexOf('typ host')).toBeLessThan(o.indexOf('typ srflx')); expect(o.indexOf('typ srflx')).toBeLessThan(o.indexOf('typ relay'));
    expect(o).toContain('a=fingerprint');
  });
  it('keeps a global IPv6 candidate on an IPv6-first network', () => {
    const v6 = ['v=0', 'a=candidate:1 1 udp 2113937151 2405:201:600:1::9 40000 typ host', 'a=fingerprint:sha-256 AA'].join('\r\n') + '\r\n';
    expect(slim(v6)).toContain('2405:201:600:1::9');
  });
  it('drops TCP and link-local candidates, keeps UDP IPv4 / mDNS ones', () => {
    const o = slim(sdp);
    expect(o).toContain('abcd.local'); expect(o).toContain('1.2.3.4');
    expect(o).not.toContain('tcptype'); expect(o).not.toContain('fe80');
    expect(o).toContain('a=fingerprint');
  });
  it('round-trips offers and answers', async () => {
    const c = await pack({ type: 'offer', sdp });
    expect(c.startsWith('Y1.')).toBe(true);
    const u = await unpack(`  ${c}\n`);
    expect(u.type).toBe('offer'); expect(u.sdp).toBe(slim(sdp));
    expect((await unpack(await pack({ type: 'answer', sdp }))).type).toBe('answer');
  });
  it('rejects junk', async () => {
    await expect(unpack('hello')).rejects.toThrow();
  });
});
