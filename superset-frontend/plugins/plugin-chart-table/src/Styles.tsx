/*
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

import { css, styled } from '@superset-ui/core';

export default styled.div`
  ${({ theme }) => css`
    table {
      width: 100%;
      min-width: auto;
      max-width: none;
      margin: 0;
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

    thead > tr > th {
      padding-right: 1.4em;
      position: relative;
      background: ${theme.colors.grayscale.light5};
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
    th svg {
      color: ${theme.colors.grayscale.light2};
      position: relative;
      vertical-align: middle;
      margin: 0 ${theme.gridUnit}px;
      visibility: hidden;
    }

    th.is-sorted svg {
      color: ${theme.colors.grayscale.base};
    }

    .table > tbody > tr:first-of-type > td,
    .table > tbody > tr:first-of-type > th {
      border-top: 1px;
    }

    .dt-controls {
      padding-bottom: 0.65em;
    }
    .dt-metric {
      text-align: right;
    }
    .dt-totals {
      font-weight: ${theme.typography.weights.bold};
    }
    .dt-is-null {
      color: ${theme.colors.grayscale.light1};
    }
    td.dt-is-filter {
      cursor: pointer;
    }
    td.dt-is-filter:hover {
      background-color: ${theme.colors.secondary.light4};
    }
    td.dt-is-active-filter,
    td.dt-is-active-filter:hover {
      background-color: ${theme.colors.secondary.light3};
    }

    .dt-global-filter {
      float: right;
    }

    .dt-pagination {
      text-align: right;
      /* use padding instead of margin so clientHeight can capture it */
      padding-top: 0.5em;
    }
    .dt-pagination .pagination {
      margin: 0;
    }

    .pagination > li > span.dt-pagination-ellipsis:focus,
    .pagination > li > span.dt-pagination-ellipsis:hover {
      background: ${theme.colors.grayscale.light5};
    }

    .dt-no-results {
      text-align: center;
      padding: 1em 0.6em;
    }
  `}
`;
