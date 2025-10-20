sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'kassabericht/kassaberichtgrawe/test/integration/FirstJourney',
		'kassabericht/kassaberichtgrawe/test/integration/pages/ZC_KB_MONITORList',
		'kassabericht/kassaberichtgrawe/test/integration/pages/ZC_KB_MONITORObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZC_KB_MONITORList, ZC_KB_MONITORObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('kassabericht/kassaberichtgrawe') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZC_KB_MONITORList: ZC_KB_MONITORList,
					onTheZC_KB_MONITORObjectPage: ZC_KB_MONITORObjectPage
                }
            },
            opaJourney.run
        );
    }
);