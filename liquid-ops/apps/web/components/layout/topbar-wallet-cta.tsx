'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopbarWalletCta() {
  const pathname = usePathname();
  const href = pathname === '/' ? '/trade?access=wallet' : `${pathname}?access=wallet`;

  return (
    <Link className="connect-wallet-link" href={href}>
      <span className="connect-wallet-orb" />
      <span>
        <strong>Connect wallet</strong>
        <span className="connect-wallet-subtitle">Wallet mode / demo fallback</span>
      </span>
    </Link>
  );
}
