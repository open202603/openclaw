import { TradeTerminal } from '../../components/trading/trade-terminal';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TradePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const access = params.access === 'wallet' ? 'wallet' : 'demo';
  const funding = params.funding === 'deposit';

  return <TradeTerminal initialAccessMode={access} initialShowDepositMessage={funding} />;
}
