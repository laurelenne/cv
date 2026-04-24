// Génère et télécharge le PDF du CV à partir de la page courante
// Nécessite html2pdf.js chargé dans la page




window.downloadCVasPDF = function() {
  // Crée l'overlay de chargement
  let overlay = document.createElement('div');
  overlay.id = 'pdf-export-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(6,14,26,0.96)';
  overlay.style.color = '#fff';
  overlay.style.zIndex = 9999;
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.fontSize = '1.3rem';
  overlay.style.fontFamily = 'Space Grotesk, Lato, Arial, sans-serif';
  overlay.innerHTML = '<div style="text-align:center"><div style="margin-bottom:0.7em"><svg width="48" height="48" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.4 31.4" transform="rotate(-90 25 25)"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/></circle></svg></div>Préparation du PDF…</div>';
  document.body.appendChild(overlay);
  const element = document.querySelector('.cv-page-bg');
  if (!element) return;

  // Crée un conteneur invisible pour le clone
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.width = element.offsetWidth + 'px';
  wrapper.style.zIndex = '-1';
  document.body.appendChild(wrapper);

  // Clone le contenu à exporter
  const clone = element.cloneNode(true);
  wrapper.appendChild(clone);

  // Ajoute la classe pdf-export sur le body global (pour éviter le gros blanc)
  document.body.classList.add('pdf-export');

  // Ajoute le CSS export dans <head> si besoin
  let style = document.getElementById('cv-pdf-export-style');
  let styleAdded = false;
  if (!style) {
    style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'src/styles/pages/cv-pdf-export.css';
    style.id = 'cv-pdf-export-style';
    document.head.appendChild(style);
    styleAdded = true;
    style.onload = proceed;
  } else {
    proceed();
  }
  function proceed() {
    setTimeout(() => {
      const opt = {
        margin:       0,
        filename:     'CV-Laurelenne-Poussin.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };
      html2pdf().set(opt).from(clone).save().then(() => {
        document.body.classList.remove('pdf-export');
        wrapper.remove();
        if (styleAdded) style.remove();
        // Retire l'overlay de chargement
        if (overlay) overlay.remove();
      });
    }, 50);
  }
};
