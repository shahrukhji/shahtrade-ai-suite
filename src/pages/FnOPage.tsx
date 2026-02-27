import GlassCard from '@/components/Common/GlassCard';
import PillButton from '@/components/Common/PillButton';
import Badge from '@/components/Common/Badge';
import Disclaimer from '@/components/Common/Disclaimer';
import { useState } from 'react';
import { generateOptionChainData } from '@/utils/sampleData';
import CircularProgress from '@/components/Common/CircularProgress';

const instruments = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'];
const expiries = ['16 Jan', '23 Jan', '30 Jan', '27 Feb', '27 Mar', '26 Jun'];
const strategies = [
  { name: 'Bull Call Spread', icon: '📈', risk: 'LOW', type: 'BULLISH' },
  { name: 'Bear Put Spread', icon: '📉', risk: 'LOW', type: 'BEARISH' },
  { name: 'Long Straddle', icon: '↕️', risk: 'MED', type: 'NEUTRAL' },
  { name: 'Short Straddle', icon: '⚖️', risk: 'HIGH', type: 'RANGE' },
  { name: 'Iron Condor', icon: '🦅', risk: 'MED', type: 'RANGE' },
  { name: 'Iron Butterfly', icon: '🦋', risk: 'MED', type: 'RANGE' },
  { name: 'Long Strangle', icon: '🔀', risk: 'MED', type: 'NEUTRAL' },
  { name: 'Covered Call', icon: '🛡️', risk: 'LOW', type: 'BULLISH' },
  { name: 'Protective Put', icon: '🔒', risk: 'LOW', type: 'BEARISH' },
  { name: 'Calendar Spread', icon: '📅', risk: 'MED', type: 'NEUTRAL' },
  { name: 'Ratio Spread', icon: '⚡', risk: 'HIGH', type: 'BULLISH' },
  { name: 'Jade Lizard', icon: '🦎', risk: 'MED', type: 'BULLISH' },
];

const FnOPage = () => {
  const [activeInst, setActiveInst] = useState('NIFTY');
  const [activeExpiry, setActiveExpiry] = useState('16 Jan');
  const spotPrice = 22400;
  const chainData = generateOptionChainData(spotPrice);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">📈 F&O Trading</h1>

      {/* Instrument selector */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {instruments.map(i => <PillButton key={i} active={i === activeInst} onClick={() => setActiveInst(i)}>{i}</PillButton>)}
      </div>

      {/* Spot Price */}
      <GlassCard>
        <p className="text-lg font-bold">{activeInst}</p>
        <p className="text-2xl font-mono font-bold">{spotPrice.toLocaleString('en-IN')}</p>
        <p className="text-sm text-profit font-mono">▲ 125.30 (+0.56%)</p>
      </GlassCard>

      {/* Expiry */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {expiries.map(e => (
          <PillButton key={e} active={e === activeExpiry} onClick={() => setActiveExpiry(e)}
            className={e === activeExpiry ? '!bg-warning/20 !border-warning !text-warning' : ''}>{e}</PillButton>
        ))}
      </div>

      {/* Option Chain */}
      <GlassCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-profit text-right">OI</th>
                <th className="p-2 text-profit text-right">LTP</th>
                <th className="p-2 text-profit text-right">Chg</th>
                <th className="p-2 text-warning text-center font-bold">STRIKE</th>
                <th className="p-2 text-loss text-left">Chg</th>
                <th className="p-2 text-loss text-left">LTP</th>
                <th className="p-2 text-loss text-left">OI</th>
              </tr>
            </thead>
            <tbody>
              {chainData.map(row => (
                <tr key={row.strike} className={`border-b border-border/30 ${row.isATM ? 'bg-warning/5' : row.callITM ? 'bg-profit/5' : row.putITM ? 'bg-loss/5' : ''}`}>
                  <td className="p-1.5 text-right">{(row.callOI / 1000).toFixed(0)}K</td>
                  <td className="p-1.5 text-right font-bold">{row.callLTP}</td>
                  <td className={`p-1.5 text-right ${row.callChg >= 0 ? 'text-profit' : 'text-loss'}`}>{row.callChg > 0 ? '+' : ''}{row.callChg}</td>
                  <td className={`p-1.5 text-center font-bold text-warning ${row.isATM ? 'text-base' : ''}`}>{row.isATM && '⭐'}{row.strike}</td>
                  <td className={`p-1.5 text-left ${row.putChg >= 0 ? 'text-profit' : 'text-loss'}`}>{row.putChg > 0 ? '+' : ''}{row.putChg}</td>
                  <td className="p-1.5 text-left font-bold">{row.putLTP}</td>
                  <td className="p-1.5 text-left">{(row.putOI / 1000).toFixed(0)}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* AI Analysis */}
      <button className="w-full h-12 rounded-xl bg-gradient-to-r from-ai to-info text-foreground font-bold text-sm">
        🤖 Analyze Option Chain with AI
      </button>

      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold">Market Outlook</p>
          <Badge variant="success">BULLISH</Badge>
        </div>
        <div className="flex justify-center mb-3"><CircularProgress value={78} /></div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['PCR', '1.24'], ['Max Pain', '22,400'], ['Range', '22,200-22,600']].map(([l, v]) => (
            <div key={l} className="bg-background/30 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">{l}</p>
              <p className="text-xs font-bold font-mono">{v}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Strategies */}
      <h3 className="text-sm font-bold">📋 Strategies</h3>
      <div className="grid grid-cols-2 gap-2">
        {strategies.map(s => (
          <div key={s.name} className="bg-card rounded-lg p-3 border border-border">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xs font-bold">{s.name}</p>
            <div className="flex gap-1 mt-1">
              <Badge variant={s.risk === 'LOW' ? 'success' : s.risk === 'MED' ? 'warning' : 'danger'}>{s.risk}</Badge>
              <Badge variant="info">{s.type}</Badge>
            </div>
          </div>
        ))}
      </div>

      <Disclaimer />
    </div>
  );
};

export default FnOPage;
