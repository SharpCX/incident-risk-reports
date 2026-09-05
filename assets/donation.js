(function () {
  const address = '0x86a1f6758e84271ba338855fb99c21eebeac848d';
  const script = document.currentScript;
  const qrUrl = new URL('donation-qr.svg', script.src).href;
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');

  const copy = isEnglish ? {
    eyebrow: 'Support independent research',
    title: 'Help cover the cost of AI-assisted research',
    body: 'If these reports are useful, any amount helps cover AI and data-tool costs. Any asset on an EVM-compatible network is welcome.',
    warning: 'Confirm the network and full address before sending. A small test transfer is recommended.',
    qrNote: 'The QR code contains the address only—no amount or network is preset.',
    copyButton: 'Copy address',
    copiedButton: 'Address copied',
    copyError: 'Select address'
  } : {
    eyebrow: '支持独立研究',
    title: '帮忙覆盖 AI 辅助研究费用',
    body: '如果这些报告对你有帮助，可以随意捐一点，用于覆盖 AI 与数据工具费用。EVM 兼容网络上的任意资产都欢迎。',
    warning: '转账前请核对网络与完整地址，建议先做一笔小额测试。',
    qrNote: '二维码只包含地址，不预设金额或网络。',
    copyButton: '复制地址',
    copiedButton: '已复制',
    copyError: '请手动选择地址'
  };

  const style = document.createElement('style');
  style.textContent = `
    .support-band{width:min(1180px,calc(100% - 40px));margin:26px auto;padding:22px;border:1px solid rgba(31,61,79,.16);border-radius:16px;background:linear-gradient(135deg,rgba(255,255,255,.94),rgba(238,246,248,.94));box-shadow:0 10px 30px rgba(18,45,58,.07);color:#172b36;text-align:left}
    .support-band__inner{display:grid;grid-template-columns:116px minmax(0,1fr);gap:22px;align-items:center}
    .support-band__qr{display:block;width:116px;height:116px;padding:7px;border:1px solid #d3e0e5;border-radius:12px;background:#fff}
    .support-band__eyebrow{margin:0 0 4px;color:#18706d;font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
    .support-band h2{margin:0 0 7px;color:#163549;font:700 22px/1.25 Georgia,"Noto Serif SC",serif}
    .support-band p{margin:0 0 8px;color:#536672;font-size:14px;line-height:1.55}
    .support-band__address-row{display:flex;gap:8px;align-items:center;margin:12px 0 8px}
    .support-band__address{min-width:0;padding:9px 11px;border:1px solid #cfdae0;border-radius:8px;background:#fff;color:#183a4d;font:600 13px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere;user-select:all}
    .support-band__copy{flex:none;padding:9px 12px;border:0;border-radius:8px;background:#165f69;color:#fff;font:700 13px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}
    .support-band__copy:hover{background:#104d55}
    .support-band__copy:focus-visible{outline:3px solid rgba(22,95,105,.25);outline-offset:2px}
    .support-band__note{font-size:12px!important;color:#71808a!important}
    @media(max-width:620px){.support-band{width:min(100% - 22px,1180px);padding:18px}.support-band__inner{grid-template-columns:82px minmax(0,1fr);gap:14px;align-items:start}.support-band__qr{width:82px;height:82px;padding:5px}.support-band h2{font-size:19px}.support-band__address-row{grid-column:1/-1;display:grid}.support-band__copy{width:100%}}
    @media print{.support-band{box-shadow:none;background:#fff}.support-band__copy{display:none}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'support-band';
  section.setAttribute('aria-labelledby', 'support-research-title');

  const inner = document.createElement('div');
  inner.className = 'support-band__inner';

  const qr = document.createElement('img');
  qr.className = 'support-band__qr';
  qr.src = qrUrl;
  qr.alt = isEnglish ? 'Donation address QR code' : '捐款地址二维码';
  qr.width = 116;
  qr.height = 116;

  const content = document.createElement('div');
  const eyebrow = document.createElement('div');
  eyebrow.className = 'support-band__eyebrow';
  eyebrow.textContent = copy.eyebrow;
  const title = document.createElement('h2');
  title.id = 'support-research-title';
  title.textContent = copy.title;
  const body = document.createElement('p');
  body.textContent = copy.body;
  const warning = document.createElement('p');
  warning.textContent = copy.warning;

  const row = document.createElement('div');
  row.className = 'support-band__address-row';
  const addressText = document.createElement('code');
  addressText.className = 'support-band__address';
  addressText.textContent = address;
  const button = document.createElement('button');
  button.className = 'support-band__copy';
  button.type = 'button';
  button.textContent = copy.copyButton;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address);
      button.textContent = copy.copiedButton;
      window.setTimeout(() => { button.textContent = copy.copyButton; }, 1800);
    } catch (_) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(addressText);
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = copy.copyError;
    }
  });

  const note = document.createElement('p');
  note.className = 'support-band__note';
  note.textContent = copy.qrNote;

  row.append(addressText, button);
  content.append(eyebrow, title, body, warning, row, note);
  inner.append(qr, content);
  section.appendChild(inner);

  const footer = document.querySelector('footer') || Array.from(document.querySelectorAll('.footer')).at(-1);
  if (footer) footer.before(section);
  else document.body.insertBefore(section, script);
})();
