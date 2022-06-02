import { memo, forwardRef, useState, useRef, useImperativeHandle } from 'react';
import { message } from 'antd';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import FileSaver from 'file-saver';
import moment from 'moment';
import { getEchartsData, exportData } from '@/service/widgetsApi';
import InnerChart, { ICharInstanceRef } from './InnerChart';
import { base64ToBlob } from '../../../../utils';
import { IWidgetDefaultProps, IWidgetRef } from '../../../../types';

import './index.less';

const ChartWidget = memo(forwardRef<IWidgetRef, IWidgetDefaultProps>((props, ref) => {
  const { type, pageId, api, id: widgetId, filterValues, settings, emptyRender } = props;
  const [option, setOption] = useState({});
  const chartRef = useRef<ICharInstanceRef>(null);

  const fetchData = async () => {
    try {
      const res: any = await getEchartsData({
        api,
        method: 'post',
        params: {
          type,
          pageId,
          widgetId,
          filterValues,
          settings
        },
      });

      setOption(res || {});
    } catch (err) {}
  }

  const downloadData = async () => {
    try {
      const res: any = await exportData({
        type,
        pageId,
        widgetId,
        filterValues,
        settings
      });

      const blob = new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      });

      FileSaver.saveAs(blob, `${settings?.style?.title}${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}.csv`);
      message.success('导出成功');
    } catch (err) {}
  }

  const downloadImage = () => {
    if (isEmpty(option)) {
      return message.warning('图表数据为空');
    }

    const base64 = chartRef?.current?.charInstance?.getDataURL({
      pixelRatio: 2,
      backgroundColor: '#FFFFFF'
    }) as string;
    const blob = base64ToBlob(base64);

    FileSaver.saveAs(blob, `${settings?.style?.title}${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}.png`);
    message.success('下载成功');
  }

  useImperativeHandle(ref, () => ({
    fetchData,
    exportData: downloadData,
    downloadImage: downloadImage
  }));

  return (
    <div className="chart-widget-container">
      <AutoSizer
        className={classNames({
          'chart-widget-auto-size': isEmpty(option)
        })}
      >
        {({ height, width }) => {
          return !isEmpty(option) ? (
            <InnerChart
              option={option}
              ref={chartRef}
              height={height}
              width={width}
            />
          ) : emptyRender?.();
        }}
      </AutoSizer>
    </div>
  );
}));

export default ChartWidget;
