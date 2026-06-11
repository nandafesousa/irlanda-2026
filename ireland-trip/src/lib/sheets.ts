import 'server-only';
import type { City, Hotel, Transport, TransportType } from './types';
import { TRANSPORT_EMOJI } from './types';

function toDisplayDate(raw: string): string {
  const s = raw.trim();
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  }
  // X/Y/ZZ or X/Y/ZZZZ — detect M/D/Y (Google Sheets US) vs DD/MM/Y
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
    const parts = s.split('/');
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    // if second segment > 12, it must be a day → format is M/D/Y
    const [day, month] = b > 12 ? [b, a] : [a, b];
    return `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`;
  }
  return s;
}

if (!process.env.GOOGLE_SHEETS_ID && process.env.NEXT_PHASE !== 'phase-production-build') {
  throw new Error('GOOGLE_SHEETS_ID não definida');
}
if (!process.env.GOOGLE_API_KEY && process.env.NEXT_PHASE !== 'phase-production-build') {
  throw new Error('GOOGLE_API_KEY não definida');
}

async function fetchSheetRange(range: string): Promise<string[][]> {
  const sheetsId = process.env.GOOGLE_SHEETS_ID;
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${range}?key=${apiKey}`;

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sheets API error: ${response.status} ${body}`);
  }

  const data = await response.json() as { values?: string[][] };

  if (!data.values) {
    const tabName = range.split('!')[0];
    console.warn(`[sheets-client] Aba '${tabName}' retornou sem dados`);
    return [];
  }

  return data.values;
}

function mapRowsToType<T>(
  tabName: string,
  requiredHeaders: string[],
  rows: string[][],
  numericFields: string[] = []
): Record<string, unknown>[] {
  if (rows.length === 0) return [];
  const [rawHeaderRow, ...dataRows] = rows;
  const headerRow = rawHeaderRow.map(h => h.trim());

  for (const col of requiredHeaders) {
    if (headerRow.indexOf(col) === -1) {
      throw new Error(`Coluna '${col}' não encontrada na aba '${tabName}'`);
    }
  }

  // T constraint is only for call-site documentation; we return plain objects and callers cast
  void (undefined as unknown as T);

  return dataRows.map(row => {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < headerRow.length; i++) {
      const key = headerRow[i];
      const raw = row[i] ?? '';
      obj[key] = numericFields.includes(key) ? (Number(raw) || 0) : raw;
    }
    return obj;
  });
}

export async function getRoteiro(): Promise<City[]> {
  const rows = await fetchSheetRange('Roteiro!A:Z');
  const items = mapRowsToType<City>(
    'Roteiro',
    ['cidade', 'emoji', 'data_entrada', 'data_saida', 'noites', 'destaque', 'bairro', 'preco_noite', 'moeda', 'atividades'],
    rows,
    ['noites', 'preco_noite'],
  );
  return items.map((item, idx) => ({
    ...item,
    id: `${idx + 1}-${item.cidade}`,
    data_entrada: toDisplayDate(item.data_entrada as string),
    data_saida: toDisplayDate(item.data_saida as string),
  } as unknown as City));
}

function normalizeHotelRow(raw: Record<string, string>, rowIndex: number): Hotel | null {
  const status = raw.status?.trim().toLowerCase();
  if (status !== 'confirmado' && status !== 'pendente') {
    console.warn(`[sheets] Linha ${rowIndex} descartada: status inválido "${raw.status}"`);
    return null;
  }

  const precoRaw = (raw.preco_total?.trim() ?? '').replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const preco_total = precoRaw === '' ? NaN : Number(precoRaw);
  if (isNaN(preco_total)) {
    console.warn(`[sheets] Linha ${rowIndex} descartada: preco_total não numérico "${raw.preco_total}"`);
    return null;
  }

  const noutesRaw = raw.noites?.trim() ?? '';
  const noites = noutesRaw === '' ? NaN : Number(noutesRaw);
  if (isNaN(noites)) {
    console.warn(`[sheets] Linha ${rowIndex} descartada: noites não numérico "${raw.noites}"`);
    return null;
  }

  const link_booking = raw.link_booking?.trim() || undefined;
  const observacoes = raw.observacoes?.trim() || undefined;

  return {
    id: raw.id as string,
    cidade: raw.cidade?.trim() ?? '',
    nome_hotel: raw.nome_hotel?.trim() ?? '',
    data_checkin: toDisplayDate(raw.data_checkin?.trim() ?? ''),
    data_checkout: toDisplayDate(raw.data_checkout?.trim() ?? ''),
    noites,
    preco_total,
    moeda: (raw.moeda?.trim().toUpperCase() ?? 'EUR') as Hotel['moeda'],
    status: status as Hotel['status'],
    endereco: raw.endereco?.trim() ?? '',
    link_booking,
    observacoes,
  };
}

export async function getHospedagens(): Promise<Hotel[]> {
  const rows = await fetchSheetRange('Hospedagens!A:Z');
  const rawItems = mapRowsToType<Hotel>(
    'Hospedagens',
    ['cidade', 'nome_hotel', 'data_checkin', 'data_checkout', 'noites', 'preco_total', 'moeda', 'status', 'endereco'],
    rows,
  );
  return rawItems
    .map((item, idx) => {
      const raw = { ...item, id: `${idx + 1}-${item.nome_hotel}` } as Record<string, string>;
      return normalizeHotelRow(raw, idx + 2);
    })
    .filter((h): h is Hotel => h !== null);
}

const TRIP_YEAR = 2026;

function normalizeTransportDate(raw: string): string | null {
  const trimmed = raw.trim();
  // Passthrough for already-ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // DD/MM or DD/MM/YYYY
  const ddmm = trimmed.match(/^(\d{2})\/(\d{2})(?:\/(\d{4}))?$/);
  if (ddmm) {
    const day = ddmm[1];
    const month = ddmm[2];
    const year = ddmm[3] ?? String(TRIP_YEAR);
    return `${year}-${month}-${day}`;
  }
  return null;
}

const TIPO_MAP: Record<string, TransportType> = {
  aviao: 'aviao',
  avião: 'aviao',
  trem: 'trem',
  ferry: 'ferry',
  onibus: 'onibus',
  ônibus: 'onibus',
};

function normalizeTransportRow(raw: Record<string, string>, index: number): Transport | null {
  const data = normalizeTransportDate(raw.data ?? '');
  if (!data) {
    console.warn(`[sheets] Linha ${index} descartada: data inválida "${raw.data}"`);
    return null;
  }

  const precoRaw = (raw.preco ?? '').trim().replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const preco = precoRaw === '' ? NaN : Number(precoRaw);
  if (isNaN(preco)) {
    console.warn(`[sheets] Linha ${index} descartada: preco não numérico "${raw.preco}"`);
    return null;
  }

  const status = (raw.status ?? '').trim().toLowerCase();
  const paymentStatus = (status === 'pago' || status === 'pendente') ? status : 'pendente';

  const tipoRaw = (raw.tipo ?? '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const tipo: TransportType = TIPO_MAP[tipoRaw] ?? 'outro';
  const emoji = TRANSPORT_EMOJI[tipo];

  const observacoes = (raw.observacoes ?? '').trim() || undefined;

  return {
    id: raw.id as string,
    tipo,
    emoji,
    origem: (raw.origem ?? '').trim(),
    destino: (raw.destino ?? '').trim(),
    data: toDisplayDate(data),
    horario: (raw.horario ?? '').trim(),
    duracao: (raw.duracao ?? '').trim(),
    operadora: (raw.operadora ?? '').trim(),
    status: paymentStatus as Transport['status'],
    preco,
    moeda: ((raw.moeda ?? '').trim().toUpperCase() || 'EUR') as Transport['moeda'],
    observacoes,
  };
}

export async function getTransportes(): Promise<Transport[]> {
  const rows = await fetchSheetRange('Transportes!A:Z');
  const rawItems = mapRowsToType<Transport>(
    'Transportes',
    ['tipo', 'origem', 'destino', 'data', 'horario', 'duracao', 'operadora', 'status', 'preco', 'moeda'],
    rows,
  );
  return rawItems
    .map((item, idx) => {
      const raw = { ...item, id: `${idx + 1}-${item.origem}-${item.destino}` } as Record<string, string>;
      return normalizeTransportRow(raw, idx + 2);
    })
    .filter((t): t is Transport => t !== null);
}
