import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Frozen from "@amcharts/amcharts5/themes/Frozen";

function Chart({ data, width, height }) {
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  useLayoutEffect(() => {
    let root = am5.Root.new("chartdivvww");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root), am5themes_Frozen.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    let chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        endAngle: 270,
      })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    const chartdata = data.map((item) => ({
      result: item.result,
      count: item.count,
    }));

    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        categoryField: "result",
        valueField: "count",
        endAngle: 270,
      })
    );

    series.states.create("hidden", {
      endAngle: -90,
    });

    series.data.setAll(chartdata);

    series.labels.template.setAll({
      fontSize: 16,
      text: "{result}: {count}",
    });

    series.appear(1000, 100);

    let legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.horizontalLayout,
      })
    );

    legend.data.setAll(series.dataItems);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <div
      id="chartdivvww"
      style={{ width: `${width}px`, height: `${height}px` }}
    ></div>
  );
}

export default Chart;
