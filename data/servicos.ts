export interface Servico {
  id: string;
  tipo: 'veterinario' | 'parque' | 'hotel' | 'petsitter' | 'creche' | 'petdriver' | 'petshop';
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  avaliacao: number;
  preco?: string;
  telefone?: string;
  horario?: string;
  servicos?: string[];
  disponivel?: boolean;
  favorito?: boolean;
  instagram?: string;
  website?: string;
  destaque?: boolean;
  plantao24h?: boolean;
  premium?: boolean;
  lat?: number;
  lng?: number;
}

export interface Cidade {
  nome: string;
  uf: string;
  regiao: string;
  lat: number;
  lng: number;
}

export const cidades: Cidade[] = [
  // ===== REGIÃO NORTE =====
  { nome: 'Manaus', uf: 'AM', regiao: 'Norte', lat: -3.119, lng: -60.022 },
  { nome: 'Belém', uf: 'PA', regiao: 'Norte', lat: -1.455, lng: -48.502 },
  { nome: 'Ananindeua', uf: 'PA', regiao: 'Norte', lat: -1.365, lng: -48.394 },
  { nome: 'Santarém', uf: 'PA', regiao: 'Norte', lat: -2.502, lng: -54.708 },
  { nome: 'Boa Vista', uf: 'RR', regiao: 'Norte', lat: 2.819, lng: -60.671 },
  { nome: 'Macapá', uf: 'AP', regiao: 'Norte', lat: 0.034, lng: -51.069 },
  { nome: 'Palmas', uf: 'TO', regiao: 'Norte', lat: -10.168, lng: -48.331 },
  { nome: 'Porto Velho', uf: 'RO', regiao: 'Norte', lat: -8.761, lng: -63.900 },
  { nome: 'Rio Branco', uf: 'AC', regiao: 'Norte', lat: -9.975, lng: -67.810 },

  // ===== REGIÃO NORDESTE =====
  { nome: 'São Luís', uf: 'MA', regiao: 'Nordeste', lat: -2.529, lng: -44.282 },
  { nome: 'Timon', uf: 'MA', regiao: 'Nordeste', lat: -5.094, lng: -42.836 },
  { nome: 'Teresina', uf: 'PI', regiao: 'Nordeste', lat: -5.089, lng: -42.801 },
  { nome: 'Fortaleza', uf: 'CE', regiao: 'Nordeste', lat: -3.717, lng: -38.543 },
  { nome: 'Juazeiro do Norte', uf: 'CE', regiao: 'Nordeste', lat: -7.213, lng: -39.315 },
  { nome: 'Sobral', uf: 'CE', regiao: 'Nordeste', lat: -3.688, lng: -40.348 },
  { nome: 'Natal', uf: 'RN', regiao: 'Nordeste', lat: -5.794, lng: -35.211 },
  { nome: 'Mossoró', uf: 'RN', regiao: 'Nordeste', lat: -5.187, lng: -37.344 },
  { nome: 'João Pessoa', uf: 'PB', regiao: 'Nordeste', lat: -7.119, lng: -34.845 },
  { nome: 'Campina Grande', uf: 'PB', regiao: 'Nordeste', lat: -7.230, lng: -35.881 },
  { nome: 'Recife', uf: 'PE', regiao: 'Nordeste', lat: -8.047, lng: -34.877 },
  { nome: 'Olinda', uf: 'PE', regiao: 'Nordeste', lat: -7.999, lng: -34.855 },
  { nome: 'Caruaru', uf: 'PE', regiao: 'Nordeste', lat: -8.283, lng: -35.972 },
  { nome: 'Petrolina', uf: 'PE', regiao: 'Nordeste', lat: -9.389, lng: -40.502 },
  { nome: 'Maceió', uf: 'AL', regiao: 'Nordeste', lat: -9.665, lng: -35.735 },
  { nome: 'Arapiraca', uf: 'AL', regiao: 'Nordeste', lat: -9.754, lng: -36.663 },
  { nome: 'Aracaju', uf: 'SE', regiao: 'Nordeste', lat: -10.909, lng: -37.067 },
  { nome: 'Nossa Senhora do Socorro', uf: 'SE', regiao: 'Nordeste', lat: -10.856, lng: -37.125 },
  { nome: 'Salvador', uf: 'BA', regiao: 'Nordeste', lat: -12.971, lng: -38.512 },
  { nome: 'Feira de Santana', uf: 'BA', regiao: 'Nordeste', lat: -12.266, lng: -38.966 },
  { nome: 'Vitória da Conquista', uf: 'BA', regiao: 'Nordeste', lat: -14.861, lng: -40.844 },
  { nome: 'Camaçari', uf: 'BA', regiao: 'Nordeste', lat: -12.696, lng: -38.324 },

  // ===== REGIÃO CENTRO-OESTE =====
  { nome: 'Brasília', uf: 'DF', regiao: 'Centro-Oeste', lat: -15.797, lng: -47.892 },
  { nome: 'Taguatinga', uf: 'DF', regiao: 'Centro-Oeste', lat: -15.817, lng: -48.061 },
  { nome: 'Ceilândia', uf: 'DF', regiao: 'Centro-Oeste', lat: -15.814, lng: -48.112 },
  { nome: 'Goiânia', uf: 'GO', regiao: 'Centro-Oeste', lat: -16.686, lng: -49.264 },
  { nome: 'Aparecida de Goiânia', uf: 'GO', regiao: 'Centro-Oeste', lat: -16.817, lng: -49.244 },
  { nome: 'Anápolis', uf: 'GO', regiao: 'Centro-Oeste', lat: -16.326, lng: -48.952 },
  { nome: 'Rio Verde', uf: 'GO', regiao: 'Centro-Oeste', lat: -17.739, lng: -50.925 },
  { nome: 'Cuiabá', uf: 'MT', regiao: 'Centro-Oeste', lat: -15.601, lng: -56.097 },
  { nome: 'Várzea Grande', uf: 'MT', regiao: 'Centro-Oeste', lat: -15.646, lng: -56.132 },
  { nome: 'Rondonópolis', uf: 'MT', regiao: 'Centro-Oeste', lat: -16.467, lng: -54.637 },
  { nome: 'Sinop', uf: 'MT', regiao: 'Centro-Oeste', lat: -12.233, lng: -55.725 },
  { nome: 'Campo Grande', uf: 'MS', regiao: 'Centro-Oeste', lat: -20.469, lng: -54.620 },
  { nome: 'Dourados', uf: 'MS', regiao: 'Centro-Oeste', lat: -22.268, lng: -54.809 },
  { nome: 'Três Lagoas', uf: 'MS', regiao: 'Centro-Oeste', lat: -20.751, lng: -51.705 },

  // ===== REGIÃO SUDESTE =====
  { nome: 'Belo Horizonte', uf: 'MG', regiao: 'Sudeste', lat: -19.916, lng: -43.934 },
  { nome: 'Contagem', uf: 'MG', regiao: 'Sudeste', lat: -19.932, lng: -44.053 },
  { nome: 'Betim', uf: 'MG', regiao: 'Sudeste', lat: -19.968, lng: -44.198 },
  { nome: 'Uberlândia', uf: 'MG', regiao: 'Sudeste', lat: -18.918, lng: -48.277 },
  { nome: 'Juiz de Fora', uf: 'MG', regiao: 'Sudeste', lat: -21.761, lng: -43.352 },
  { nome: 'Montes Claros', uf: 'MG', regiao: 'Sudeste', lat: -16.735, lng: -43.861 },
  { nome: 'Governador Valadares', uf: 'MG', regiao: 'Sudeste', lat: -18.851, lng: -41.949 },
  { nome: 'Vitória', uf: 'ES', regiao: 'Sudeste', lat: -20.315, lng: -40.312 },
  { nome: 'Vila Velha', uf: 'ES', regiao: 'Sudeste', lat: -20.329, lng: -40.295 },
  { nome: 'Serra', uf: 'ES', regiao: 'Sudeste', lat: -20.063, lng: -40.313 },
  { nome: 'Cariacica', uf: 'ES', regiao: 'Sudeste', lat: -20.263, lng: -40.415 },
  { nome: 'Rio de Janeiro', uf: 'RJ', regiao: 'Sudeste', lat: -22.906, lng: -43.172 },
  { nome: 'Niterói', uf: 'RJ', regiao: 'Sudeste', lat: -22.883, lng: -43.103 },
  { nome: 'Nova Iguaçu', uf: 'RJ', regiao: 'Sudeste', lat: -22.759, lng: -43.451 },
  { nome: 'Campos dos Goytacazes', uf: 'RJ', regiao: 'Sudeste', lat: -21.760, lng: -41.330 },
  { nome: 'Búzios', uf: 'RJ', regiao: 'Sudeste', lat: -22.747, lng: -41.882 },
  { nome: 'São Paulo', uf: 'SP', regiao: 'Sudeste', lat: -23.550, lng: -46.633 },
  { nome: 'Campinas', uf: 'SP', regiao: 'Sudeste', lat: -22.909, lng: -47.062 },
  { nome: 'Santos', uf: 'SP', regiao: 'Sudeste', lat: -23.960, lng: -46.333 },
  { nome: 'São José dos Campos', uf: 'SP', regiao: 'Sudeste', lat: -23.179, lng: -45.887 },
  { nome: 'Ribeirão Preto', uf: 'SP', regiao: 'Sudeste', lat: -21.176, lng: -47.820 },
  { nome: 'Sorocaba', uf: 'SP', regiao: 'Sudeste', lat: -23.501, lng: -47.452 },
  { nome: 'São Bernardo do Campo', uf: 'SP', regiao: 'Sudeste', lat: -23.691, lng: -46.564 },
  { nome: 'Osasco', uf: 'SP', regiao: 'Sudeste', lat: -23.532, lng: -46.791 },
  { nome: 'Santo André', uf: 'SP', regiao: 'Sudeste', lat: -23.663, lng: -46.554 },
  { nome: 'Guarulhos', uf: 'SP', regiao: 'Sudeste', lat: -23.453, lng: -46.533 },

  // ===== REGIÃO SUL =====
  { nome: 'Curitiba', uf: 'PR', regiao: 'Sul', lat: -25.428, lng: -49.273 },
  { nome: 'Londrina', uf: 'PR', regiao: 'Sul', lat: -23.304, lng: -51.169 },
  { nome: 'Maringá', uf: 'PR', regiao: 'Sul', lat: -23.421, lng: -51.933 },
  { nome: 'Ponta Grossa', uf: 'PR', regiao: 'Sul', lat: -25.094, lng: -50.163 },
  { nome: 'Cascavel', uf: 'PR', regiao: 'Sul', lat: -24.955, lng: -53.455 },
  { nome: 'São José dos Pinhais', uf: 'PR', regiao: 'Sul', lat: -25.535, lng: -49.205 },
  { nome: 'Foz do Iguaçu', uf: 'PR', regiao: 'Sul', lat: -25.516, lng: -54.585 },
  { nome: 'Colombo', uf: 'PR', regiao: 'Sul', lat: -25.291, lng: -49.199 },
  { nome: 'Florianópolis', uf: 'SC', regiao: 'Sul', lat: -27.595, lng: -48.547 },
  { nome: 'Joinville', uf: 'SC', regiao: 'Sul', lat: -26.304, lng: -48.848 },
  { nome: 'Blumenau', uf: 'SC', regiao: 'Sul', lat: -26.919, lng: -49.066 },
  { nome: 'Chapecó', uf: 'SC', regiao: 'Sul', lat: -27.100, lng: -52.615 },
  { nome: 'Itajaí', uf: 'SC', regiao: 'Sul', lat: -26.907, lng: -48.661 },
  { nome: 'Criciúma', uf: 'SC', regiao: 'Sul', lat: -28.677, lng: -49.369 },
  { nome: 'Porto Alegre', uf: 'RS', regiao: 'Sul', lat: -30.034, lng: -51.217 },
  { nome: 'Caxias do Sul', uf: 'RS', regiao: 'Sul', lat: -29.166, lng: -51.178 },
  { nome: 'Pelotas', uf: 'RS', regiao: 'Sul', lat: -31.764, lng: -52.337 },
  { nome: 'Canoas', uf: 'RS', regiao: 'Sul', lat: -29.918, lng: -51.183 },
  { nome: 'Santa Maria', uf: 'RS', regiao: 'Sul', lat: -29.684, lng: -53.806 },
  { nome: 'Gravataí', uf: 'RS', regiao: 'Sul', lat: -29.947, lng: -50.991 },
  { nome: 'Viamão', uf: 'RS', regiao: 'Sul', lat: -30.081, lng: -51.023 },
  { nome: 'Novo Hamburgo', uf: 'RS', regiao: 'Sul', lat: -29.678, lng: -51.130 },
  { nome: 'São Leopoldo', uf: 'RS', regiao: 'Sul', lat: -29.760, lng: -51.147 },
  { nome: 'Rio Grande', uf: 'RS', regiao: 'Sul', lat: -32.035, lng: -52.098 },
];

// Função auxiliar para criar serviços mock
function criarServicosBase(cidade: string, uf: string, latBase: number, lngBase: number): Servico[] {
  const variacao = () => (Math.random() - 0.5) * 0.02;
  const id = `${cidade.toLowerCase().replace(/\s+/g, '')}`;
  
  return [
    {
      id: `${id}-vet1`, tipo: 'veterinario', nome: `VetCare ${cidade}`,
      endereco: `Av. Principal, 1000`, bairro: 'Centro', cidade,
      avaliacao: 4.8, telefone: `(0${Math.floor(Math.random() * 90) + 10}) 3${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
      servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
      lat: latBase + variacao(), lng: lngBase + variacao(),
    },
    {
      id: `${id}-pet1`, tipo: 'petshop', nome: `Patinha ${cidade}`,
      endereco: `Rua das Flores, 500`, bairro: 'Jardim Central', cidade,
      avaliacao: 4.7, telefone: `(0${Math.floor(Math.random() * 90) + 10}) 3${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
      servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
      lat: latBase + variacao(), lng: lngBase + variacao(),
    },
    {
      id: `${id}-parq1`, tipo: 'parque', nome: `Parque Municipal ${cidade}`,
      endereco: `Av. Verde, 200`, bairro: 'Zona Verde', cidade,
      avaliacao: 4.6, horario: 'Diário 6h-18h',
      servicos: ['Área Verde', 'Trilhas', 'Espaço para Passeio'], disponivel: true,
      lat: latBase + variacao(), lng: lngBase + variacao(),
    },
  ];
}

function criarServicosCompletos(cidade: string, uf: string, latBase: number, lngBase: number, ehCapital: boolean = false): Servico[] {
  const variacao = () => (Math.random() - 0.5) * 0.02;
  const id = `${cidade.toLowerCase().replace(/\s+/g, '')}`;
  const ddd = obterDDD(uf);
  const tel = () => `(${ddd}) 3${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;

  const servicos: Servico[] = [
    {
      id: `${id}-vet1`, tipo: 'veterinario', nome: `VetCare ${cidade}`,
      endereco: `Av. Principal, 1000`, bairro: 'Centro', cidade,
      avaliacao: 4.8, telefone: tel(),
      horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
      servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
      lat: latBase + variacao(), lng: lngBase + variacao(),
    },
    {
      id: `${id}-pet1`, tipo: 'petshop', nome: `Patinha ${cidade}`,
      endereco: `Rua das Flores, 500`, bairro: 'Jardim Central', cidade,
      avaliacao: 4.7, telefone: tel(),
      horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
      servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
      lat: latBase + variacao(), lng: lngBase + variacao(),
    },
    {
      id: `${id}-parq1`, tipo: 'parque', nome: `Parque Municipal ${cidade}`,
      endereco: `Av. Verde, 200`, bairro: 'Zona Verde', cidade,
      avaliacao: 4.6, horario: 'Diário 6h-18h',
      servicos: ['Área Verde', 'Trilhas', 'Espaço para Passeio'], disponivel: true,
      lat: latBase + variacao(), lng: lngBase + variacao(),
    },
  ];

  if (ehCapital) {
    servicos.push(
      {
        id: `${id}-vet2`, tipo: 'veterinario', nome: `Hospital Veterinário ${cidade}`,
        endereco: `Av. da Saúde, 800`, bairro: 'Vila Nova', cidade,
        avaliacao: 4.9, telefone: tel(), horario: 'Plantão 24 horas',
        servicos: ['Emergência', 'Internamento', 'UTI', 'Cirurgias'], disponivel: true, plantao24h: true,
        lat: latBase + variacao(), lng: lngBase + variacao(),
      },
      {
        id: `${id}-creche1`, tipo: 'creche', nome: `PetSkill Escola Canina`,
        endereco: `Rua do Sol, 300`, bairro: 'Jardim América', cidade,
        avaliacao: 4.8, telefone: tel(), horario: 'Seg-Sex 7h-19h',
        servicos: ['Creche', 'Educação Canina', 'Banho', 'Hotel'], disponivel: true,
        lat: latBase + variacao(), lng: lngBase + variacao(),
      },
      {
        id: `${id}-parq2`, tipo: 'parque', nome: `Pet Park ${cidade}`,
        endereco: `Av. Natureza, 1500`, bairro: 'Zona Leste', cidade,
        avaliacao: 4.7, horario: 'Seg-Sáb 8h-20h',
        servicos: ['Área para Cães', 'Obstáculos', 'Bebedouros'], disponivel: true,
        lat: latBase + variacao(), lng: lngBase + variacao(),
      }
    );
  }

  return servicos;
}

function obterDDD(uf: string): string {
  const ddds: Record<string, string> = {
    AC: '68', AM: '92', AP: '96', PA: '91', RO: '69', RR: '95', TO: '63',
    AL: '82', BA: '71', CE: '85', MA: '98', PB: '83', PE: '81', PI: '86', RN: '84', SE: '79',
    DF: '61', GO: '62', MS: '67', MT: '65',
    ES: '27', MG: '31', RJ: '21', SP: '11',
    PR: '41', RS: '51', SC: '48',
  };
  return ddds[uf] || '11';
}

// ===== DADOS COMPLETOS POR CIDADE =====
// Capitais e grandes cidades com serviços mais detalhados

const servicosManaus: Servico[] = [
  {
    id: 'mao-vet1', tipo: 'veterinario', nome: 'VetCare Manaus', endereco: 'Av. Eduardo Ribeiro, 600', bairro: 'Centro', cidade: 'Manaus',
    avaliacao: 4.8, telefone: '(92) 3633-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -3.119, lng: -60.022,
  },
  {
    id: 'mao-pet1', tipo: 'petshop', nome: 'Patinha Manaus', endereco: 'Rua Ramos Ferreira, 1000', bairro: 'Centro', cidade: 'Manaus',
    avaliacao: 4.7, telefone: '(92) 3633-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -3.120, lng: -60.025,
  },
  {
    id: 'mao-parq1', tipo: 'parque', nome: 'Parque do Rio Negro', endereco: 'Cuiabá, 265', bairro: 'Centro', cidade: 'Manaus',
    avaliacao: 4.6, horario: 'Diário 6h-18h', servicos: ['Área Verde', 'Trilhas', 'Espaço para Passeio'], disponivel: true,
    lat: -3.115, lng: -60.028,
  },
  {
    id: 'mao-vet2', tipo: 'veterinario', nome: 'Hospital Vet Amazonas', endereco: 'Av. Constantino Nery, 1500', bairro: 'Ponta Negra', cidade: 'Manaus',
    avaliacao: 4.9, telefone: '(92) 3644-9999', horario: 'Plantão 24 horas',
    servicos: ['Emergência', 'Internamento', 'UTI', 'Cirurgias'], disponivel: true, plantao24h: true,
    lat: -3.098, lng: -60.035,
  },
];

const servicosBelem: Servico[] = [
  {
    id: 'bel-vet1', tipo: 'veterinario', nome: 'VetCare Belém', endereco: 'Av. Presidente Vargas, 800', bairro: 'Centro', cidade: 'Belém',
    avaliacao: 4.8, telefone: '(91) 3212-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -1.455, lng: -48.502,
  },
  {
    id: 'bel-pet1', tipo: 'petshop', nome: 'Patinha Belém', endereco: 'Rua do Porto, 500', bairro: 'Cidade Velha', cidade: 'Belém',
    avaliacao: 4.7, telefone: '(91) 3212-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -1.458, lng: -48.505,
  },
  {
    id: 'bel-parq1', tipo: 'parque', nome: 'Parque do Pascoal', endereco: 'Av. Nazaré, 1000', bairro: 'Nazaré', cidade: 'Belém',
    avaliacao: 4.6, horario: 'Diário 6h-18h', servicos: ['Área Verde', 'Trilhas', 'Espaço para Passeio'], disponivel: true,
    lat: -1.448, lng: -48.498,
  },
];

const servicosSaoLuis: Servico[] = [
  {
    id: 'slz-vet1', tipo: 'veterinario', nome: 'VetCare São Luís', endereco: 'Av. da Liberdade, 500', bairro: 'Centro', cidade: 'São Luís',
    avaliacao: 4.8, telefone: '(98) 3123-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -2.529, lng: -44.282,
  },
  {
    id: 'slz-pet1', tipo: 'petshop', nome: 'Patinha São Luís', endereco: 'Rua do Sol, 300', bairro: 'Praia Grande', cidade: 'São Luís',
    avaliacao: 4.7, telefone: '(98) 3123-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -2.532, lng: -44.285,
  },
];

const servicosTeresina: Servico[] = [
  {
    id: 'ter-vet1', tipo: 'veterinario', nome: 'VetCare Teresina', endereco: 'Av. Frei Serafim, 800', bairro: 'Centro', cidade: 'Teresina',
    avaliacao: 4.8, telefone: '(86) 3216-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -5.089, lng: -42.801,
  },
  {
    id: 'ter-pet1', tipo: 'petshop', nome: 'Patinha Teresina', endereco: 'Rua da Cruz, 500', bairro: 'Centro', cidade: 'Teresina',
    avaliacao: 4.7, telefone: '(86) 3216-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -5.092, lng: -42.804,
  },
];

const servicosFortaleza: Servico[] = [
  {
    id: 'for-vet1', tipo: 'veterinario', nome: 'VetCare Fortaleza', endereco: 'Av. Beira Mar, 1000', bairro: 'Meireles', cidade: 'Fortaleza',
    avaliacao: 4.8, telefone: '(85) 3219-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -3.717, lng: -38.543,
  },
  {
    id: 'for-pet1', tipo: 'petshop', nome: 'Patinha Fortaleza', endereco: 'Rua Barão de Aracati, 500', bairro: 'Aldeota', cidade: 'Fortaleza',
    avaliacao: 4.7, telefone: '(85) 3219-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -3.720, lng: -38.546,
  },
  {
    id: 'for-parq1', tipo: 'parque', nome: 'Parque do Cocó', endereco: 'Av. Eng. Alberto Sá, 1500', bairro: 'Aldeota', cidade: 'Fortaleza',
    avaliacao: 4.7, horario: 'Diário 5h-22h', servicos: ['Área Verde', 'Trilhas', 'Pista de Caminhada'], disponivel: true,
    lat: -3.735, lng: -38.520,
  },
];

const servicosNatal: Servico[] = [
  {
    id: 'nat-vet1', tipo: 'veterinario', nome: 'VetCare Natal', endereco: 'Av. Salgado Filho, 800', bairro: 'Centro', cidade: 'Natal',
    avaliacao: 4.8, telefone: '(84) 3217-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -5.794, lng: -35.211,
  },
  {
    id: 'nat-pet1', tipo: 'petshop', nome: 'Patinha Natal', endereco: 'Rua Chile, 500', bairro: 'Centro', cidade: 'Natal',
    avaliacao: 4.7, telefone: '(84) 3217-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -5.797, lng: -35.214,
  },
];

const servicosJoaoPessoa: Servico[] = [
  {
    id: 'jp-vet1', tipo: 'veterinario', nome: 'VetCare João Pessoa', endereco: 'Av. Epitácio Pessoa, 1000', bairro: 'Centro', cidade: 'João Pessoa',
    avaliacao: 4.8, telefone: '(83) 3218-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -7.119, lng: -34.845,
  },
  {
    id: 'jp-pet1', tipo: 'petshop', nome: 'Patinha João Pessoa', endereco: 'Rua Maciel Pinheiro, 500', bairro: 'Centro', cidade: 'João Pessoa',
    avaliacao: 4.7, telefone: '(83) 3218-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -7.122, lng: -34.848,
  },
];

const servicosRecife: Servico[] = [
  {
    id: 'rec-vet1', tipo: 'veterinario', nome: 'VetCare Recife', endereco: 'Av. Boa Viagem, 1000', bairro: 'Boa Viagem', cidade: 'Recife',
    avaliacao: 4.8, telefone: '(81) 3212-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -8.047, lng: -34.877,
  },
  {
    id: 'rec-pet1', tipo: 'petshop', nome: 'Patinha Recife', endereco: 'Rua da Aurora, 500', bairro: 'Boa Vista', cidade: 'Recife',
    avaliacao: 4.7, telefone: '(81) 3212-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -8.050, lng: -34.880,
  },
  {
    id: 'rec-vet2', tipo: 'veterinario', nome: 'Hospital Vet Pernambuco', endereco: 'Rua Sete de Setembro, 800', bairro: 'Centro', cidade: 'Recife',
    avaliacao: 4.9, telefone: '(81) 3423-9999', horario: 'Plantão 24 horas',
    servicos: ['Emergência', 'Internamento', 'UTI', 'Cirurgias'], disponivel: true, plantao24h: true,
    lat: -8.043, lng: -34.873,
  },
];

const servicosMaceio: Servico[] = [
  {
    id: 'mac-vet1', tipo: 'veterinario', nome: 'VetCare Maceió', endereco: 'Av. Fernão Lima, 800', bairro: 'Centro', cidade: 'Maceió',
    avaliacao: 4.8, telefone: '(82) 3214-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -9.665, lng: -35.735,
  },
  {
    id: 'mac-pet1', tipo: 'petshop', nome: 'Patinha Maceió', endereco: 'Rua Marechal Deodoro, 500', bairro: 'Centro', cidade: 'Maceió',
    avaliacao: 4.7, telefone: '(82) 3214-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -9.668, lng: -35.738,
  },
];

const servicosAracaju: Servico[] = [
  {
    id: 'ara-vet1', tipo: 'veterinario', nome: 'VetCare Aracaju', endereco: 'Av. Augusto Franco, 800', bairro: 'Atalaia', cidade: 'Aracaju',
    avaliacao: 4.8, telefone: '(79) 3217-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -10.909, lng: -37.067,
  },
  {
    id: 'ara-pet1', tipo: 'petshop', nome: 'Patinha Aracaju', endereco: 'Rua Orzes Motta, 500', bairro: 'Centro', cidade: 'Aracaju',
    avaliacao: 4.7, telefone: '(79) 3217-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -10.912, lng: -37.070,
  },
];

const servicosSalvador: Servico[] = [
  {
    id: 'sal-vet1', tipo: 'veterinario', nome: 'VetCare Salvador', endereco: 'Av. ACM, 1000', bairro: 'Imbuí', cidade: 'Salvador',
    avaliacao: 4.8, telefone: '(71) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -12.971, lng: -38.512,
  },
  {
    id: 'sal-pet1', tipo: 'petshop', nome: 'Patinha Salvador', endereco: 'Rua Chile, 500', bairro: 'Centro', cidade: 'Salvador',
    avaliacao: 4.7, telefone: '(71) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -12.974, lng: -38.515,
  },
  {
    id: 'sal-parq1', tipo: 'parque', nome: 'Parque da Cidade', endereco: 'Av. Vasco da Gama, 2000', bairro: 'Brotas', cidade: 'Salvador',
    avaliacao: 4.6, horario: 'Diário 6h-18h', servicos: ['Área Verde', 'Trilhas', 'Espaço para Passeio'], disponivel: true,
    lat: -12.965, lng: -38.505,
  },
  {
    id: 'sal-vet2', tipo: 'veterinario', nome: 'Hospital Vet Bahia', endereco: 'Av. Cardeal da Silva, 800', bairro: 'Barra', cidade: 'Salvador',
    avaliacao: 4.9, telefone: '(71) 3316-9999', horario: 'Plantão 24 horas',
    servicos: ['Emergência', 'Internamento', 'UTI', 'Cirurgias'], disponivel: true, plantao24h: true,
    lat: -12.968, lng: -38.518,
  },
];

const servicosBrasilia: Servico[] = [
  {
    id: 'bsb-vet1', tipo: 'veterinario', nome: 'VetCare Brasília', endereco: 'SGAS Quadra 607, 1000', bairro: 'Asa Sul', cidade: 'Brasília',
    avaliacao: 4.8, telefone: '(61) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -15.797, lng: -47.892,
  },
  {
    id: 'bsb-pet1', tipo: 'petshop', nome: 'Patinha Brasília', endereco: 'SCLS Quadra 308, 500', bairro: 'Asa Sul', cidade: 'Brasília',
    avaliacao: 4.7, telefone: '(61) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -15.800, lng: -47.895,
  },
  {
    id: 'bsb-parq1', tipo: 'parque', nome: 'Parque da Cidade Sarah', endereco: 'SCES Trecho 2, 2000', bairro: 'Asa Sul', cidade: 'Brasília',
    avaliacao: 4.7, horario: 'Diário 6h-18h', servicos: ['Área Verde', 'Trilhas', 'Pista de Caminhada'], disponivel: true,
    lat: -15.805, lng: -47.880,
  },
  {
    id: 'bsb-vet2', tipo: 'veterinario', nome: 'Hospital Vet Brasília', endereco: 'SQN 308, Bloco A, 800', bairro: 'Asa Norte', cidade: 'Brasília',
    avaliacao: 4.9, telefone: '(61) 3316-9999', horario: 'Plantão 24 horas',
    servicos: ['Emergência', 'Internamento', 'UTI', 'Cirurgias'], disponivel: true, plantao24h: true,
    lat: -15.790, lng: -47.898,
  },
];

const servicosGoiania: Servico[] = [
  {
    id: 'goi-vet1', tipo: 'veterinario', nome: 'VetCare Goiânia', endereco: 'Av. Goiás, 1000', bairro: 'Centro', cidade: 'Goiânia',
    avaliacao: 4.8, telefone: '(62) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -16.686, lng: -49.264,
  },
  {
    id: 'goi-pet1', tipo: 'petshop', nome: 'Patinha Goiânia', endereco: 'Rua T-30, 500', bairro: 'Bueno', cidade: 'Goiânia',
    avaliacao: 4.7, telefone: '(62) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -16.689, lng: -49.267,
  },
];

const servicosCuiaba: Servico[] = [
  {
    id: 'cui-vet1', tipo: 'veterinario', nome: 'VetCare Cuiabá', endereco: 'Av. Getúlio Vargas, 800', bairro: 'Centro', cidade: 'Cuiabá',
    avaliacao: 4.8, telefone: '(65) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -15.601, lng: -56.097,
  },
  {
    id: 'cui-pet1', tipo: 'petshop', nome: 'Patinha Cuiabá', endereco: 'Rua da Paz, 500', bairro: 'Centro', cidade: 'Cuiabá',
    avaliacao: 4.7, telefone: '(65) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -15.604, lng: -56.100,
  },
];

const servicosCampoGrande: Servico[] = [
  {
    id: 'cg-vet1', tipo: 'veterinario', nome: 'VetCare Campo Grande', endereco: 'Av. Mato Grosso, 800', bairro: 'Centro', cidade: 'Campo Grande',
    avaliacao: 4.8, telefone: '(67) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -20.469, lng: -54.620,
  },
  {
    id: 'cg-pet1', tipo: 'petshop', nome: 'Patinha Campo Grande', endereco: 'Rua Bahia, 500', bairro: 'Centro', cidade: 'Campo Grande',
    avaliacao: 4.7, telefone: '(67) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -20.472, lng: -54.623,
  },
];

const servicosBeloHorizonte: Servico[] = [
  {
    id: 'bh-vet1', tipo: 'veterinario', nome: 'VetCare Belo Horizonte', endereco: 'Av. Afonso Pena, 1000', bairro: 'Centro', cidade: 'Belo Horizonte',
    avaliacao: 4.8, telefone: '(31) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -19.916, lng: -43.934,
  },
  {
    id: 'bh-pet1', tipo: 'petshop', nome: 'Patinha Belo Horizonte', endereco: 'Rua Curitiba, 500', bairro: 'Centro', cidade: 'Belo Horizonte',
    avaliacao: 4.7, telefone: '(31) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -19.919, lng: -43.937,
  },
  {
    id: 'bh-parq1', tipo: 'parque', nome: 'Parque Municipal Américo Renné Giannetti', endereco: 'Av. Ápio, 2000', bairro: 'Funcionários', cidade: 'Belo Horizonte',
    avaliacao: 4.7, horario: 'Diário 6h-20h', servicos: ['Área Verde', 'Trilhas', 'Lago'], disponivel: true,
    lat: -19.930, lng: -43.925,
  },
  {
    id: 'bh-vet2', tipo: 'veterinario', nome: 'Hospital Vet Minas', endereco: 'Av. Contorno, 800', bairro: 'Centro', cidade: 'Belo Horizonte',
    avaliacao: 4.9, telefone: '(31) 3316-9999', horario: 'Plantão 24 horas',
    servicos: ['Emergência', 'Internamento', 'UTI', 'Cirurgias'], disponivel: true, plantao24h: true,
    lat: -19.912, lng: -43.930,
  },
];

const servicosUberlandia: Servico[] = [
  {
    id: 'ubl-vet1', tipo: 'veterinario', nome: 'VetCare Uberlândia', endereco: 'Av. João Naves, 1000', bairro: 'Centro', cidade: 'Uberlândia',
    avaliacao: 4.8, telefone: '(34) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -18.918, lng: -48.277,
  },
  {
    id: 'ubl-pet1', tipo: 'petshop', nome: 'Patinha Uberlândia', endereco: 'Rua Bahia, 500', bairro: 'Centro', cidade: 'Uberlândia',
    avaliacao: 4.7, telefone: '(34) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -18.921, lng: -48.280,
  },
];

const servicosVitoria: Servico[] = [
  {
    id: 'vit-vet1', tipo: 'veterinario', nome: 'VetCare Vitória', endereco: 'Av. Princesa Isabel, 800', bairro: 'Centro', cidade: 'Vitória',
    avaliacao: 4.8, telefone: '(27) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -20.315, lng: -40.312,
  },
  {
    id: 'vit-pet1', tipo: 'petshop', nome: 'Patinha Vitória', endereco: 'Rua Sete de Setembro, 500', bairro: 'Centro', cidade: 'Vitória',
    avaliacao: 4.7, telefone: '(27) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -20.318, lng: -40.315,
  },
  {
    id: 'vit-parq1', tipo: 'parque', nome: 'Parque da Pedra da Cebola', endereco: 'Av. Augusto Pestana, 1500', bairro: 'Jardim Camburi', cidade: 'Vitória',
    avaliacao: 4.6, horario: 'Diário 6h-18h', servicos: ['Área Verde', 'Trilhas', 'Espaço para Passeio'], disponivel: true,
    lat: -20.305, lng: -40.305,
  },
];

const servicosRioDeJaneiro: Servico[] = [
  {
    id: 'rj-vet1', tipo: 'veterinario', nome: 'VetCare Rio de Janeiro', endereco: 'Av. Atlântica, 1000', bairro: 'Copacabana', cidade: 'Rio de Janeiro',
    avaliacao: 4.8, telefone: '(21) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -22.906, lng: -43.172,
  },
  {
    id: 'rj-pet1', tipo: 'petshop', nome: 'Patinha Rio de Janeiro', endereco: 'Rua das Laranjeiras, 500', bairro: 'Laranjeiras', cidade: 'Rio de Janeiro',
    avaliacao: 4.7, telefone: '(21) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -22.909, lng: -43.175,
  },
  {
    id: 'rj-parq1', tipo: 'parque', nome: 'Parque Lage', endereco: 'Rua Riachuelo, 2000', bairro: 'Jardim Botânico', cidade: 'Rio de Janeiro',
    avaliacao: 4.7, horario: 'Diário 8h-17h', servicos: ['Área Verde', 'Trilhas', 'Espaço para Passeio'], disponivel: true,
    lat: -22.960, lng: -43.210,
  },
  {
    id: 'rj-vet2', tipo: 'veterinario', nome: 'Hospital Vet Rio', endereco: 'Rua Voluntários da Pátria, 800', bairro: 'Botafogo', cidade: 'Rio de Janeiro',
    avaliacao: 4.9, telefone: '(21) 3316-9999', horario: 'Plantão 24 horas',
    servicos: ['Emergência', 'Internamento', 'UTI', 'Cirurgias'], disponivel: true, plantao24h: true,
    lat: -22.950, lng: -43.178,
  },
  {
    id: 'rj-parq2', tipo: 'parque', nome: 'Parque Municipal da Catacumba', endereco: 'Estrada da Gávea, 1500', bairro: 'Lagoa', cidade: 'Rio de Janeiro',
    avaliacao: 4.6, horario: 'Diário 8h-17h', servicos: ['Área para Cães', 'Trilhas', 'Bebedouros'], disponivel: true,
    lat: -22.975, lng: -43.205,
  },
];

const servicosSaoPaulo: Servico[] = [
  {
    id: 'sp-vet1', tipo: 'veterinario', nome: 'VetCare São Paulo', endereco: 'Av. Paulista, 1500', bairro: 'Bela Vista', cidade: 'São Paulo',
    avaliacao: 4.9, telefone: '(11) 3300-9900', horario: 'Plantão 24 horas',
    servicos: ['Consultas', 'Emergência', 'Cirurgias', 'Internamento'], disponivel: true, plantao24h: true,
    lat: -23.550, lng: -46.633,
  },
  {
    id: 'sp-pet1', tipo: 'petshop', nome: 'Patinha São Paulo', endereco: 'Rua Augusta, 2000', bairro: 'Consolação', cidade: 'São Paulo',
    avaliacao: 4.7, telefone: '(11) 3255-4400', horario: 'Seg-Sex 9h-21h, Sáb 9h-18h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios', 'Day Care'], disponivel: true,
    lat: -23.555, lng: -46.640,
  },
  {
    id: 'sp-parq1', tipo: 'parque', nome: 'Parque Ibirapuera', endereco: 'Av. Pedro Álvares Cabral', bairro: 'Vila Mariana', cidade: 'São Paulo',
    avaliacao: 4.8, horario: 'Diário 5h-22h', servicos: ['Área Verde', 'Trilhas', 'Pista de Caminhada', 'Espaço para Cães'], disponivel: true,
    lat: -23.587, lng: -46.657,
  },
  {
    id: 'sp-creche1', tipo: 'creche', nome: 'Cobasi Pinheiros', endereco: 'Rua dos Pinheiros, 800', bairro: 'Pinheiros', cidade: 'São Paulo',
    avaliacao: 4.7, telefone: '(11) 3095-5500', horario: 'Seg-Sex 7h-19h',
    servicos: ['Creche', 'Day Care', 'Banho', 'Tosa'], disponivel: true,
    lat: -23.565, lng: -46.680,
  },
  {
    id: 'sp-parq2', tipo: 'parque', nome: 'Parque Villa-Lobos', endereco: 'Av. Pres. Juscelino Kubitschek, 2000', bairro: 'Vila Leopoldina', cidade: 'São Paulo',
    avaliacao: 4.6, horario: 'Diário 5h-22h', servicos: ['Área para Cães', 'Obstáculos', 'Bebedouros'], disponivel: true,
    lat: -23.525, lng: -46.720,
  },
];

const servicosCampinas: Servico[] = [
  {
    id: 'cmp-vet1', tipo: 'veterinario', nome: 'VetCare Campinas', endereco: 'Av. Anchieta, 1000', bairro: 'Centro', cidade: 'Campinas',
    avaliacao: 4.8, telefone: '(19) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -22.909, lng: -47.062,
  },
  {
    id: 'cmp-pet1', tipo: 'petshop', nome: 'Patinha Campinas', endereco: 'Rua Barão de Jaguara, 500', bairro: 'Centro', cidade: 'Campinas',
    avaliacao: 4.7, telefone: '(19) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -22.912, lng: -47.065,
  },
  {
    id: 'cmp-parq1', tipo: 'parque', nome: 'Parque Taquaral', endereco: 'Av. Heitor Penteado, 1500', bairro: 'Centro', cidade: 'Campinas',
    avaliacao: 4.6, horario: 'Diário 6h-20h', servicos: ['Área Verde', 'Lago', 'Trilhas'], disponivel: true,
    lat: -22.900, lng: -47.055,
  },
];

const servicosSantos: Servico[] = [
  {
    id: 'stc-vet1', tipo: 'veterinario', nome: 'VetCare Santos', endereco: 'Av. Ana Costa, 800', bairro: 'Gonzaga', cidade: 'Santos',
    avaliacao: 4.8, telefone: '(13) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -23.960, lng: -46.333,
  },
  {
    id: 'stc-pet1', tipo: 'petshop', nome: 'Patinha Santos', endereco: 'Rua Conselheiro Saraiva, 500', bairro: 'Centro', cidade: 'Santos',
    avaliacao: 4.7, telefone: '(13) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -23.963, lng: -46.336,
  },
];

const servicosRibeiraoPreto: Servico[] = [
  {
    id: 'rpt-vet1', tipo: 'veterinario', nome: 'VetCare Ribeirão Preto', endereco: 'Av. Brasil, 1000', bairro: 'Centro', cidade: 'Ribeirão Preto',
    avaliacao: 4.8, telefone: '(16) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -21.176, lng: -47.820,
  },
  {
    id: 'rpt-pet1', tipo: 'petshop', nome: 'Patinha Ribeirão Preto', endereco: 'Rua Visconde de Pirajá, 500', bairro: 'Centro', cidade: 'Ribeirão Preto',
    avaliacao: 4.7, telefone: '(16) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -21.179, lng: -47.823,
  },
];

const servicosCuritiba: Servico[] = [
  {
    id: 'cwb-vet1', tipo: 'veterinario', nome: 'VetCare Curitiba', endereco: 'Av. Marechal Deodoro, 1000', bairro: 'Centro', cidade: 'Curitiba',
    avaliacao: 4.9, telefone: '(41) 3300-5500', horario: 'Plantão 24 horas',
    servicos: ['Consultas', 'Emergência', 'Cirurgias', 'UTI'], disponivel: true, plantao24h: true,
    lat: -25.428, lng: -49.273,
  },
  {
    id: 'cwb-pet1', tipo: 'petshop', nome: 'Patinha Curitiba', endereco: 'Rua das Flores, 500', bairro: 'Batel', cidade: 'Curitiba',
    avaliacao: 4.7, telefone: '(41) 3322-8800', horario: 'Seg-Sex 9h-20h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Day Care', 'Hotel'], disponivel: true,
    lat: -25.435, lng: -49.280,
  },
  {
    id: 'cwb-parq1', tipo: 'parque', nome: 'Parque Tanguá', endereco: 'Rua Padre Agostinho Leão', bairro: 'Taboão', cidade: 'Curitiba',
    avaliacao: 4.8, horario: 'Diário 6h-20h', servicos: ['Trilhas', 'Área Verde', 'Lago', 'Mirante'], disponivel: true,
    lat: -25.380, lng: -49.250,
  },
  {
    id: 'cwb-parq2', tipo: 'parque', nome: 'Parque Barigui', endereco: 'Rua Carlos de Carvalho, 2000', bairro: 'Sto. Inácio', cidade: 'Curitiba',
    avaliacao: 4.7, horario: 'Diário 6h-20h', servicos: ['Área para Cães', 'Lago', 'Trilhas'], disponivel: true,
    lat: -25.410, lng: -49.310,
  },
];

const servicosLondrina: Servico[] = [
  {
    id: 'ldn-vet1', tipo: 'veterinario', nome: 'VetLar Clínica', endereco: 'Av. Brasil, 4500', bairro: 'Centro', cidade: 'Londrina',
    avaliacao: 4.8, telefone: '(43) 3322-1100', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Raio-X'], disponivel: true,
    lat: -23.304, lng: -51.169,
  },
  {
    id: 'ldn-pet1', tipo: 'petshop', nome: 'Cobasi Londrina', endereco: 'Av. Tarobá, 1050', bairro: 'Jardim Bandeirantes', cidade: 'Londrina',
    avaliacao: 4.6, telefone: '(43) 3338-8800', horario: 'Seg-Sex 9h-20h, Sáb 9h-18h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -23.290, lng: -51.175,
  },
  {
    id: 'ldn-parq1', tipo: 'parque', nome: 'Parque Lazaro', endereco: 'Av. Lazaro de Melo Pereira', bairro: 'Higienópolis', cidade: 'Londrina',
    avaliacao: 4.7, horario: 'Diário 6h-20h', servicos: ['Área Verde', 'Pista de Caminhada', 'Playground'], disponivel: true,
    lat: -23.280, lng: -51.180,
  },
];

const servicosMaringa: Servico[] = [
  {
    id: 'mg1', tipo: 'veterinario', nome: 'Amor Por Patas', endereco: 'Av. Paraná, 368 - Centro', bairro: 'Centro', cidade: 'Maringá',
    avaliacao: 4.9, telefone: '(44) 3305-2683', horario: 'Plantão 24 horas',
    servicos: ['Consultas', 'Exames', 'Cirurgias', 'Emergência'], disponivel: true, plantao24h: true,
    instagram: 'amorporpatasveterinaria', lat: -23.4255, lng: -51.9380,
  },
  {
    id: 'mg2', tipo: 'veterinario', nome: 'Prontodog', endereco: 'Av. São Paulo, 1654', bairro: 'Zona 02', cidade: 'Maringá',
    avaliacao: 4.7, telefone: '(44) 3262-1840', horario: 'Seg-Sex 8h-18h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias'], disponivel: true, lat: -23.4150, lng: -51.9300,
  },
  {
    id: 'mg3', tipo: 'petshop', nome: 'On Dog Pet Club', endereco: 'Av. Colombo, 5.885', bairro: 'Jardim Itália', cidade: 'Maringá',
    avaliacao: 4.8, telefone: '(44) 3038-8800', horario: 'Seg-Sex 9h-19h',
    servicos: ['Banho com Creche', 'Tosa', 'Day Care', 'Hidratação'], disponivel: true,
    instagram: 'ondogpetclub', lat: -23.4200, lng: -51.9280,
  },
  {
    id: 'mg4', tipo: 'creche', nome: 'PetSkill Escola Canina', endereco: 'R. Caramuru, 520A', bairro: 'Zona 6', cidade: 'Maringá',
    avaliacao: 4.9, telefone: '(44) 3030-1300', horario: 'Seg-Sex 7h-19h',
    servicos: ['Creche', 'Educação Canina', 'Banho', 'Hotel'], disponivel: true,
    instagram: 'petskillmga', lat: -23.4050, lng: -51.9350,
  },
  {
    id: 'mg5', tipo: 'parque', nome: 'Catuaí Pet Park', endereco: 'Av. Colombo, 9161', bairro: 'Catuaí Shopping', cidade: 'Maringá',
    avaliacao: 4.8, horario: 'Seg-Sáb 10h-22h',
    servicos: ['Área para Cães', 'Obstáculos', 'Bebedouros'], disponivel: true,
    lat: -23.4080, lng: -51.9550,
  },
  {
    id: 'mg6', tipo: 'parque', nome: 'Parque Municipal do Ingá', endereco: 'Av. Duarte da Silveira, 155', bairro: 'Jardim Paquita', cidade: 'Maringá',
    avaliacao: 4.7, horario: 'Diário 6h-18h',
    servicos: ['Área Verde', 'Trilhas', 'Espaço para Passeio'], disponivel: true,
    lat: -23.4120, lng: -51.9250,
  },
];

const servicosPontaGrossa: Servico[] = [
  {
    id: 'pg1', tipo: 'veterinario', nome: 'UPF Vet', endereco: 'Av. Carlos Cavalcanti, 450', bairro: 'Centro', cidade: 'Ponta Grossa',
    avaliacao: 4.8, telefone: '(42) 3220-7700', horario: 'Seg-Sex 8h-18h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -25.094, lng: -50.163,
  },
  {
    id: 'pg2', tipo: 'petshop', nome: 'Royal Pet', endereco: 'Rua Marechal Deodoro, 800', bairro: 'Centro', cidade: 'Ponta Grossa',
    avaliacao: 4.6, telefone: '(42) 3224-3300', horario: 'Seg-Sex 9h-18h',
    servicos: ['Banho', 'Tosa', 'Rações'], disponivel: true,
    lat: -25.098, lng: -50.158,
  },
];

const servicosCascavel: Servico[] = [
  {
    id: 'csc-vet1', tipo: 'veterinario', nome: 'VetTotal Cascavel', endereco: 'Av. Brasil, 3500', bairro: 'Neva', cidade: 'Cascavel',
    avaliacao: 4.7, telefone: '(45) 3225-5500', horario: 'Seg-Sex 8h-18h',
    servicos: ['Consultas', 'Vacinas', 'Exames Laboratoriais'], disponivel: true,
    lat: -24.955, lng: -53.455,
  },
  {
    id: 'csc-pet1', tipo: 'petshop', nome: 'Petz Cascavel', endereco: 'Av. Tancredo Neves, 2000', bairro: 'Centro', cidade: 'Cascavel',
    avaliacao: 4.5, telefone: '(45) 3222-3300', horario: 'Seg-Sex 9h-19h, Sáb 9h-14h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -24.960, lng: -53.460,
  },
  {
    id: 'csc-parq1', tipo: 'parque', nome: 'Parque Ecológico', endereco: 'Av. Brasil, 5500', bairro: 'São Cristóvão', cidade: 'Cascavel',
    avaliacao: 4.6, horario: 'Diário 6h-18h', servicos: ['Trilhas', 'Área Verde', 'Lago'], disponivel: true,
    lat: -24.948, lng: -53.448,
  },
];

const servicosFlorianopolis: Servico[] = [
  {
    id: 'flp-vet1', tipo: 'veterinario', nome: 'VetCare Florianópolis', endereco: 'Av. Beira-Mar Norte, 800', bairro: 'Centro', cidade: 'Florianópolis',
    avaliacao: 4.8, telefone: '(48) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -27.595, lng: -48.547,
  },
  {
    id: 'flp-pet1', tipo: 'petshop', nome: 'Patinha Florianópolis', endereco: 'Rua Esteves Júnior, 500', bairro: 'Centro', cidade: 'Florianópolis',
    avaliacao: 4.7, telefone: '(48) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -27.598, lng: -48.550,
  },
  {
    id: 'flp-parq1', tipo: 'parque', nome: 'Parque Municipal da Lagoa da Conceição', endereco: 'Av. da Lagoa, 1000', bairro: 'Lagoa da Conceição', cidade: 'Florianópolis',
    avaliacao: 4.7, horario: 'Diário 6h-20h', servicos: ['Área Verde', 'Trilhas', 'Lago'], disponivel: true,
    lat: -27.570, lng: -48.460,
  },
];

const servicosJoinville: Servico[] = [
  {
    id: 'jnv-vet1', tipo: 'veterinario', nome: 'VetCare Joinville', endereco: 'Av. Juscelino Kubitschek, 1000', bairro: 'Centro', cidade: 'Joinville',
    avaliacao: 4.8, telefone: '(47) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -26.304, lng: -48.848,
  },
  {
    id: 'jnv-pet1', tipo: 'petshop', nome: 'Patinha Joinville', endereco: 'Rua Paraná, 500', bairro: 'Centro', cidade: 'Joinville',
    avaliacao: 4.7, telefone: '(47) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -26.307, lng: -48.851,
  },
];

const servicosPortoAlegre: Servico[] = [
  {
    id: 'poa-vet1', tipo: 'veterinario', nome: 'VetCare Porto Alegre', endereco: 'Av. Borges de Medeiros, 1000', bairro: 'Centro', cidade: 'Porto Alegre',
    avaliacao: 4.8, telefone: '(51) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -30.034, lng: -51.217,
  },
  {
    id: 'poa-pet1', tipo: 'petshop', nome: 'Patinha Porto Alegre', endereco: 'Rua dos Andradas, 500', bairro: 'Centro', cidade: 'Porto Alegre',
    avaliacao: 4.7, telefone: '(51) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -30.037, lng: -51.220,
  },
  {
    id: 'poa-parq1', tipo: 'parque', nome: 'Parque da Redenção', endereco: 'Av. Botafogo, 2000', bairro: 'Moinhos de Vento', cidade: 'Porto Alegre',
    avaliacao: 4.7, horario: 'Diário 6h-22h', servicos: ['Área Verde', 'Trilhas', 'Lago'], disponivel: true,
    lat: -30.025, lng: -51.210,
  },
  {
    id: 'poa-vet2', tipo: 'veterinario', nome: 'Hospital Vet Rio Grande do Sul', endereco: 'Av. Protásio Alves, 800', bairro: 'Petrópolis', cidade: 'Porto Alegre',
    avaliacao: 4.9, telefone: '(51) 3316-9999', horario: 'Plantão 24 horas',
    servicos: ['Emergência', 'Internamento', 'UTI', 'Cirurgias'], disponivel: true, plantao24h: true,
    lat: -30.040, lng: -51.225,
  },
];

const servicosCaxiasDoSul: Servico[] = [
  {
    id: 'cxs-vet1', tipo: 'veterinario', nome: 'VetCare Caxias do Sul', endereco: 'Av. Júlio de Castilhos, 1000', bairro: 'Centro', cidade: 'Caxias do Sul',
    avaliacao: 4.8, telefone: '(54) 3316-1234', horario: 'Seg-Sex 8h-18h, Sáb 8h-12h',
    servicos: ['Consultas', 'Vacinas', 'Cirurgias', 'Exames'], disponivel: true,
    lat: -29.166, lng: -51.178,
  },
  {
    id: 'cxs-pet1', tipo: 'petshop', nome: 'Patinha Caxias do Sul', endereco: 'Rua São Pedro, 500', bairro: 'Centro', cidade: 'Caxias do Sul',
    avaliacao: 4.7, telefone: '(54) 3316-5678', horario: 'Seg-Sex 9h-19h, Sáb 9h-16h',
    servicos: ['Banho', 'Tosa', 'Rações', 'Acessórios'], disponivel: true,
    lat: -29.169, lng: -51.181,
  },
];

// ===== COMPILAR TODOS OS SERVIÇOS =====
export const servicosMock: Servico[] = [
  // Norte
  ...servicosManaus, ...servicosBelem, ...servicosSaoLuis,
  ...criarServicosBase('Boa Vista', 'RR', 2.819, -60.671),
  ...criarServicosBase('Macapá', 'AP', 0.034, -51.069),
  ...criarServicosBase('Palmas', 'TO', -10.168, -48.331),
  ...criarServicosBase('Porto Velho', 'RO', -8.761, -63.900),
  ...criarServicosBase('Rio Branco', 'AC', -9.975, -67.810),
  ...criarServicosBase('Santarém', 'PA', -2.502, -54.708),
  ...criarServicosBase('Ananindeua', 'PA', -1.365, -48.394),

  // Nordeste
  ...servicosSaoLuis, ...servicosTeresina, ...servicosFortaleza,
  ...criarServicosBase('Juazeiro do Norte', 'CE', -7.213, -39.315),
  ...criarServicosBase('Sobral', 'CE', -3.688, -40.348),
  ...servicosNatal, ...criarServicosBase('Mossoró', 'RN', -5.187, -37.344),
  ...servicosJoaoPessoa, ...criarServicosBase('Campina Grande', 'PB', -7.230, -35.881),
  ...servicosRecife,
  ...criarServicosBase('Olinda', 'PE', -7.999, -34.855),
  ...criarServicosBase('Caruaru', 'PE', -8.283, -35.972),
  ...criarServicosBase('Petrolina', 'PE', -9.389, -40.502),
  ...servicosMaceio, ...criarServicosBase('Arapiraca', 'AL', -9.754, -36.663),
  ...servicosAracaju, ...criarServicosBase('Nossa Senhora do Socorro', 'SE', -10.856, -37.125),
  ...servicosSalvador,
  ...criarServicosBase('Feira de Santana', 'BA', -12.266, -38.966),
  ...criarServicosBase('Vitória da Conquista', 'BA', -14.861, -40.844),
  ...criarServicosBase('Camaçari', 'BA', -12.696, -38.324),

  // Centro-Oeste
  ...servicosBrasilia,
  ...criarServicosBase('Taguatinga', 'DF', -15.817, -48.061),
  ...criarServicosBase('Ceilândia', 'DF', -15.814, -48.112),
  ...servicosGoiania,
  ...criarServicosBase('Aparecida de Goiânia', 'GO', -16.817, -49.244),
  ...criarServicosBase('Anápolis', 'GO', -16.326, -48.952),
  ...criarServicosBase('Rio Verde', 'GO', -17.739, -50.925),
  ...servicosCuiaba,
  ...criarServicosBase('Várzea Grande', 'MT', -15.646, -56.132),
  ...criarServicosBase('Rondonópolis', 'MT', -16.467, -54.637),
  ...criarServicosBase('Sinop', 'MT', -12.233, -55.725),
  ...servicosCampoGrande,
  ...criarServicosBase('Dourados', 'MS', -22.268, -54.809),
  ...criarServicosBase('Três Lagoas', 'MS', -20.751, -51.705),

  // Sudeste - MG
  ...servicosBeloHorizonte,
  ...criarServicosBase('Contagem', 'MG', -19.932, -44.053),
  ...criarServicosBase('Betim', 'MG', -19.968, -44.198),
  ...servicosUberlandia,
  ...criarServicosBase('Juiz de Fora', 'MG', -21.761, -43.352),
  ...criarServicosBase('Montes Claros', 'MG', -16.735, -43.861),
  ...criarServicosBase('Governador Valadares', 'MG', -18.851, -41.949),

  // Sudeste - ES
  ...servicosVitoria,
  ...criarServicosBase('Vila Velha', 'ES', -20.329, -40.295),
  ...criarServicosBase('Serra', 'ES', -20.063, -40.313),
  ...criarServicosBase('Cariacica', 'ES', -20.263, -40.415),

  // Sudeste - RJ
  ...servicosRioDeJaneiro,
  ...criarServicosBase('Niterói', 'RJ', -22.883, -43.103),
  ...criarServicosBase('Nova Iguaçu', 'RJ', -22.759, -43.451),
  ...criarServicosBase('Campos dos Goytacazes', 'RJ', -21.760, -41.330),
  ...criarServicosBase('Búzios', 'RJ', -22.747, -41.882),

  // Sudeste - SP
  ...servicosSaoPaulo,
  ...servicosCampinas, ...servicosSantos, ...servicosRibeiraoPreto,
  ...criarServicosBase('São José dos Campos', 'SP', -23.179, -45.887),
  ...criarServicosBase('Sorocaba', 'SP', -23.501, -47.452),
  ...criarServicosBase('São Bernardo do Campo', 'SP', -23.691, -46.564),
  ...criarServicosBase('Osasco', 'SP', -23.532, -46.791),
  ...criarServicosBase('Santo André', 'SP', -23.663, -46.554),
  ...criarServicosBase('Guarulhos', 'SP', -23.453, -46.533),

  // Sul - PR
  ...servicosCuritiba, ...servicosLondrina, ...servicosMaringa,
  ...servicosPontaGrossa, ...servicosCascavel,
  ...criarServicosBase('São José dos Pinhais', 'PR', -25.535, -49.205),
  ...criarServicosBase('Foz do Iguaçu', 'PR', -25.516, -54.585),
  ...criarServicosBase('Colombo', 'PR', -25.291, -49.199),

  // Sul - SC
  ...servicosFlorianopolis, ...servicosJoinville,
  ...criarServicosBase('Blumenau', 'SC', -26.919, -49.066),
  ...criarServicosBase('Chapecó', 'SC', -27.100, -52.615),
  ...criarServicosBase('Itajaí', 'SC', -26.907, -48.661),
  ...criarServicosBase('Criciúma', 'SC', -28.677, -49.369),

  // Sul - RS
  ...servicosPortoAlegre, ...servicosCaxiasDoSul,
  ...criarServicosBase('Pelotas', 'RS', -31.764, -52.337),
  ...criarServicosBase('Canoas', 'RS', -29.918, -51.183),
  ...criarServicosBase('Santa Maria', 'RS', -29.684, -53.806),
  ...criarServicosBase('Gravataí', 'RS', -29.947, -50.991),
  ...criarServicosBase('Viamão', 'RS', -30.081, -51.023),
  ...criarServicosBase('Novo Hamburgo', 'RS', -29.678, -51.130),
  ...criarServicosBase('São Leopoldo', 'RS', -29.760, -51.147),
  ...criarServicosBase('Rio Grande', 'RS', -32.035, -52.098),
];
