import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Frozen from "@amcharts/amcharts5/themes/Frozen";

function Chart({ data1, data2, width, height }) {
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  useLayoutEffect(() => {
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    let root = am5.Root.new("chartdivv1w");

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

    let stat = data1[0];

    const avgadf = [
      {
        category: "Double Faults",
        avvalue: Math.round(parseFloat(stat.avg_df) * 1000) / 1000,
        mvalue: data2.w_df,
      },
      {
        category: "Aces",
        avvalue: Math.round(parseFloat(stat.avg_ace) * 1000) / 1000,
        mvalue: data2.w_ace,
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
    yAxis.data.setAll(avgadf);

    var xRenderer = am5xy.AxisRendererX.new(root, {
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
      minorGridEnabled: true,
    });

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
        min: 0,
      })
    );

    xAxis.data.setAll(avgadf);

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
            text: "{category}",
            fill: am5.color(0xffffff),
            populateText: true,
          }),
        });
      });

      series.data.setAll(avgadf);
      series.appear();

      return series;
    }

    createSeries("avvalue", "2023 Average");
    createSeries("mvalue", "Match");

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    const avgbp = [
      {
        category: "Break Points Saved %",
        avvalue:
          Math.round(parseFloat(stat.total_bps / stat.total_bpf) * 1000) / 10,
        mvalue:
          Math.round(parseFloat(data2.w_bpSaved / data2.w_bpFaced) * 1000) / 10,
      },
      {
        category: "Break Points Converted %",
        avvalue:
          Math.round(parseFloat(stat.total_bpc / stat.total_bpo) * 1000) / 10,
        mvalue:
          Math.round(
            parseFloat((data2.l_bpFaced - data2.l_bpSaved) / data2.l_bpFaced) *
              1000
          ) / 10,
      },
    ];

    // Create the 1st chart
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
    yAxis2.data.setAll(avgbp);

    var xRenderer = am5xy.AxisRendererX.new(root, {
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
      minorGridEnabled: true,
    });

    // Create X-Axis
    let xAxis2 = chart2.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
        min: 0,
      })
    );

    xAxis2.data.setAll(avgbp);

    function createSeries2(field, name) {
      let series = chart2.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          xAxis: xAxis2,
          yAxis: yAxis2,
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
            centerX: am5.p100,
            centerY: am5.p50,
            text: "{valueX}",
            fill: am5.color(0xffffff),
            populateText: true,
          }),
        });
      });

      series.data.setAll(avgbp);
      series.appear();

      return series;
    }

    createSeries2("avvalue", "2023 Average");
    createSeries2("mvalue", "Match");

    chart2.set("cursor", am5xy.XYCursor.new(root, {}));

    const avgsv = [
      {
        category: "2nd Serve Won %",
        avvalue: Math.round(parseFloat(stat.avg_sstwin) * 1000) / 10,
        mvalue:
          Math.round(
            parseFloat(data2.w_2ndWon / (data2.w_svpt - data2.w_1stIn)) * 1000
          ) / 10,
      },
      {
        category: "1st Serve Won %",
        avvalue: Math.round(parseFloat(stat.avg_fstwin) * 1000) / 10,
        mvalue:
          Math.round(parseFloat(data2.w_1stWon / data2.w_1stIn) * 1000) / 10,
      },
      {
        category: "1st Serve In %",
        avvalue: Math.round(parseFloat(stat.avg_fstin) * 1000) / 10,
        mvalue:
          Math.round(parseFloat(data2.w_1stIn / data2.w_svpt) * 1000) / 10,
      },
    ];

    // Create the 1st chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    let chart3 = chartContainer.children.push(
      am5xy.XYChart.new(root, { panY: false, layout: root.horizontalLayout })
    );

    let yAxis3 = chart3.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        categoryField: "category",
      })
    );
    yAxis3.data.setAll(avgsv);

    var xRenderer = am5xy.AxisRendererX.new(root, {
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
      minorGridEnabled: true,
    });

    // Create X-Axis
    let xAxis3 = chart3.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
        min: 0,
      })
    );

    xAxis3.data.setAll(avgsv);

    function createSeries3(field, name) {
      let series = chart3.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          xAxis: xAxis3,
          yAxis: yAxis3,
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
            text: "{category}",
            fill: am5.color(0xffffff),
            populateText: true,
          }),
        });
      });

      series.data.setAll(avgsv);
      series.appear();

      return series;
    }

    createSeries3("avvalue", "2023 Average");
    createSeries3("mvalue", "Match");

    // Add cursor
    chart3.set("cursor", am5xy.XYCursor.new(root, {}));

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    return () => {
      root.dispose();
    };
  }, [data1, data2]);

  return (
    <div
      id="chartdivv1w"
      style={{ width: `${width}px`, height: `${height}px` }}
    ></div>
  );
}

export default Chart;
