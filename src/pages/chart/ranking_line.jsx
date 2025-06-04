import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Material from "@amcharts/amcharts5/themes/Material";

function Chart({ data, width, height }) {
  useLayoutEffect(() => {
    let root = am5.Root.new("chartdiv");

    const myTheme = am5.Theme.new(root);

    myTheme.rule("AxisLabel", ["minor"]).setAll({
      dy: 1,
    });

    myTheme.rule("Grid", ["x"]).setAll({
      strokeOpacity: 0.05,
    });

    myTheme.rule("Grid", ["x", "minor"]).setAll({
      strokeOpacity: 0.05,
    });

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/

    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Material.new(root),
    ]);

    // Create chart
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        maxTooltipDistance: 0,
        pinchZoomX: true,
        minDistance: 4,
      })
    );

    // Prepare chart data
    let chartData = [];
    let minrank = Infinity;
    let maxrank = 0;
    Object.keys(data).forEach((player) => {
      data[player].forEach((item) => {
        const year = item.ranking_date.toString().slice(0, 4);
        const month = item.ranking_date.toString().slice(4, 6);
        const day = item.ranking_date.toString().slice(6, 8);

        chartData.push({
          date: new Date(year, month - 1, day).getTime(),
          value: item.rank,
          player: player,
        });

        if (item.rank > maxrank) {
          maxrank = item.rank;
        }

        if (item.rank < minrank) {
          minrank = item.rank;
        }
      });
    });

    // Create axes
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        min: new Date(2023, 0, 2).getTime(),
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: "day",
          count: 7,
        },
        renderer: am5xy.AxisRendererX.new(root, {
          minorGridEnabled: true,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: true,
        }),
        min: minrank,
        max: maxrank + 3,
      })
    );

    // Add series
    Object.keys(data).forEach((player) => {
      let series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: player,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "date",
          legendValueText: "{valueY}",
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "[bold]{name}[/]\n{valueY}",
          }),
        })
      );
      const playerData = chartData.filter((item) => item.player === player);
      series.data.setAll(playerData);
      series.appear();
    });

    // Add cursor
    let cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      })
    );
    cursor.lineY.set("visible", false);

    // Add scrollbar
    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    );

    // Scrollbar Y
    var scrollbarY = am5.Scrollbar.new(root, {
      orientation: "vertical",
    });

    chart.set("scrollbarY", scrollbarY);
    chart.leftAxesContainer.children.push(scrollbarY);

    // Add legend
    let legend = chart.rightAxesContainer.children.push(
      am5.Legend.new(root, {
        width: 240,
        paddingLeft: 20,
        overflow: "auto",
        height: am5.percent(100),
        verticalScrollbar: am5.Scrollbar.new(root, {
          orientation: "vertical",
        }),
      })
    );

    // When legend item container is hovered, dim all the series except the hovered one
    legend.itemContainers.template.events.on("pointerover", function (e) {
      let itemContainer = e.target;

      // As series list is data of a legend, dataContext is series
      let series = itemContainer.dataItem.dataContext;

      chart.series.each(function (chartSeries) {
        if (chartSeries != series) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 0.15,
            stroke: am5.color(0x000000),
          });
        } else {
          chartSeries.strokes.template.setAll({
            strokeWidth: 3,
          });
        }
      });
    });

    // When legend item container is unhovered, make all series as they are
    legend.itemContainers.template.events.on("pointerout", function (e) {
      let itemContainer = e.target;
      let series = itemContainer.dataItem.dataContext;

      chart.series.each(function (chartSeries) {
        chartSeries.strokes.template.setAll({
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: chartSeries.get("fill"),
        });
      });
    });

    legend.itemContainers.template.set("width", am5.p100);
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right",
    });

    // It's is important to set legend data after all the events are set on template, otherwise events won't be copied
    legend.data.setAll(chart.series.values);

    // Make stuff animate on load
    chart.appear(1000, 100);

    // Cleanup function to dispose of the chart
    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <div
      id="chartdiv"
      style={{ width: `${width}px`, height: `${height}px` }}
    ></div>
  );
}

export default Chart;
