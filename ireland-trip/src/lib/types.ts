export type HotelStatus = 'confirmado' | 'pendente';
export type TransportType = 'aviao' | 'trem' | 'ferry' | 'onibus' | 'outro';
export type PaymentStatus = 'pago' | 'pendente';
/** @deprecated Use PaymentStatus */
export type TransportStatus = PaymentStatus;
export type Currency = 'EUR' | 'GBP' | 'BRL';

export const TRANSPORT_EMOJI: Record<TransportType, string> = {
  aviao:  '✈️',
  trem:   '🚂',
  ferry:  '⛴️',
  onibus: '🚌',
  outro:  '🚗',
};

export interface City {
  readonly id: string;
  readonly cidade: string;
  readonly emoji: string;
  readonly data_entrada: string;
  readonly data_saida: string;
  readonly noites: number;
  readonly destaque: string;
  readonly bairro: string;
  readonly preco_noite: number;
  readonly moeda: Currency;
  readonly atividades: string; // comma-separated raw string; split in consumers
}

export interface Hotel {
  readonly id: string;
  readonly cidade: string;
  readonly nome_hotel: string;
  readonly data_checkin: string;
  readonly data_checkout: string;
  readonly noites: number;
  readonly preco_total: number;
  readonly moeda: Currency;
  readonly status: HotelStatus;
  readonly endereco: string;
  readonly link_booking?: string;
  readonly observacoes?: string;
}

export interface Transport {
  readonly id: string;
  readonly tipo: TransportType;
  readonly emoji: string;
  readonly origem: string;
  readonly destino: string;
  /** ISO 8601: "YYYY-MM-DD" — normalizado em getTransportes, usado para ordenação via localeCompare */
  readonly data: string;
  readonly horario: string;
  readonly duracao: string;
  readonly operadora: string;
  readonly status: PaymentStatus;
  readonly preco: number;
  readonly moeda: Currency;
  readonly observacoes?: string;
}
