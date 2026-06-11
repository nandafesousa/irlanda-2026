import type { Hotel, Transport } from './types';

export interface TotalsByMoeda {
  readonly [moeda: string]: {
    readonly confirmed: number;
    readonly pending: number;
    readonly total: number;
  };
}

export interface TransportTotalsByMoeda {
  readonly [moeda: string]: {
    readonly paid: number;
    readonly pending: number;
    readonly total: number;
    readonly count: number;
  };
}

export function calculateTransportesTotals(transports: Transport[]): TransportTotalsByMoeda {
  return transports.reduce<Record<string, { paid: number; pending: number; total: number; count: number }>>(
    (acc, transport) => {
      const { moeda, preco, status } = transport;
      const entry = acc[moeda] ?? { paid: 0, pending: 0, total: 0, count: 0 };
      const isPaid = status === 'pago';
      return {
        ...acc,
        [moeda]: {
          paid:    entry.paid    + (isPaid ? preco : 0),
          pending: entry.pending + (isPaid ? 0 : preco),
          total:   entry.total   + preco,
          count:   entry.count   + 1,
        },
      };
    },
    {},
  );
}

export function calculateHospedagensTotals(hotels: Hotel[]): TotalsByMoeda {
  return hotels.reduce<Record<string, { confirmed: number; pending: number; total: number }>>(
    (acc, hotel) => {
      const { moeda, preco_total, status } = hotel;
      const entry = acc[moeda] ?? { confirmed: 0, pending: 0, total: 0 };
      const isConfirmed = status === 'confirmado';
      return {
        ...acc,
        [moeda]: {
          confirmed: entry.confirmed + (isConfirmed ? preco_total : 0),
          pending: entry.pending + (isConfirmed ? 0 : preco_total),
          total: entry.total + preco_total,
        },
      };
    },
    {},
  );
}
