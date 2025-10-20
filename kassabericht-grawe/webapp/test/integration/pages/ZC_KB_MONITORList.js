sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'kassabericht.kassaberichtgrawe',
            componentId: 'ZC_KB_MONITORList',
            contextPath: '/ZC_KB_MONITOR'
        },
        CustomPageDefinitions
    );
});