import type { EChartsOption, TooltipComponentFormatterCallbackParams } from 'echarts'

import type { AnalyticsEndpoint } from '../analytic.type'
import { ANALYTICS_TIME_RANGE } from '../constants/analytics.constant'

import { getDateKey, formatDateLabel, getUniqueDates } from '../helpers/analyticsDate.utils'

type HeatmapDataPoint = [ timeIndex: number, endpointIndex: number, count: number]


/* =========================================================
 * BUILD HEATMAP
 * ========================================================= */

export function buildHeatmap(data: AnalyticsEndpoint[]): EChartsOption {
  const uniqueDates = getUniqueDates(data)

  const isMultipleDates =uniqueDates.length > 1

  const times: string[] = isMultipleDates ? uniqueDates.map(formatDateLabel): [...ANALYTICS_TIME_RANGE]

  const endpointNames: string[] = data.map(ep => ep.endRoute ?? ep.endpoint)


  // ==========================================
  // BUILD HEATMAP DATA
  // ==========================================
  const heatmapData: HeatmapDataPoint[] = []
  data.forEach((ep, endpointIndex) => {
    if (isMultipleDates) {
      const dateMap = new Map<string, number>()
      ep.data.forEach(point => {
        if (!point.created_at) {
          return
        }

        const dateKey = getDateKey(point.created_at)
        dateMap.set(
          dateKey,
          (dateMap.get(dateKey) ?? 0) + point.count
        )
      })

      uniqueDates.forEach(
        (dateKey, dateIndex) => {
          heatmapData.push([
            dateIndex,
            endpointIndex,
            dateMap.get(dateKey) ?? 0
          ])
        }
      )

      return
    }

    const map = new Map<string, number>(
      ep.data.map(point => [
        point.time,
        point.count
      ])
    )

    times.forEach((time, timeIndex) => {
      heatmapData.push([
        timeIndex,
        endpointIndex,
        map.get(time) ?? 0
      ])
    })
  })

  const maxValue = Math.max(...heatmapData.map(item => item[2]), 1)

  return {
    tooltip: {
      formatter(params: TooltipComponentFormatterCallbackParams) {
        const param = Array.isArray(params)? params[0]: params

        if (!param) {
          return ''
        }

        const value = param.value

        if (!Array.isArray(value) || value.length < 3) {
          return ''
        }

        const timeIndex = Number(value[0])
        const endpointIndex = Number(value[1])
        const count = Number(value[2])

        const label = times[timeIndex] ?? ''

        return `
          <b>${endpointNames[endpointIndex] ?? ''}</b><br/>
          ${isMultipleDates ? 'Date' : 'Time'}: ${label}<br/>
          Requests: ${count}
        `
      }
    },

    grid: {
      left: 220,
      right: 20,
      top: 20,
      bottom: 80,
      containLabel: true
    },

    xAxis: {
      type: 'category',
      data: times,
      axisLine: {
        lineStyle: {
          color: '#bbb'
        }
      },

      axisLabel: {
        fontSize: 12,
        color: '#555'
      },

      splitArea: {
        show: true
      }
    },

    yAxis: {
      type: 'category',
      data: endpointNames,
      inverse: true,
      axisLine: {
        lineStyle: {
          color: '#bbb'
        }
      },

      axisLabel: {
        fontSize: 12,
        color: '#444',
        width: 180,
        overflow: 'truncate'
      },

      splitArea: {
        show: true
      }
    },

    visualMap: {
      min: 0,
      max: maxValue,
      show: false,
      inRange: {
        color: [
          '#edf8e9',
          '#c7e9c0',
          '#a1d99b',
          '#ffff99',
          '#fdd870',
          '#fdae61',
          '#f46d43',
          '#d73027'
        ]
      }
    },

    series: [
      {
        type: 'heatmap',
        data: heatmapData,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },

        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold',
          formatter(params) {
            const value = params.value
            if (Array.isArray(value) && value.length >= 3) {
              return String(value[2])
            }

            return ''
          },
          color: '#333'
        },
        emphasis: {
          label: {
            color: '#fff'
          }
        }
      }
    ],

    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        start: 0,
        end: 100,
        height: 40,
        bottom: 35,
        showDetail: true,
        showDataShadow: false,
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
        labelFormatter(value: number) {
          return times[value] ?? ''
        }
      },

      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: 100
      }
    ]
  }
}
