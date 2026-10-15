import { NextResponse } from 'next/server';
import os from 'os';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export async function GET() {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = '127.0.0.1';

    for (const name of Object.keys(interfaces)) {
      const ifaces = interfaces[name] || [];
      for (const iface of ifaces) {
        if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254')) {
          localIp = iface.address;
          break;
        }
      }
    }

    const port = process.env.PORT || 3000;
    const networkUrl = `http://${localIp}:${port}`;
    const localhostUrl = `http://localhost:${port}`;

    // Detect public tunnel URL (Cloudflare Tunnel, etc.)
    let publicUrl = process.env.PUBLIC_URL || '';
    const possibleLogPaths = [
      'C:\\Users\\anisa\\.gemini\\antigravity\\scratch\\tunnel.log',
      'C:\\Users\\anisa\\.gemini\\antigravity\\scratch\\public-url.txt',
      path.join(process.cwd(), '..', 'tunnel.log'),
      path.join(process.cwd(), 'tunnel.log'),
    ];

    for (const p of possibleLogPaths) {
      if (fs.existsSync(p)) {
        try {
          const content = fs.readFileSync(p, 'utf8');
          const matches = content.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g);
          if (matches && matches.length > 0) {
            publicUrl = matches[matches.length - 1];
            break;
          }
        } catch {
          // ignore
        }
      }
    }

    // Generate high-resolution QR codes
    let publicQrCodeDataUrl = '';
    let localQrCodeDataUrl = '';

    try {
      if (publicUrl) {
        publicQrCodeDataUrl = await QRCode.toDataURL(publicUrl, {
          width: 320,
          margin: 2,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        });
      }
      localQrCodeDataUrl = await QRCode.toDataURL(networkUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      });
    } catch (qrErr) {
      console.warn('QR Code generation error:', qrErr);
    }

    return NextResponse.json({
      ok: true,
      isPublic: !!publicUrl,
      publicUrl,
      publicQrCodeDataUrl,
      localIp,
      port,
      networkUrl,
      localQrCodeDataUrl,
      localhostUrl,
      qrCodeDataUrl: publicQrCodeDataUrl || localQrCodeDataUrl,
      hostname: os.hostname(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        localIp: '127.0.0.1',
        networkUrl: 'http://localhost:3000',
        localhostUrl: 'http://localhost:3000',
      },
      { status: 500 }
    );
  }
}
