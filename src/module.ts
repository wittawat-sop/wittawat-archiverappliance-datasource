import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { ArchiverApplianceQuery, ArchiverApplianceDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, ArchiverApplianceQuery, ArchiverApplianceDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
