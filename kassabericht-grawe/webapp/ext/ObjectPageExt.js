sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(ControllerExtension, Fragment, MessageBox, MessageToast) {
    'use strict';

    return ControllerExtension.extend("kassabericht.kassaberichtgrawe.ext.ObjectPageExt", {

        _selectedFile: null,
        _oAttachmentDialog: null,

        override: {
            editFlow: {
                onBeforeCreate: function(oEvent, mParameters) {
                    if (mParameters && mParameters.contextPath &&
                        mParameters.contextPath.indexOf("_Attachments") > -1) {

                        console.log("=== Create button clicked for attachments ===");

                        this.openUploadDialog();

                        return new Promise(function(resolve, reject) {
                            // Store the resolve/reject for later use
                            this._createPromiseResolve = resolve;
                            this._createPromiseReject = reject;
                        }.bind(this));
                    }
                }
            }
        },

        openUploadDialog: function() {
            console.log("=== onUploadFile called ===");

            if (!this._oAttachmentDialog) {
                console.log("=== Loading fragment ===");
                Fragment.load({
                    id: "attachmentUploadDialog",
                    name: "kassabericht.kassaberichtgrawe.ext.fragment.AttachmentUpload",
                    controller: this
                }).then(function(oDialog) {
                    console.log("=== Fragment loaded ===");
                    this._oAttachmentDialog = oDialog;
                    this.base.getView().addDependent(this._oAttachmentDialog);
                    console.log("=== Opening dialog ===");
                    this._oAttachmentDialog.open();
                }.bind(this)).catch(function(error) {
                    console.error("=== Error loading fragment ===", error);
                });
            } else {
                console.log("=== Opening cached dialog ===");
                this._oAttachmentDialog.open();
            }
        },

        onFileChange: function(oEvent) {
            console.log("=== onFileChange called ===");

            const oFileUploader = oEvent.getSource();
            const file = oFileUploader.oFileUpload.files[0];

            if (file) {
                if (!file.name.toLowerCase().endsWith('.pdf')) {
                    MessageToast.show("Bitte wählen Sie eine PDF-Datei aus");
                    oFileUploader.clear();
                    this._selectedFile = null;
                    return;
                }

                if (file.type !== 'application/pdf') {
                    MessageToast.show("Ungültiger Dateityp. Erwartet: PDF");
                    oFileUploader.clear();
                    this._selectedFile = null;
                    return;
                }

                const maxSize = 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    MessageToast.show("Dateigröße darf 10MB nicht überschreiten");
                    oFileUploader.clear();
                    this._selectedFile = null;
                    return;
                }

                this._selectedFile = file;
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                console.log("PDF selected:", file.name, "Size:", sizeMB, "MB");
                MessageToast.show("PDF ausgewählt: " + file.name + " (" + sizeMB + " MB)");

                const oFileNameText = Fragment.byId("attachmentUploadDialog", "fileNameText");
                const oFileTypeText = Fragment.byId("attachmentUploadDialog", "fileTypeText");
                const oFileSizeText = Fragment.byId("attachmentUploadDialog", "fileSizeText");

                if (oFileNameText) oFileNameText.setText(file.name);
                if (oFileTypeText) oFileTypeText.setText(file.type);
                if (oFileSizeText) oFileSizeText.setText(sizeMB + " MB");
            }
        },

        onUploadAttachment: function() {
            console.log("=== onUploadAttachment called ===");

            if (!this._selectedFile) {
                MessageBox.warning("Bitte wählen Sie eine PDF-Datei aus.");
                return;
            }

            const file = this._selectedFile;

            if (!file.name.toLowerCase().endsWith('.pdf')) {
                MessageToast.show("Bitte wählen Sie eine PDF-Datei aus");
                return;
            }

            if (file.type !== 'application/pdf') {
                MessageToast.show("Ungültiger Dateityp. Erwartet: PDF");
                return;
            }

            const maxSize = 10 * 1024 * 1024; 
            if (file.size > maxSize) {
                MessageToast.show("Dateigröße darf 10MB nicht überschreiten");
                return;
            }

            const oModel = this.base.getView().getModel();

            sap.ui.core.BusyIndicator.show();

            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    const base64Content = e.target.result.split(',')[1];
                    console.log("PDF file read successfully");
                    console.log("File name:", file.name);
                    console.log("File size:", file.size, "bytes");

                    const oParentContext = this.base.getView().getBindingContext();
                    console.log("Parent context:", oParentContext.getPath());

                    console.log("=== Creating new attachment ===");
                    const oListBinding = oModel.bindList("/ZC_KB_ATT", oParentContext);
                    const oNewContext = oListBinding.create({
                        Kassaguid: oParentContext.getProperty("Guid"),
                        Filename: file.name,
                        Mimetype: file.type,
                        Filesize: file.size,
                        Attachment: base64Content
                    });

                    oNewContext.created()
                        .then(function() {
                            sap.ui.core.BusyIndicator.hide();
                            console.log("=== PDF attachment created successfully ===");
                            MessageToast.show("PDF erfolgreich hochgeladen: " + file.name);

                            if (this._createPromiseResolve) {
                                this._createPromiseResolve();
                                this._createPromiseResolve = null;
                                this._createPromiseReject = null;
                            }

                            this._cleanup();
                        }.bind(this))
                        .catch(function(oError) {
                            sap.ui.core.BusyIndicator.hide();
                            console.error("=== Error creating attachment ===", oError);
                            MessageBox.error("Fehler beim Hochladen der PDF-Datei", {
                                title: "Upload-Fehler",
                                details: oError.message || oError.toString()
                            });

                            if (this._createPromiseReject) {
                                this._createPromiseReject(oError);
                                this._createPromiseResolve = null;
                                this._createPromiseReject = null;
                            }
                        }.bind(this));
                } catch (error) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("=== Processing error ===", error);
                    MessageBox.error("Fehler beim Verarbeiten der PDF-Datei", {
                        title: "Verarbeitungsfehler",
                        details: error.toString()
                    });

                    if (this._createPromiseReject) {
                        this._createPromiseReject(error);
                        this._createPromiseResolve = null;
                        this._createPromiseReject = null;
                    }
                }
            }.bind(this);

            reader.onerror = function() {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("Fehler beim Lesen der Datei");
                console.error("FileReader error");

                if (this._createPromiseReject) {
                    this._createPromiseReject(new Error("File read error"));
                    this._createPromiseResolve = null;
                    this._createPromiseReject = null;
                }
            }.bind(this);

            reader.readAsDataURL(file);
        },

        _cleanup: function() {
            console.log("=== Cleaning up and closing dialog ===");

            this._selectedFile = null;

            const oFileUploader = Fragment.byId("attachmentUploadDialog", "fileUploader");
            const oFileNameText = Fragment.byId("attachmentUploadDialog", "fileNameText");
            const oFileTypeText = Fragment.byId("attachmentUploadDialog", "fileTypeText");
            const oFileSizeText = Fragment.byId("attachmentUploadDialog", "fileSizeText");

            if (oFileUploader) oFileUploader.clear();
            if (oFileNameText) oFileNameText.setText("");
            if (oFileTypeText) oFileTypeText.setText("");
            if (oFileSizeText) oFileSizeText.setText("");

            if (this._oAttachmentDialog) {
                this._oAttachmentDialog.close();
            }
        },

        onCancelUpload: function() {
            console.log("=== onCancelUpload called ===");

            if (this._createPromiseReject) {
                this._createPromiseReject(new Error("Upload cancelled"));
                this._createPromiseResolve = null;
                this._createPromiseReject = null;
            }

            this._cleanup();
        }
    });
});
