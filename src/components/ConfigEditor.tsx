import React from 'react';
import { DataSourceHttpSettings } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { ArchiverApplianceDataSourceOptions } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<ArchiverApplianceDataSourceOptions> { }

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  return (

    <div className="gf-form-group">
      <DataSourceHttpSettings
        defaultUrl='http://localhost:17668/retrieval'
        dataSourceConfig={options}
        onChange={onOptionsChange}
      />
    </div>
  );
}
