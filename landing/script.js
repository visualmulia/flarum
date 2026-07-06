// 1. Tool Switching Navigation
function switchTool(toolId) {
  // Hide all sections
  document.querySelectorAll('.tool-section').forEach(sec => {
    sec.classList.remove('active');
  });
  // Deactivate all menu items
  document.querySelectorAll('.menu-item').forEach(btn => {
    btn.classList.remove('active');
  });

  // Activate selected section
  const targetSection = document.getElementById('sec-' + toolId);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Find and activate the menu button
  const menuButtons = Array.from(document.querySelectorAll('.menu-item'));
  const clickedBtn = menuButtons.find(btn => btn.getAttribute('onclick').includes(toolId));
  if (clickedBtn) {
    clickedBtn.classList.add('active');
  }

  // Render mockup if switching to mockup tab
  if (toolId === 'mockup-gen') {
    renderMockup();
  }
}

// 2. Local Tool: HTML Landing Maker Realtime Sync
const htmlHeadline = document.getElementById('html-headline');
const htmlDesc = document.getElementById('html-desc');
const htmlPrice = document.getElementById('html-price');
const htmlWa = document.getElementById('html-wa');
const htmlIframe = document.getElementById('html-preview-iframe');

function updateHTMLPreview() {
  if (!htmlIframe) return;

  const headlineVal = htmlHeadline.value || 'Headline Utama Anda';
  const descVal = htmlDesc.value || 'Deskripsi singkat produk atau jasa Anda yang memikat pelanggan.';
  const priceVal = htmlPrice.value || 'Gratis';
  const waVal = htmlWa.value || '#';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f8fafc;
          color: #0f172a;
          margin: 0;
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .card {
          background: white;
          max-width: 480px;
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        .badge {
          background: #e0e7ff;
          color: #4f46e5;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          display: inline-block;
          margin-bottom: 1rem;
        }
        .body {
          padding: 1.5rem;
        }
        h1 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 1rem 0;
          line-height: 1.3;
          color: #1e1b4b;
        }
        p {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 1.5rem 0;
        }
        .price-tag {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 1.5rem;
        }
        .cta-btn {
          display: block;
          text-align: center;
          background: #4f46e5;
          color: white;
          text-decoration: none;
          padding: 0.8rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: background 0.2s;
        }
        .cta-btn:hover {
          background: #4338ca;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="body">
          <div class="badge">PROMO SPESIAL</div>
          <h1>${headlineVal}</h1>
          <p>${descVal}</p>
          <div class="price-tag">${priceVal}</div>
          <a href="${waVal}" target="_blank" class="cta-btn">Amankan Slot Sekarang</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const doc = htmlIframe.contentDocument || htmlIframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();
}

if (htmlHeadline) {
  [htmlHeadline, htmlDesc, htmlPrice, htmlWa].forEach(el => {
    el.addEventListener('input', updateHTMLPreview);
  });
  // Initial call
  setTimeout(updateHTMLPreview, 500);
}

function copyHTMLCode() {
  const headlineVal = htmlHeadline.value || 'Headline Utama Anda';
  const descVal = htmlDesc.value || 'Deskripsi singkat produk atau jasa Anda.';
  const priceVal = htmlPrice.value || 'Gratis';
  const waVal = htmlWa.value || '#';

  const htmlCode = `<div style="background:#f8fafc;padding:2rem;font-family:sans-serif;text-align:center;border-radius:12px;border:1px solid #e2e8f0;max-width:500px;margin:0 auto;">
  <span style="background:#e0e7ff;color:#4f46e5;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:99px;text-transform:uppercase;">PROMO SPESIAL</span>
  <h2 style="font-size:22px;color:#1e1b4b;margin:15px 0;">${headlineVal}</h2>
  <p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:20px;">${descVal}</p>
  <div style="font-size:24px;font-weight:bold;color:#0f172a;margin-bottom:20px;">${priceVal}</div>
  <a href="${waVal}" target="_blank" style="background:#4f46e5;color:white;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block;">Amankan Slot Sekarang</a>
</div>`;

  navigator.clipboard.writeText(htmlCode);
  alert('Kode HTML berhasil disalin! Anda dapat membagikannya di forum.');
}

// 3. Local Tool: Sales Page Maker Realtime Sync
const salesHook = document.getElementById('sales-hook');
const salesProblem = document.getElementById('sales-problem');
const salesSolution = document.getElementById('sales-solution');
const salesScarcity = document.getElementById('sales-scarcity');
const salesCta = document.getElementById('sales-cta');
const salesOutput = document.getElementById('sales-output-preview');

function updateSalesPreview() {
  if (!salesOutput) return;

  const hook = salesHook.value || 'Hook Penarik Perhatian';
  const problem = salesProblem.value || 'Masalah Terbesar Pelanggan';
  const solution = salesSolution.value || 'Produk/Solusi Anda';
  const scarcity = salesScarcity.value || 'Keterbatasan/Urgensi';
  const cta = salesCta.value || 'Ajakan bertindak';

  salesOutput.innerHTML = `
    <h3 style="color:#f43f5e;font-size:1.15rem;margin-bottom:0.75rem;font-weight:800;text-transform:uppercase;">📢 APAKAH ANDA MENGALAMI INI?</h3>
    <p style="font-size:1.1rem;font-style:italic;color:#94a3b8;margin-bottom:1.5rem;line-height:1.5;">"${hook}"</p>
    
    <p style="margin-bottom:1.25rem;">Banyak orang mengeluh karena: <strong style="color:#f3f4f6;">${problem}</strong>. Ini adalah kendala utama yang menghambat kemajuan Anda.</p>
    
    <h3 style="color:#10b981;font-size:1.15rem;margin-top:1.5rem;margin-bottom:0.75rem;font-weight:800;">💡 KINI HADIR SOLUSINYA!</h3>
    <p style="margin-bottom:1.25rem;">Jangan khawatir, semua masalah di atas bisa Anda selesaikan dengan mudah menggunakan: <strong style="color:#a5b4fc;">${solution}</strong>.</p>
    
    <div style="background:rgba(239,68,68,0.1);border:1px dashed #ef4444;padding:1rem;border-radius:6px;margin:1.5rem 0;">
      <span style="color:#ef4444;font-weight:700;">⚠️ PENTING:</span> ${scarcity}
    </div>
    
    <p style="font-weight:700;font-size:1.05rem;color:#f3f4f6;text-align:center;margin-top:1.5rem;">👉 ${cta}</p>
  `;
}

if (salesHook) {
  [salesHook, salesProblem, salesSolution, salesScarcity, salesCta].forEach(el => {
    el.addEventListener('input', updateSalesPreview);
  });
  setTimeout(updateSalesPreview, 500);
}

function copySalesLetter() {
  const hook = salesHook.value || 'Hook';
  const problem = salesProblem.value || 'Problem';
  const solution = salesSolution.value || 'Solution';
  const scarcity = salesScarcity.value || 'Scarcity';
  const cta = salesCta.value || 'CTA';

  const letterText = `📢 APAKAH ANDA MENGALAMI INI?\n"${hook}"\n\nBanyak orang mengeluh karena: ${problem}.\n\n💡 KINI HADIR SOLUSINYA!\nJangan khawatir, semua masalah di atas bisa diselesaikan dengan mudah menggunakan: ${solution}.\n\n⚠️ PENTING: ${scarcity}\n\n👉 ${cta}`;
  
  navigator.clipboard.writeText(letterText);
  alert('Naskah copywriting berhasil disalin!');
}

// 4. Local Tool: 3D Product Mockup Generator
let mockupImage = null;

function handleMockupUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    mockupImage = new Image();
    mockupImage.onload = function() {
      renderMockup();
    };
    mockupImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function renderMockup() {
  const canvas = document.getElementById('mockup-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const type = document.getElementById('mockup-type').value;

  // Clear canvas and draw solid background
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background circle glow
  const glow = ctx.createRadialGradient(300, 225, 50, 300, 225, 250);
  glow.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (type === 'laptop') {
    // 1. Draw Laptop Bezel & Screen
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#1e293b'; // dark bezel
    drawRoundedRect(ctx, 110, 70, 380, 230, 12);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // Inner screen border (thin shiny bezel)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 110, 70, 380, 230, 12);
    ctx.stroke();

    // Webcam dot
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(300, 80, 3, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Screen Display Area
    const screenX = 122;
    const screenY = 82;
    const screenW = 356;
    const screenH = 206;

    if (mockupImage) {
      ctx.drawImage(mockupImage, screenX, screenY, screenW, screenH);
    } else {
      // Default screen placeholder
      const grad = ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH);
      grad.addColorStop(0, '#4f46e5');
      grad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = grad;
      ctx.fillRect(screenX, screenY, screenW, screenH);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WIDATAMA AI', 300, 180);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Unggah cover Anda di panel kiri', 300, 210);
    }

    // 3. Draw Laptop Base & Hinge
    ctx.fillStyle = '#0f172a'; // hinge
    ctx.fillRect(260, 298, 80, 8);

    ctx.fillStyle = '#475569'; // metallic bottom base
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 15;
    drawRoundedRect(ctx, 60, 302, 480, 14, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Front opening notch
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(270, 302, 60, 4);

  } else if (type === 'mobile') {
    // Draw Mobile Device
    const devX = 210;
    const devY = 40;
    const devW = 180;
    const devH = 370;
    const devR = 26;

    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#1e293b'; // space grey bezel
    drawRoundedRect(ctx, devX, devY, devW, devH, devR);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Display Area
    const dispX = devX + 8;
    const dispY = devY + 8;
    const dispW = devW - 16;
    const dispH = devH - 16;
    const dispR = devR - 6;

    ctx.save();
    drawRoundedRect(ctx, dispX, dispY, dispW, dispH, dispR);
    ctx.clip();

    if (mockupImage) {
      ctx.drawImage(mockupImage, dispX, dispY, dispW, dispH);
    } else {
      const grad = ctx.createLinearGradient(dispX, dispY, dispX + dispW, dispY + dispH);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;
      ctx.fillRect(dispX, dispY, dispW, dispH);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Widatama Hub', devX + devW/2, devY + devH/2 - 10);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Mockup HP', devX + devW/2, devY + devH/2 + 15);
    }
    ctx.restore();

    // Speaker grill & camera notch (iPhone style pill)
    ctx.fillStyle = '#020617';
    drawRoundedRect(ctx, devX + devW/2 - 30, devY + 14, 60, 12, 6);
    ctx.fill();

  } else if (type === 'book') {
    // Draw 3D Book Container
    const bookX = 200;
    const bookY = 60;
    const bookW = 200;
    const bookH = 310;

    // Book spine depth shadow (left)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(bookX, bookY);
    ctx.lineTo(bookX - 15, bookY + 8);
    ctx.lineTo(bookX - 15, bookY + bookH + 8);
    ctx.lineTo(bookX, bookY + bookH);
    ctx.closePath();
    ctx.fill();

    // Book spine side color
    const spineGrad = ctx.createLinearGradient(bookX - 15, bookY, bookX, bookY);
    spineGrad.addColorStop(0, '#0f172a');
    spineGrad.addColorStop(1, '#334155');
    ctx.fillStyle = spineGrad;
    ctx.beginPath();
    ctx.moveTo(bookX, bookY);
    ctx.lineTo(bookX - 15, bookY + 8);
    ctx.lineTo(bookX - 15, bookY + bookH + 8);
    ctx.lineTo(bookX, bookY + bookH);
    ctx.closePath();
    ctx.fill();

    // Front Cover area
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#334155';
    ctx.fillRect(bookX, bookY, bookW, bookH);
    ctx.shadowBlur = 0;

    if (mockupImage) {
      ctx.drawImage(mockupImage, bookX, bookY, bookW, bookH);
    } else {
      const grad = ctx.createLinearGradient(bookX, bookY, bookX + bookW, bookY + bookH);
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(1, '#fb7185');
      ctx.fillStyle = grad;
      ctx.fillRect(bookX, bookY, bookW, bookH);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('E-BOOK COVER', bookX + bookW/2, bookY + 120);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Widatama Marketplace', bookX + bookW/2, bookY + 160);
    }

    // Page edges cream paper texture (bottom depth)
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(bookX - 15, bookY + bookH + 8);
    ctx.lineTo(bookX, bookY + bookH);
    ctx.lineTo(bookX + bookW, bookY + bookH);
    ctx.lineTo(bookX + bookW - 10, bookY + bookH + 8);
    ctx.closePath();
    ctx.fill();

    // Page lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bookX - 8, bookY + bookH + 5);
    ctx.lineTo(bookX + bookW - 5, bookY + bookH + 5);
    ctx.stroke();
  }
}

function downloadMockup() {
  const canvas = document.getElementById('mockup-canvas');
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = 'widatama-mockup.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// 5. AI Tool: Content Generation via Proxy API
async function generateAICopy(toolType) {
  // Local Rate Limit check
  const today = new Date().toISOString().split('T')[0];
  let localLimit = JSON.parse(localStorage.getItem('widatama_rate_limit')) || { date: today, count: 0 };
  
  if (localLimit.date !== today) {
    localLimit = { date: today, count: 0 };
  }

  if (localLimit.count >= 5) {
    alert('Batas harian tercapai (Maksimal 5 pembuatan konten AI per hari). Hubungi admin di forum untuk peningkatan akun!');
    return;
  }

  // Setup inputs
  let inputs = {};
  let submitBtnId = '';
  let outputContainerId = '';
  let badgeId = '';

  if (toolType === 'wa_copy') {
    const prodName = document.getElementById('wa-prod-name').value;
    const targetAud = document.getElementById('wa-audience').value;
    if (!prodName || !targetAud) {
      alert('Tolong isi semua bidang input!');
      return;
    }
    inputs = { product_name: prodName, target_audience: targetAud };
    submitBtnId = 'wa-submit-btn';
    outputContainerId = 'wa-output';
    badgeId = 'wa-rate-limit-badge';
  } else if (toolType === 'short_script') {
    const topic = document.getElementById('script-topic').value;
    if (!topic) {
      alert('Tolong isi topik naskah!');
      return;
    }
    inputs = { topic: topic };
    submitBtnId = 'script-submit-btn';
    outputContainerId = 'script-output';
    badgeId = 'script-rate-limit-badge';
  } else if (toolType === 'headline_rater') {
    const headline = document.getElementById('rate-headline').value;
    if (!headline) {
      alert('Tolong masukkan headline yang ingin diuji!');
      return;
    }
    inputs = { headline: headline };
    submitBtnId = 'rate-submit-btn';
    outputContainerId = 'rate-output';
    badgeId = 'rate-rate-limit-badge';
  }

  const submitBtn = document.getElementById(submitBtnId);
  const outputContainer = document.getElementById(outputContainerId);

  // Set loading state
  submitBtn.disabled = true;
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sedang berfikir...';
  outputContainer.innerText = 'AI sedang memproses naskah promosi Anda...';

  try {
    const response = await fetch('api/generate.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonStringify({ tool: toolType, inputs: inputs })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Terjadi kesalahan sistem.');
    }

    // Render result
    outputContainer.innerText = data.result;

    // Update local limits
    localLimit.count++;
    localStorage.setItem('widatama_rate_limit', jsonStringify(localLimit));
    
    // Update badge text across all AI tool displays
    const remaining = 5 - localLimit.count;
    document.getElementById(badgeId).innerText = `Kredit Gratis Hari Ini: ${remaining}/5`;

  } catch (err) {
    outputContainer.innerText = `Error: ${err.message}`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function jsonStringify(obj) {
  return JSON.stringify(obj);
}

function copyToClipboard(elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;

  navigator.clipboard.writeText(container.innerText);
  alert('Teks berhasil disalin!');
}

// Update Local Limit displays on page load
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  let localLimit = JSON.parse(localStorage.getItem('widatama_rate_limit')) || { date: today, count: 0 };
  if (localLimit.date !== today) {
    localLimit = { date: today, count: 0 };
  }
  const remaining = 5 - localLimit.count;
  ['wa-rate-limit-badge', 'script-rate-limit-badge', 'rate-rate-limit-badge'].forEach(badgeId => {
    const el = document.getElementById(badgeId);
    if (el) el.innerText = `Kredit Gratis Hari Ini: ${remaining}/5`;
  });
});
