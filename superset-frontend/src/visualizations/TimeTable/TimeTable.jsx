/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Mustache from 'mustache';
import { scaleLinear } from 'd3-scale';
import TableView from 'src/components/TableView';
import { formatNumber, formatTime, styled } from '@superset-ui/core';
import {
  InfoTooltipWithTrigger,
  MetricOption,
} from '@superset-ui/chart-controls';
import moment from 'moment';
import sortNumericValues from 'src/utils/sortNumericValues';

import FormattedNumber from './FormattedNumber';
import SparklineCell from './SparklineCell';
import './TimeTable.less';

const ACCESSIBLE_COLOR_BOUNDS = ['#ca0020', '#0571b0'];

const sortNumberWithMixedTypes = (rowA, rowB, columnId, descending) =>
  sortNumericValues(
    rowA.values[columnId].props['data-value'],
    rowB.values[columnId].props['data-value'],
    { descending, nanTreatment: 'asSmallest' },
  ) *
  // react-table sort function always expects -1 for smaller number
  (descending ? -1 : 1);

function colorFromBounds(value, bounds, colorBounds = ACCESSIBLE_COLOR_BOUNDS) {
  if (bounds) {
    const [min, max] = bounds;
    const [minColor, maxColor] = colorBounds;
    if (min !== null && max !== null) {
      const colorScale = scaleLinear()
        .domain([min, (max + min) / 2, max])
        .range([minColor, 'grey', maxColor]);
      return colorScale(value);
    }
    if (min !== null) {
      return value >= min ? maxColor : minColor;
    }
    if (max !== null) {
      return value < max ? maxColor : minColor;
    }
  }
  return null;
}

const propTypes = {
  className: PropTypes.string,
  height: PropTypes.number,
  // Example
  // {'2018-04-14 00:00:00': { 'SUM(metric_value)': 80031779.40047 }}
  data: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)).isRequired,
  columnConfigs: PropTypes.arrayOf(
    PropTypes.shape({
      colType: PropTypes.string,
      comparisonType: PropTypes.string,
      d3format: PropTypes.string,
      key: PropTypes.string,
      label: PropTypes.string,
      timeLag: PropTypes.number,
    }),
  ).isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        label: PropTypes.string,
      }),
      PropTypes.shape({
        metric_name: PropTypes.string,
      }),
    ]),
  ).isRequired,
  rowType: PropTypes.oneOf(['column', 'metric']).isRequired,
  url: PropTypes.string,
};
const defaultProps = {
  className: '',
  height: undefined,
  url: '',
};

const TimeTableStyles = styled.div`
  height: ${props => props.height}px;

  th {
    z-index: 1; // to cover sparkline
  }
  tr {
    width: 656px;
    height: 32px;
  }

  #bootstrap_overrides > td,
  tbody > tr > td,
  .table > tfoot > tr > td {
    min-width: 4.3em;
    border: 1px solid #e6e6e7;
    vertical-align: middle;
    font-family: Inter, serif;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 13px;
    letter-spacing: -0.01em;
    text-transform: capitalize;
    font-feature-settings: 'tnum' on, 'lnum' on;
    color: #535355;
  }

  tr {
    border: 1px solid #e6e6e7;
  }

  #bootstrap_overrides > .table > thead > tr > th {
    padding-right: 1.4em;
    position: relative;
    background: ${({ theme: { colors } }) => colors.grayscale.light5};
    text-align: left;
    padding-left: 15px;
    width: 178px;
    height: 60px;
    display: table-cell;
    vertical-align: middle;
    border: 1px solid #e6e6e7;
    font-family: Inter, serif;
    font-style: normal;
    font-weight: 550;
    font-size: 13px;
    line-height: 12px;
    letter-spacing: 0.02em;
    text-transform: capitalize;
    font-feature-settings: 'tnum' on, 'lnum' on;
    color: #6c6c6e;
  }

  .table > tbody > tr:first-of-type > td,
  .table > tbody > tr:first-of-type > th {
    border-top: 1px;
  }

  th svg {
    visibility: hidden;
  }
`;

const TimeTable = ({
  className,
  height,
  data,
  columnConfigs,
  rowType,
  rows,
  url,
}) => {
  const memoizedColumns = useMemo(
    () => [
      { accessor: 'metric', Header: 'Metric' },
      ...columnConfigs.map((columnConfig, i) => ({
        accessor: columnConfig.key,
        cellProps: columnConfig.colType === 'spark' && {
          style: { width: '1%' },
        },
        Header: () => (
          <>
            {columnConfig.label}{' '}
            {columnConfig.tooltip && (
              <InfoTooltipWithTrigger
                tooltip={columnConfig.tooltip}
                label={`tt-col-${i}`}
                placement="top"
              />
            )}
          </>
        ),
        sortType: sortNumberWithMixedTypes,
      })),
    ],
    [columnConfigs],
  );

  const memoizedRows = useMemo(() => {
    const renderSparklineCell = (valueField, column, entries) => {
      const fillColor = '#FF7A7A';
      let sparkData;
      if (column.timeRatio) {
        // Period ratio sparkline
        sparkData = [];
        for (let i = column.timeRatio; i < entries.length; i += 1) {
          const prevData = entries[i - column.timeRatio][valueField];
          if (prevData && prevData !== 0) {
            sparkData.push(entries[i][valueField] / prevData);
          } else {
            sparkData.push(null);
          }
        }
      } else {
        sparkData = entries.map(d => d[valueField]);
      }

      return (
        <SparklineCell
          width={parseInt(column.width, 10) || 300}
          height={parseInt(column.height, 10) || 50}
          data={sparkData}
          data-value={sparkData[sparkData.length - 1]}
          ariaLabel={`spark-${valueField}`}
          numberFormat={column.d3format}
          yAxisBounds={column.yAxisBounds}
          showYAxis={column.showYAxis}
          fillColor={fillColor}
          renderTooltip={({ index }) => (
            <div>
              <strong>{formatNumber(column.d3format, sparkData[index])}</strong>
              <div>
                {formatTime(
                  column.dateFormat,
                  moment.utc(entries[index].time).toDate(),
                )}
              </div>
            </div>
          )}
        />
      );
    };

    const renderValueCell = (valueField, column, reversedEntries) => {
      const recent = reversedEntries[0][valueField];
      let v;
      let errorMsg;
      if (column.colType === 'time') {
        // Time lag ratio
        const timeLag = column.timeLag || 0;
        const totalLag = Object.keys(reversedEntries).length;
        if (timeLag >= totalLag) {
          errorMsg = `The time lag set at ${timeLag} is too large for the length of data at ${reversedEntries.length}. No data available.`;
        } else {
          v = reversedEntries[timeLag][valueField];
        }
        if (typeof v === 'number' && typeof recent === 'number') {
          if (column.comparisonType === 'diff') {
            v = recent - v;
          } else if (column.comparisonType === 'perc') {
            v = recent / v;
          } else if (column.comparisonType === 'perc_change') {
            v = recent / v - 1;
          }
        } else {
          v = null;
        }
      } else if (column.colType === 'contrib') {
        // contribution to column total
        v =
          recent /
          Object.keys(reversedEntries[0])
            .map(k => (k !== 'time' ? reversedEntries[0][k] : null))
            .reduce((a, b) => a + b);
      } else if (column.colType === 'avg') {
        // Average over the last {timeLag}
        v = null;
        if (reversedEntries.length > 0) {
          const stats = reversedEntries.slice(undefined, column.timeLag).reduce(
            function ({ count, sum }, entry) {
              return entry[valueField] !== undefined &&
                entry[valueField] !== null
                ? { count: count + 1, sum: sum + entry[valueField] }
                : { count, sum };
            },
            { count: 0, sum: 0 },
          );
          if (stats.count > 0) {
            v = stats.sum / stats.count;
          }
        }
      }

      const color = colorFromBounds(v, column.bounds);

      return (
        <span
          key={column.key}
          data-value={v}
          style={
            color && {
              boxShadow: `inset 0px -2.5px 0px 0px ${color}`,
              borderRight: '2px solid #fff',
            }
          }
        >
          {errorMsg || (
            <span style={{ color }}>
              <FormattedNumber num={v} format={column.d3format} />
            </span>
          )}
        </span>
      );
    };

    const renderLeftCell = row => {
      const context = { metric: row };
      const fullUrl = url ? Mustache.render(url, context) : null;

      if (rowType === 'column') {
        const column = row;
        if (fullUrl) {
          return (
            <a href={fullUrl} rel="noopener noreferrer" target="_blank">
              {column.label}
            </a>
          );
        }
        return column.label;
      }

      return (
        <MetricOption
          metric={row}
          url={fullUrl}
          showFormula={false}
          openInNewWindow
        />
      );
    };

    const entries = Object.keys(data)
      .sort()
      .map(time => ({ ...data[time], time }));
    const reversedEntries = entries.concat().reverse();

    return rows.map(row => {
      const valueField = row.label || row.metric_name;
      const cellValues = columnConfigs.reduce((acc, columnConfig) => {
        if (columnConfig.colType === 'spark') {
          return {
            ...acc,
            [columnConfig.key]: renderSparklineCell(
              valueField,
              columnConfig,
              entries,
            ),
          };
        }
        return {
          ...acc,
          [columnConfig.key]: renderValueCell(
            valueField,
            columnConfig,
            reversedEntries,
          ),
        };
      }, {});
      return { ...row, ...cellValues, metric: renderLeftCell(row) };
    });
  }, [columnConfigs, data, rowType, rows, url]);

  const defaultSort =
    rowType === 'column' && columnConfigs.length
      ? [
          {
            id: columnConfigs[0].key,
            desc: 'true',
          },
        ]
      : [];

  return (
    <TimeTableStyles className={`time-table ${className}`} height={height}>
      <TableView
        id="bootstrap_overrides"
        className="table-no-hover"
        columns={memoizedColumns}
        data={memoizedRows}
        initialSortBy={defaultSort}
        withPagination={false}
      />
    </TimeTableStyles>
  );
};

TimeTable.propTypes = propTypes;
TimeTable.defaultProps = defaultProps;

export default TimeTable;
