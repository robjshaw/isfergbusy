'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16 md:mt-24 glass-subtle safe-bottom">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="w-8 h-8 border border-white/80 rounded-lg md:rounded-none flex items-center justify-center">
                <span className="font-serif font-bold text-lg text-white">F</span>
              </div>
              <span className="font-serif font-bold text-white text-lg">
                IsFergBusy
              </span>
            </div>
            <p className="text-[#666666] text-sm leading-relaxed">
              Real-time Fergburger intelligence for Queenstown.
              Know before you go.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="uppercase-wide text-[#666666] mb-3 md:mb-4 text-[10px] md:text-xs">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-white hover:text-[#00c0f3] transition-colors text-sm"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/how-we-built-this"
                  className="text-white hover:text-[#00c0f3] transition-colors text-sm"
                >
                  Build Log
                </Link>
              </li>
              <li>
                <Link
                  href="/stats"
                  className="text-white hover:text-[#00c0f3] transition-colors text-sm"
                >
                  Statistics
                </Link>
              </li>
            </ul>
          </div>

          {/* External */}
          <div>
            <h4 className="uppercase-wide text-[#666666] mb-3 md:mb-4 text-[10px] md:text-xs">The Real Deal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://fergburger.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#00c0f3] transition-colors text-sm"
                >
                  Fergburger.com
                </a>
              </li>
              <li>
                <a
                  href="https://ferglovesyou.co.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#00c0f3] transition-colors text-sm"
                >
                  Order Tracker
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="ferg-divider mb-6 md:mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-[10px] md:text-xs text-[#666666]">
          <p>Not affiliated with Fergburger. A fan-made project.</p>
          <p className="font-serif italic text-[#00c0f3]/60">
            &quot;In Ferg We Trust&quot;
          </p>
        </div>
      </div>
    </footer>
  );
}
