import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/shawn/Documents/ChatGPT/事故报告';
const input = '/Users/shawn/Documents/理财/Neutrl事件影响与风险暴露报告_2026-08-15_更新版.artifact.json';
const artifactOutput = '/Users/shawn/Documents/理财/Neutrl事件影响与风险暴露报告_2026-08-31_v2.artifact.json';
const htmlOutput = path.join(root, 'reports/neutrl-lulo-2026-08-13/index.html');
const artifact = JSON.parse(fs.readFileSync(input, 'utf8'));
const m = artifact.manifest;
const ds = artifact.snapshot.datasets;
const generatedAt = '2026-08-31T15:54:00+08:00';

m.title = 'Neutrl 事件影响与 Lulo 风险暴露报告';
m.description = '截至 2026 年 8 月 31 日：Neutrl 策略头寸与储备流动性事件、约 2,700 万美元可用流动资产、早期兑付计划，以及 Lulo/Morpho、Strata、Pendle 与 Curve 风险传导。';
m.generatedAt = generatedAt;
artifact.snapshot.generatedAt = generatedAt;

function block(id, body) {
  const target = m.blocks.find((item) => item.id === id);
  if (!target) throw new Error(`Missing block: ${id}`);
  target.body = body;
}

function source(id, label, href, description) {
  return {
    id, label, href,
    query: {
      sql: `SELECT '${id}' AS source_id, TIMESTAMP '2026-08-31 15:54:00' AS snapshot_time_cst;`,
      description,
      tables_used: ['Official disclosure and reproducible protocol/on-chain snapshots'],
      metric_definitions: ['Available liquid assets are not the same as total reserves, final recovery value, or a promised distribution amount.'],
    },
  };
}

function upsertSource(item) {
  for (const list of [m.sources, artifact.sources]) {
    const index = list.findIndex((x) => x.id === item.id);
    if (index >= 0) list[index] = structuredClone(item);
    else list.push(structuredClone(item));
  }
}

block('title', '# Neutrl 事件影响与 Lulo 风险暴露报告\n\n**数据截点：2026-08-31 15:54 CST（UTC+8）｜链上主截点：Ethereum block 25,873,897**');
block('executive_summary', `## Executive Summary

- **【官方确认】事件不是智能合约漏洞。** Neutrl 8 月 28 日确认，问题影响某个策略头寸及部分储备的流动性；不是 hack、合约 exploit 或代码漏洞。协议仍暂停，最终受损金额、可追回金额和时间尚未确定。
- **【官方确认】Neutrl 称目前约有 2,700 万美元可用流动资产。** 另有暂时缺乏流动性的头寸和 PnL。这个数字不是总储备、不是已承诺分配金额，也不能直接写成 50.6% 的兑付率。
- **【官方确认】计划为 NUSD 与 sNUSD 持有人提供早期兑付。** 目标时间是 9 月上旬，但依赖新兑付合约部署、独立审计和法律/财务审查；兑付价格、额度、顺序、分期方式与资格仍未公布。
- **【链上可验证】协议暂停状态未变。** NUSD 供应约 **53.390M**；Router 与 sNUSD 仍为 paused=true。sNUSD 合约账面兑换率约 **1.064387 NUSD**，但这不是美元回收率。
- **【链上可验证】Lulo 剩余 Vault 已高度集中于问题市场。** Lulo USDC Vault 当前总资产约 **$1.672M**，其中约 **$1.672M** 位于 sNUSD/USDC 市场；市场利用率 100%、可提款流动性为 0、API 尚显示已实现坏账为 0。8 月 15 日时该配置仅占 Vault 39.96%，之后其他可流动配置基本被提走。
- **【链上可验证】Strata 与 Curve 仍显示退出约束。** Strata Strategy 账面资产约 **1.671M NUSD**；Senior 前的 Junior+reserve 账面缓冲约 **17.1%**。Curve NUSD/USDC 池仅约 **$26.6K**，卖出 15,000 NUSD 的平均链上报价约 $0.778。
- **【机制推断】当前最重要的未知量是“可分配净资产”和“兑付条款”。** 事件已从单纯的信息真空进入有初步流动性数字和处置路径的阶段，但在独立审计、完整资产清单、法律权属和兑付合约公布前，仍不能确定最终损失。`);

block('scope', `## 评估范围、证据标签与数据口径

报告覆盖 Neutrl 的事件性质、可用流动资产、暂停与早期兑付路径，以及 Morpho/Lulo、Strata、Pendle、Euler、Silo、Curve 的直接或结构化风险传导。

- **【官方确认】** 项目或协议官方渠道明确发布的事实。
- **【链上可验证】** 合约状态、余额、事件日志或官方协议 API 的可复核读数。
- **【媒体报道】** 具名媒体或研究机构转述，不能替代一手披露。
- **【机制推断】** 基于资产负债与合约结构的分析，不是已确认根因或损失。
- **【社区传言】** 未经独立核验的归因，只保留为线索。

**口径隔离：** 约 $27M 可用流动资产 ≠ 总储备 ≠ 可分配净资产 ≠ 最终兑付金额；NUSD totalSupply 是可观察的代币负债规模，sNUSD 是其收益型包装凭证，二者不能相加；外部协议头寸可能与 NUSD/sNUSD 底层重复。`);

block('reserve_context', `## 资产负债表：从事件前超额抵押快照转向事件后流动性披露

**【官方确认】** 官网当前可见的事件前快照日期为 2026-08-05：储备约 $60.35M、NUSD outstanding 约 $58.4M、覆盖率 103.18%、盈余约 $1.8M。该快照早于 8 月 13 日事件，不能和当前供应拼接计算“最新覆盖率”。

**【官方确认】** 8 月 28 日官方称持有约 $27M 可用流动资产，另有暂时不流动的头寸及相关 PnL。官方没有披露这些资产的币种、托管位置、法律权属、扣除费用后的可分配金额，或不流动头寸的估值与回收期。

**【链上可验证】** 当前 NUSD totalSupply 为 53.390M，暂停后基本不变。把 $27M 除以 53.390M 得到约 50.6% 只能用于数量级对比，不能称作覆盖率或预计回收率。`);

block('transparency_limits', `## Proof of Solvency 能证明什么，不能证明什么

事件前的储备证明与透明度系统可以支持某个时间点的资产存在性与模型估值，但不能单独证明压力情景下资产可立即用于兑付。当前最缺失的仍是：事件后分项资产、冻结或争议头寸、法律可得性、债权优先级、处置费用及独立审计结果。

**【机制推断】** 早期兑付合约的审计解决代码风险，不会自动解决资产权属、分配公平性或剩余持有人承担何种尾部风险。`);

block('how_happened', `## 事件路径：根因范围缩小，但具体头寸仍未知

**【官方确认】** 官方已经排除智能合约 hack、exploit 与代码漏洞，并将问题定位为“某个策略头寸”及“部分储备流动性”受到影响。

**【机制推断】** 这更符合链下或跨场所策略头寸的损失、冻结、交割争议、保证金/对冲失配或退出期限错配。官方没有披露具体资产、交易场所、对手方或交易记录，因此不能选定其中任何一种作为已确认根因。

**【链上可验证】** 8 月 13 日 Router 与 sNUSD 暂停，一级铸造、赎回和 unstake 路径被切断；Curve 深度随后显著收缩，风险由策略层快速传到二级退出与外部抵押品。`);

block('status', `## 当前状态：仍暂停，目标 9 月上旬开放早期兑付

**【官方确认】** 协议仍处于暂停状态。Neutrl 正在设计 NUSD/sNUSD 早期兑付机制，目标在 9 月上旬上线，但明确表示时间表可能调整。前置条件包括新兑付合约部署、独立审计，以及法律和财务审查。

**【链上可验证】** Router 与 sNUSD 仍 paused=true。NUSD/sNUSD 可转移与“可按面值兑付”是两件不同的事；sNUSD 账面兑换率继续上升也不等于经济价值已经恢复。

**【官方确认】** 官方建议用户在恢复评估期间不要交易 NUSD 或 sNUSD。`);

block('full_impact_intro', `## 完整影响范围：核心是 53.390M NUSD 供应及其重叠包装层

**【链上可验证】** 当前约 53.390M NUSD 是最清晰的代币负债规模。sNUSD、Pendle PT/YT/LP、Strata 分层、Morpho 抵押品和 Curve LP 都可能是同一底层 NUSD 的包装或抵押路径，不能机械相加。

**【机制推断】** 约 $27M 的流动性披露降低了“全部资产不可得”的极端不确定性，但不决定最终回收。早期兑付可能降低等待成本，也可能把剩余不流动资产和法律风险集中给未兑付持有人；公平性取决于价格、额度、顺序和剩余债权安排。`);

block('exposure_heading', `## 外部敞口：Lulo 已从分散 Vault 变成高度集中剩余仓位

**【链上可验证】** Lulo/Morpho 是 USDC 债权人风险；Strata 是 NUSD/sNUSD 的分层损失风险；Pendle 是期限与持有承载层。Euler 与 Silo 在 8 月 15 日核验时直接余额很小或为 0。

这些数字用于识别传导节点，不代表已实现损失，也不能与 53.390M NUSD 供应相加。`);

block('lulo_detail', `## Lulo：约 $1.672M 剩余资产几乎全部位于 sNUSD/USDC 市场

**【链上可验证】** Morpho API 快照显示，Lulo USDC Vault totalAssets 约 $1.672M，其中约 $1.672M 配置在 sNUSD/USDC 市场。该市场 supply=borrow≈$1.672M、利用率 100%、流动性 0，Lulo 几乎占全部供给。

8 月 15 日 Vault totalAssets 约 $4.156M，sNUSD 市场占 39.96%；到 8 月 31 日，其他可流动市场配置几乎归零，而 sNUSD allocation 无法退出。因此“事件发生时的集中度”和“当前剩余份额的集中度”必须分开。

**【机制推断】** 当前 API 的 realized bad debt=0 只表示协议尚未按 oracle/会计规则确认坏账。Lulo 保护是否覆盖本事件、Protected 与 Boost 如何分担、是否存在专项补偿，仍需官方认定。`);

block('liquidation', `## Morpho：市场流动性为 0，Oracle 仍按 sNUSD 账面兑换率

**【链上可验证】** sNUSD/USDC 市场 LLTV 为 91.5%，账面 price 约 1.064387 USDC/sNUSD；利用率 100%、可提款流动性为 0，当前 badDebt 与 realizedBadDebt 均显示 0。

8 月 15 日借款人级快照显示，约 39.6% 债务的健康度不高于 1.001。该统计未在本次更新中重新逐账户计算，保留为历史压力信号。

**【机制推断】** Oracle 读取的是未减记的 sNUSD 合约会计价格，而不是暂停兑付后的可执行经济回收价值。若不减记，清算可能延后；若突然减记，清算人又缺少足够二级深度处置 sNUSD。`);

block('strata_detail', `## Strata：Strategy 账面资产约 1.671M NUSD，Senior 前缓冲约 17.1%

**【链上可验证】** 当前 Strategy totalAssets 约 1.671M NUSD、持有约 1.570M sNUSD；Senior totalAssets 约 1.386M，Junior 约 284.7K。按 Strategy 减去 Senior 计算，Junior+reserve 账面缓冲约 285.3K NUSD，占 Strategy 约 17.1%。

已验证的损失顺序仍是 Junior → Reserve → Senior。两层 deposit/withdraw 的暂停状态最后在 8 月 15 日完成合约级核验，本次未见官方恢复公告。

**【机制推断】** 上述都是未减记账面口径，不是可执行退出价值。早期兑付若有折价或额度限制，会通过 Strategy 的实际回收和分层顺序传导。`);

block('protocol_live_heading', '## 外部协议状态：当前快照与历史核验分开呈现');

block('scenarios_heading', `## 回收情景：不要把“$27M 可用流动资产”直接套成统一赔付率

**【机制推断】** 早期兑付价格、额度和排队方式未知，且不同持有人可能面临不同时间价值与法律路径。情景表只是对 Lulo 与 Strata 可识别头寸做统一底层回收率的机械敏感度，不是预测，也不含 Pendle 重叠头寸、补偿、资本注入、处置费用或法律追偿。`);

block('prices', `## 价格与流动性：边际近锚，规模化退出仍失效

**【链上可验证】** Curve NUSD/USDC 池约持有 14,876.58 NUSD 与 11,751.57 USDC，官方 API TVL 约 $26.6K。直接 RPC 报价显示：1 NUSD 约 $0.9991；卖出 10,000 NUSD 平均约 $0.9875；15,000 NUSD 平均约 $0.7781；100,000 NUSD 最多只能换得约 11,748 USDC。

**【机制推断】** 极小额价格接近 $1 只说明曲线局部，不能证明规模化退出、早期兑付价格或最终回收率。`);

block('sentiment_analysis', `## 社区情绪：关注点已从“是否被黑”转向兑付条款

官方排除合约漏洞并披露约 $27M 流动资产后，核心争议转为：流动资产构成、未流动头寸的回收、早期兑付折价、先后顺序和剩余债权安排。

**【社区传言】** 对具体对手方、内部责任或确定回收比例的说法仍缺乏一手证据。二级市场极薄，局部价格也不适合当作群体预期的可靠量化指标。`);

block('thinking', `## 独立思考与判断

1. **事件性质已更清楚，但损失还不清楚。** 排除代码漏洞后，风险核心转向策略头寸、资产可得性和法律/财务处置。
2. **约 $27M 是有价值的新信息，但最容易被误写。** 它说明存在可用流动资产，却没有证明分配池就是 $27M，也没有覆盖未流动资产、费用和债权优先级。
3. **早期兑付设计本身会重新分配风险。** 先退出者拿到何种资产、剩余持有人保留何种请求权，决定方案是否只是降低等待成本，还是把尾部风险集中化。
4. **Lulo 当前占比上升主要来自分母收缩。** sNUSD allocation 从约 $1.661M 增至 $1.672M 不多，但 Vault 总资产从 $4.156M 降到 $1.672M，显示可退出部分先行流失。
5. **Morpho 的坏账字段暂为 0 不代表经济损失为 0。** Oracle 与 sNUSD 账面 NAV 尚未反映暂停和潜在减值。
6. **Curve 价格不能替代回收率。** 约 $26.6K 的池深远小于 53.390M NUSD 供应，规模化报价会快速塌缩。`);

block('actions', `## 建议的风险动作

1. 不要把 $27M、1.064387 账面 NAV 或 Curve 小额近锚报价当成确定兑付比例。
2. NUSD/sNUSD 持有人等待早期兑付合约、审计报告、价格、额度、顺序和剩余债权条款后再比较“早退”与“等待”情景。
3. Lulo 用户关注 Vault 份额净值、市场减记、保护认定与专项补偿；当前剩余 Vault 已几乎完全暴露于问题市场。
4. Strata/Pendle 持有人按底层回收率和时间做压力测试，避免把 PT 到期或 Senior 优先级误解为无风险。
5. 本报告为风险管理框架，不构成个性化投资、法律或税务建议。`);

block('questions', `## 仍待确认的关键问题

- 约 $27M 可用流动资产的币种、托管位置、法律权属和可分配净额是什么？
- 受影响策略头寸是什么，账面值、可回收值、预计回收期和对手方风险如何？
- 早期兑付价格、额度、顺序、资格、分期方式和剩余请求权是什么？
- NUSD 与 sNUSD 是否使用同一折算规则，sNUSD 未实现收益如何处理？
- Lulo 是否会确认减记，Protected/Boost 与其他补偿如何分担？
- Strata 的 Junior/Reserve/Senior 如何按实际兑付现金流结算？
- 独立审计和法律/财务审查是否会公开结论或摘要？`);

block('monitoring', `## 后续监控清单

- **官方：** Neutrl X/Telegram、早期兑付合约地址、审计报告、条款、开放时间与分配进度。
- **链上核心：** Router/sNUSD paused、NUSD totalSupply、sNUSD totalAssets/convertToAssets、兑付合约资金与累计兑付。
- **Morpho/Lulo：** Vault totalAssets、sNUSD allocation、market liquidity、oracle price、liquidations、badDebt/realizedBadDebt 与保护认定。
- **Curve：** USDC/NUSD 余额、10K/15K/100K get_dy 与大额 LP 变化。
- **Strata/Pendle：** Strategy/sr/jr NAV、操作开关、PT/SY 余额、到期结算与市场深度。
- **法律与财务：** 不流动资产回收、处置费用、债权优先级、资本注入与补偿上限。`);

block('caveats', `## Caveats and Assumptions

- 数据截止为 2026-08-31 15:54 CST；主链上状态锚为 Ethereum block 25,873,897。API 与链上读数存在数分钟时间差。
- 约 $27M 是 Neutrl 官方称的 available liquid assets，不是独立审计值、总储备、保证兑付金额或最终回收率。
- 官网事件前储备快照不能与事件后供应拼接计算覆盖率；不流动头寸的 PnL 与可回收值未知。
- sNUSD、Morpho Oracle 与 Strata totalAssets 都是未减记账面口径，不是美元退出价值。
- Pendle/Euler/Silo 的细分余额沿用 8 月 15 日合约级核验，并明确作为历史快照；本次重点更新官方处置、Neutrl 核心、Lulo/Morpho、Strata 与 Curve。
- 风险敞口、潜在毛损失与已实现坏账不同；外部协议头寸可能与 NUSD 核心负债重叠，不能相加为总损失。
- 本报告基于公开信息与链上数据，不构成投资、法律或税务建议。`);

ds.headline_metrics = [{
  liquid_assets_usd: 27000000,
  nusd_supply: 53390061.785021,
  lulo_exposure: 1671805.294,
  lulo_share_pct: 99.999999,
  strata_proxy: 1670840.840768,
  strata_junior_pct: 17.077,
  curve_liquidity: 26614.706833,
  snapshot: '2026-08-31 15:54 CST',
}];

ds.external_exposure = [
  { protocol: 'Lulo / Morpho', exposure_musd: 1.671805, basis: 'Lulo Vault 对 sNUSD/USDC 市场的 USDC 供给；当前剩余 Vault 近 100%', confidence: '高：Morpho 官方 API', snapshot: '2026-08-31 16:00 CST', withdrawal_liquidity_musd: 0 },
  { protocol: 'Strata NUSD', exposure_musd: 1.670841, basis: 'Strategy 合约 totalAssets；未减记账面值', confidence: '高：Ethereum RPC', snapshot: '2026-08-31 15:54 CST', withdrawal_liquidity_musd: 0 },
];

const lulo = 1.671805;
const strata = 1.670841;
ds.loss_scenarios = [1, 0.75, 0.5, 0].map((recovery) => ({
  recovery_label: `${Math.round(recovery * 100)}%`,
  recovery_rate: recovery,
  lulo_loss_musd: +(lulo * (1 - recovery)).toFixed(6),
  strata_loss_musd: +(strata * (1 - recovery)).toFixed(6),
  combined_loss_musd: +((lulo + strata) * (1 - recovery)).toFixed(6),
  assumption: recovery === 1 ? '全部按面值恢复' : recovery === 0 ? '底层最终无回收' : `统一减记 ${Math.round((1 - recovery) * 100)}%`,
}));

ds.event_timeline = [
  ...ds.event_timeline.filter((row) => row.order <= 7),
  { order: 8, date: '2026-08-20', event: '官方称协议仍暂停，正在评估储备与有序处置流程', classification: '【官方确认】', meaning: '暂停延续；尚无量化处置方案' },
  { order: 9, date: '2026-08-28', event: '官方排除合约漏洞，披露约 $27M 可用流动资产并计划早期兑付', classification: '【官方确认】', meaning: '根因范围缩小，处置进入合约/审计/法律审查阶段' },
  { order: 10, date: '2026-08-31', event: 'Router/sNUSD 仍 paused；Lulo 剩余 Vault 几乎全部位于 sNUSD 市场', classification: '【链上可验证】', meaning: '退出限制和下游集中风险仍未解除' },
];

ds.protocol_live_status = [
  { order: 1, protocol: 'Morpho / Lulo', chain_metric: '$1.672M allocation；market utilization 100%；bad debt=0', exit_liquidity: '该 market 为 0；剩余 Vault 几乎全仓', evidence_class: '【链上可验证】2026-08-31', conclusion: 'USDC 债权风险尚未会计减记' },
  { order: 2, protocol: 'Strata', chain_metric: 'Strategy 1.671M NUSD；Junior+reserve 约 17.1%', exit_liquidity: '未见官方恢复公告', evidence_class: '【链上可验证】2026-08-31', conclusion: '账面未减记；损失顺序 Junior→Reserve→Senior' },
  { order: 3, protocol: 'Pendle', chain_metric: '8 月 15 日 wrappers：8.261M sNUSD 等', exit_liquidity: '底层 Neutrl/Strata 退出受限', evidence_class: '【历史链上快照】2026-08-15', conclusion: '重要承载层；与 Strata/NUSD 重叠' },
  { order: 4, protocol: 'Euler / Silo', chain_metric: '8 月 15 日直接余额极小或为 0', exit_liquidity: '隔离市场限制横向传染', evidence_class: '【历史链上快照】2026-08-15', conclusion: '当前报告不把其计入主要敞口' },
  { order: 5, protocol: 'Curve NUSD/USDC', chain_metric: '14,876.58 NUSD + 11,751.57 USDC；TVL $26.6K', exit_liquidity: '15K NUSD 平均约 $0.778', evidence_class: '【链上可验证】2026-08-31', conclusion: '边际近锚不代表规模化退出' },
];

ds.full_impact_layers = [
  { layer: 'L0', affected: 'NUSD/sNUSD、直接钱包与法律债权人', transmission: '协议暂停；早期兑付条款和最终回收未知', scale: 'NUSD 供应 53.390M；官方称约 $27M 可用流动资产', severity: '高：核心负债端' },
  { layer: 'L1', affected: 'Curve、Pendle PT/YT/LP、做市商', transmission: '流动性枯竭、折价与到期结算依赖底层', scale: 'Curve $26.6K；Pendle 数据为 8 月 15 日历史快照', severity: '高：退出/期限/基差' },
  { layer: 'L2', affected: 'Strata srNUSD/jrNUSD', transmission: 'Junior → Reserve → Senior', scale: 'Strategy 账面 1.671M NUSD；Senior 前缓冲约 17.1%', severity: '高：直接底层风险' },
  { layer: 'L3', affected: 'Morpho sNUSD/USDC 与 Lulo Vault', transmission: 'Oracle 账面价、清算缺乏流动性、保护认定待定', scale: '$1.672M；剩余 Vault 几乎全仓；market liquidity 0', severity: '高：贷款本金风险' },
  { layer: 'L4', affected: 'Euler 与 Silo 隔离市场', transmission: '按具体市场的供给/抵押/借款传导', scale: '8 月 15 日余额极小或为 0', severity: '较低：历史快照下直接敞口有限' },
  { layer: 'L5', affected: '不流动策略头寸、交易场所与法律债权人', transmission: '资产权属、处置费用、优先级与追偿', scale: '未披露', severity: '高不确定性、长尾' },
];

ds.impact_map = [
  { risk_rank: 1, protocol: 'Neutrl 原生 NUSD/sNUSD', exposure: 'NUSD 供应 53.390M；约 $27M 可用流动资产为官方自述', exit_status: '协议暂停；早期兑付目标 9 月上旬', loss_bearer: '直接持有人与法律债权人', assessment: '【官方确认】+【链上可验证】核心风险层' },
  { risk_rank: 2, protocol: 'Lulo USDC Vault / Morpho', exposure: '$1.672M；剩余 Vault 几乎 100%', exit_status: '该市场流动性 0', loss_bearer: 'Vault 存款人；保护与补偿待定', assessment: '【链上可验证】直接贷款本金风险' },
  { risk_rank: 3, protocol: 'Strata srNUSD / jrNUSD', exposure: 'Strategy 账面 1.671M NUSD', exit_status: '未见官方恢复公告', loss_bearer: 'Junior→Reserve→Senior；账面缓冲约 17.1%', assessment: '【链上可验证】账面 +【机制推断】损失路径' },
  { risk_rank: 4, protocol: 'Pendle NUSD/sNUSD/sr/jr', exposure: '8 月 15 日 wrappers 合计 8.261M sNUSD 等', exit_status: '底层 Neutrl/Strata 退出受限', loss_bearer: 'PT/YT/LP；与 Strata/NUSD 重叠', assessment: '【历史链上快照】重要承载与期限层' },
  { risk_rank: 5, protocol: 'Curve NUSD/USDC', exposure: '池 TVL 约 $26.6K', exit_status: '15K NUSD 平均约 $0.778', loss_bearer: 'LP 与试图退出的 NUSD 持有人', assessment: '【链上可验证】规模化流动性近枯竭' },
  { risk_rank: 6, protocol: 'Euler / Silo', exposure: '8 月 15 日直接余额极小或为 0', exit_status: '隔离限制横向传染', loss_bearer: '具体隔离市场份额持有人', assessment: '【历史链上快照】未计入主要敞口' },
];

for (const chart of m.charts) {
  if (chart.id === 'chart_exposure') {
    chart.title = '当前可识别的主要外部直接风险敞口';
    chart.subtitle = 'Lulo 为 USDC 供给本金；Strata 为 Strategy 未减记账面 NUSD 资产，单位：百万。';
    chart.comparisonContext = { baseline: '2026-08-31 API/RPC 快照', denominator: '各协议可识别直接头寸；非去重总损失', grain: '协议', unit: '百万' };
  }
  if (chart.id === 'chart_scenarios') chart.subtitle = '机械敏感度，不代表早期兑付价格或最终损失；单位：百万。';
}

ds.evidence_table = [
  { priority: 1, metric: '可用流动资产', value: '约 $27M', basis: '【官方确认】8 月 28 日公告', confidence: '中高：官方自述，待独立审计和分项' },
  { priority: 2, metric: 'NUSD totalSupply', value: '53.390M', basis: '【链上可验证】ERC-20 totalSupply', confidence: '高' },
  { priority: 3, metric: '协议状态', value: 'Router / sNUSD paused=true', basis: '【链上可验证】Ethereum RPC', confidence: '高' },
  { priority: 4, metric: 'Lulo 剩余 Vault', value: '$1.672M，几乎全在 sNUSD 市场', basis: '【链上可验证】Morpho API', confidence: '高' },
  { priority: 5, metric: 'Strata Strategy', value: '1.671M NUSD 账面资产', basis: '【链上可验证】Ethereum RPC', confidence: '高：账面；退出价值未知' },
  { priority: 6, metric: 'Curve 深度', value: '$26.6K TVL；15K 平均约 $0.778', basis: '【链上可验证】Curve API + RPC', confidence: '高：特定快照' },
];

upsertSource(source('neutrl_update_aug28', 'Neutrl 官方 8 月 28 日处置更新', 'https://t.me/NeutrlOfficial/54', 'Official disclosure that the issue affected a strategy position and reserve liquidity, was not a smart-contract exploit, and that approximately $27M of liquid assets were available while an early-redemption mechanism was being prepared.'));
upsertSource(source('neutrl_update_aug20', 'Neutrl 官方 8 月 20 日状态更新', 'https://t.me/NeutrlOfficial/53', 'Official confirmation that the protocol remained paused while reserves and an orderly process were assessed.'));
upsertSource(source('neutrl_x_aug28', 'Neutrl 官方 X 镜像', 'https://x.com/Neutrl/status/2093390526582010348', 'X mirror of the August 28 official recovery update.'));
upsertSource(source('neutrl_reserves_current', 'Neutrl 官方储备页（事件前快照）', 'https://www.neutrl.finance/reserves', 'Official reserve page visible at the update cutoff showed a pre-incident August 5, 2026 snapshot: approximately $60.35M reserves, $58.4M NUSD outstanding, 103.18% coverage and $1.8M surplus. It must not be combined with post-incident supply to calculate current coverage.'));

// Keep the mirrored top-level source inventory aligned with the manifest.
artifact.sources = structuredClone(m.sources);
fs.writeFileSync(artifactOutput, JSON.stringify(artifact, null, 2) + '\n');

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' })[c]);
}

function inline(markdown) {
  let text = escapeHtml(markdown);
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/【(官方确认|链上可验证|媒体报道|机制推断|社区传言|历史链上快照)】/g, '<span class="ev $1">【$1】</span>');
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
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { flushPara(); closeList(); out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); continue; }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (bullet || ordered) {
      flushPara();
      const type = bullet ? 'ul' : 'ol';
      if (list !== type) { closeList(); list = type; out.push(`<${type}>`); }
      out.push(`<li>${inline((bullet || ordered)[1])}</li>`);
      continue;
    }
    para.push(line);
  }
  flushPara(); closeList();
  return out.join('\n');
}

function getBody(id) { return m.blocks.find((item) => item.id === id)?.body || ''; }
function section(id, num, title, blockIds, extra = '') {
  return `<section id="${id}"><div class="section-head"><span class="num">${num}</span><h2>${title}</h2></div>${blockIds.map((x) => markdownToHtml(getBody(x)).replace(/^<h2>.*?<\/h2>\s*/s, '')).join('\n')}${extra}</section>`;
}

function tableHtml(title, columns, rows) {
  return `<div class="table-block"><h3>${escapeHtml(title)}</h3><div class="table-wrap"><table><thead><tr>${columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((c) => `<td>${inline(row[c.field] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
}

const timeline = tableHtml('事件时间线', [
  { field: 'date', label: '日期' }, { field: 'event', label: '事件' }, { field: 'classification', label: '证据' }, { field: 'meaning', label: '意义' },
], ds.event_timeline);
const protocolTable = tableHtml('外部协议状态', [
  { field: 'protocol', label: '协议/市场' }, { field: 'chain_metric', label: '余额/风险指标' }, { field: 'exit_liquidity', label: '退出流动性' }, { field: 'evidence_class', label: '证据' }, { field: 'conclusion', label: '结论' },
], ds.protocol_live_status);
const evidenceTable = tableHtml('关键数字与证据等级', [
  { field: 'metric', label: '指标' }, { field: 'value', label: '当前读数' }, { field: 'basis', label: '口径' }, { field: 'confidence', label: '可信度' },
], ds.evidence_table);
const scenarioTable = tableHtml('Lulo + Strata 机械回收情景（非预测）', [
  { field: 'recovery_label', label: '底层回收率' }, { field: 'lulo_loss_musd', label: 'Lulo 毛损失（百万）' }, { field: 'strata_loss_musd', label: 'Strata 毛损失（百万）' }, { field: 'combined_loss_musd', label: '合计（百万）' }, { field: 'assumption', label: '假设' },
], ds.loss_scenarios);

const sourceIds = ['neutrl_official_status','neutrl_update_aug20','neutrl_update_aug28','neutrl_x_aug28','neutrl_reserves_current','morpho_api_snapshot','morpho_snusd','lulo_morpho','strata_chain_snapshot','strata_pause_tx','pendle_api_snapshot','curve_chain_snapshot','curve_remove_tx','neutrl_strategy','neutrl_transparency'];
const sourceList = sourceIds.map((id) => m.sources.find((s) => s.id === id)).filter(Boolean);
const sourcesHtml = `<div class="sources">${sourceList.map((s, i) => `<div class="source"><span class="sid">S${String(i + 1).padStart(2, '0')}</span><br><a href="${escapeHtml(s.href)}" target="_blank" rel="noreferrer">${escapeHtml(s.label)}</a><br><span>${escapeHtml(s.query?.description || '')}</span></div>`).join('')}</div>`;

const cards = [
  ['Available liquid assets', '~$27M', '官方自述｜非总储备/兑付率'],
  ['NUSD supply', '53.390M', '链上 totalSupply'],
  ['Lulo remaining vault', '$1.672M', '几乎全在 sNUSD market'],
  ['Curve pool TVL', '$26.6K', '规模化退出深度极薄'],
].map(([label, value, note]) => `<div class="card"><div class="label">${label}</div><div class="value">${value}</div><div class="note">${note}</div></div>`).join('');

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Neutrl 事件影响与 Lulo 风险暴露报告 v2 · 2026-08-31</title>
<meta name="description" content="Neutrl 策略头寸与储备流动性事件、约 2,700 万美元可用流动资产、早期兑付计划，以及 Lulo/Morpho、Strata、Pendle 与 Curve 风险传导。">
<meta property="og:type" content="article"><meta property="og:title" content="Neutrl 事件影响与 Lulo 风险暴露报告"><meta property="og:description" content="约 $27M 是可用流动资产，不是确定兑付率；Lulo 剩余 Vault 约 $1.672M，几乎全部位于 sNUSD 市场。"><meta property="og:url" content="https://sharpcx.github.io/incident-risk-reports/reports/neutrl-lulo-2026-08-13/"><meta property="og:image" content="https://sharpcx.github.io/incident-risk-reports/assets/neutrl-lulo-cover.png"><meta property="article:published_time" content="2026-08-31T15:54:00+08:00"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="https://sharpcx.github.io/incident-risk-reports/reports/neutrl-lulo-2026-08-13/"><link rel="alternate" hreflang="zh-CN" href="https://sharpcx.github.io/incident-risk-reports/reports/neutrl-lulo-2026-08-13/"><link rel="alternate" hreflang="en" href="https://sharpcx.github.io/incident-risk-reports/reports/neutrl-lulo-2026-08-13/en/"><link rel="alternate" hreflang="x-default" href="https://sharpcx.github.io/incident-risk-reports/reports/neutrl-lulo-2026-08-13/"><link rel="icon" href="../../assets/site-icon.svg" type="image/svg+xml">
<style>
:root{--bg:#eef5f4;--paper:#fffefd;--ink:#172522;--muted:#657470;--line:#d3dfdc;--teal:#086b67;--aqua:#8ddbd4;--amber:#a96c12;--red:#ad4351;--blue:#346c8b;--shadow:0 14px 42px rgba(20,49,46,.09)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;overflow-x:hidden;background:var(--bg);color:var(--ink);font:15px/1.72 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Noto Sans CJK SC",sans-serif}a{color:var(--teal);text-decoration:none}a:hover{text-decoration:underline}code{font:12px ui-monospace,SFMono-Regular,Menlo,monospace;background:#e8efed;padding:2px 5px;border-radius:4px;overflow-wrap:anywhere}.shell{display:grid;grid-template-columns:240px minmax(0,980px);gap:28px;max-width:1280px;margin:auto;padding:24px}.side{position:sticky;top:20px;height:calc(100vh - 40px);overflow:auto;padding:18px 8px}.brand{font:800 19px/1.25 Georgia,serif;margin:0 10px 18px;color:var(--teal)}.side a{display:flex;gap:10px;color:#50605c;padding:7px 10px;border-radius:7px;font-size:12px}.side a:hover,.side a.active{background:var(--paper);color:var(--ink);text-decoration:none}.side a span{font:700 10px ui-monospace;color:#8a9995;min-width:20px}.tools{display:flex;gap:8px;margin:18px 10px}.tools button{border:1px solid var(--line);background:var(--paper);padding:7px 10px;border-radius:6px;cursor:pointer;color:var(--ink)}main{min-width:0}.hero{min-width:0;background:linear-gradient(135deg,#075c59,#0d4442 64%,#172f32);color:white;border-radius:18px;padding:48px 52px;margin-bottom:18px;box-shadow:var(--shadow);position:relative;overflow:hidden}.hero:after{content:"";position:absolute;width:360px;height:360px;border:1px solid rgba(141,219,212,.23);border-radius:50%;right:-130px;top:-150px;box-shadow:0 0 0 54px rgba(141,219,212,.06),0 0 0 120px rgba(141,219,212,.03)}.kicker{text-transform:uppercase;letter-spacing:.18em;font-size:11px;color:var(--aqua);font-weight:700}.hero h1{font:700 42px/1.05 Georgia,"Noto Serif SC",serif;margin:16px 0 13px;max-width:720px}.hero .sub{font-size:17px;color:#d4eeeb;max-width:740px}.hero h1,.hero .sub,.kicker,.meta{overflow-wrap:anywhere;word-break:break-word}.meta{display:flex;flex-wrap:wrap;gap:8px 22px;margin-top:28px;font-size:12px;color:#bddbd7}.warning{margin-top:22px;padding:12px 14px;border-left:3px solid #f0b44d;background:rgba(255,255,255,.08);font-size:12px;max-width:790px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.card{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:18px;box-shadow:0 4px 16px rgba(28,49,46,.04)}.card .label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}.card .value{font:700 27px/1.1 Georgia,serif;margin:8px 0 4px}.card .note{font-size:11px;color:var(--muted)}section{scroll-margin-top:18px;background:var(--paper);border:1px solid var(--line);border-radius:14px;margin:16px 0;padding:32px 38px;box-shadow:0 5px 20px rgba(28,49,46,.035)}.section-head{display:flex;align-items:baseline;gap:14px;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:20px}.section-head .num{font:700 12px ui-monospace;color:var(--teal)}h2{font:700 25px/1.2 Georgia,"Noto Serif SC",serif;margin:0}h3{font-size:15px;margin:24px 0 10px}p{margin:0 0 15px}ul,ol{padding-left:21px;margin:9px 0 18px}li{margin:7px 0}.ev{font-weight:700;font-size:12px;white-space:nowrap}.ev.官方确认{color:var(--teal)}.ev.链上可验证,.ev.历史链上快照{color:var(--blue)}.ev.媒体报道{color:#72559c}.ev.机制推断{color:var(--amber)}.ev.社区传言{color:var(--red)}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:9px;margin:14px 0 22px}table{border-collapse:collapse;width:100%;font-size:12px;background:white}th{background:#edf4f2;color:#465753;text-align:left;font-weight:700}th,td{padding:10px 12px;border-bottom:1px solid #e2ebe8;vertical-align:top}tr:last-child td{border-bottom:0}.sources{columns:2;column-gap:26px}.source{break-inside:avoid;margin:0 0 11px;padding-bottom:9px;border-bottom:1px dotted var(--line);font-size:12px}.source .sid{font:700 10px ui-monospace;color:#899894}.source span:last-child{color:var(--muted)}.footer{color:var(--muted);font-size:11px;text-align:center;padding:28px}.filterbar{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}.filterbar button{border:1px solid var(--line);background:white;border-radius:999px;padding:5px 10px;font-size:11px;cursor:pointer}.filterbar button.on{background:var(--ink);color:white}.dim{opacity:.16;transition:opacity .2s}@media(max-width:900px){.shell{display:block;padding:12px}.side{position:relative;height:auto;padding:8px}.side nav{display:none}.hero{padding:34px 25px}.hero h1{font-size:34px}.cards{grid-template-columns:repeat(2,1fr)}section{padding:25px 21px}.sources{columns:1}}@media(max-width:540px){.cards{grid-template-columns:1fr}}@media print{body{background:white}.shell{display:block;max-width:none;padding:0}.side,.tools,.filterbar{display:none}.hero,section,.card{box-shadow:none;break-inside:avoid}.hero{border-radius:0}.cards{grid-template-columns:repeat(4,1fr)}a{color:inherit}.sources{columns:2}}
</style></head><body><div class="shell"><aside class="side"><div class="brand">Neutrl / Lulo<br>Event Risk</div><div class="tools"><button onclick="window.print()">打印 / PDF</button><button id="topBtn">顶部</button></div><nav>
${[['executive','Executive Summary'],['scope','范围与证据规则'],['background','项目与储备结构'],['timeline','事件时间线'],['status','当前状态与早期兑付'],['impact','完整影响范围'],['exposure','Lulo / Morpho / Strata'],['protocols','外部协议状态'],['liquidity','价格与流动性'],['scenarios','回收情景'],['thinking','独立判断'],['actions','风险动作与监控'],['caveats','假设与局限'],['sources','来源清单']].map(([id,label],i)=>`<a href="#${id}"><span>${String(i+1).padStart(2,'0')}</span>${label}</a>`).join('')}
</nav></aside><main><header class="hero"><div style="display:flex;justify-content:space-between;gap:16px;align-items:center;position:relative;z-index:1"><a href="../../" style="display:inline-block;color:#c8ece7;margin-bottom:20px;font-size:12px">← 返回报告档案</a><a href="en/" style="display:inline-block;color:#fff;margin-bottom:20px;font-size:12px;border:1px solid rgba(255,255,255,.35);padding:4px 9px;border-radius:999px">English</a></div><div class="kicker">Incident Intelligence · Ethereum · 2026-08-31</div><h1>Neutrl 事件影响与 Lulo 风险暴露报告</h1><div class="sub">策略头寸与储备流动性事件｜暂停、早期兑付与跨协议传导</div><div class="meta"><span>截止：2026-08-31 15:54（北京时间，UTC+8）</span><span>Ethereum #25,873,897</span><span>版本：v2</span></div><div class="warning">约 $27M 是官方称的可用流动资产，不是总储备、已承诺分配金额或确定兑付率。</div></header>
<div class="cards">${cards}</div><div class="filterbar"><button class="on" data-filter="all">全部证据</button><button data-filter="官方确认">官方</button><button data-filter="链上可验证">链上</button><button data-filter="机制推断">机制推断</button><button data-filter="社区传言">社区传言</button></div>
${section('executive','01','Executive Summary｜执行摘要',['executive_summary'])}
${section('scope','02','范围、截止与证据规则',['scope'])}
${section('background','03','项目、策略、储备与透明度',['project_background','strategy','reserve_context','transparency_limits'])}
${section('timeline','04','事件时间线与根因边界',['how_happened'],timeline)}
${section('status','05','当前状态与早期兑付',['status'])}
${section('impact','06','完整影响范围与去重口径',['full_impact_intro'])}
${section('exposure','07','Lulo / Morpho / Strata 风险暴露',['exposure_heading','lulo_detail','liquidation','strata_detail'])}
${section('protocols','08','外部协议状态',['protocol_live_heading'],protocolTable + evidenceTable)}
${section('liquidity','09','价格与规模化退出能力',['prices'])}
${section('scenarios','10','回收情景',['scenarios_heading'],scenarioTable)}
${section('thinking','11','独立思考与判断',['thinking'])}
${section('actions','12','风险动作、开放问题与监控',['actions','questions','monitoring'])}
${section('caveats','13','Caveats｜假设与局限',['caveats'])}
<section id="sources"><div class="section-head"><span class="num">14</span><h2>来源清单与可复核入口</h2></div>${sourcesHtml}</section>
<div class="footer"><a href="../../">链上事故风险报告档案</a> · Neutrl / Lulo Event Risk Report · v2 · Evidence cutoff 2026-08-31 15:54 CST</div></main></div>
<script>document.getElementById('topBtn').onclick=()=>scrollTo({top:0,behavior:'smooth'});const buttons=[...document.querySelectorAll('[data-filter]')];buttons.forEach(b=>b.onclick=()=>{buttons.forEach(x=>x.classList.remove('on'));b.classList.add('on');const f=b.dataset.filter;document.querySelectorAll('.ev').forEach(x=>x.closest('p,li')?.classList.toggle('dim',f!=='all'&&!x.classList.contains(f)))});const links=[...document.querySelectorAll('.side nav a')];const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-20% 0px -70%'});document.querySelectorAll('section').forEach(s=>obs.observe(s));</script></body></html>`;

fs.writeFileSync(htmlOutput, html + '\n');
await import('./build-neutrl-report-en.mjs');
console.log(`Wrote ${artifactOutput}`);
console.log(`Wrote ${htmlOutput}`);
