sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function(Fragment, MessageToast) {
    'use strict';

    let _oPreviewDialog = null;

    return {
        onPreviewAttachment: function(oBindingContext, aSelectedContexts) {
            if (!aSelectedContexts || aSelectedContexts.length === 0) {
                MessageToast.show("Bitte wählen Sie einen Anhang aus");
                return;
            }

            const oSelectedContext = aSelectedContexts[0];
            const oData = oSelectedContext.getObject();
            const sFilename = oData.Filename;
            const oModel = oSelectedContext.getModel();
            const sServiceUrl = oModel.getServiceUrl();
            const sContextPath = oSelectedContext.getPath();
            const sAttachmentUrl = sServiceUrl + sContextPath + "/Attachment";

            if (!sAttachmentUrl) {
                MessageToast.show("Keine Datei zum Anzeigen verfügbar");
                return;
            }

            const updateDialog = function() {
                const oFileNameText = Fragment.byId("attachmentPreviewDialog", "previewFileName");
                const oPdfViewer = Fragment.byId("attachmentPreviewDialog", "pdfViewer");
                const pdfHtml = '<iframe src="' + sAttachmentUrl + '" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"></iframe>';

                if (oFileNameText) oFileNameText.setText(sFilename);
                if (oPdfViewer) oPdfViewer.setContent(pdfHtml);
            };

            if (!_oPreviewDialog) {
                Fragment.load({
                    id: "attachmentPreviewDialog",
                    name: "kassabericht.kassaberichtgrawe.ext.fragment.AttachmentPreview",
                    controller: {
                        onClosePreview: function() {
                            if (_oPreviewDialog) {
                                _oPreviewDialog.close();
                            }
                        }
                    }
                }).then(function(oDialog) {
                    _oPreviewDialog = oDialog;
                    updateDialog();
                    oDialog.open();
                });
            } else {
                updateDialog();
                _oPreviewDialog.open();
            }
        }
    };
});
