// Ajoute html2pdf.js via CDN si besoin
// Ce script gère le bouton Télécharger PDF pour le CV

function setupDownloadPDFButton() {
    var btn = document.getElementById('cv-download-pdf');
    if (!btn) return;
    btn.addEventListener('click', function () {
        var element = document.querySelector('.cv-document');
        if (!element) return;
        // Options pour html2pdf
        var opt = {
            margin:       0,
            filename:     'cv.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save();
    });
}

document.addEventListener('DOMContentLoaded', setupDownloadPDFButton);