const assert = require("assert");

module.exports = function (opcua) {

    /**
    * Create a new instance of AASReferenceType representing a Reference of the AAS metamodel.
    *
    * @param {object} options
    * @param {string} options.idShort The unique identifier for the AAS. The DataType is Identifier. 
    * @param {array | object} [options.semanticId] An array of Key object composing an AAS reference or the AASReference instance itself to the Object defining semantic fot this View.
    * @param {array | object} [options.parent] An array of Key object composing an AAS reference or the AASReference instance itself to the parent Object.
    * @param {string | object | array} [options.description] A string, a LocalizedText or an Array of LocalizedText describing the Submodel.
    * @param {string} [options.browseName] The BrowseName for the AASReference Object.
    * @param {object} [options.nodeId] The string representation of the NodeId for the AASreference Object. 
    * @param {object} [options.viewOf] The parent node containing the View by means of an Organizes Reference. 
    * @returns {object} The Object Node representing the AAS View.
    * 
    * @example
    *    addressSpace.addAASView({
    *        viewOf: aas,
    *        browseName: "Maintenence"
    *    });
    */
    opcua.AddressSpace.prototype.addAASView = function(options) {

        assert(options.idShort, "options.idShort parameter is missing.")

        const addressSpace  = this;
        const namespace = addressSpace.getOwnNamespace();

        const viewType = addressSpace.findCoreAASObjectType("ViewType");

        const view = namespace.addObject({
            typeDefinition: viewType,
            browseName:    options.browseName || "View_" + options.idShort,
            nodeId:        options.nodeId
        });

        view.coreAASType = "ViewType";

        const folderType = addressSpace.findNode("FolderType").nodeId;

        const containedElements = namespace.addObject({
            typeDefinition: folderType,
            browseName: "ContainedElements",
            componentOf: view
        });

        if (typeof options.viewOf !== "undefined") {
            assert(options.viewOf instanceof opcua.UAObject, "options.viewOf is not a UAObject.");
            assert(options.viewOf.coreAASType === "AASType", "options.viewOf is not a AASType.");
            
            const views = options.viewOf.views;
            views.addReference({ referenceType: "Organizes", nodeId: view });
        }

        if (typeof options.semanticId !== "undefined") _addSemanticId(options.semanticId);

        if (typeof options.parent !== "undefined") _addParent(options.parent);

        if (typeof options.description !== "undefined") {
            assert( typeof(options.description) === "string" || 
                    options.description instanceof opcua.LocalizedText || 
                    Array.isArray(options.description), "Parameter options.description is neither a string nor a LocalizedText nor an Array.");

            let localizedTextArray = [];

            if(typeof options.description === "string") {
                localizedTextArray.push(opcua.LocalizedText.coerce(options.description));
            } else if(options.description instanceof opcua.LocalizedText) {
                localizedTextArray.push(options.description);
            } else {
                options.description.forEach(el => assert(el instanceof opcua.LocalizedText, "An element of the array is not a LocalizedText."));
                localizedTextArray = options.description;
            }

            namespace.addVariable({
                propertyOf: view,
                browseName: "description",
                dataType: "LocalizedText",
                value: {
                    get: function() {
                        return new opcua.Variant({ 
                            dataType: opcua.DataType.LocalizedText, 
                            arrayType: opcua.VariantArrayType.Array,
                            value: localizedTextArray
                        });
                    }
                },
                valueRank: 1
            });
        }

        view.addSemanticId = _addSemanticId;

        view.addParent = _addParent;

        view.addElements = (elemArray) => {
            assert(Array.isArray(elemArray), "elemArray parameter is not an Array.");
            elemArray.forEach(el => {
                assert(el instanceof opcua.UAObject, "elemArray contains an element that is not an UAObject.");
                const submodelElementType = addressSpace.findCoreAASObjectType("SubmodelElementType");
                assert(el.typeDefinitionObj.isSupertypeOf(submodelElementType), "elemArray contains an element that is not a subtype instance of SubmodelElementType."); //isSupertypeOf is confusional. It should be isSubtypeOf

                view.containedElements.addReference({ referenceType: "Organizes", nodeId: el });
            });

            return view;
        }
        
        return view;
        
        function _addSemanticId(semanticId) {
            assert(Array.isArray(semanticId) || semanticId instanceof opcua.UAObject, "semanticId is neither a UAObject or an Array of Key.");
            assert(!semanticId.hasOwnProperty("semanticId"), "the ViewType Object already contains a Component with BrowseName semanticId");
            
            if (Array.isArray(semanticId)) {

                semanticId.forEach(el => assert(el.constructor.name === "Key", "semanticId Array contains an element that is not a Key."));

                addressSpace.addAASReference({
                    componentOf: view,
                    browseName: "semanticId",
                    keys: semanticId
                });
            } 
            else {
                assert(semanticId.coreAASType === "AASReferenceType", "semanticId is not an AASReferenceType instance.");

                view.addReference({ referenceType: "HasComponent", nodeId: semanticId});
            }

            return view;
        }

        function _addParent(parent) {
            assert(Array.isArray(parent) || parent instanceof opcua.UAObject, "parent is neither a UAObject or an Array of Key.");
            assert(!parent.hasOwnProperty("parent"), "the ViewType Object already contains a Component with BrowseName parent");
            
            if (Array.isArray(parent)) {

                parent.forEach(el => assert(el.constructor.name === "Key", "parent Array contains an element that is not a Key."));

                addressSpace.addAASReference({
                    componentOf: view,
                    browseName: "parent",
                    keys: parent
                });
            } 
            else {
                assert(parent.coreAASType === "AASReferenceType", "parent is not an AASReferenceType instance.");

                view.addReference({ referenceType: "HasComponent", nodeId: parent});
            }

            return view;
        }
    }
}