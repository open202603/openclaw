import { TradeTerminal } from '../../components/trading/trade-terminal';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortfolioPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const access = params.access === 'wallet' ? 'wallet' : 'demo';
  const funding = params.funding === 'deposit';

  return <TradeTerminal initialMarketSymbol="ETH-PERP" view="portfolio" initialAccessMode={access} initialShowDepositMessage={funding} />;
}
