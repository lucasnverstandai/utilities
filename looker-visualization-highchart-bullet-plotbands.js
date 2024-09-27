/**
 * Welcome to the Looker Custom Visualization Builder! Please refer to the following resources
 * to help you write your visualization:
 *  - API Documentation - https://github.com/looker/custom_visualizations_v2/blob/master/docs/api_reference.md
 *  - Example Visualizations - https://github.com/looker/custom_visualizations_v2/tree/master/src/examples
 *  - How to use the CVB - https://developers.looker.com/marketplace/tutorials/about-custom-viz-builder
 **/

jQuery.htmlPrefilter = function (html) {
    return html;
};

const visObject = {
    /**
     * Configuration options for your visualization. In Looker, these show up in the vis editor
     * panel but here, you can just manually set your default values in the code.
     **/
    options: {
    },

    /**
     * The create function gets called when the visualization is mounted but before any
     * data is passed to it.
     **/
    create: function (element, config) {
        //$('head').append('<link rel="stylesheet" type="text/css" href="https://localhost:4443/src/bullet_plotband.css">');
        $('head').append('<style type="text/css">\n' +
            '\n' +
            '#container2,\n' +
            '#container3, #legend {\n' +
            '    height: 85px;\n' +
            '}\n' +
            '\n' +
            '.plotbandContainer, #legend{ height:85px;width:100%;}\n' +
            '\n' +
            '\n' +
            '\n' +
            '\n' +
            '.hc-cat-title {\n' +
            '    font-size: 13px;\n' +
            '    font-weight: bold;\n' +
            '}\n' +
            '\n' +
            '.highcharts-figure,\n' +
            '.highcharts-data-table table {\n' +
            '    min-width: 320px;\n' +
            '    max-width: 800px;\n' +
            '    margin: 1em auto;\n' +
            '}\n' +
            '\n' +
            '.highcharts-data-table table {\n' +
            '    font-family: Verdana, sans-serif;\n' +
            '    border-collapse: collapse;\n' +
            '    border: 0px solid #ebebeb;\n' +
            '    margin: 10px auto;\n' +
            '    text-align: center;\n' +
            '    width: 100%;\n' +
            '    max-width: 500px;\n' +
            '}\n' +
            '\n' +
            '.highcharts-data-table caption {\n' +
            '    padding: 1em 0;\n' +
            '    font-size: 1.2em;\n' +
            '    color: #555;\n' +
            '}\n' +
            '\n' +
            '.highcharts-data-table th {\n' +
            '    font-weight: 600;\n' +
            '    padding: 0.5em;\n' +
            '}plotBand.label.attr({text:undefined});\n' +
            '\n' +
            '.highcharts-data-table td,\n' +
            '.highcharts-data-table th,\n' +
            '.highcharts-data-table caption {\n' +
            '    padding: 0.5em;\n' +
            '}\n' +
            '\n' +
            '.highcharts-data-table thead tr,\n' +
            '.highcharts-data-table tr:nth-child(even) {\n' +
            '    background: #f8f8f8;\n' +
            '}\n' +
            '\n' +
            '.highcharts-data-table tr:hover {\n' +
            '    background: #f1f7ff;\n' +
            '}\n' +
            '\n' +
            '.highcharts-description {\n' +
            '    margin: 0.3rem 10px;\n' +
            '}\n' +
            '\n' +
            '.custom-tooltip {\n' +
            '  /*margin-left:5px;\n' +
            '  margin-top:180px;*/\n' +
            '\n' +
            '}\n' +
            '\n' +
            '.custom-tooltip span {\n' +
            '  color:#D1A217;\n' +
            '}</style>');

    },

    updateConfigOption: function (queryResponse) {

        const qr_dimensions = queryResponse.fields.dimensions;
        const qr_measures = queryResponse.fields.measures;
        const qr_calculation = queryResponse.fields.table_calculations;
        let dimension_names = [];
        let measure_names = [];
        let all_fields = [];

        qr_dimensions.forEach((d) => {
            let obj = {};
            obj[d.label_short || d.label] = d.name;
            dimension_names.push(obj);
            all_fields.push(obj);
        });

        qr_measures.forEach((d) => {
            let obj = {};
            obj[d.label_short] = d.name;
            qr_measures.push(obj);
            measure_names.push(obj);
            all_fields.push(obj);
        });

        qr_calculation.forEach((d) => {
            let obj = {};
            obj[d.label] = d.name;
            all_fields.push(obj);
        });

        let options = {
             primary_measure: {
                section: "Data Mapping",
                type: "string",
                label: "Primary Measure",
                values: measure_names,
                display: "select",
                order: 2
             },
             toggle_measure_label: {
                section: "Theme",
                type: "boolean",
                label: "Tool Tip Reference",
                display: "Show Label",
                default: false,
                order: 5
             },
            toggle_legend: {
                section: "Theme",
                type: "boolean",
                label: "Show Legend",
                display: "Show Label",
                default: false,
                order:6
             },
             bar_color : {
                type: 'string',
                label: 'Primary Color',
                section: 'Theme',
                order: 1,
                placeholder: '#4BD8D4',
                default:'#4BD8D4'
             },
             bar_height : {
                type: 'number',
                label: 'Bar height (px)',
                section: 'Theme',
                order: 3,
                default: 85,
                placeholder: '85px'
             },
             plotband_colors : {
                type: 'array',
                label: 'PlotBand Color Ranges',
                section: 'Theme',
                order: 2,
                placeholder: '#FFF100, #16C60C, #886CE4, etc...'
            }
        };

        this.trigger('registerOptions', options) // register options with parent page to update visConfig
    },

    generateGraph: function (columns, style) {


    },

    /**
     * UpdateAsync is the function that gets called (potentially) multiple times. It receives
     * the data and should update the visualization with the new data.
     **/
    updateAsync: function (data, element, config, queryResponse, details, doneRendering) {

       look_vis = this;
       look_vis.l_config = config;

       this.clearErrors();

       this.updateConfigOption(queryResponse);

        // Throw some errors and exit if the shape of the data isn't what this chart needs.
        if (queryResponse.fields.dimensions.length < 1) {
            this.addError({title: "No Dimensions", message: "This chart requires a minimum of 1 dimension."});
            return;
        }

        // Throw some errors and exit if the shape of the data isn't what this chart needs.
        if (!look_vis.l_config.primary_measure) {
            this.addError({title: "Setting Missing", message: "Please define the Primary Measure."});
            return;
        }

        Highcharts.setOptions({
            chart: {
                inverted: true,
                marginTop:25,
                marginBottom:25,
                marginLeft: 135,
                title: null,
                type: 'bullet'
            },
            title: {
                text: null
            },
            legend: {
                enabled: false
            },
            xAxis: {
            lineWidth:0,
                borderWidth:0,
                minorGridLineWidth: 0,
                gridLineWidth: 0,
                alternateGridColor: null,
                title:null
            },
            yAxis: {
                min: 0,
                borderWidth:0,
                minorGridLineWidth: 0,
                gridLineWidth: 0,
                alternateGridColor: null,
                title:null,
                labels:{
                    enabled:false
                }
            },
            plotOptions: {
                  bullet: {
                    borderWidth:0,
                    borderRadius: '0%',
                    borderPadding:10,
                    groupPadding:0,
                    dataLabels: {
                        enabled: config.toggle_measure_label,
                        shadow:false
                    },
                    cursor:'pointer'
                },
                series: {
                    pointPadding: 0,
                    borderWidth: 0,
                    borderPadding:0,
                    color: '#4BD8D4',
                    targetOptions: {
                        height: 0,
                        borderWidth: 0
                    }
                }
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            }
        });

        const qr_dimensions = queryResponse.fields.dimensions,
            qr_measures = queryResponse.fields.measures,
            qr_all_fields = qr_dimensions.concat(qr_measures);

        let dimensions = [],
            measures = [],
            dimension_names = [],
            measure_names = [],
            legend_series = [],
            primary_measure;

        qr_all_fields.forEach((d) => {
            if(d.category === 'dimension'){
                dimensions.push(d);
                dimension_names.push(d.short_label);
            } else if (d.category === 'measure') {
                if(d.name !== config.primary_measure ) {
                    measures.push(d);
                    measure_names.push(d.short_label);
                } else if (d.name === config.primary_measure ) {
                    primary_measure = d;
                }
            }
        });

        var html = '<figure className="highcharts-figure">';

        var i = 0;
        data.forEach((d) => {
            i++;
           html += '<div id="container' + i + '" class="plotbandContainer" style="height:' + look_vis.l_config.bar_height + 'px;"></div>';
        });

        html += '<div id="legend"></div></figure>';
        $('#vis').html(html);

        i = 0;

        data.forEach((d) => {

            var plotbands = [],
                maxValue = 0;

            // Primary Value
            var pm = d[primary_measure.name];

            // Find MaxValue;
            maxValue = pm.value;
            measures.forEach((m) => {
                if(d[m.name].value > maxValue) {
                    maxValue = d[m.name].value;
                }
            });

            plotbandWidth = Math.round(maxValue / 300);
            capValue = maxValue + (maxValue / 10);

            // Build Plot bands
            var c = 0;
            measures.forEach((m) => {

                var band = {
                            from: d[m.name].value,
                            to: d[m.name].value + plotbandWidth,
                            color: config.plotband_colors[c],
                            id: m.label_short +'band',
                            tooltipText: m.label_short,
                            zIndex: 5,
                            label: {
                              text: m.label_short,
                              align:'center',
                              allowOverlap:true,
                              inside:false,
                              y:-4,
                              style: {
                                color: '#000',
                                fontSize:12
                              }
                            },
                            animation:{
                                duration:1500
                            }
                        };

                if(i === 0) {
                    legend_series.push({
                        name: m.label_short,
                        color: config.plotband_colors[c],
                        id: m.label_short + 'band',
                        data: []
                    });
                }


                plotbands.push(band);
                c++;
            });

            plotbands.push({
                from: 0,
                to: capValue + 1000,
                color: '#D9D9D9'
            });

            i++;
            Highcharts.chart('container' + i, {
                chart:{
                    events:{

                        render(){
                            var chart = this,
                                yAxis = chart.yAxis[0],
                                series = chart.series[0],
                                trWidth = 8,
                                trHeight = 10,
                                svgArrow,
                                yTr,
                                xTr;

                            // destroy previous custom SVG elements.
                            if (chart.customSvgElems) {
                              chart.customSvgElems.forEach(function(elem) {
                                elem.destroy();
                              });
                            }

                            chart.customSvgElems = [];

                            series.data.forEach(function(serie, i) {

                                  yTr = yAxis.toPixels(serie.y);
                                  xTr =  look_vis.l_config.bar_height - 25;

                                  svgArrow = chart.renderer
                                    .path([
                                      'M', yTr, xTr,
                                      'L', yTr + trWidth, xTr + trHeight,
                                      'L', yTr - trWidth, xTr + trHeight,
                                      'z'
                                    ])
                                    .attr({
                                        fill: config.bar_color,
                                        stroke: config.bar_color,
                                        zIndex:10, opacity:0,
                                        'stroke-width': 0
                                    })
                                      .animate({
                                        opacity:1},{
                                           defer: 1000
                                      }
                                      )
                                    .add()
                                    .toFront();

                                  chart.customSvgElems.push(svgArrow);
                            });
                        }
                    }
                },
                xAxis: {
                    categories: [
                        '<span class="hc-cat-title">' + d[dimensions[0].name].value + '</span>'
                    ]
                },
                yAxis: {
                    borderWidth:0,
                    plotBands: plotbands,
                    labels: {
                        format: '{value}'
                    }
                },
                plotOptions:{series:{color:config.bar_color}},
                series: [{
                        id: 'metric',
                        data: [{
                            y: pm.value,
                            target: maxValue
                        }]
                }],
                tooltip: {
                    outside:true,
                    backgroundColor:null,
                     pointFormat: '',
                    borderColor: null,
                    borderRadius:0,
                    shared: false,
                    hideDelay:100,
                    animation:true,
                    followPointer:true,
                    shadow:false,
                    useHTML:true,
                    formatter: function (tooltip) {
                        return d[primary_measure.name].html;
                    }
                }
            });

            //throw BreakException;
        });


        // Build Legend
        if(look_vis.l_config.toggle_legend) {
            Highcharts.chart('legend', {
                chart: {
                    type: 'bar',
                    spacing: [0, 0, 0, 0],
                    marginTop: 0,
                    marginBottom: 0,
                    spacingTop: 0
                },
                title: {
                    text: null
                },
                yAxis: {
                    visible: false
                },
                xAxis: {
                    visible: false
                },
                legend: {
                    enabled: true,
                    padding: 0,
                    margin: 0,
                    verticalAlign: 'middle',
                },
                plotOptions: {
                    series: {
                        events: {
                            legendItemClick: function (event) {
                                legend = this;
                                Highcharts.charts.forEach(function (chart, index) {
                                    if (chart.renderTo.id !== 'legend') {
                                        chart.yAxis[0].plotLinesAndBands.forEach(function (plotBand, index) {
                                            if (plotBand.id === legend.options.id) {
                                                if (plotBand.hidden) {
                                                    plotBand.hidden = false;
                                                    plotBand.label.attr({text: legend.options.name});
                                                    plotBand.svgElem.element.style.opacity = 1;
                                                    plotBand.svgElem.element.style['pointer-events'] = 'all';
                                                } else {
                                                    plotBand.hidden = true;
                                                    plotBand.svgElem.element.style.opacity = 0;
                                                    plotBand.label.attr({text: undefined});
                                                    plotBand.svgElem.element.style['pointer-events'] = 'none';
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                },
                series: legend_series
            });
        }


        if (details.print) {
            done();
        }

        doneRendering();
    }
};

looker.plugins.visualizations.add(visObject);