// Defaults institucionais para os formulários de cadastro de instalação CIUCA.
// São valores reais editáveis, não apenas exemplos/placeholder.
(function(){
  const DEFAULTS = {
    inst: 'Universidade Federal do Paraná — Setor Palotina',
    cnpj: '75.095.679/0001-49',
    addr: 'Rua Pioneiro, 2153, CEP: 85953-128',
    city: 'Palotina / PR',
    ceua: 'CEUA Palotina – UFPR'
  };

  function applyInstitutionalDefaults(){
    Object.entries(DEFAULTS).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el && !String(el.value || '').trim()) {
        el.value = value;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(applyInstitutionalDefaults, 0));
  } else {
    setTimeout(applyInstitutionalDefaults, 0);
  }
})();
