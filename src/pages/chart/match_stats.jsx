import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Frozen from "@amcharts/amcharts5/themes/Frozen";

function Chart({ data1, width, height }) {
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  useLayoutEffect(() => {
    /* Chart code */
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    let root = am5.Root.new("chartdivv");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        layout: root.verticalLayout,
      })
    );

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    let legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );

    chart
      .get("colors")
      .set("colors", [am5.color("#65b2c9"), am5.color("#6eb350")]);

    let stats = data1;

    // Data
    const data = [
      {
        category: "Total Aces",
        playerA: parseInt(stats.w_ace),
        playerB: parseInt(stats.l_ace),
      },
      {
        category: "Total Double Faults",
        playerA: parseInt(stats.w_df),
        playerB: parseInt(stats.l_df),
      },
    ];

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: true,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
          minorGridEnabled: true,
        }),
      })
    );

    yAxis.data.setAll(data);

    let xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {
          strokeOpacity: 0.1,
          minGridDistance: 50,
        }),
        min: 0,
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function createSeries(field, name) {
      let series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueXField: field,
          categoryYField: "category",
          sequencedInterpolation: true,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "[bold]{name}[/]\n{categoryY}: {valueX}",
          }),
        })
      );

      series.columns.template.setAll({
        height: am5.p100,
        strokeOpacity: 0,
      });

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: am5.Label.new(root, {
            centerY: am5.p50,
            text: "{valueX}",
            populateText: true,
          }),
        });
      });

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: am5.Label.new(root, {
            centerX: am5.p100,
            centerY: am5.p50,
            text: "{name}",
            fill: am5.color(0xffffff),
            populateText: true,
          }),
        });
      });

      series.data.setAll(data);
      series.appear();

      return series;
    }

    createSeries("playerA", stats.winner_name_last);
    createSeries("playerB", data1.loser_name_last);

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/

    legend.data.setAll(chart.series.values);

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomY",
      })
    );
    cursor.lineY.set("forceHidden", true);
    cursor.lineX.set("forceHidden", true);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);

    let root2 = am5.Root.new("chartdivv2");

    let chart2 = root2.container.children.push(
      am5percent.PieChart.new(root2, {
        layout: root2.verticalLayout,
      })
    );

    chart2.children.unshift(
      am5.Label.new(root2, {
        text: "Serve Breakdown: " + stats.winner_name_last,
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
      am5percent.PieSeries.new(root2, {
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

    let num = Math.round((stats.w_1stWon / stats.w_1stIn) * 10000) / 100;

    series2.labels.template.setAll({
      text: `{category}: \n ${num}%`,
      oversizedBehavior: "wrap",
    });
    series2.set(
      "tooltip",
      am5.Tooltip.new(root2, {
        forceHidden: true,
      })
    );

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series2.data.setAll([
      {
        category: "1st Serve Won",
        value: stats.w_1stWon,
      },
      {
        category: "Unused",
        value: stats.w_svpt - stats.w_1stWon,
        settings: { forceHidden: true },
      },
    ]);

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    // start and end angle must be set both for chart and series
    let series3 = chart2.series.push(
      am5percent.PieSeries.new(root2, {
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
      fontSize: 16,
      text: "{prop}",
      oversizedBehavior: "wrap",
    });

    series3.slices.template.states.create("hover", { scale: 1 });
    series3.slices.template.states.create("active", { shiftRadius: 0 });

    series3.ticks.template.setAll({
      forceHidden: true,
    });
    series3.set(
      "tooltip",
      am5.Tooltip.new(root2, {
        forceHidden: true,
      })
    );

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series3.data.setAll([
      {
        category: "1st Serve In",
        value: stats.w_1stIn,
        prop:
          "1st Serve In: " +
          Math.round((stats.w_1stIn / stats.w_svpt) * 10000) / 100 +
          "%",
      },
      {
        category: "2nd Serve Won",
        value: stats.w_2ndWon,
        prop:
          "2nd Serve Won: " +
          Math.round(
            (stats.w_2ndWon / (stats.w_svpt - stats.w_1stIn)) * 10000
          ) /
            100 +
          "%",
      },
      {
        category: " ",
        value: stats.w_svpt - stats.w_1stIn - stats.w_2ndWon,
        prop: " ",
        sliceSettings: { fill: am5.color(0xdedede) },
      },
    ]);

    series2.appear(1000, 100);
    series3.appear(1000, 100);

    let root3 = am5.Root.new("chartdivv3");

    let chart3 = root3.container.children.push(
      am5percent.PieChart.new(root3, {
        layout: root3.verticalLayout,
      })
    );

    chart3.children.unshift(
      am5.Label.new(root3, {
        text: "Serve Breakdown: " + stats.loser_name_last,
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
      am5percent.PieSeries.new(root3, {
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

    let num2 = Math.round((stats.l_1stWon / stats.l_1stIn) * 10000) / 100;

    series4.labels.template.setAll({
      text: `{category}: \n ${num2}%`,
      oversizedBehavior: "wrap",
    });
    series4.set(
      "tooltip",
      am5.Tooltip.new(root3, {
        forceHidden: true,
      })
    );

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series4.data.setAll([
      {
        category: "1st Serve Won",
        value: stats.l_1stWon,
      },
      {
        category: "Unused",
        value: stats.l_svpt - stats.l_1stWon,
        settings: { forceHidden: true },
      },
    ]);

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    // start and end angle must be set both for chart and series
    let series5 = chart3.series.push(
      am5percent.PieSeries.new(root3, {
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
      fontSize: 16,
      text: "{prop}",
      oversizedBehavior: "wrap",
    });

    series5.slices.template.states.create("hover", { scale: 1 });
    series5.slices.template.states.create("active", { shiftRadius: 0 });

    series5.ticks.template.setAll({
      forceHidden: true,
    });
    series5.set(
      "tooltip",
      am5.Tooltip.new(root3, {
        forceHidden: true,
      })
    );

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series5.data.setAll([
      {
        category: "1st Serve In",
        value: stats.l_1stIn,
        prop:
          "1st Serve In: " +
          Math.round((stats.l_1stIn / stats.l_svpt) * 10000) / 100 +
          "%",
      },
      {
        category: "2nd Serve Won",
        value: stats.l_2ndWon,
        prop:
          "2nd Serve Won: " +
          Math.round(
            (stats.l_2ndWon / (stats.l_svpt - stats.l_1stIn)) * 10000
          ) /
            100 +
          "%",
      },
      {
        category: " ",
        value: stats.l_svpt - stats.l_1stIn - stats.l_2ndWon,
        prop: " ",
        sliceSettings: { fill: am5.color(0xdedede) },
      },
    ]);

    series4.appear(1000, 100);
    series5.appear(1000, 100);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    return () => {
      root.dispose();
      root2.dispose();
      root3.dispose();
    };
  }, [data1]);

  return (
    <div>
      <div
        class="container"
        style={{
          display: "flex",
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <div
          id="chartdivv"
          style={{
            width: `${width / 3}px`,
          }}
        ></div>
        <div
          id="chartdivv2"
          style={{
            width: `${width / 3}px`,
          }}
        ></div>
        <div
          id="chartdivv3"
          style={{
            width: `${width / 3}px`,
          }}
        ></div>
      </div>
    </div>
  );
}

export default Chart;
