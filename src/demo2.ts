import path from "path";
import { coreaasXmlFile, OPCUACertificateManager, nodesets, LocalizedText, CoreServer, IdentifierType, Kind, KeyType, KeyElements, PropertyCategory, PropertyValueType, Variant, DataType } from ".";
import { UAObject } from "node-opcua-address-space/dist/src/ua_object";

let xmlFiles = [nodesets.standard_nodeset_file, coreaasXmlFile]

let server = new CoreServer({
    nodeset_filename: xmlFiles,
    port: 4848,
    serverCertificateManager: new OPCUACertificateManager({ 
        automaticallyAcceptUnknownCertificate: true,
        rootFolder: path.join(__dirname, "../certs")
    })
})

function post_initialize() {

    const Identifier = server.coreaas.Identifier;
    const Key = server.coreaas.Key;

    let admin = server.coreaas.addAdministrativeInformation({
        version: "555",
        revision: "1825"
    });

    const aas_1 = server.coreaas.addAssetAdministrationShell({
        browseName: "SampleAAS",
        description: [  new LocalizedText({locale: "en", text: "Festo Controller"}),
                        new LocalizedText({locale: "de", text: "Festo Controller"}) ],
        identification: new Identifier({
            id: "www.admin-shell.io/aas-sample/1.0",
            idType: IdentifierType.URI
        }),
        assetRef: [new Key({
            idType: KeyType.URI,
            local: true,
            type: KeyElements.Asset,
            value: "http://pk.festo.com/3S7PLFDRS35"
        })],
        derivedFromRef: [ new Key({
            idType: KeyType.IRDI,
            local: false,
            type: KeyElements.AssetAdministrationShell,
            value: "AAA#1234-454#123456789"
        }) ],
        administration: admin
    });

    let asset = server.coreaas.addAsset({
        browseName: "3S7PLFDRS35",
        idShort: "3S7PLFDRS35",
        identification: new Identifier({
            id: "http://pk.festo.com/3S7PLFDRS35",
            idType: IdentifierType.URI
        }),
        kind: Kind.Instance,
        description: "Festo Controller Asset",
        //assetOf: aas_1,
        assetIdentificationModelRef: [ new Key({
            idType: KeyType.URI,
            local: false,
            type: KeyElements.Submodel,
            value: "//submodels/identification_3S7PLFDRS35"
        }) ]
    });

    aas_1.hasAsset(asset)
    .addSubmodelRef([new Key({
        idType: KeyType.URI,
        local: true,
        type: KeyElements.Submodel,
        value: "http://www.zvei.de/demo/submodel/12345679"
    })]);

    /**
     * Add Submodel
     */

    const submodel_type = server.coreaas.addSubmodel({
        browseName: "AAAAA",
        kind: Kind.Type,
        idShort: "AAAA",
        identification: new Identifier({
            id: "http://www.zvei.de/demo/submodel/AAAA",
            idType: IdentifierType.URI
        })
    })

    const submodel_1 = server.coreaas.addSubmodel({
        browseName: "12345679",
        kind: Kind.Instance,
        idShort: "12345679",
        identification: new Identifier({
            id: "http://www.zvei.de/demo/submodel/12345679",
            idType: IdentifierType.URI
        })
    }).submodelOf(aas_1)
    /* .addSemanticId([new Key({
        idType: KeyType.URI,
        local: true,
        type: KeyElements.Submodel,
        value: "http://www.zvei.de/demo/semantic_for_submodel"
    })]) */
    .hasSubmodelSemantic(submodel_type)
    .addParent([new Key({
        idType: KeyType.URI,
        local: true,
        type: KeyElements.AssetAdministrationShell,
        value: "www.admin-shell.io/aas-sample/1.0"
    })]);

    /**
     * Add SubmodelElementCollection
     */
    let collection = server.coreaas.addSubmodelElementCollection({
        idShort: "Measurement",
        submodelElementOf: submodel_1,
        ordered: true,
        kind: Kind.Instance
    })
    .addParent([new Key({
        idType: KeyType.URI,
        local: true,
        type: KeyElements.Submodel,
        value: "http://www.zvei.de/demo/submodel/12345679"
    })]);

    /**
     * Add SubmodelProperty
     */

    const rotationSpeed = server.coreaas.addSubmodelProperty({
        browseName: "rotationSpeed",
        idShort: "rotationSpeed",
        //submodelElementOf: submodel_1,
        category: PropertyCategory.VARIABLE,
        valueType: PropertyValueType.Double,
        value: {
            dataType: "Double",
            value: {
                get: () => {
                    return new Variant({ dataType: DataType.Double, value: 1120});
                }
            }
        }
    })
    .addSemanticId([ new Key({
        idType: KeyType.URI,
        local: true,
        type: KeyElements.ConceptDescription,
        value: "www.festo.com/dic/08111234"
    }) ])
    .addParent([new Key({
        idType: KeyType.URI,
        local: true,
        type: KeyElements.Submodel,
        value: "http://www.zvei.de/demo/submodel/12345679"
    }), 
    new Key({
        idType: KeyType.idShort,
        local: true,
        type: KeyElements.SubmodelElementCollection,
        value: "Measurement"
    })])
    .addValueId([new Key({
        idType: KeyType.URI,
        local: true,
        type: KeyElements.GlobalReference,
        value: "//value/of/rotationSpeed"
    })]);

    const nmax = server.coreaas.addSubmodelProperty({
        browseName: "NMAX",
        idShort: "NMAX",
        //submodelElementOf: submodel_1,
        semanticId: [ new Key({
            idType: KeyType.IRDI,
            local: true,
            type: KeyElements.ConceptDescription,
            value: "0173-1#02-BAA120#007"
        }) ],
        category: PropertyCategory.PARAMETER,
        valueType: PropertyValueType.Double,
        value: {
            dataType: "Double",
            value: {
                get: () => {
                    return new Variant({ dataType: DataType.Double, value: 2000});
                }
            }
        }
    });

    collection.addElements([nmax, rotationSpeed]);

    /**
     * Add Concept Dictionary
     */

    const conceptDictionary = server.coreaas.addConceptDictionary({
        browseName: "ConceptDict_1",
        idShort: "ConceptDictionary_1",
        conceptDictionaryOf: aas_1,
        description: [  new LocalizedText({locale: "en", text: "Dicitonary for the Festo Controller."}),
                        new LocalizedText({locale: "it", text: "Dizionario per il Controller Festo"}) ]
    })
    .addConceptDescriptionRef([
        new Key({
            idType: KeyType.URI,
            local: true,
            type: KeyElements.ConceptDescription,
            value: "www.festo.com/dic/08111234"
        })
    ])
    .addConceptDescriptionRef([
        new Key({
            idType: KeyType.IRDI,
            local: true,
            type: KeyElements.ConceptDescription,
            value: "0173-1#02-BAA120#007"
        })
    ]);

    /**
     * Add ConceptDescription with EmbeddedDataSpecification
     */

    const embedded_1 = server.coreaas.addEmbeddedDataSpecification({
        browseName: "EmbeddedDS_1",
        hasDataSpecification: [ new Key({
            idType: KeyType.URI,
            local: false,
            type: KeyElements.GlobalReference,
            value: "www.admin-shell.io/DataSpecificationTemplates/DataSpecificationIEC61360"
        }) ],
    })
    .addDataSpecificationIEC61360({
        identifier: "rtzspd#123",
        preferredName: "Rotation Speed",
        definition: "The Rotation Speed of something",
        dataType: "double",
        unit: "1/m",
        unitId: [ new Key({
            idType: KeyType.IRDI,
            local: false,
            type: KeyElements.GlobalReference,
            value: "0173-1#05-AAA650#002"
        }) ],
        shortName: "N",
        valueFormat: "NR1..5"
    });

    server.coreaas.addConceptDescription({
        browseName: "N",
        identification: new Identifier({
            id: "www.festo.com/dic/08111234",
            idType: IdentifierType.URI
        }),
        conceptDescriptionOf: conceptDictionary
    })
    .hasEmbeddedDataSpecifications(embedded_1)
    .semanticOf(rotationSpeed);

    //Add an EmbeddedDataSpecification to the AAS for Max Rotation Speed
    const embedded_2 = server.coreaas.addEmbeddedDataSpecification({
        browseName: "EmbeddedDS_1",
        hasDataSpecification: [ new Key({
            idType: KeyType.URI,
            local: false,
            type: KeyElements.GlobalReference,
            value: "www.admin-shell.io/DataSpecificationTemplates/DataSpecificationIEC61360"
        }) ],
    }).addDataSpecificationIEC61360(server.coreaas.addDataSpecificationIEC61360({ //notice that you can pass the DataSpecificationIEC61360Type Object as parameter
        preferredName: "Max Rotation Speed",
        shortName: "NMAX",
        valueFormat: "NR1..5",
        unitId: [ new Key({
            idType: KeyType.IRDI,
            local: false,
            type: KeyElements.GlobalReference,
            value: "0173-1#05-AAA650#002"
        }) ]
    }));

    server.coreaas.addConceptDescription({
        browseName: "NMax",
        identification: new Identifier({
            id: "0173-1#02-BAA120#007",
            idType: IdentifierType.IRDI
        }),
        hasEmbeddedDataSpecifications: embedded_2,
        conceptDescriptionOf: conceptDictionary
    })
    .semanticOf(nmax);

    /** Add View */

    let view_1 = server.coreaas.addAASView({
        idShort: "Maintenence",
        semanticId: [ new Key({
            idType: KeyType.IRDI,
            local: true,
            type: KeyElements.ConceptDescription,
            value: "EREOTO"
        }) ],
        description: [  new LocalizedText({locale: "en", text: "Festo Controller"}),
                        new LocalizedText({locale: "de", text: "Festo Controller"}) ],
        //viewOf: aas_1
    })
    .addContainedElementRef([ 
        new Key({
            idType: KeyType.URI,
            local: true,
            type: KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/12345679"
        }),
        new Key({
            idType: KeyType.idShort,
            local: true,
            type: KeyElements.Property,
            value: "NMAX"
        }) 
    ])
    .addContainedElementRef([ 
        new Key({
            idType: KeyType.URI,
            local: true,
            type: KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/12345679"
        }),
        new Key({
            idType: KeyType.idShort,
            local: true,
            type: KeyElements.Property,
            value: "rotationSpeed"
        }) 
    ])
    .containsElements([nmax, rotationSpeed]);

    aas_1.addViews([view_1]);

    /**
     * Start The OPC UA Server
     */
    server.start(function () {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}

server.initialize(post_initialize);