/* Unit 16 | Assignment - Data Journalism and D3: JavaScript file  */
/**********  Set up SVG ****************/
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
  .attr("preserveAspectRatio", "xMidYMid meet");

// Append an SVG group
var scatterGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

/**********  All the functions ****************/
// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, selectYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8, d3.max(censusData, d => d[selectYAxis]) * 1.01])
    .range([height, 0]);
  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

// new labels
function renderXCircleLables(circlesLabels, newXScale, chosenXAxis) {

  circlesLabels.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesLabels;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
// new labels
function renderYCircleLables(circlesLabels, newYScale, chosenYAxis) {

  circlesLabels.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesLabels;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel = chosenXAxis.charAt(0).toUpperCase() + chosenXAxis.slice(1);

  var ylabel = chosenYAxis.charAt(0).toUpperCase() + chosenYAxis.slice(1);
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
      if (xlabel === "Poverty") {
        return (`<strong>${d.state}</strong> <br>${xlabel}: ${d[chosenXAxis]}%<br>${ylabel}: ${d[chosenYAxis]}%`);
      }
      return (`<strong>${d.state}</strong> <br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
      d3.select(this).attr("fill", "#00fbff")
      toolTip.show(data, this);

    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      d3.select(this).attr("fill", "#008b8b")
      toolTip.hide(data);
    });

  return circlesGroup;
}

/**********  Import Data ****************/
d3.csv("assets/data/data.csv")
  .then(function (censusData) {
    //  console.log(censusData);
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    censusData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.age = +data.age;
      data.smokes = +data.smokes;
      data.income = +data.income;

    });

    // Step 2: Create scale functions
    // ==============================
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
    // yLinearScale function above csv import
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Step 3: Create initial axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = scatterGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = scatterGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = scatterGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "12")
      .attr("fill", "#008b8b")
      .attr("stroke", "#00e6e6")
      .attr("opacity", ".5");

    // Step 6: Create Circles Label
    // ==============================
    var circleLabelGroup = scatterGroup.selectAll("tspan")
      .data(censusData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .style("font-size", 9)
      .attr("fill", "#004d4d")
      .style("text-anchor", "middle")
      .text(d => d.abbr);


    //Step 7: Create group for  3 x-axis and 3 y-axis labels
    // ==============================
    var xlabelsGroup = scatterGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty(%)");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var householdIncomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
    //----------------------------------
    // Create group for 3 y-axis labels
    var yLabelsGroup = scatterGroup.append("g")
      .attr("transform", "rotate(-90)")

    var healthInsuranceLabel = yLabelsGroup.append("text")
      .attr("value", "healthcare") // value to grab for event listener 
      .classed("axis-text", true)
      .attr("y", 20 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "3em")
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
      .attr("value", "smokes") // value to grab for event listener
      .classed("axis-text", true)
      .attr("y", 15 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "2em")
      .classed("inactive", true)
      .text("Smokes (%)");

    var obeseLabel = yLabelsGroup.append("text")
      .attr("value", "obesity") // value to grab for event listener
      .classed("axis-text", true)
      .attr("y", 10 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("active", true)
      .text("Obese (%)");


    // Step 7: updateToolTip function above csv import
    // ==============================
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
          // replaces chosenXAxis with value
          chosenXAxis = value;
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

          // updates circles with new x values
          circleLabelGroup = renderXCircleLables(circleLabelGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            householdIncomeLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenXAxis === "income") {
            householdIncomeLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenXAxis == "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            householdIncomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      }); // end xlabelsGroup event listner
    //---------------------------------------
    yLabelsGroup.selectAll("text")
      .on("click", function () {

        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // replaces chosenYaxsis with value
          chosenYAxis = value;

          //update y scale for new data
          yLinearScale = yScale(censusData, chosenYAxis);

          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new y values
          circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

          // updates circles with new y values
          circleLabelGroup = renderYCircleLables(circleLabelGroup, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // change classes to change bold text
          if (chosenYAxis == "healthcare") {
            healthInsuranceLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenYAxis == "smokes") {
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
            healthInsuranceLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenYAxis == "obesity") {
            obeseLabel
              .classed("active", true)
              .classed("inactive", false);
            healthInsuranceLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        } // ends if value function
      }); //end yLabelsGroup event listner
  }); // end d3.csv

/************************ End of JavaScript file ************************ */