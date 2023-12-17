import dayjs from 'dayjs/esm';

export interface IEntregaDiploma {
  id: number;
  dataDeEntrega?: dayjs.Dayjs | null;
  observacoes?: string | null;
}

export type NewEntregaDiploma = Omit<IEntregaDiploma, 'id'> & { id: null };
