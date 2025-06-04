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

    let stats = data1;

    let root4 = am5.Root.new("chartdivv2a");

    let chart2 = root4.container.children.push(
      am5percent.PieChart.new(root4, {
        layout: root4.verticalLayout,
      })
    );

    chart2.children.unshift(
      am5.Label.new(root4, {
        text: "Break point Opportunities: " + stats.l_bpFaced,
        fontSize: 18,
        fontWeight: "300",
        textAlign: "center",
        x: am5.percent(50),
        centerX: am5.percent(50),
        paddingTop: 10,
        paddingBottom: 0,
      })
    );

    chart2.children.unshift(
      am5.Label.new(root4, {
        text: "Break point Conversion: " + stats.winner_name_last,
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
      am5percent.PieSeries.new(root4, {
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
      text: "{category}: {value}",
    });

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series2.data.setAll([
      {
        category: "Break Point Saved by Opponent",
        value: stats.l_bpSaved,
      },
      {
        category: "Break Point Converted",
        value: stats.l_bpFaced - stats.l_bpSaved,
      },
    ]);

    series2.appear(1000, 100);

    let root5 = am5.Root.new("chartdivv2b");

    let chart3 = root5.container.children.push(
      am5percent.PieChart.new(root5, {
        layout: root5.verticalLayout,
      })
    );

    chart3.children.unshift(
      am5.Label.new(root5, {
        text: "Break point Opportunities: " + stats.w_bpFaced,
        fontSize: 18,
        fontWeight: "300",
        textAlign: "center",
        x: am5.percent(50),
        centerX: am5.percent(50),
        paddingTop: 10,
        paddingBottom: 0,
      })
    );

    chart3.children.unshift(
      am5.Label.new(root5, {
        text: "Break point Conversion: " + stats.loser_name_last,
        fontSize: 23,
        fontWeight: "400",
        textAlign: "center",
        x: am5.percent(50),
        centerX: am5.percent(50),
        paddingTop: 0,
        paddingBottom: 0,
      })
    );

    let series3 = chart3.series.push(
      am5percent.PieSeries.new(root5, {
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
        radius: am5.percent(100),
        innerRadius: am5.percent(80),
      })
    );

    series3.states.create("hidden", {
      startAngle: 180,
      endAngle: 180,
    });

    series3.slices.template.setAll({
      strokeOpacity: 0,
      templateField: "settings",
    });

    series3.slices.template.states.create("hover", { scale: 1 });
    series3.slices.template.states.create("active", { shiftRadius: 0 });

    series3.labels.template.setAll({
      templateField: "settings",
    });

    series3.ticks.template.setAll({
      templateField: "settings",
    });

    series3.labels.template.setAll({
      text: "{category}: {value}",
    });

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series3.data.setAll([
      {
        category: "Break Point Saved by Opponent",
        value: stats.w_bpSaved,
      },
      {
        category: "Break Point Converted",
        value: stats.w_bpFaced - stats.w_bpSaved,
      },
    ]);

    series3.appear(1000, 100);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    return () => {
      root4.dispose();
      root5.dispose();
    };
  }, [data1]);

  return (
    <div display="flex" style={{ display: "flex", width: `${width}px` }}>
      <div
        id="chartdivv2a"
        style={{
          display: "flex",
          width: "100%",
          height: `${height}px`,
          marginRight: "8px",
        }}
      ></div>
      <div
        id="chartdivv2b"
        style={{
          display: "flex",
          width: "100%",
          height: `${height}px`,
        }}
      ></div>
    </div>
  );
}

export default Chart;
