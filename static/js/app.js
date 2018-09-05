function buildMetadata(sample) {
  // Fetch the metadata for a sample
  var sample_url = "/metadata/" + sample;
  d3.json(sample_url).then( (data) => {
    console.log('data:', data);
    var metadata = {
      "Age" : data.AGE,
      "Belly Button Type" : data.BBTYPE,
      "Ethnicity" : data.ETHNICITY,
      "Sex" : data.GENDER,
      "Location" : data.LOCATION,
      "Washing Frequency" : data.WFREQ,
      "Sample ID" : data.sample,
    };

    // Use d3 to select the panel with id of `#sample-metadata`
    var md = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    md.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(metadata).forEach(([key, value]) => {
      md.append("p")
      .html("<strong>" + key + ": </strong>" + value)
    });

    // BONUS: Build the Gauge Chart
    buildGauge(data.WFREQ);
  });
}

function buildCharts(sample) {
  // Fetch the sample data for the plots
  var sample_url = "/samples/" + sample;

  d3.json(sample_url).then( (data) => {

    // var sampleData = [];
    // for (var i=0; i<sample_values.length;i++){
    //   var sample = {
    //     id: data.otu_ids[i],
    //     label: data.sample_label[i],
    //     name: label.split(";").slice(-2).join(" "),
    //     value: data.sample_values[i],
    //   };
    //   sampleData.push(sample);
    // };
    // console.log(sampleData);

    var sample_values = data.sample_values;
    var otu_ids = data.otu_ids;
    var otu_labels = data.otu_labels;
    var otu_names = otu_labels.map(f => {
      return f.split(";").slice(-2).join(" ");
    });

    // Create top 10 samples pie chart
    var pie_trace = {
      labels: otu_ids,
      // labels: otu_names,
      values: sample_values,
      hovertext: otu_labels,
      // text: otu_ids.slice(-10).forEach(i => { return "ID:" + i } ),
      type: 'pie'
    };
    var pie_data = [pie_trace];
    var pie_layout = {
      title: "<b>Relative Abundance of OTUs</b> <br>Bacterial species found in bellybutton sample",
      showlegend: true,
    };
    Plotly.newPlot("pie", pie_data, pie_layout);

    // Create bubble chart using the sample data
    var bubble_trace = {
      x: otu_ids,
      y: sample_values,
      mode: 'markers',
      marker: { size: sample_values },
      text: otu_labels,
    };
    var bubble_data = [bubble_trace];
    var bubble_layout = {
      title: "Sample Value vs OTU ID",
      xaxis: { title: "OTU ID" },
      yaxis: { title: "Sample Value" },
    };
    Plotly.newPlot("bubble", bubble_data, bubble_layout);

  });
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  d3.json("/names").then(function(response){
    // Get sample names
    const sampleNames = response;

    // Fill dropdown
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Build charts from first sample
    const firstSample = sampleNames[0];

    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
};

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
