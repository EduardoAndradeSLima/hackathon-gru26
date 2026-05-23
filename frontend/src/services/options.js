export const regioes = [
  'Centro',
  'Norte',
  'Sul',
  'Leste',
  'Oeste',
  'Municipal'
].map((value) => ({ value, label: value }));

export const tiposServico = [
  'Acolhimento adulto',
  'ILPI',
  'Acolhimento infantil',
  'Violencia domestica',
  'Centro Dia',
  'Acompanhamento socioassistencial'
].map((value) => ({ value, label: value }));

export const urgencias = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Critica' }
];

export const statusVaga = [
  { value: 'disponivel', label: 'Disponivel' },
  { value: 'ocupada', label: 'Ocupada' },
  { value: 'reservada', label: 'Reservada' },
  { value: 'bloqueada', label: 'Bloqueada' }
];

export const statusSolicitacao = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_analise', label: 'Em analise' },
  { value: 'encaminhada', label: 'Encaminhada' },
  { value: 'concluida', label: 'Concluida' },
  { value: 'cancelada', label: 'Cancelada' }
];

export const grausDependencia = [
  { value: 'nao_aplicavel', label: 'Nao aplicavel' },
  { value: 'baixo', label: 'Baixo' },
  { value: 'grau_1', label: 'Grau 1' },
  { value: 'grau_2', label: 'Grau 2' },
  { value: 'grau_3', label: 'Grau 3' }
];
