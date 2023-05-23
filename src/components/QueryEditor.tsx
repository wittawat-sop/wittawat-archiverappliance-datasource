import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import { InlineFormLabel, AsyncSelect, InputActionMeta, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue, toOption } from '@grafana/data';
import { DataSource } from '../datasource';
import { ArchiverApplianceDataSourceOptions, ArchiverApplianceQuery, operatorList } from '../types';
import { components } from "react-select";
import { defaults } from 'lodash';

type Props = QueryEditorProps<DataSource, ArchiverApplianceQuery, ArchiverApplianceDataSourceOptions>;

const Input = (props: any) => <components.Input {...props} isHidden={false} />;

export function QueryEditor({ query, onChange, onRunQuery, datasource }: Props) {
  
  const operatorOptions: Array<SelectableValue<string>> = operatorList.map(toOption);
  const [pvOption, setPVOption] = useState(query.target ? toOption(query.target) : undefined);
  const [pvInput, setPVInput] = useState(query.target);
  const [operatorOptionValue, setOperatorOptionValue] = useState(query.operator && query.operator !== "" ? toOption(query.operator) : undefined);
  const [operatorInputValue, setOperatorInputValue] = useState(query.operator);
  const onOperatorChange = (option: SelectableValue) => {
    const changedOpertor = option && option.value !== "" ? option.value : undefined;
    onChange({ ...query, operator: changedOpertor });
    setOperatorInputValue(changedOpertor);
    setOperatorOptionValue(option);

    if (option && option.value !== null) {
      onRunQuery();
    }
  };
  const onPVChange = (option: SelectableValue) => {
    const target = option ? option.value : "";
    onChange({ ...query, target });
    setPVInput(target);
    setPVOption(option);
    if (option && option.value !== null) {
      onRunQuery();
    }
  };
  return (
    <>
      <div className="gf-form-inline">
        <InlineFormLabel
          className='query-keyword'
          width={6}>
          PV
        </InlineFormLabel>
        <div className="max-width-30 gf-form-spacing">
          <AsyncSelect
            value={pvOption}
            inputValue={pvInput}
            defaultOptions
            allowCustomValue
            isClearable
            components={{
              Input
            }}
            onInputChange={
              (val: string, { action }: InputActionMeta) => {
                if (action === 'input-blur') {
                  onPVChange(toOption(pvInput));
                }
                if (action === 'input-change') {
                  setPVInput(val);
                }
              }
            }
            // loadOptions={pvDebonceeSuggestions}
            loadOptions={
              inputValue => fetch(datasource.buildOptions(`bpl/getMatchingPVs?limit=100&regex=.*${inputValue}.*`).url)
                .then(data => data.json())
                .then(results =>
                  results.map((name: any) => {
                    return { label: name, value: name };
                  }
                  )
                )
            }
            onChange={(option: SelectableValue) => {
              const target = option ? option.value : "";
              onChange({ ...query, target });
              setPVInput(target);
              setPVOption(option);
              if (option && option.value !== null) {
                onRunQuery();
              }
            }}
            placeholder={"PV Name"}
            key={JSON.stringify(pvOption)}
            className={""}
          />
        </div>
      </div>
      <div className="gf-form-inline">
        <InlineFormLabel
          width={6}
          className="query-keyword"
        >
          Operator
        </InlineFormLabel>
        <div className="max-width-30 gf-form-spacing">
          <Select
            value={operatorOptionValue}
            inputValue={operatorInputValue}
            options={operatorOptions}
            onChange={onOperatorChange}
            onInputChange={
              (inputValue: string, { action }: InputActionMeta) => {
                // onBlur => issue onPVChange with a current input value
                if (action === "input-blur") {
                  onOperatorChange(toOption(operatorInputValue));
                }

                // onInputChange => update inputValue
                if (action === "input-change") {
                  setOperatorInputValue(inputValue);
                }
              }}
            allowCustomValue
            isClearable
            components={{
              Input
            }}
            placeholder="mean"
          />
        </div>
      </div>
      <div className="gf-form">
        <InlineFormLabel width={6} className="query-keyword" tooltip={<p>Set alias for the legend.</p>}>
          Alias
        </InlineFormLabel>
        <input
          type="text"
          value={query.alias}
          className="gf-form-input max-width-30"
          placeholder="Alias"
          style={defaults({})}
          onChange={(
            event: ChangeEvent<HTMLInputElement>) => {
            onChange({ ...query, alias: event.target.value });
          }}
          onBlur={onRunQuery}
          onKeyDown={
            (event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
        />
      </div>
    </>
  );
}
