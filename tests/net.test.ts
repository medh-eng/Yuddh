import { describe, expect, it } from 'vitest';
import { slim, pack, unpack } from '../src/game/net/link';

const sdp = ['v=0', 'a=candidate:1 1 udp 2113937151 abcd.local 5000 typ host', 'a=candidate:2 1 tcp 1518280447 10.0.0.2 9 typ host tcptype active',
  'a=candidate:3 1 udp 2113937151 fe80::1 5001 typ host', 'a=candidate:4 1 udp 1677729535 1.2.3.4 5002 typ srflx raddr 0.0.0.0 rport 0', 'a=fingerprint:sha-256 AA'].join('\r\n') + '\r\n';

describe('pairing codes', () => {
  it('keeps UDP IPv4 / mDNS candidates only', () => {
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
