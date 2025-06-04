import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Frozen from "@amcharts/amcharts5/themes/Frozen";

function Chart({ data, width, height }) {
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  useLayoutEffect(() => {
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    let root = am5.Root.new("chartdivvv");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    root.container.set("layout", root.verticalLayout);

    // Create container to hold charts
    let chartContainer = root.container.children.push(
      am5.Container.new(root, {
        layout: root.horizontalLayout,
        width: am5.p100,
        height: am5.p100,
      })
    );

    let stat = data[0];

    const data1 = [
      { category: "Total Aces", value: stat.t_ace },
      { category: "Total Double Faults", value: stat.t_df },
    ];

    const data2 = [
      { category: "Break Points Saved", value: stat.t_bps },
      { category: "Break Points Converted", value: stat.t_bpc },
    ];

    // Create the 1st chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    let chart = chartContainer.children.push(
      am5xy.XYChart.new(root, { panY: false, layout: root.horizontalLayout })
    );

    let yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        categoryField: "category",
      })
    );
    yAxis.data.setAll(data1);

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        valueField: "value",
        min: 0,
      })
    );
    xAxis.data.setAll(data1);

    // Create series
    let series1 = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        categoryYField: "category",
        valueXField: "value",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryY}: {valueX}",
        }),
      })
    );

    series1.set("fill", am5.color("#21cc69"));

    series1.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationX: 1,
        locationY: 0.5,
        sprite: am5.Label.new(root, {
          centerY: am5.p50,
          text: "{value}",
          populateText: true,
        }),
      });
    });

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    // Create the 2nd chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    let chart2 = chartContainer.children.push(
      am5xy.XYChart.new(root, { panY: false, layout: root.horizontalLayout })
    );

    let yAxis2 = chart2.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        categoryField: "category",
      })
    );
    yAxis2.data.setAll(data2);

    // Create X-Axis
    let xAxis2 = chart2.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        valueField: "value",
        min: 0,
      })
    );
    xAxis2.data.setAll(data2);

    // Create series
    let series2 = chart2.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series",
        xAxis: xAxis2,
        yAxis: yAxis2,
        categoryYField: "category",
        valueXField: "value",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryY}: {valueX}",
        }),
      })
    );

    series2.set("fill", am5.color("#22bf69"));

    series2.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationX: 1,
        locationY: 0.5,
        sprite: am5.Label.new(root, {
          centerY: am5.p50,
          text: "{value}",
          populateText: true,
        }),
      });
    });

    let colorset2 = am5.ColorSet.new(root, {
      colors: [
        am5.color("rgb(111, 177, 77)"), // Custom color 1
        am5.color("rgb(47, 217, 105)"), // Custom color 2
      ],
      reuse: true, // Reuse colors if there are more slices than colors
    });

    series2.set("colors", colorset2);

    chart2.set("cursor", am5xy.XYCursor.new(root, {}));

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series1.data.setAll(data1);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series2.data.setAll(data2);

    series1.appear(1000, 100);
    series2.appear(1000, 100);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <div
      id="chartdivvv"
      style={{ width: `${width}px`, height: `${height}px` }}
    ></div>
  );
}

export default Chart;
