/**
 * JAPAFAN - HTML5 CANVAS NEON BADGE EXPORTER (MULTI-THEMED)
 * 
 * Programmatically renders a visually stunning, high-fidelity digital profile card
 * for the user in three selectable styles: Neon Cyberpunk, Retro 8-Bit Pixel, 
 * and Cozy Pastel. 100% vector-drawn to remain safe from CORS issues.
 */

function downloadBadgeImage(state, theme = 'cyberpunk') {
  if (!state || !state.user) {
    console.error("Invalid application state provided to badge exporter.");
    return false;
  }

  // 1. Create Canvas Element
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 580;
  const ctx = canvas.getContext('2d');

  // Typographies
  const fontDisplay = "'Space Grotesk', sans-serif";
  const fontBody = "'Plus Jakarta Sans', sans-serif";

  // Helper function to draw rounded rectangles
  function drawRoundRect(x, y, w, h, r, fill = true, stroke = false) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Determine colors based on themes
  let cBgGradStart, cBgGradMid, cBgGradEnd;
  let cBorder, cTextMain, cTextMuted, cAccent1, cAccent2;
  let isRetro = (theme === 'retro');
  let isCozy = (theme === 'cozy');

  if (isRetro) {
    // Retro 8-Bit Pixel colors (Classic arcade terminal)
    cBgGradStart = '#0f0f16';
    cBgGradMid = '#171724';
    cBgGradEnd = '#0c0c12';
    cBorder = '#39ff14'; // Acid green border
    cTextMain = '#39ff14'; // All text is glowing green/white
    cTextMuted = '#7b9e87';
    cAccent1 = '#fff01f'; // Yellow highlights
    cAccent2 = '#ff5e00'; // Orange retro
  } else if (isCozy) {
    // Cozy Pastel colors (Cute lavender & cream)
    cBgGradStart = '#faf8fc';
    cBgGradMid = '#f3e8ff';
    cBgGradEnd = '#edd8fc';
    cBorder = '#b794f4'; // Soft purple border
    cTextMain = '#3b0764'; // Deep purple text
    cTextMuted = '#6b5a80';
    cAccent1 = '#ff7b9f'; // Pastel pink
    cAccent2 = '#ffb088'; // Pastel peach
  } else {
    // Default Cyberpunk
    cBgGradStart = '#0a0815';
    cBgGradMid = '#120e2e';
    cBgGradEnd = '#1b124a';
    cBorder = '#00f0ff'; // Neon Cyan
    cTextMain = '#ffffff';
    cTextMuted = '#8e8bb3';
    cAccent1 = '#ff007f'; // Neon Pink
    cAccent2 = '#00f0ff';
  }

  // ==========================================================================
  // A. BACKGROUND DESIGN
  // ==========================================================================

  // Gradient fill
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, cBgGradStart);
  bgGrad.addColorStop(0.5, cBgGradMid);
  bgGrad.addColorStop(1, cBgGradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background detailing grid
  if (isRetro) {
    // Sharp retro grid
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  } else if (isCozy) {
    // Wholesome cozy floating vector bubbles
    ctx.fillStyle = 'rgba(255, 123, 159, 0.05)';
    ctx.beginPath(); ctx.arc(320, 80, 80, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(183, 148, 244, 0.06)';
    ctx.beginPath(); ctx.arc(60, 420, 100, 0, Math.PI * 2); ctx.fill();
  } else {
    // Default Cyberpunk grid + glowing spheres
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    
    // Glowing ambient spheres
    const pinkGlow = ctx.createRadialGradient(320, 80, 0, 320, 80, 160);
    pinkGlow.addColorStop(0, 'rgba(255, 0, 127, 0.2)');
    pinkGlow.addColorStop(1, 'rgba(255, 0, 127, 0)');
    ctx.fillStyle = pinkGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Outer glowing card border
  ctx.strokeStyle = cBorder;
  ctx.lineWidth = isRetro ? 4 : (isCozy ? 1.5 : 2.5);
  if (!isCozy && !isRetro) {
    ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
    ctx.shadowBlur = 12;
  }
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  ctx.shadowBlur = 0; // Reset blur

  // If Retro, draw corner brackets for arcade vibe
  if (isRetro) {
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(0, 0, 15, 6); ctx.fillRect(0, 0, 6, 15);
    ctx.fillRect(canvas.width - 15, 0, 15, 6); ctx.fillRect(canvas.width - 6, 0, 6, 15);
    ctx.fillRect(0, canvas.height - 6, 15, 6); ctx.fillRect(0, canvas.height - 15, 6, 15);
    ctx.fillRect(canvas.width - 15, canvas.height - 6, 15, 6); ctx.fillRect(canvas.width - 6, canvas.height - 15, 6, 15);
  }

  // ==========================================================================
  // B. THEMED PORTRAIT AVATAR (CORS-Safe Vector Pathing)
  // ==========================================================================
  const avX = 60;
  const avY = 60;
  const avR = 30;

  if (isRetro) {
    // 8-Bit Pixel style robot head
    ctx.fillStyle = '#06050b';
    ctx.fillRect(avX - avR, avY - avR, avR * 2, avR * 2);
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 2;
    ctx.strokeRect(avX - avR, avY - avR, avR * 2, avR * 2);
    
    // Pixel visor
    ctx.fillStyle = '#fff01f';
    ctx.fillRect(avX - 18, avY - 10, 36, 12);
    // Visor eyes
    ctx.fillStyle = '#0f0f16';
    ctx.fillRect(avX - 12, avY - 8, 6, 8);
    ctx.fillRect(avX + 6, avY - 8, 6, 8);
    
    // Antenna
    ctx.fillStyle = '#ff5e00';
    ctx.fillRect(avX - 2, avY - 38, 4, 8);
    ctx.beginPath(); ctx.arc(avX, avY - 38, 4, 0, Math.PI * 2); ctx.fill();
  } else if (isCozy) {
    // Wholesome cute vector cat silhouette
    ctx.fillStyle = '#e9d5ff';
    ctx.beginPath();
    ctx.arc(avX, avY + 4, avR - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b794f4';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cat ears
    ctx.fillStyle = '#ff7b9f';
    ctx.beginPath();
    ctx.moveTo(avX - 20, avY - 14);
    ctx.lineTo(avX - 22, avY - 30);
    ctx.lineTo(avX - 8, avY - 20);
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(avX + 20, avY - 14);
    ctx.lineTo(avX + 22, avY - 30);
    ctx.lineTo(avX + 8, avY - 20);
    ctx.closePath(); ctx.fill();

    // Cute closing eyes (u w u)
    ctx.strokeStyle = '#3b0764';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.arc(avX - 8, avY - 2, 4, 0, Math.PI, false); // left eye arc
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(avX + 8, avY - 2, 4, 0, Math.PI, false); // right eye arc
    ctx.stroke();
    
    // Whiskers
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(avX - 18, avY + 6); ctx.lineTo(avX - 26, avY + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(avX + 18, avY + 6); ctx.lineTo(avX + 26, avY + 4); ctx.stroke();
  } else {
    // Default Cyberpunk mecha avatar
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(avX, avY, avR + 4, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#06050b';
    ctx.beginPath(); ctx.arc(avX, avY, avR, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.beginPath(); ctx.arc(avX, avY, avR - 4, 0, Math.PI, true); ctx.fill();

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(avX - 18, avY - 2); ctx.lineTo(avX + 18, avY - 2); ctx.stroke();

    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(avX, avY - 2, 22, Math.PI, 0); ctx.stroke();
  }

  // ==========================================================================
  // C. PROFILE INFO DETAILS
  // ==========================================================================

  // Username
  ctx.fillStyle = cTextMain;
  ctx.font = isRetro ? `bold 1.15rem monospace` : `800 1.25rem ${fontDisplay}`;
  ctx.textAlign = 'left';
  ctx.fillText(state.user.username, 110, 52);

  // Level Badge
  ctx.fillStyle = cAccent1;
  ctx.font = isRetro ? `bold 0.8rem monospace` : `bold 0.75rem ${fontDisplay}`;
  ctx.letterSpacing = '1px';
  ctx.fillText(state.user.level.toUpperCase(), 110, 72);
  ctx.letterSpacing = '0px';

  // Bio Quote
  ctx.fillStyle = cTextMuted;
  ctx.font = isRetro ? `0.75rem monospace` : `italic 0.8rem ${fontBody}`;
  const bioText = state.user.bio ? `"${state.user.bio.slice(0, 55)}..."` : '"Anime is life."';
  ctx.fillText(bioText, 30, 120);

  // Divider Line
  ctx.strokeStyle = isRetro ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(30, 142); ctx.lineTo(370, 142); ctx.stroke();

  // ==========================================================================
  // D. TIER BOARD LISTINGS (Rank 1 to 5)
  // ==========================================================================

  ctx.fillStyle = cTextMuted;
  ctx.font = isRetro ? `bold 0.75rem monospace` : `bold 0.75rem ${fontDisplay}`;
  ctx.fillText("ULTIMATE ANIME SELECTIONS", 30, 172);

  // Styled thematic ranks
  const rankColors = {
    cyberpunk: {
      1: '#ff007f', 2: '#ff5e00', 3: '#fff01f', 4: '#39ff14', 5: '#00f0ff',
      bg: 'rgba(10, 8, 21, 0.6)', border: 'rgba(255, 255, 255, 0.04)', text: '#ffffff'
    },
    retro: {
      1: '#ff007f', 2: '#ff5e00', 3: '#fff01f', 4: '#39ff14', 5: '#00f0ff',
      bg: 'rgba(15, 15, 22, 0.9)', border: '#39ff14', text: '#39ff14'
    },
    cozy: {
      1: '#fbcfe8', 2: '#fed7aa', 3: '#fef08a', 4: '#bbf7d0', 5: '#cffafe',
      bg: '#ffffff', border: '#e9d5ff', text: '#3b0764'
    }
  };

  const themeColors = rankColors[theme] || rankColors.cyberpunk;

  let itemY = 190;
  const rowHeight = 52;
  const rowSpacing = 10;
  let hasRanks = false;

  for (let r = 1; r <= 5; r++) {
    const anime = state.tierList[r];
    if (!anime) continue;

    hasRanks = true;

    // Draw background slot row card
    ctx.fillStyle = themeColors.bg;
    ctx.strokeStyle = themeColors.border;
    ctx.lineWidth = 1;
    if (isRetro) {
      // Direct hard square borders for retro arcade cards
      ctx.fillRect(30, itemY, 340, rowHeight);
      ctx.strokeRect(30, itemY, 340, rowHeight);
    } else {
      drawRoundRect(30, itemY, 340, rowHeight, 6, true, true);
    }

    // Draw Rank Numeric Circle Badge
    ctx.fillStyle = themeColors[r];
    if (isRetro) {
      ctx.fillRect(40, itemY + 11, 38, 30);
      ctx.strokeRect(40, itemY + 11, 38, 30);
    } else {
      drawRoundRect(40, itemY + 11, 38, 30, 4, true, false);
    }

    // Rank Number
    ctx.fillStyle = isCozy ? '#3b0764' : (isRetro ? '#0f0f16' : '#ffffff');
    ctx.font = isRetro ? `bold 0.85rem monospace` : `bold 0.8rem ${fontDisplay}`;
    ctx.textAlign = 'center';
    ctx.fillText(`#${r}`, 59, itemY + 30);

    // Anime Title Text
    ctx.fillStyle = cTextMain;
    ctx.font = isRetro ? `bold 0.8rem monospace` : `600 0.85rem ${fontBody}`;
    ctx.textAlign = 'left';
    
    // Truncate long titles safely
    let titleStr = anime.title;
    if (titleStr.length > 34) titleStr = titleStr.slice(0, 31) + '...';
    ctx.fillText(titleStr, 92, itemY + 24);

    // Score Metadata
    const score = anime.score ? anime.score.toFixed(2) : 'N/A';
    ctx.fillStyle = cTextMuted;
    ctx.font = isRetro ? `0.7rem monospace` : `500 0.7rem ${fontBody}`;
    
    // Add reflection snippet if exists
    const note = state.tierNotes[r] ? ` | Note: "${state.tierNotes[r].slice(0, 24)}..."` : '';
    ctx.fillText(`MAL Rating: ${score}${note}`, 92, itemY + 41);

    itemY += rowHeight + rowSpacing;
  }

  // If no rankings present
  if (!hasRanks) {
    ctx.fillStyle = isCozy ? '#ffffff' : 'rgba(10, 8, 21, 0.4)';
    ctx.strokeStyle = themeColors.border;
    ctx.lineWidth = 1;
    if (isRetro) {
      ctx.fillRect(30, 190, 340, 200);
      ctx.strokeRect(30, 190, 340, 200);
    } else {
      drawRoundRect(30, 190, 340, 200, 8, true, true);
    }

    ctx.fillStyle = cTextMuted;
    ctx.font = isRetro ? `0.75rem monospace` : `italic 0.8rem ${fontBody}`;
    ctx.textAlign = 'center';
    ctx.fillText("No ultimate series ranked yet.", 200, 280);
    ctx.fillText("Build your list in 'My Rank' tab!", 200, 300);

    itemY = 410;
  }

  // Adjust genre position below list
  const genreY = Math.max(itemY + 10, 420);

  // Divider Line
  ctx.strokeStyle = isRetro ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(30, genreY); ctx.lineTo(370, genreY); ctx.stroke();

  // ==========================================================================
  // E. GENRES PILLS
  // ==========================================================================

  ctx.fillStyle = cTextMuted;
  ctx.font = isRetro ? `bold 0.7rem monospace` : `bold 0.7rem ${fontDisplay}`;
  ctx.textAlign = 'left';
  ctx.fillText("FAVORITE INTERESTS", 30, genreY + 22);

  // Render Genre text elements side-by-side
  let pillX = 30;
  const genres = state.user.favoriteGenres || [];

  ctx.font = isRetro ? `bold 0.65rem monospace` : `600 0.7rem ${fontBody}`;
  genres.forEach(g => {
    const textWidth = ctx.measureText(g).width;
    const paddingH = 8;
    const pillW = textWidth + (paddingH * 2);

    // Pill background
    if (isRetro) {
      ctx.fillStyle = 'rgba(57, 255, 20, 0.08)';
      ctx.strokeStyle = '#39ff14';
      ctx.fillRect(pillX, genreY + 32, pillW, 20);
      ctx.strokeRect(pillX, genreY + 32, pillW, 20);
    } else if (isCozy) {
      ctx.fillStyle = '#fdf2f8';
      ctx.strokeStyle = '#fbcfe8';
      drawRoundRect(pillX, genreY + 32, pillW, 20, 10, true, true);
    } else {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      drawRoundRect(pillX, genreY + 32, pillW, 20, 10, true, true);
    }

    // Pill Text
    ctx.fillStyle = isCozy ? '#db2777' : (isRetro ? '#39ff14' : '#00f0ff');
    ctx.fillText(g, pillX + paddingH, genreY + 45);

    pillX += pillW + 8;
  });

  if (genres.length === 0) {
    ctx.fillStyle = cTextMuted;
    ctx.font = isRetro ? `0.7rem monospace` : `italic 0.75rem ${fontBody}`;
    ctx.fillText("General Anime Fan", 30, genreY + 46);
  }

  // ==========================================================================
  // F. BADGE FOOTER
  // ==========================================================================

  const footerY = 548;

  // Divider Line
  ctx.strokeStyle = isRetro ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(30, footerY - 14); ctx.lineTo(370, footerY - 14); ctx.stroke();

  ctx.fillStyle = cTextMuted;
  ctx.font = isRetro ? `500 0.65rem monospace` : `500 0.65rem ${fontDisplay}`;
  ctx.textAlign = 'left';
  ctx.fillText("POWERED BY JAPAFAN", 30, footerY);

  ctx.textAlign = 'right';
  ctx.fillStyle = cAccent1;
  ctx.font = isRetro ? `bold 0.65rem monospace` : `bold 0.65rem ${fontDisplay}`;
  ctx.fillText(`OTAKU DIGITAL BADGE // 2026`, 370, footerY);

  // ==========================================================================
  // G. EXPORT DOWNLOADING
  // ==========================================================================
  try {
    const dataUrl = canvas.toDataURL("image/png");
    
    // Create browser clicking link
    const downloadLink = document.createElement('a');
    downloadLink.download = `japafan-${state.user.username.toLowerCase()}-${theme}-badge.png`;
    downloadLink.href = dataUrl;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    console.log("Canvas PNG Badge successfully generated for theme:", theme);
    return true;
  } catch (error) {
    console.error("Canvas export failed:", error);
    return false;
  }
}

// Bind load trigger inside browser context
window.downloadBadgeImage = downloadBadgeImage;
