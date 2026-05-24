const bairroRegionMap = {
  centro: 'Centro',
  macedo: 'Centro',
  gopouva: 'Centro',
  itapegica: 'Centro',
  vila_augusta: 'Centro',
  ponte_grande: 'Centro',
  maia: 'Centro',
  vila_galvao: 'Norte',
  vila_rosalia: 'Norte',
  cabucu: 'Norte',
  taboao: 'Norte',
  parque_cecap: 'Norte',
  sao_joao: 'Leste',
  pimentas: 'Leste',
  cumbica: 'Leste',
  jardim_cumbica: 'Leste',
  bonsucesso: 'Leste',
  agua_chata: 'Leste',
  presidente_dutra: 'Leste',
  cidade_soberana: 'Leste',
  cocaia: 'Sul',
  lavras: 'Sul',
  recreio_sao_jorge: 'Sul',
  outro: 'Municipal'
};

function normalizeBairro(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function inferRegionFromBairro(bairro) {
  return bairroRegionMap[normalizeBairro(bairro)] || 'Municipal';
}

function getIlpiReferenceUnit(region) {
  const regiao = region || 'Municipal';
  return regiao === 'Municipal'
    ? 'Central de Vagas - ILPI'
    : `Equipe tecnica ILPI - Regiao ${regiao}`;
}

module.exports = { inferRegionFromBairro, getIlpiReferenceUnit };
