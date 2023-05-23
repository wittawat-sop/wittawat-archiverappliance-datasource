import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface ArchiverApplianceQuery extends DataQuery {
  target: string;
  alias: string;
  operator: string;
}

export const DEFAULT_QUERY: Partial<ArchiverApplianceQuery> = {
  target: '',
  alias: '',
  operator: 'lastSample'
};

/**
 * These are options configured for each DataSource instance
 */
export interface ArchiverApplianceDataSourceOptions extends DataSourceJsonData {
  url?: string;
  useBackend: boolean;
  withCredentials: boolean;
  headers: { [key: string]: string };
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface ArchiverApplianceSecureJsonData {
  apiKey?: string;
}
export interface VersionResponse {
  version: string;
}
export interface QwData {
  meta: {
    name: string;
    waveform: boolean;
    PREC: string;
  };
  data: [{
    millis: number;
    val: number;
  }];
}
export const operatorList: string[] = [
  'firstSample',
  'lastSample',
  'firstFill',
  'lastFill',
  'mean',
  'min',
  'max',
  'count',
  'ncount',
  'nth',
  'median',
  'std',
  'jitter',
  'ignoreflyers',
  'flyers',
  'variance',
  'popvariance',
  'kurtosis',
  'skewness',
  'raw',
  'last',
];
