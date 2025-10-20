sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'kassabericht.kassaberichtgrawe',
            componentId: 'ZC_KB_MONITORObjectPage',
            contextPath: '/ZC_KB_MONITOR'
        },
        CustomPageDefinitions
    );
});