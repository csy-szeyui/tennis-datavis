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
    let root = am5.Root.new("chartdivv1");

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
      {
        category: "Average Aces",
        value: Math.round(parseFloat(stat.avg_ace) * 1000) / 1000,
      },
      {
        category: "Average Double Faults",
        value: Math.round(parseFloat(stat.avg_df) * 1000) / 1000,
      },
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

    series1.set("fill", am5.color("#22bf69"));

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

    series1.data.setAll(data1);

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {}));
    series1.appear(1000, 100);

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    // start and end angle must be set both for chart and series

    let chart2 = chartContainer.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart2.children.unshift(
      am5.Label.new(root, {
        text: "Break Points Faced/Saved",
        fontSize: 23,
        fontWeight: "400",
        textAlign: "center",
        x: am5.percent(50),
        centerX: am5.percent(50),
        paddingTop: 0,
        paddingBottom: 0,
      })
    );

    let series2 = chart2.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
        radius: am5.percent(100),
        innerRadius: am5.percent(80),
      })
    );

    series2.states.create("hidden", {
      startAngle: 180,
      endAngle: 180,
    });

    series2.slices.template.setAll({
      fillOpacity: 0.5,
      strokeOpacity: 0,
      templateField: "settings",
    });

    series2.slices.template.states.create("hover", { scale: 1 });
    series2.slices.template.states.create("active", { shiftRadius: 0 });

    series2.labels.template.setAll({
      templateField: "settings",
    });

    series2.ticks.template.setAll({
      templateField: "settings",
    });

    series2.labels.template.setAll({
      textType: "circular",
      radius: 30,
      height: 10,
      text: "{category}: {value}",
    });

    let colorset1 = am5.ColorSet.new(root, {
      colors: [
        am5.color("rgb(89, 204, 36)"), // Custom color 1
      ],
      reuse: true,
    });

    series2.set("colors", colorset1);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series2.data.setAll([
      { category: "Break Points Saved", value: stat.total_bps },
      {
        category: "Unused",
        value: stat.total_bpf - stat.total_bps,
        settings: { forceHidden: true },
      },
    ]);

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    // start and end angle must be set both for chart and series
    let series3 = chart2.series.push(
      am5percent.PieSeries.new(root, {
        radius: am5.percent(95),
        innerRadius: am5.percent(85),
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
      })
    );

    series3.states.create("hidden", {
      startAngle: 180,
      endAngle: 180,
    });

    series3.slices.template.setAll({
      templateField: "sliceSettings",
      strokeOpacity: 0,
    });

    series3.labels.template.setAll({
      textType: "regular",
      height: 290,
      fontSize: 16,
      text: "{category}: \n \n {value}",
    });

    series3.slices.template.states.create("hover", { scale: 1 });
    series3.slices.template.states.create("active", { shiftRadius: 0 });

    series3.ticks.template.setAll({
      forceHidden: true,
    });
    series3.set(
      "tooltip",
      am5.Tooltip.new(root, {
        forceHidden: true,
      })
    );

    let colorset2 = am5.ColorSet.new(root, {
      colors: [
        am5.color("rgb(111, 177, 77)"), // Custom color 1
      ],
      reuse: true,
    });

    series3.set("colors", colorset2);
    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series3.data.setAll([
      {
        category: "Break Points Faced",
        value: stat.total_bpf,
      },
    ]);

    series2.appear(1000, 100);
    series3.appear(1000, 100);

    let chart3 = chartContainer.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart3.children.unshift(
      am5.Label.new(root, {
        text: "Break Points Converted",
        fontSize: 23,
        fontWeight: "400",
        textAlign: "center",
        x: am5.percent(50),
        centerX: am5.percent(50),
        paddingTop: 0,
        paddingBottom: 0,
      })
    );

    let series4 = chart3.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
        radius: am5.percent(100),
        innerRadius: am5.percent(80),
      })
    );

    series4.states.create("hidden", {
      startAngle: 180,
      endAngle: 180,
    });

    series4.slices.template.setAll({
      fillOpacity: 0.5,
      strokeOpacity: 0,
      templateField: "settings",
    });

    series4.slices.template.states.create("hover", { scale: 1 });
    series4.slices.template.states.create("active", { shiftRadius: 0 });

    series4.labels.template.setAll({
      templateField: "settings",
    });

    series4.ticks.template.setAll({
      templateField: "settings",
    });

    series4.labels.template.setAll({
      textType: "circular",
      radius: 30,
      height: -30,
      text: "{category}: {value}",
    });

    let colorset3 = am5.ColorSet.new(root, {
      colors: [
        am5.color("#91c712"), // Custom color 1
      ],
      reuse: true, // Reuse colors if there are more slices than colors
    });

    series4.set("colors", colorset3);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series4.data.setAll([
      { category: "Break Points Converted", value: stat.total_bpc },
      {
        category: "Unused",
        value: stat.total_bpo - stat.total_bpc,
        settings: { forceHidden: true },
      },
    ]);

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    // start and end angle must be set both for chart and series
    let series5 = chart3.series.push(
      am5percent.PieSeries.new(root, {
        radius: am5.percent(95),
        innerRadius: am5.percent(85),
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
      })
    );

    series5.states.create("hidden", {
      startAngle: 180,
      endAngle: 180,
    });

    series5.slices.template.setAll({
      templateField: "sliceSettings",
      strokeOpacity: 0,
    });

    series5.labels.template.setAll({
      textType: "regular",
      height: 280,
      fontSize: 16,
      text: "{category}: \n \n {value}",
    });

    series5.slices.template.states.create("hover", { scale: 1 });
    series5.slices.template.states.create("active", { shiftRadius: 0 });

    series5.ticks.template.setAll({
      forceHidden: true,
    });
    series5.set(
      "tooltip",
      am5.Tooltip.new(root, {
        forceHidden: true,
      })
    );

    let colorset4 = am5.ColorSet.new(root, {
      colors: [
        am5.color("#91ad05"), // Custom color 1
      ],
      reuse: true, // Reuse colors if there are more slices than colors
    });

    series5.set("colors", colorset4);
    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series5.data.setAll([
      {
        category: "Break Point Opportunities",
        value: stat.total_bpo,
      },
    ]);

    series4.appear(1000, 100);
    series5.appear(1000, 100);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <div
      id="chartdivv1"
      style={{ width: `${width}px`, height: `${height}px` }}
    ></div>
  );
}

export default Chart;
