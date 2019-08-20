"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const builder_1 = require("./builders/builder");
/**
 * This class represents the extension part of the OPC UA Server relevant to the CoreAAS Information Model.\
 * An instance of **CoreAASExtension** provides all the methods to populate the AddressSpace with instances of the ObjectTypes coming from CoreAAS.\
 * Furthermore it provides the Constructors for the Structured DataType defined in CoreAAS and lot of utilities methods to find Nodes in the Namespace of CoreAAS.
 */
class CoreAASExtension {
    /**
     * @param addressSpace The Address Space instance of the current OPC UA Server.
     */
    constructor(addressSpace) {
        this.addressSpace = addressSpace;
        /** The complete URI of CoreAAS. */
        this.namespaceUri = "http://dieei.unict.it/coreAAS/";
        /** The absolute path to the CoreAAS xml file. */
        this.coreaasXmlFile = path.join(__dirname, "../nodesets/coreaas.xml");
        /**
         * A Map containing all the Identifiables' ids as key and the relevant UAObject as value.
         * This attribute can be useful to implement function to resolve AAS References into Objects
         * in the AddressSpace. */
        this.identifiableMap = new Map();
        this._aasBuilder = new builder_1.AASBuilder(this);
        this._administrativeBuilder = new builder_1.AdministrativeInformationBuilder(this);
        this._aasReferenceBuilder = new builder_1.AASReferenceBuilder(this);
        this._assetBuilder = new builder_1.AssetBuilder(this);
        this._submodelPropertyBuilder = new builder_1.SubmodelPropertyBuilder(this);
        this._submodelBuilder = new builder_1.SubmodelBuilder(this);
        this._dataSpecificationIECBuilder = new builder_1.DataSpecificationIEC61360Builder(this);
        this._edsBuilder = new builder_1.EmbeddedDataSpecificationBuilder(this);
        this._conceptDescriptionBuilder = new builder_1.ConceptDescriptionBuilder(this);
        this._conceptDictionaryBuilder = new builder_1.ConceptDictionaryBuilder(this);
        this._submodelElementsBuilder = new builder_1.SubmodelElementsBuilder(this);
        this._viewBuilder = new builder_1.ViewBuilder(this);
    }
    /* Getters */
    /** The Namespace instance of the CoreAAS Information Model. */
    get coreAASNamespace() {
        return this.addressSpace.getNamespace(this.namespaceUri);
    }
    /** The Namespace instance of the current Namespace. */
    get namespace() {
        return this.addressSpace.getOwnNamespace();
    }
    /** The namespace index of the CoreAAS Information Model */
    get namespaceIndex() {
        return this.addressSpace.getNamespaceIndex(this.namespaceUri);
    }
    /* CoreAAS OPCUA Types */
    /** The Constructor of the Identifier Structured DataType. */
    get Identifier() {
        const identifierDataType = this.coreAASNamespace.findDataType("Identifier");
        return this.addressSpace.getExtensionObjectConstructor(identifierDataType);
    }
    /** The Constructor of the Key Structured DataType. */
    get Key() {
        const keyDataType = this.coreAASNamespace.findDataType("Key");
        return this.addressSpace.getExtensionObjectConstructor(keyDataType);
    }
    /* AddressSpace Builder methods */
    /**
     * Create and returns an instance of AASType ObjectType in the AddressSpace.
     */
    addAssetAdministrationShell(options) {
        return this._aasBuilder.addAssetAdministrationShell(options);
    }
    addAdministrativeInformation(options) {
        return this._administrativeBuilder.addAdministrativeInformation(options);
    }
    addAASReference(options) {
        return this._aasReferenceBuilder.addAASReference(options);
    }
    addAsset(options) {
        return this._assetBuilder.addAsset(options);
    }
    addSubmodelProperty(options) {
        return this._submodelPropertyBuilder.addSubmodelProperty(options);
    }
    addReferenceElement(options) {
        return this._submodelElementsBuilder.addReferenceElement(options);
    }
    addAASFile(options) {
        return this._submodelElementsBuilder.addAASFile(options);
    }
    addSubmodelElementCollection(options) {
        return this._submodelElementsBuilder.addSubmodelElementCollection(options);
    }
    addSubmodel(options) {
        return this._submodelBuilder.addSubmodel(options);
    }
    addAASView(options) {
        return this._viewBuilder.addAASView(options);
    }
    addDataSpecificationIEC61360(options) {
        return this._dataSpecificationIECBuilder.addDataSpecificationIEC61360(options);
    }
    addEmbeddedDataSpecification(options) {
        return this._edsBuilder.addEmbeddedDataSpecification(options);
    }
    addConceptDescription(options) {
        return this._conceptDescriptionBuilder.addConceptDescription(options);
    }
    addConceptDictionary(options) {
        return this._conceptDictionaryBuilder.addConceptDictionary(options);
    }
    /* Utility methods */
    findCoreAASObjectType(name) {
        return this.addressSpace.findObjectType(name, this.namespaceIndex);
    }
    findCoreAASReferenceType(name) {
        return this.addressSpace.findReferenceType(name, this.namespaceIndex);
    }
    findCoreAASVariableType(name) {
        return this.addressSpace.findVariableType(name, this.namespaceIndex);
    }
    findCoreAASDataType(name) {
        return this.addressSpace.findDataType(name, this.namespaceIndex);
    }
    getAASType() {
        return this.findCoreAASObjectType("AASType");
    }
    getAdministrativeInformationType() {
        return this.findCoreAASObjectType("AdministrativeInformationType");
    }
    getAssetType() {
        return this.findCoreAASObjectType("AssetType");
    }
    getAASReferenceType() {
        return this.findCoreAASObjectType("AASReferenceType");
    }
}
exports.CoreAASExtension = CoreAASExtension;
//# sourceMappingURL=CoreAASExtension.js.map