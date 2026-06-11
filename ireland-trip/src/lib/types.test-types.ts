// Arquivo de testes de asserção de tipo — verificado via `tsc --noEmit`
// NÃO é executado em runtime; erros de compilação = falhas de teste.
import type {
  City,
  Hotel,
  Transport,
  HotelStatus,
  TransportStatus,
  PaymentStatus,
  TransportType,
  Currency,
} from '@/lib/types';
import { TRANSPORT_EMOJI } from '@/lib/types';

// ─── Tarefa 1: Union literals ────────────────────────────────────────────────

const _statusConfirmado: HotelStatus = 'confirmado';
const _statusPendente: HotelStatus = 'pendente';
const _transportPago: TransportStatus = 'pago';
const _transportPendente: TransportStatus = 'pendente';
const _eur: Currency = 'EUR';
const _gbp: Currency = 'GBP';
const _brl: Currency = 'BRL';

// Valores inválidos devem causar TS2322
// @ts-expect-error — 'cancelado' não pertence a HotelStatus
const _invalidHotelStatus: HotelStatus = 'cancelado';
// @ts-expect-error — 'atrasado' não pertence a TransportStatus
const _invalidTransportStatus: TransportStatus = 'atrasado';
// @ts-expect-error — 'USD' não pertence a Currency
const _invalidCurrency: Currency = 'USD';

// ─── Task 1: TransportType ────────────────────────────────────────────────────

const _aviao: TransportType = 'aviao';
const _trem: TransportType = 'trem';
const _ferry: TransportType = 'ferry';
const _onibus: TransportType = 'onibus';
const _outro: TransportType = 'outro';
// @ts-expect-error — 'taxi' não pertence a TransportType
const _invalidTransportType: TransportType = 'taxi';

// ─── Task 1: PaymentStatus ───────────────────────────────────────────────────

const _pago: PaymentStatus = 'pago';
const _paymentPendente: PaymentStatus = 'pendente';
// @ts-expect-error — 'cancelado' não pertence a PaymentStatus
const _invalidPaymentStatus: PaymentStatus = 'cancelado';

// ─── Task 1: TRANSPORT_EMOJI ──────────────────────────────────────────────────

const _emojiAviao: string = TRANSPORT_EMOJI['aviao'];
const _emojiOutro: string = TRANSPORT_EMOJI['outro'];
// @ts-expect-error — 'taxi' não é TransportType, portanto não é chave válida de TRANSPORT_EMOJI
const _emojiInvalid: string = TRANSPORT_EMOJI['taxi'];

// ─── Tarefa 2.1: Interface City ──────────────────────────────────────────────

const _validCity: City = {
  id: '0-dublin',
  cidade: 'Dublin',
  emoji: '🇮🇪',
  data_entrada: '2026-08-10',
  data_saida: '2026-08-13',
  noites: 3,
  destaque: 'Temple Bar',
  bairro: 'City Centre',
  preco_noite: 120,
  moeda: 'EUR',
  atividades: 'Guinness Storehouse, Trinity College',
};

// Campo obrigatório ausente deve causar TS2741
// @ts-expect-error — campo 'noites' ausente
const _cityMissingNoites: City = {
  id: '0-dublin',
  cidade: 'Dublin',
  emoji: '🇮🇪',
  data_entrada: '2026-08-10',
  data_saida: '2026-08-13',
  destaque: 'Temple Bar',
  bairro: 'City Centre',
  preco_noite: 120,
  moeda: 'EUR',
  atividades: 'Guinness Storehouse',
};

// Campo number com string deve causar TS2322
const _cityStringNoites: City = {
  id: '0-dublin',
  cidade: 'Dublin',
  emoji: '🇮🇪',
  data_entrada: '2026-08-10',
  data_saida: '2026-08-13',
  // @ts-expect-error — 'três' não é number
  noites: 'três',
  destaque: 'Temple Bar',
  bairro: 'City Centre',
  preco_noite: 120,
  moeda: 'EUR',
  atividades: 'Guinness Storehouse',
};

// Mutação de campo readonly deve causar TS2540
// @ts-expect-error — cidade é readonly
_validCity.cidade = 'Cork';

// ─── Tarefa 2.2: Interface Hotel ─────────────────────────────────────────────

const _validHotel: Hotel = {
  id: '0-dublin',
  cidade: 'Dublin',
  nome_hotel: 'The Shelbourne',
  data_checkin: '2026-08-10',
  data_checkout: '2026-08-13',
  noites: 3,
  preco_total: 360,
  moeda: 'EUR',
  status: 'confirmado',
  endereco: '27 St Stephen\'s Green',
};

// Campos opcionais podem ser omitidos
const _hotelWithOptionals: Hotel = {
  id: '1-london',
  cidade: 'London',
  nome_hotel: 'The Ritz',
  data_checkin: '2026-08-13',
  data_checkout: '2026-08-16',
  noites: 3,
  preco_total: 900,
  moeda: 'GBP',
  status: 'confirmado',
  endereco: '150 Piccadilly',
  link_booking: 'https://theritz.co.uk',
  observacoes: 'Café da manhã incluído',
};

// Campo obrigatório ausente deve causar TS2741
// @ts-expect-error — campo 'endereco' ausente
const _hotelMissingEndereco: Hotel = {
  id: '0-dublin',
  cidade: 'Dublin',
  nome_hotel: 'The Shelbourne',
  data_checkin: '2026-08-10',
  data_checkout: '2026-08-13',
  noites: 3,
  preco_total: 360,
  moeda: 'EUR',
  status: 'confirmado',
};

// Mutação de campo readonly deve causar TS2540
// @ts-expect-error — nome_hotel é readonly
_validHotel.nome_hotel = 'Outro Hotel';

// ─── Tarefa 2.3: Interface Transport ─────────────────────────────────────────

const _validTransport: Transport = {
  id: '0-flight',
  tipo: 'aviao',
  emoji: '✈️',
  origem: 'GRU',
  destino: 'DUB',
  data: '2026-08-10',
  horario: '23:55',
  duracao: '14h30',
  operadora: 'TAP',
  status: 'pago',
  preco: 2800,
  moeda: 'BRL',
};

// Campo opcional pode ser omitido (acima) ou incluído
const _transportWithObs: Transport = {
  id: '1-train',
  tipo: 'trem',
  emoji: '🚂',
  origem: 'Dublin',
  destino: 'Belfast',
  data: '2026-08-13',
  horario: '09:00',
  duracao: '2h15',
  operadora: 'Iarnród Éireann',
  status: 'pendente',
  preco: 35,
  moeda: 'EUR',
  observacoes: 'Bilhete impresso necessário',
};

// Campo obrigatório ausente deve causar TS2741
// @ts-expect-error — campo 'operadora' ausente
const _transportMissingOperadora: Transport = {
  id: '0-flight',
  tipo: 'aviao',
  emoji: '✈️',
  origem: 'GRU',
  destino: 'DUB',
  data: '2026-08-10',
  horario: '23:55',
  duracao: '14h30',
  status: 'pago',
  preco: 2800,
  moeda: 'BRL',
};

// Mutação de campo readonly deve causar TS2540
// @ts-expect-error — preco é readonly
_validTransport.preco = 0;

// ─── Suprimir avisos de variáveis não utilizadas ──────────────────────────────
export type { City, Hotel, Transport, HotelStatus, TransportStatus, PaymentStatus, TransportType, Currency };
export {
  TRANSPORT_EMOJI,
  _statusConfirmado,
  _statusPendente,
  _transportPago,
  _transportPendente,
  _eur,
  _gbp,
  _brl,
  _aviao,
  _trem,
  _ferry,
  _onibus,
  _outro,
  _pago,
  _paymentPendente,
  _emojiAviao,
  _emojiOutro,
  _validCity,
  _validHotel,
  _hotelWithOptionals,
  _validTransport,
  _transportWithObs,
};
