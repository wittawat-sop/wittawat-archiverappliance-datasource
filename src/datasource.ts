import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { ArchiverApplianceQuery, ArchiverApplianceDataSourceOptions, VersionResponse, operatorList, QwData } from './types';
import { getBackendSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';
import _, { } from 'lodash';

export class DataSource extends DataSourceApi<ArchiverApplianceQuery, ArchiverApplianceDataSourceOptions> {
  name: string;
  url: string;
  withCredentials: boolean;
  headers: { [key: string]: string };
  constructor(instanceSettings: DataSourceInstanceSettings<ArchiverApplianceDataSourceOptions>) {
    super(instanceSettings);
    if (instanceSettings.url) { this.url = instanceSettings.url; }
    else { this.url = "http://localhost:17668/retrieval"; }
    this.name = instanceSettings.name;
    this.withCredentials = instanceSettings.withCredentials || false;
    this.headers = { 'Content-Type': 'application/json' };
  }

  async query(options: DataQueryRequest<ArchiverApplianceQuery>): Promise<DataQueryResponse> {
    const interval = options.intervalMs > 1000 ? String(Number(options.intervalMs / 1000).toFixed()) : '1';
    // const { range } = options;
    // const from = range!.from.valueOf();
    // const to = range!.to.valueOf();
    // Return a constant for each query.
    const data = options.targets.map(async (target) => {
      const pv = (() => {
        if (target.operator === 'raw' || target.operator === 'last' || interval === '') {
          return `${target.target}`;
        }
        if (_.includes(['', undefined], target.operator)) {
          return `mean_${interval}(${target.target})`;
        }
        if (_.includes(operatorList, target.operator)) {
          return `${target.operator}_${interval}(${target.target})`;
        }
        throw new Error('invalide operator')
      })();
      const from_str = target.operator === 'last' ? options.range.to.toISOString() : options.range.from.toISOString();
      const url = `data/getData.qw?pv=${encodeURIComponent(pv)}&from=${from_str}&&to=${options.range.to.toISOString()}`;
      const opt = this.buildOptions(url);
      // console.log(opt.url)
      // <[{ meta: { name: string, waveform: boolean, PREC: string } }, [{ milis: number, val: number }]]>
      const request = await lastValueFrom(getBackendSrv().fetch<[QwData]>(opt));
      let values: number[] = [];
      let times: number[] = []
      if (request.status === 200) {
        values = request.data[0].data.map((v) => v.val);
        times = request.data[0].data.map((v) => v.millis);
      }
      let v_name = target.target;
      if (target.alias !== undefined) {
        v_name = target.alias;
      }
      return new MutableDataFrame({
        refId: target.refId,
        fields: [
          { name: 'Time', values: times, type: FieldType.time },
          { name: `${v_name}`, values: values, type: FieldType.number },
        ],
      });
    });
    const resolvData = await Promise.all(data);
    // console.log(resolvData);

    return { data: resolvData };
  }

  async testDatasource() {
    const options = { method: "GET", url: `${this.url}/bpl/getVersion`, headers: this.headers, withCredentials: this.withCredentials };

    const r = await lastValueFrom(getBackendSrv().fetch<VersionResponse>(options));
    if (r.status === 200) {
      const resp = { status: 'success', message: `Datasource is work. ${r.data.version}`, title: 'Success' };
      return resp;
    }
    const resp = { status: 'error', message: r.data, title: 'Failed' };
    return resp;
  }

  buildOptions(parms: string) {
    return { method: "GET", url: `${this.url}/${parms}`, headers: this.headers, withCredentials: this.withCredentials };
  }
}
