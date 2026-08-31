import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/shawn/Documents/ChatGPT/事故报告';
const chinesePath = path.join(root, 'reports/neutrl-lulo-2026-08-13/index.html');
const output = path.join(root, 'reports/neutrl-lulo-2026-08-13/en/index.html');
const artifactPath = '/Users/shawn/Documents/理财/Neutrl事件影响与风险暴露报告_2026-08-31_v2.artifact.json';
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' })[c]);
}

function inline(markdown) {
  let text = escapeHtml(markdown);
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const labels = { Official: '官方确认', 'On-chain': '链上可验证', Inference: '机制推断', Reporting: '媒体报道', Community: '社区传言', 'Historical snapshot': '历史链上快照' };
  text = text.replace(/\[(Official|On-chain|Inference|Reporting|Community|Historical snapshot)\]/g, (_, label) => `<span class="ev ${labels[label]}">[${label}]</span>`);
  return text;
}

function markdownToHtml(markdown) {
  const lines = String(markdown || '').split(/\r?\n/);
  const out = [];
  let list = null;
  let para = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); closeList(); continue; }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (bullet || ordered) {
      flushPara();
      const type = bullet ? 'ul' : 'ol';
      if (list !== type) { closeList(); list = type; out.push(`<${type}>`); }
      out.push(`<li>${inline((bullet || ordered)[1])}</li>`);
      continue;
    }
    para.push(line.replace(/^#{1,3}\s+/, ''));
  }
  flushPara(); closeList();
  return out.join('\n');
}

function section(id, num, title, markdown, extra = '') {
  return `<section id="${id}"><div class="section-head"><span class="num">${num}</span><h2>${title}</h2></div>${markdownToHtml(markdown)}${extra}</section>`;
}

function table(title, columns, rows) {
  return `<div class="table-block"><h3>${escapeHtml(title)}</h3><div class="table-wrap"><table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((column) => `<td>${inline(row[column.field] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
}

const copy = {
  executive: `
- **[Official] The incident was not a smart-contract exploit.** On August 28, Neutrl said the issue affected a strategy position and the liquidity of part of its reserves. It was not a hack, contract exploit or code vulnerability. The protocol remains paused, and the final loss, recovery amount and recovery timing are still unknown.
- **[Official] Neutrl says approximately $27 million of liquid assets are available.** Additional positions and related PnL exist but are presently illiquid. The $27 million figure is not total reserves, a committed distribution pool or a confirmed 50.6% recovery rate.
- **[Official] An early-redemption mechanism is planned for NUSD and sNUSD holders.** The target is early September, subject to deployment of a new redemption contract, an independent audit, and legal and financial review. Price, capacity, sequencing, instalments and eligibility have not been disclosed.
- **[On-chain] The protocol remains paused.** NUSD supply is approximately **53.390 million**. The Router and sNUSD contracts remain paused. The sNUSD accounting conversion rate is approximately **1.064387 NUSD**, but this is not a dollar recovery rate.
- **[On-chain] Lulo's remaining vault is now highly concentrated in the affected market.** The Lulo USDC Vault has approximately **$1.672 million** of assets, nearly all allocated to the sNUSD/USDC market. Utilization is 100%, withdrawable liquidity is zero, and the API still reports zero realized bad debt. On August 15, this allocation represented only 39.96% of the vault; the liquid allocations were subsequently withdrawn.
- **[On-chain] Strata and Curve still show binding exit constraints.** Strata Strategy reports approximately **1.671 million NUSD** of accounting assets, with a Junior-plus-reserve buffer of roughly **17.1%** ahead of Senior. The Curve NUSD/USDC pool has only about **$26,600** of TVL; selling 15,000 NUSD produces an average on-chain quote near $0.778.
- **[Inference] The decisive unknowns are distributable net assets and redemption terms.** The situation has moved beyond a complete information vacuum, but final losses cannot be determined before the independent audit, asset schedule, legal ownership analysis and redemption contract are published.`,
  scope: `
This report covers the nature of the Neutrl incident, available liquid assets, the pause and proposed early-redemption path, and the direct or structured transmission channels through Morpho/Lulo, Strata, Pendle, Euler, Silo and Curve.

- **[Official]** Facts explicitly disclosed by a protocol or project.
- **[On-chain]** Reproducible contract state, balances, logs or official protocol API data.
- **[Reporting]** Attributed media or third-party research that does not replace primary evidence.
- **[Inference]** Mechanism-based analysis, not a confirmed root cause or loss.
- **[Community]** Unverified attribution retained only as a lead.

**Denominator discipline:** $27 million of available liquid assets is not the same as total reserves, distributable net assets or final redemptions. NUSD total supply is the observable token liability; sNUSD is a yield-bearing wrapper and must not be added to it. Downstream positions may overlap the same NUSD/sNUSD collateral.`,
  background: `
**[Official]** Neutrl packages OTC token discounts, hedged positions, basis/funding trades, liquid stablecoins, JLP and other strategies into the synthetic dollar NUSD. Users can stake NUSD for sNUSD, whose contract exchange rate accrues portfolio returns.

**[Inference]** “Delta-neutral” describes reduced directional exposure. It does not eliminate counterparty, custody, basis, liquidity, operational or legal risk. Integrations with Pendle, Morpho, Euler and Strata transmit those off-chain and cross-venue risks into composable DeFi positions.

The latest visible pre-incident reserve snapshot on Neutrl's website is dated August 5, 2026: approximately $60.35 million of reserves, $58.4 million of NUSD outstanding, 103.18% coverage and $1.8 million of surplus. It predates the August 13 event and cannot be combined with today's supply to calculate a current coverage ratio.

**[Official]** On August 28, Neutrl said it held approximately $27 million of available liquid assets plus additional positions and PnL that were presently illiquid. The asset mix, custody, legal ownership, distributable amount and valuation of the illiquid positions were not disclosed.

**[Inference]** Dividing $27 million by 53.390 million NUSD gives a 50.6% scale comparison only. It is not a recovery estimate.`,
  timelineIntro: `
**[Official]** Neutrl has ruled out a smart-contract hack, exploit or code vulnerability and narrowed the issue to a strategy position and the liquidity of part of the reserves.

**[Inference]** This is more consistent with a strategy loss, asset freeze, delivery dispute, margin/hedge mismatch or maturity mismatch across off-chain or cross-venue positions. The specific asset, venue, counterparty and transaction records remain undisclosed, so none of these channels can be presented as the confirmed root cause.

**[On-chain]** On August 13, the Router and sNUSD contracts were paused, cutting off primary minting, redemption and unstaking. Curve liquidity then contracted sharply, transmitting strategy-level uncertainty into secondary exits and downstream collateral.`,
  status: `
**[Official]** The protocol remains paused. Neutrl is designing an early-redemption mechanism for NUSD and sNUSD holders and targets early September, while explicitly warning that the timeline may change. Preconditions include deployment of a new redemption contract, an independent audit, and legal and financial review.

**[On-chain]** The Router and sNUSD remain paused. Transferability and par redemption are separate properties; a rising sNUSD accounting exchange rate does not prove that economic value has recovered.

**[Official]** Neutrl advised users not to trade NUSD or sNUSD while recovery is being assessed.`,
  impact: `
**[On-chain]** Approximately 53.390 million NUSD is the clearest observable token-liability scale. sNUSD, Pendle PT/YT/LP, Strata tranches, Morpho collateral and Curve LP positions may wrap or collateralize the same underlying NUSD and cannot be added mechanically.

**[Inference]** The $27 million disclosure reduces the extreme uncertainty that all assets are inaccessible, but it does not determine recovery. Early redemption can reduce waiting costs, yet may concentrate illiquid assets and legal tail risk among holders who remain. Fairness depends on price, caps, sequencing and treatment of residual claims.`,
  exposure: `
**Lulo / Morpho. [On-chain]** Morpho's API shows approximately $1.672 million of Lulo USDC Vault assets, almost entirely supplied to the sNUSD/USDC market. Market supply and borrow are both about $1.672 million, utilization is 100% and liquidity is zero. On August 15, the vault held approximately $4.156 million and the affected allocation represented 39.96%; by August 31 the liquid allocations had largely exited while the sNUSD allocation remained trapped.

The market LLTV is 91.5%, and the accounting oracle price is approximately 1.064387 USDC per sNUSD. Bad debt and realized bad debt are both reported as zero. **[Inference]** Those fields show that no accounting loss has yet been recognized under the oracle rules; they do not prove that the economic loss is zero.

**Strata. [On-chain]** Strategy totalAssets is approximately 1.671 million NUSD and it holds about 1.570 million sNUSD. Senior totalAssets is about 1.386 million and Junior about 284,700. Strategy minus Senior implies a Junior-plus-reserve accounting buffer of about 285,300 NUSD, or 17.1% of Strategy assets.

The verified loss waterfall remains Junior → Reserve → Senior. These are unadjusted accounting values, not executable exit values.`,
  liquidity: `
**[On-chain]** The Curve NUSD/USDC pool holds approximately 14,876.58 NUSD and 11,751.57 USDC, with official API TVL near $26,600. Direct RPC quotes show roughly $0.9991 for 1 NUSD, an average $0.9875 for 10,000 NUSD, $0.7781 for 15,000 NUSD, and only about 11,748 USDC for 100,000 NUSD.

**[Inference]** A near-$1 marginal quote describes only the local shape of an extremely thin curve. It does not demonstrate scalable exits, the early-redemption price or final recovery.`,
  scenarios: `
**[Inference]** Early-redemption price, capacity and sequencing are unknown, and holders may face different time value and legal outcomes. The table is a mechanical sensitivity of the identifiable Lulo and Strata positions to a uniform underlying recovery rate. It is not a forecast and excludes overlapping Pendle positions, compensation, recapitalization, disposal costs and legal recovery.`,
  thinking: `
1. **The nature of the incident is clearer; the loss is not.** Once a code exploit is excluded, the core risks become strategy performance, asset availability and legal/financial resolution.
2. **The $27 million disclosure is useful but easy to misstate.** It proves the existence of available liquidity according to Neutrl, not that $27 million is the distribution pool or that illiquid assets, costs and creditor priority are resolved.
3. **Early redemption redistributes risk.** What early redeemers receive—and what residual claim remains for others—determines whether the mechanism merely reduces waiting time or concentrates tail risk.
4. **Lulo's concentration rose mainly because the denominator shrank.** The sNUSD allocation changed little, from roughly $1.661 million to $1.672 million, while total vault assets fell from $4.156 million to $1.672 million.
5. **Zero Morpho bad debt is not zero economic loss.** The oracle and sNUSD accounting NAV have not incorporated the pause or potential impairment.
6. **Curve price is not a recovery rate.** A $26,600 pool is immaterial beside 53.390 million NUSD of supply, and executable quotes collapse quickly with size.`,
  actions: `
1. Do not treat $27 million, the 1.064387 accounting NAV or Curve's small-trade peg as a confirmed redemption rate.
2. NUSD and sNUSD holders should compare early exit with waiting only after the contract, audit, price, cap, sequencing and residual-claim terms are published.
3. Lulo users should monitor vault NAV, market impairment, protection classification and any targeted compensation. The remaining vault is now almost entirely exposed to the affected market.
4. Strata and Pendle holders should stress-test underlying recovery and timing rather than treating PT maturity or Senior priority as risk-free.

**Open questions**

- What assets make up the $27 million, where are they held, who owns them legally, and what is distributable after costs?
- What was the affected strategy position, and what are its book value, recoverable value, recovery horizon and counterparty risk?
- What are the early-redemption price, cap, sequencing, eligibility, instalment structure and residual claim?
- Will NUSD and sNUSD use the same conversion framework, and how will accrued sNUSD yield be treated?
- Will Lulo recognize an impairment, and how will Protected, Boost or any other compensation absorb it?
- How will Strata allocate actual redemption cash flows through Junior, Reserve and Senior?

**Monitoring**

- Neutrl X/Telegram, redemption contract, audit, terms, opening time and distributions.
- Router/sNUSD pause state, NUSD supply, sNUSD accounting rate and redemption-contract funding.
- Lulo vault assets, sNUSD allocation, market liquidity, oracle, liquidations and bad-debt fields.
- Curve balances and executable quotes at 10,000, 15,000 and 100,000 NUSD.
- Strata/Pendle accounting values, action flags, maturities and market depth.`,
  caveats: `
- Evidence cutoff: August 31, 2026 at 15:54 CST (UTC+8); primary on-chain anchor: Ethereum block 25,873,897. API and RPC snapshots differ by several minutes.
- Approximately $27 million is Neutrl's statement of available liquid assets, not an independently audited total, guaranteed distribution amount or final recovery rate.
- The pre-incident reserve snapshot cannot be combined with post-incident supply to calculate current coverage. The PnL and recoverable value of illiquid positions are unknown.
- sNUSD, the Morpho oracle and Strata totalAssets are unadjusted accounting measures, not dollar exit values.
- Pendle, Euler and Silo detail balances retain the August 15 contract-level verification and are explicitly presented as historical snapshots.
- Exposure, potential gross loss and realized bad debt are different measures. Downstream positions may overlap NUSD liabilities and cannot be summed into a total loss.
- This report is based on public information and on-chain data and is not investment, legal or tax advice.`,
};

const timelineRows = [
  { date: 'Aug 13, 2026', event: 'Router and sNUSD paused; primary mint, redemption and unstaking paths were cut off.', evidence: '[On-chain]', meaning: 'The interruption was enforced on-chain, not only in the front end.' },
  { date: 'Aug 13, 2026', event: 'Neutrl confirmed circumstances affecting reserves and paused protocol functions.', evidence: '[Official]', meaning: 'Reserve availability and legal uncertainty became the core risk.' },
  { date: 'Aug 13, 2026', event: 'A large Curve liquidity removal preceded severe contraction in secondary depth.', evidence: '[On-chain]', meaning: 'Loss of the primary redemption anchor rapidly weakened secondary exits.' },
  { date: 'Aug 20, 2026', event: 'Neutrl said the protocol remained paused while it assessed reserves and an orderly process.', evidence: '[Official]', meaning: 'No quantitative recovery plan had yet been released.' },
  { date: 'Aug 28, 2026', event: 'Neutrl ruled out a contract exploit, disclosed about $27M of liquid assets and proposed early redemption.', evidence: '[Official]', meaning: 'The root-cause boundary narrowed and resolution moved into contract, audit and legal review.' },
  { date: 'Aug 31, 2026', event: 'Router/sNUSD remained paused; Lulo remaining assets were almost entirely in the sNUSD market.', evidence: '[On-chain]', meaning: 'Exit constraints and downstream concentration remained unresolved.' },
];

const protocolRows = [
  { protocol: 'Morpho / Lulo', metric: '$1.672M allocation; 100% utilization; bad debt = 0', liquidity: 'Zero in the affected market; remaining vault almost fully concentrated', evidence: '[On-chain] Aug 31', conclusion: 'USDC creditor risk has not yet been written down' },
  { protocol: 'Strata', metric: '1.671M NUSD Strategy assets; ~17.1% Junior + reserve', liquidity: 'No official restoration notice found', evidence: '[On-chain] Aug 31', conclusion: 'Unadjusted accounting; waterfall is Junior → Reserve → Senior' },
  { protocol: 'Pendle', metric: 'Aug 15 wrappers: 8.261M sNUSD plus other related tokens', liquidity: 'Underlying Neutrl/Strata exits constrained', evidence: '[Historical snapshot] Aug 15', conclusion: 'Important maturity layer; overlaps Strata/NUSD' },
  { protocol: 'Euler / Silo', metric: 'Aug 15 direct balances were minimal or zero', liquidity: 'Isolation limits horizontal contagion', evidence: '[Historical snapshot] Aug 15', conclusion: 'Not included among primary identified exposures' },
  { protocol: 'Curve NUSD/USDC', metric: '14,876.58 NUSD + 11,751.57 USDC; $26.6K TVL', liquidity: '15K NUSD averages about $0.778', evidence: '[On-chain] Aug 31', conclusion: 'Marginal peg does not imply scalable exit capacity' },
];

const evidenceRows = [
  { metric: 'Available liquid assets', value: 'Approximately $27M', basis: '[Official] Aug 28 update', confidence: 'Medium-high: issuer statement; composition and audit pending' },
  { metric: 'NUSD total supply', value: '53.390M', basis: '[On-chain] ERC-20 totalSupply', confidence: 'High' },
  { metric: 'Protocol state', value: 'Router / sNUSD paused = true', basis: '[On-chain] Ethereum RPC', confidence: 'High' },
  { metric: 'Lulo remaining vault', value: '$1.672M, almost entirely in sNUSD market', basis: '[On-chain] Morpho API', confidence: 'High' },
  { metric: 'Strata Strategy', value: '1.671M NUSD accounting assets', basis: '[On-chain] Ethereum RPC', confidence: 'High for accounting value; exit value unknown' },
  { metric: 'Curve depth', value: '$26.6K TVL; 15K averages ~$0.778', basis: '[On-chain] Curve API + RPC', confidence: 'High for the snapshot' },
];

const scenarioRows = [
  { recovery: '100%', lulo: '0.000', strata: '0.000', total: '0.000', assumption: 'Full par recovery' },
  { recovery: '75%', lulo: '0.418', strata: '0.418', total: '0.836', assumption: 'Uniform 25% impairment' },
  { recovery: '50%', lulo: '0.836', strata: '0.835', total: '1.671', assumption: 'Uniform 50% impairment' },
  { recovery: '0%', lulo: '1.672', strata: '1.671', total: '3.343', assumption: 'No underlying recovery' },
];

const timelineTable = table('Incident timeline', [
  { field: 'date', label: 'Date' }, { field: 'event', label: 'Event' }, { field: 'evidence', label: 'Evidence' }, { field: 'meaning', label: 'Why it matters' },
], timelineRows);
const protocolTable = table('Downstream protocol status', [
  { field: 'protocol', label: 'Protocol / market' }, { field: 'metric', label: 'Balance / risk metric' }, { field: 'liquidity', label: 'Exit liquidity' }, { field: 'evidence', label: 'Evidence' }, { field: 'conclusion', label: 'Assessment' },
], protocolRows);
const evidenceTable = table('Key figures and evidence quality', [
  { field: 'metric', label: 'Metric' }, { field: 'value', label: 'Current reading' }, { field: 'basis', label: 'Basis' }, { field: 'confidence', label: 'Confidence' },
], evidenceRows);
const scenarioTable = table('Mechanical Lulo + Strata recovery sensitivity — not a forecast', [
  { field: 'recovery', label: 'Underlying recovery' }, { field: 'lulo', label: 'Lulo gross loss ($M)' }, { field: 'strata', label: 'Strata gross loss ($M)' }, { field: 'total', label: 'Combined ($M)' }, { field: 'assumption', label: 'Assumption' },
], scenarioRows);

const sourceIds = ['neutrl_official_status','neutrl_update_aug20','neutrl_update_aug28','neutrl_x_aug28','neutrl_reserves_current','morpho_api_snapshot','morpho_snusd','lulo_morpho','strata_chain_snapshot','strata_pause_tx','pendle_api_snapshot','curve_chain_snapshot','curve_remove_tx','neutrl_strategy','neutrl_transparency'];
const sourceNames = {
  neutrl_official_status: 'Neutrl initial pause announcement', neutrl_update_aug20: 'Neutrl August 20 status update', neutrl_update_aug28: 'Neutrl August 28 recovery update', neutrl_x_aug28: 'Neutrl official X mirror', neutrl_reserves_current: 'Neutrl reserve dashboard', morpho_api_snapshot: 'Morpho official API snapshot', morpho_snusd: 'Morpho sNUSD/USDC market', lulo_morpho: 'Lulo USDC Vault on Morpho', strata_chain_snapshot: 'Strata contracts and documentation', strata_pause_tx: 'Strata action-disable transaction', pendle_api_snapshot: 'Pendle market API and contracts', curve_chain_snapshot: 'Curve API and Ethereum RPC', curve_remove_tx: 'Curve large liquidity-removal transaction', neutrl_strategy: 'Neutrl strategy overview', neutrl_transparency: 'Neutrl transparency dashboard methodology',
};
const sources = sourceIds.map((id) => artifact.manifest.sources.find((source) => source.id === id)).filter(Boolean);
const sourcesHtml = `<div class="sources">${sources.map((source, index) => `<div class="source"><span class="sid">S${String(index + 1).padStart(2, '0')}</span><br><a href="${escapeHtml(source.href)}" target="_blank" rel="noreferrer">${escapeHtml(sourceNames[source.id] || source.label)}</a><br><span>${escapeHtml(source.query?.description || '')}</span></div>`).join('')}</div>`;

const sections = {
  executive: section('executive', '01', 'Executive Summary', copy.executive),
  scope: section('scope', '02', 'Scope, Cutoff and Evidence Rules', copy.scope),
  background: section('background', '03', 'Project, Strategy, Reserves and Transparency', copy.background),
  timeline: section('timeline', '04', 'Incident Timeline and Root-cause Boundary', copy.timelineIntro, timelineTable),
  status: section('status', '05', 'Current Status and Early Redemption', copy.status),
  impact: section('impact', '06', 'Full Impact Perimeter and Deduplication', copy.impact),
  exposure: section('exposure', '07', 'Lulo / Morpho / Strata Exposure', copy.exposure),
  protocols: section('protocols', '08', 'Downstream Protocol Status', '', protocolTable + evidenceTable),
  liquidity: section('liquidity', '09', 'Price and Scalable Exit Capacity', copy.liquidity),
  scenarios: section('scenarios', '10', 'Recovery Sensitivity', copy.scenarios, scenarioTable),
  thinking: section('thinking', '11', 'Independent Assessment', copy.thinking),
  actions: section('actions', '12', 'Risk Actions, Open Questions and Monitoring', copy.actions),
  caveats: section('caveats', '13', 'Caveats and Assumptions', copy.caveats),
  sources: `<section id="sources"><div class="section-head"><span class="num">14</span><h2>Sources and Reproducible Entry Points</h2></div>${sourcesHtml}</section>`,
};

let html = fs.readFileSync(chinesePath, 'utf8');
html = html
  .replace('<html lang="zh-CN">', '<html lang="en">')
  .replace(/<title>[^<]+<\/title>/, '<title>Neutrl Incident Impact and Lulo Risk Exposure Report v2 · 2026-08-31</title>')
  .replace(/<meta name="description" content="[^"]+">/, '<meta name="description" content="Neutrl strategy-position and reserve-liquidity incident, approximately $27 million of available liquid assets, proposed early redemption, and risk transmission through Lulo/Morpho, Strata, Pendle and Curve.">')
  .replace(/<meta property="og:title" content="[^"]+">/, '<meta property="og:title" content="Neutrl Incident Impact and Lulo Risk Exposure Report">')
  .replace(/<meta property="og:description" content="[^"]+">/, '<meta property="og:description" content="$27M is available liquidity—not a confirmed recovery rate. Lulo\'s remaining $1.672M vault is almost entirely allocated to the zero-liquidity sNUSD market.">')
  .replace('content="https://sharpcx.github.io/incident-risk-reports/reports/neutrl-lulo-2026-08-13/"', 'content="https://sharpcx.github.io/incident-risk-reports/reports/neutrl-lulo-2026-08-13/en/"')
  .replace('content="https://sharpcx.github.io/incident-risk-reports/assets/neutrl-lulo-cover.png"', 'content="https://sharpcx.github.io/incident-risk-reports/assets/neutrl-lulo-cover-en.png"')
  .replace('<link rel="canonical" href="https://sharpcx.github.io/incident-risk-reports/reports/neutrl-lulo-2026-08-13/">', '<link rel="canonical" href="https://sharpcx.github.io/incident-risk-reports/reports/neutrl-lulo-2026-08-13/en/">')
  .replace('href="../../assets/site-icon.svg"', 'href="../../../assets/site-icon.svg"');

const navItems = [['executive','Executive Summary'],['scope','Scope and evidence'],['background','Strategy and reserves'],['timeline','Incident timeline'],['status','Status and redemption'],['impact','Impact perimeter'],['exposure','Lulo / Morpho / Strata'],['protocols','Downstream protocols'],['liquidity','Price and liquidity'],['scenarios','Recovery sensitivity'],['thinking','Independent assessment'],['actions','Actions and monitoring'],['caveats','Caveats'],['sources','Sources']];
const aside = `<aside class="side"><div class="brand">Neutrl / Lulo<br>Event Risk</div><div class="tools"><button onclick="window.print()">Print / PDF</button><button id="topBtn">Top</button></div><nav>${navItems.map(([id, label], index) => `<a href="#${id}"><span>${String(index + 1).padStart(2, '0')}</span>${label}</a>`).join('')}</nav></aside>`;
html = html.replace(/<aside class="side">[\s\S]*?<\/aside>/, aside);

const header = `<header class="hero"><div style="display:flex;justify-content:space-between;gap:16px;align-items:center;position:relative;z-index:1"><a href="../../../en/" style="display:inline-block;color:#c8ece7;margin-bottom:20px;font-size:12px">← Report archive</a><a href="../" style="display:inline-block;color:#fff;margin-bottom:20px;font-size:12px;border:1px solid rgba(255,255,255,.35);padding:4px 9px;border-radius:999px">中文</a></div><div class="kicker">Incident Intelligence · Ethereum · 2026-08-31</div><h1>Neutrl Incident Impact and Lulo Risk Exposure Report</h1><div class="sub">Strategy position · reserve liquidity · pause · early redemption · downstream transmission</div><div class="meta"><span>Cutoff: 2026-08-31 15:54 CST (UTC+8)</span><span>Ethereum #25,873,897</span><span>Version: v2</span></div><div class="warning">Approximately $27M is Neutrl's statement of available liquid assets—not total reserves, a committed distribution amount or a confirmed recovery rate.</div></header>`;
html = html.replace(/<header class="hero">[\s\S]*?<\/header>/, header);

const cards = [
  ['Available liquid assets', '~$27M', 'Issuer statement · not recovery rate'],
  ['NUSD supply', '53.390M', 'On-chain totalSupply'],
  ['Lulo remaining vault', '$1.672M', 'Almost entirely in sNUSD market'],
  ['Curve pool TVL', '$26.6K', 'Extremely thin scalable exit depth'],
].map(([label, value, note]) => `<div class="card"><div class="label">${label}</div><div class="value">${value}</div><div class="note">${note}</div></div>`).join('');
const filters = `<div class="cards">${cards}</div><div class="filterbar"><button class="on" data-filter="all">All evidence</button><button data-filter="官方确认">Official</button><button data-filter="链上可验证">On-chain</button><button data-filter="机制推断">Inference</button><button data-filter="社区传言">Community</button></div>`;
html = html.replace(/<div class="cards">[\s\S]*?(?=<section id="executive">)/, filters);

for (const [id, replacement] of Object.entries(sections)) {
  html = html.replace(new RegExp(`<section id="${id}">[\\s\\S]*?<\\/section>`), replacement);
}

html = html.replace(/<div class="footer">[\s\S]*?<\/div><\/main>/, '<div class="footer"><a href="../../../en/">On-chain Incident Risk Report Archive</a> · Neutrl / Lulo Event Risk Report · v2 · Evidence cutoff 2026-08-31 15:54 CST</div></main>');

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html);
console.log(`Wrote ${output}`);
