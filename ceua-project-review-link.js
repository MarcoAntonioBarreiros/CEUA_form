(function () {
  'use strict';

  function installProjectReviewLink() {
    if (document.getElementById('ceua-project-review-link')) return;

    var header = document.querySelector('header.card') || document.querySelector('header');
    if (!header) return;

    var badges = Array.prototype.slice.call(header.querySelectorAll('span'));
    var versionBadge = badges.find(function (element) {
      return /Versão\s*2\.0|RN\s*53\/2021/i.test(String(element.textContent || ''));
    });
    if (!versionBadge) return;

    var actions = document.createElement('div');
    actions.className = 'flex flex-col md:flex-row items-center gap-2 flex-shrink-0';

    versionBadge.parentNode.insertBefore(actions, versionBadge);
    actions.appendChild(versionBadge);

    var link = document.createElement('a');
    link.id = 'ceua-project-review-link';
    link.href = 'https://script.google.com/macros/s/AKfycbwYg6qS24helcTYBqHCzVz5l5jXJy_diA-X_dSz605mGvrHCoC9srCQ27swRMug6HBM/exec';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'text-[.6rem] font-bold bg-white text-tl-700 px-3 py-1 rounded-full border border-tl-200 hover:bg-tl-50 transition-colors whitespace-nowrap';
    link.textContent = 'Emissão de pareceres';
    link.setAttribute('aria-label', 'Abrir sistema integrado de emissão de pareceres de projetos da CEUA');

    actions.appendChild(link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installProjectReviewLink);
  } else {
    installProjectReviewLink();
  }
})();
