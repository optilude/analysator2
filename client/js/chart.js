/* global moment, Morris, Models */
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

    Deps.autorun(function() {
        var currentAnalysis = Models.Analysis.getCurrent();

        template.$(".chartType").select2('val', currentAnalysis.chartSettings.type);
        template.$(".xkey").select2('val', currentAnalysis.chartSettings.xkey);
        template.$(".ykeys").select2('val', currentAnalysis.chartSettings.ykeys);
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

/*
 * Chart area
 */

Template.chart.rendered = function() {

    var template = this;

    Deps.autorun(function(c) {

        // Stop if the template is removed from the dom
        if(template.__component__.dom.parentNode() === null) {
            c.stop();
            return;
        }

        var currentAnalysis = Models.Analysis.getCurrent(),
            results = Session.get('currentData'),
            chartSettings = currentAnalysis.chartSettings;

        if(!results || !results.rows || !chartSettings || !chartSettings.type) {
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
            dateFormat: chartSettings.parseTime? function(d) { return moment(d).format("DD/MM/YYYY"); } : null,
            xLabelAngle: 45
        }));

    });

};