import type { EChartsOption, TooltipComponentFormatterCallbackParams } from 'echarts'

import type { AnalyticsEndpoint } from '../analytic.type'
import { ANALYTICS_TIME_RANGE } from '../constants/analytics.constant'
import { getEndpointColor } from '../helpers/analytics.helper'
import { getDateKey, formatDateLabel, getUniqueDates } from '../helpers/analyticsDate.utils'

type LineChartData = {
  name: string
  type: 'line'
  data: number[]
  showSymbol: boolean
  symbol: string
  symbolSize: number
  lineStyle: {
    width: number
    color: string
  }
  emphasis: {
    focus: 'series'
  }
}



/* =========================================================
 * BUILD LINE CHART
 * ========================================================= */

export function buildLineChart(data: AnalyticsEndpoint[]): EChartsOption {
  const uniqueDates = getUniqueDates(data)

  const isMultipleDates = uniqueDates.length > 1

  const times: string[] = isMultipleDates ? uniqueDates.map(formatDateLabel): [...ANALYTICS_TIME_RANGE]

  const series: LineChartData[] =
    data.map(endpoint => {
      const endpointName = endpoint.endRoute ?? endpoint.endpoint

      if (isMultipleDates) {
        const map = new Map<string, number>()
        endpoint.data.forEach(point => {
          if (!point.created_at) {
            return
          }

          const dateKey = getDateKey(point.created_at)

          map.set(
            dateKey,
            (
              map.get(dateKey) ?? 0
            ) + point.count
          )
        })


        return {
          name: endpointName,
          type: 'line',
          data: uniqueDates.map(
            dateKey =>map.get(dateKey) ?? 0
          ),

          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,

          lineStyle: {
            width: 3,
            color:
              getEndpointColor(
                endpointName
              )
          },

          emphasis: {
            focus: 'series'
          }
        }
      }

      const map = new Map<string, number>(
        endpoint.data.map(
          point => [
            point.time,
            point.count
          ]
        )
      )

      return {
        name: endpointName,
        type: 'line',
        data: times.map(
          time => map.get(time) ?? 0
        ),

        showSymbol: true,
        symbol: 'circle',
        symbolSize: 8,

        lineStyle: {
          width: 3,
          color:
            getEndpointColor(
              endpointName
            )
        },

        emphasis: {
          focus: 'series'
        }
      }

    })


  return {

    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter(params: TooltipComponentFormatterCallbackParams) {
        const param = Array.isArray(params) ? params[0]: params
        const seriesName = param?.seriesName ?? ''
        const name = param?.name ?? ''
        const value = Array.isArray(param?.value) ? param.value[param.value.length - 1] : param?.value ?? 0

        return `
          <div style="padding:8px; min-width:220px;">
            <div style="font-weight:600; margin-bottom:8px;">
              Endpoint Details
            </div>

            <div>
              <b>Endpoint:</b><br/>
              ${seriesName}
            </div>

            <div>
              <b>${isMultipleDates ? 'Date' : 'Time'}:</b>
              ${name}
            </div>

            <div>
              <b>Count:</b>
              ${value}
            </div>
          </div>
        `
      }
    },


    legend: {
      type: 'scroll',
      show: false
    },

    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '25%',
      containLabel: true

    },

    xAxis: {
      type: 'category',
      data: times,
      name: isMultipleDates ? 'Date' : 'Activity Time',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },

    yAxis: {
      type: 'value',
      name: 'Request Count',
      nameLocation: 'middle',
      nameGap: 50,
      nameRotate: 90,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },

    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        start: 0,
        end: 100,
        height: 40, // Reduced height slightly for a sleeker bar
        bottom: 35, // Adjusted positioning
        showDetail: true,
        showDataShadow: 'auto',

        // Modern, neutral background bar styling
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
        borderRadius: 8,

        // Soft transparent accent highlight instead of solid harsh red
        fillerColor: 'rgba(241, 70, 104, 0.12)', // Subtle primary tint

        // White elevated pill handles
        handleIcon: 'path://M-9.35,34.56V42a1,1,0,0,0,1,1h16.7a1,1,0,0,0,1-1V34.56a1,1,0,0,0-1-1H-8.35A1,1,0,0,0-9.35,34.56Z',
        handleSize: '110%',
        handleStyle: {
          color: '#ffffff',
          borderColor: '#f14668',
          borderWidth: 2,
          shadowBlur: 4,
          shadowColor: 'rgba(0, 0, 0, 0.08)',
          shadowOffsetY: 1
        },

        // Softened middle dragging bar
        moveHandleSize: 6,
        moveHandleStyle: {
          color: '#f14668',
          opacity: 0.3
        },

        // Muted slate typography
        textStyle: {
          color: '#64748b',
          fontSize: 11,
          fontWeight: 500
        },

        // Background mini-sparkline formatting
        dataBackground: {
          lineStyle: { color: '#cbd5e1', width: 1 },
          areaStyle: { color: 'rgba(203, 213, 225, 0.2)' }
        },
        selectedDataBackground: {
          lineStyle: { color: '#f14668', width: 1.5 },
          areaStyle: { color: 'rgba(241, 70, 104, 0.15)' }
        },

        labelFormatter: (value: number) => {
          return times[value] ?? ''
        }
      },

      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: 100
      }
    ],

    series
  }
}
