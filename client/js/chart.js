/* global moment, Morris, Models, Schemata */
"use strict";

/*
 * Configure chart modal
 */

Template.configureChart.rendered = function() {
    var template = this;

    function currentDataKeys() {
        var currentData = Session.get('currentData');
        if(!currentData) {
            return [];
        }

        return {
            results: currentData.fields.map(function(e) {
                return {id: e.name, text: e.name};
            })
        };
    }

    template.$(".chartType").select2();
    template.$(".xkey").select2({data: currentDataKeys});
    template.$(".ykeys").select2({data: currentDataKeys, multiple: true});

    this.setupComputation = Deps.autorun(function() {
        var currentAnalysis = Models.Analysis.getCurrent();

        template.$(".chartType").select2('val', currentAnalysis.chartSettings? currentAnalysis.chartSettings.type : null);
        template.$(".xkey").select2('val', currentAnalysis.chartSettings? currentAnalysis.chartSettings.xkey : null);
        template.$(".ykeys").select2('val', currentAnalysis.chartSettings? currentAnalysis.chartSettings.ykeys: null);
    });

    template.$(".chartModal").on('hidden.bs.modal', function() {
        var currentAnalysis = Models.Analysis.getCurrent();
        currentAnalysis.chartSettings = {
            type: template.$(".chartType").select2('val')? template.$(".chartType").select2('val') : null,
            xkey: template.$(".xkey").select2('val'),
            ykeys: template.$(".ykeys").select2('val'),
            goals: template.$(".goals").val()? template.$(".goals").val().split(',').map(function(e) { return e.trim(); }) : [],
            events: template.$(".events").val()? template.$(".events").val().split(',').map(function(e) { return e.trim(); }): [],
            preUnits: template.$(".preUnits").val(),
            postUnits: template.$(".postUnits").val(),
            smoothLines: template.$(".smoothLines:checked").length > 0,
            parseTime: template.$(".parseTime:checked").length > 0,
            stacked: template.$(".stacked:checked").length > 0
        };
        Models.Analysis.setCurrent(currentAnalysis);
    });
};

Template.configureChart.destroyed = function() {
    if(this.setupComputation) {
        this.setupComputation.stop();
    }
};

/*
 * Chart area
 */

Template.chart.rendered = function() {

    var template = this;

    this.chartComputation = Deps.autorun(function(computation) {

        var currentAnalysis = Models.Analysis.getCurrent(),
            results = Session.get('currentData'),
            chartSettings = currentAnalysis.chartSettings;

        if(!results || !results.rows || !chartSettings || !Schemata.ChartSettings.namedContext().validate(chartSettings)) {
            template.$(".chart-container").hide();
            return;
        }

        template.$(".chart-container").show();
        template.$(".chart-area").empty();

        var Chart = Morris[chartSettings.type];
        new Chart(_.extend({}, chartSettings, {
            element: template.$('.chart-area'),
            data: results.rows,
            labels: chartSettings.ykeys,
            hideHover: 'auto',
            dateFormat: chartSettings.parseTime? function(d) {
                return moment(d).format("DD/MM/YYYY");
            } : null,
            xLabelFormat: function(v) {
                if(v.label instanceof Date) {
                    return moment(v.label).format("DD/MM/YYYY");
                } else {
                    return v.label;
                }
            },
            xLabelAngle: 45
        }));

    });

};

Template.chart.destroyed = function() {
    if(this.chartComputation) {
        this.chartComputation.stop();
    }
};
