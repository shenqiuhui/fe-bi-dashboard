import { memo } from 'react';
import { Settings } from '@/core/render-engine/types';
import ChartWidget from '../../common/ChartWidget';
import { IComplexWidgetProps, ShowType, LegendType } from '../types';

const showTypeMap = {
  '1': { type: 'line' },
  '2': { type: 'bar' },
  '3': { type: 'line', areaStyle: [] }
};

const legendMap = {
  top: {},
  right: { right: 0 },
  bottom: { bottom: 0 },
  left: { left: 0 }
};

const ComplexWidget: React.FC<IComplexWidgetProps> = memo((props) => {
  const { settings } = props;

  const seriesBuilder = (settings: Settings) => {
    return settings?.data?.indicators?.map((indicator) => {
      const result = showTypeMap[indicator?.showType as ShowType];

      if (settings?.style?.yAxisAll && settings?.style?.yAxisRight?.fields?.includes(indicator?.field)) {
        return { ...result, yAxisIndex: 1 };
      } else {
        return result;
      }
    });
  }

  const xAxisBuilder = (settings: Settings) => {
    return {
      name: settings?.style?.xAxis?.title,
      boundaryGap: true,
      type: 'category'
    };
  }

  const yAxisBuilder = (settings: Settings) => {
    const yAxisAll = [
      {
        position: 'left',
        name: settings?.style?.yAxisLeft?.title,
        min: settings?.style?.yAxisLeft?.rangeValues?.[0],
        max: settings?.style?.yAxisLeft?.rangeValues?.[1],
        axisLine: { lineStyle: { color: '#5470C6' }, show: true },
      },
      {
        position: 'right',
        name: settings?.style?.yAxisRight?.title,
        min: settings?.style?.yAxisRight?.rangeValues?.[0],
        max: settings?.style?.yAxisRight?.rangeValues?.[1],
        axisLine: { lineStyle: { color: '#EE6666' }, show: true },
      }
    ];

    return settings?.style?.yAxisAll ? yAxisAll : yAxisAll?.slice(0, 1);
  }

  const legendBuilder = (settings: Settings) => {
    return legendMap[settings?.style?.legend as LegendType];
  }

  const formatterBuilder = (params: any | Array<any>, data: any) => {
    if (Array.isArray(params)) {
      return params?.reduce((result, param) => {
        const index = param?.encode?.y?.[0];
        const unit = data?.unit?.[index];

        return `
          <div>
            <div>${result}</div>
            <div class="char-tooltip-content">
              <div>
                <span>${param?.marker}</span>
                <span>${param?.dimensionNames?.[index]}:</span>
              </div>
              <span class="char-tooltip-value char-tooltip-value-margin">
                ${param?.value?.[index]}${unit ? `(${unit})` : ''}
              </span>
            </div>
          </div>
        `;
      }, `${params?.[0]?.name}`);
    } else {
      const index = params?.encode?.y?.[0];
      const unit = data?.unit?.[index];

      return `
        <div>
          <div>${params?.name}</div>
          <div class="char-tooltip-content">
            <div>
              <span>${params?.marker}</span>
              <span>${params?.dimensionNames?.[index]}:</span>
            </div>
            <span class="char-tooltip-value char-tooltip-value-margin">
              ${params?.value?.[index]}${unit ? `(${unit})` : ''}
            </span>
          </div>
        </div>
      `;
    }
  }

  const optionBuilder = (data: any) => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any | Array<any>) => formatterBuilder(params, data)
      },
      dataset: {
        source: data?.source
      },
      legend: legendBuilder(settings),
      xAxis: xAxisBuilder(settings),
      yAxis: yAxisBuilder(settings),
      series: seriesBuilder(settings)
    };
  }

  return (
    <ChartWidget
      {...props}
      api="/api/complex"
      optionBuilder={optionBuilder}
    />
  );
});

export default ComplexWidget;
