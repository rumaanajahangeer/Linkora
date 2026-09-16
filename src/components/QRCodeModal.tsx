'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode as QrIcon, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  url: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ url, title, isOpen, onClose }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `linkora-qr-${title || 'code'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 dark:bg-slate-900 dark:border-slate-800 bg-white border-slate-200 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-slate-800 border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">QR Code</h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">
                {title || url}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display */}
        <div className="flex flex-col items-center justify-center my-6 p-4 bg-slate-950 dark:bg-slate-950 bg-slate-100 rounded-xl border border-slate-800/80">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Generated Linkora QR Code"
              className="w-56 h-56 rounded-lg shadow-md border border-white/20"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-500 animate-pulse">
              Generating QR Code...
            </div>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 hover:underline text-center font-mono truncate max-w-[280px] flex items-center justify-center space-x-1"
            title="Click to open link in a new tab"
          >
            <span>{url}</span>
            <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
          </a>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-all text-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Link</span>
          </a>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-medium text-xs transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-medium text-xs transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
