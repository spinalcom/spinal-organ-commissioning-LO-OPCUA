"use strict";
/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = exports.networkService = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const processBind_1 = require("./processBind");
exports.networkService = new spinal_model_bmsnetwork_1.NetworkService();
/**
 * @export
 * @class Utils
 */
class Utils {
    constructor() {
        this.processBind = new processBind_1.ProcessBind();
        this.ATTRIBUTE_NAME = "controlValue";
        this.INIT_ZONE_MODE = "initZoneMode";
        this.ATTRIBUTE_CATEGORY_NAME = "default";
        this.DEFAULT_COMMAND_VALUE = "null";
        this.store_filter = "SRG_ELE_Moteur store";
    }
    /**
     

    /**
     * Function that returns Positions from an equipment context
     * @param  {string} contextName
     * @param  {string} categoryName
     * @param  {string} GroupName
     * @returns Promise
     */
    async getPositions(ContextName, CategoryName, GroupName) {
        try {
            const Context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(ContextName);
            if (!Context) {
                console.log("Context not found");
                return [];
            }
            const ContextID = Context.info.id.get();
            const category = (await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(ContextID, ["hasCategory"])).find(child => child.name.get() === CategoryName);
            if (!category) {
                console.log("Category 'Typologie' not found");
                return [];
            }
            const categoryID = category.id.get();
            const Groups = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(categoryID, ["hasGroup"]);
            if (Groups.length === 0) {
                console.log("No groups found under the category");
                return [];
            }
            const PosGroup = Groups.find(bmsgroup => bmsgroup.name.get() === GroupName);
            if (!PosGroup) {
                console.log("Group 'Positions de travail' not found");
                return [];
            }
            //console.log("Group 'Positions de travail' found:", PosGroup);
            const Positions = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(PosGroup.id.get(), ["groupHasBIMObject"]);
            if (Positions.length === 0) {
                console.log("No positions found in the bmsgroup");
                return [];
            }
            //console.log("Positions found:", Positions);
            return Positions;
        }
        catch (error) {
            console.error("Error in getPositions:", error);
            return [];
        }
    }
    async getCommandControlPoint(workpositionId, controlPointName) {
        const NODE_TO_CONTROL_POINTS_RELATION = "hasControlPoints";
        const CONTROL_POINTS_TO_BMS_ENDPOINT_RELATION = "hasBmsEndpoint";
        // Fetch all control points associated with the work position
        const allControlPoints = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(workpositionId, [NODE_TO_CONTROL_POINTS_RELATION]);
        if (allControlPoints.length > 0) {
            for (const controlPoint of allControlPoints) {
                // Fetch all BMS endpoints associated with the control point
                const allBmsEndpoints = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(controlPoint.id.get(), [CONTROL_POINTS_TO_BMS_ENDPOINT_RELATION]);
                if (allBmsEndpoints.length > 0) {
                    for (const bmsEndPoint of allBmsEndpoints) {
                        // Check if the BMS endpoint matches the criteria
                        if (bmsEndPoint.name.get() === controlPointName) {
                            const nodeElement = await bmsEndPoint.element.load();
                            if (nodeElement.get().command === 1) {
                                return bmsEndPoint; // Return the matching endpoint
                            }
                        }
                    }
                }
            }
        }
        // Return undefined if no matching endpoint is found
        return undefined;
    }
    async getGroupsForPosition(workpositionId) {
        const result = [];
        const NetworkGrp = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(workpositionId, ["hasNetworkTreeGroup"]);
        if (NetworkGrp.length !== 0) {
            for (const netGRP of NetworkGrp) {
                // A position can have multiple network groups
                const bmsGrp = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(netGRP.id.get(), ["hasBmsEndpoint"]);
                if (bmsGrp.length !== 0) {
                    const bmsendpoint = (await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(bmsGrp[0].id.get(), ["hasBmsEndpoint"]))
                        .find(child => child.name.get() === "Value");
                    if (bmsendpoint !== undefined) {
                        result.push({ bmsgroup: bmsGrp[0], Netgroup: netGRP, endpoint: bmsendpoint });
                    }
                }
            }
        }
        return result;
    }
    // function to get stores linked to position 
    async getStoreForPosition(workpositionId) {
        const result = [];
        const bimObjects = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(workpositionId, ["hasNetworkTreeBimObject"]);
        const stores = bimObjects.filter(x => x.name.get().includes(this.store_filter));
        if (stores.length !== 0) {
            for (const store of stores) {
                // A position can have multiple network groups
                const canal = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(store.id.get(), ["hasBmsEndpoint"]);
                if (canal.length !== 0) {
                    const bmsendpoint = (await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(canal[0].id.get(), ["hasBmsEndpoint"]))
                        .find(child => child.name.get() === "Sig_Hauteur");
                    if (bmsendpoint !== undefined) {
                        result.push({ canal: canal[0], Motstore: store, endpoint: bmsendpoint });
                    }
                }
            }
        }
        return result;
    }
    /*public async getGroupsForPosition(workpositionId: string): Promise<Array<{ bmsgroup: SpinalNodeRef}>> {
        const result: Array<{ bmsgroup: SpinalNodeRef}> = [];
        const NetworkGrp = await SpinalGraphService.getChildren(workpositionId, ["hasNetworkTreeGroup"]);
    
        if (NetworkGrp.length !== 0) {
            for (const netGRP of NetworkGrp) {
                // A position can have multiple network groups
                const bmsGrp = await SpinalGraphService.getChildren(netGRP.id.get(), ["hasBmsEndpoint"]);
                if (bmsGrp.length !== 0) {
                    const bmsendpoint = (await SpinalGraphService.getChildren(bmsGrp[0].id.get(), ["hasBmsEndpoint"]))
                        .find(child => child.name.get() === "Value");
    
                    if (bmsendpoint !== undefined) {
                        result.push({ bmsgroup: bmsGrp[0]});
                    }
                }
            }
        }
    
    
        return result;
    }*/
    async getZone(bmsGrpId, grpname) {
        const networkgrps = (await spinal_env_viewer_graph_service_1.SpinalGraphService.getParents(bmsGrpId, ["hasBmsEndpoint"])).filter(x => x.name.get() === grpname);
        //console.log(networkgrps)
        for (const networkgrp of networkgrps) {
            const parentGroups = await spinal_env_viewer_graph_service_1.SpinalGraphService.getParents(networkgrp.id.get(), ["hasNetworkTreeGroup"]);
            if (parentGroups.length != 0) {
                //console.log(parentGroups)
                const zone = parentGroups.find(x => { var _a; return ((_a = x.subtype) === null || _a === void 0 ? void 0 : _a.get()) === "zone"; });
                if (zone) {
                    return zone; // Return the first matching zone
                }
            }
        }
        return null; // Return null if no zone is found
    }
    async changezoneMode(zone) {
        const bmszone = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(zone.id.get(), ["hasBmsEndpoint"]);
        //console.log(bmszone[0].name.get())
        const bmsendpoint = (await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(bmszone[0].id.get(), ["hasBmsEndpoint"]))
            .find(child => child.name.get() === "Mode fonctionnement");
        //console.log(bmsendpoint.name.get())
        let currentvalue = (await bmsendpoint.element.load()).currentValue.get();
        console.log("current value for  ", zone.name.get(), ":", currentvalue);
        //if (currentvalue=="0"){
        const zoneNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmszone[0].id.get());
        const endpointNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmsendpoint.id.get());
        //update controlvalue attribute pour la zone 
        //await this.updateControlValueAttribute(zoneNode, this.ATTRIBUTE_CATEGORY_NAME, this.ATTRIBUTE_NAME, "1");
        //zoneNode.info.directModificationDate.set(Date.now());
        //update controlvalue attribute pour le endpoint mode de fonctionnement
        const initZoneAttribute = await this.updateControlValueAttribute(endpointNode, this.ATTRIBUTE_CATEGORY_NAME, this.INIT_ZONE_MODE, "0");
        await this.updateControlValueAttribute(endpointNode, this.ATTRIBUTE_CATEGORY_NAME, this.ATTRIBUTE_NAME, "1");
        endpointNode.info.directModificationDate.set(Date.now()); // 
        return initZoneAttribute;
        //}
    }
    _waitModeChange(value) {
        return new Promise((resolve, reject) => {
            this.processBind.addBind(value, () => {
                if (value.get() == 1) {
                    this.processBind.unbind(value);
                    resolve(value);
                    return;
                }
                else if (value.get() == -1) {
                    this.processBind.unbind(value);
                    reject("opcua request failed");
                    return;
                }
            });
            // const bindProcess = value.bind(() => {
            //     if (value.get() == 1) {
            //         value.unbind(bindProcess);
            //         resolve(value);
            //         return;
            //     } else if (value.get() == -1) {
            //         value.unbind(bindProcess);
            //         reject("opcua request failed");
            //         return;
            //     }
            // });
        });
    }
    /* public async checkAndUpdateMode(zone: any, posinfo: any, controlPoint: any) {
        try {
            
            const attribute = await this.changezoneMode(zone);
            await this._waitModeChange(attribute.value);

            // Mettre à jour la valeur du groupe
            const valueToPush = (await controlPoint.element.load()).currentValue.get();
            await this.updateGrpValue(posinfo.bmsgroup, valueToPush, posinfo.endpoint);
        } catch (error) {
            console.error("error in checkAndUpdateMode", error);

        }
    }*/
    async checkAndUpdateMode(zonedata, controlPoint) {
        try {
            for (const data of zonedata) {
                const attribute = await this.changezoneMode(data.zoneNode);
                await this._waitModeChange(attribute.value);
                for (const groupe of data.groupes) {
                    // Mettre à jour la valeur du groupe
                    const valueToPush = (await controlPoint.element.load()).currentValue.get();
                    await this.updateGrpValue(groupe.bmsGrp, valueToPush, groupe.endpoint);
                }
            }
        }
        catch (error) {
            console.error("error in checkAndUpdateMode", error);
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////
    // // Vérifier la valeur du mode de fonctionnement
    // const currentMode = (await controlPoint.element.load()).currentValue.get();
    // if (currentMode === 1) {
    //     // Attendre que l'organe de contrôle OPCUA mette la valeur à -1
    //     while ((await controlPoint.element.load()).currentValue.get() !== -1) {
    //         await new Promise(resolve => setTimeout(resolve, 100)); // Attendre 100ms
    //     }
    //     // Mettre à jour la valeur du groupe
    //     const valueToPush = (await controlPoint.element.load()).currentValue.get();
    //     await this.updateGrpValue(posinfo.bmsgroup, valueToPush, posinfo.endpoint);
    // }
    /**
        * Function that search for the targeted attribute of a node and update it's value
        * @param  {SpinalNode} endpointNode
        * @param  {any} valueToPush
        * @returns Promise
        */
    async updateControlValueAttribute(endpointNode, attributeCategoryName, attributeName, valueToPush) {
        const attribute = await this._getEndpointControlValue(endpointNode, attributeCategoryName, attributeName);
        if (attribute) {
            attribute.value.set(valueToPush);
            console.log(attributeName + " ==>  is updated with the value : " + attribute.value);
            return attribute;
        }
        else {
            console.log(valueToPush + " value to push in node : " + endpointNode.info.name.get() + " -- ABORTED !");
        }
    }
    /**
        * Function that search and return the targeted attribute. Creates it if it doesn't exist with a default value of null
        * @param  {SpinalNode} endpointNode
        * @returns Promise
        */
    async _getEndpointControlValue(endpointNode, attributeCategoryName, attributeName) {
        const attribute = await spinal_env_viewer_plugin_documentation_service_1.attributeService.findOneAttributeInCategory(endpointNode, attributeCategoryName, attributeName);
        if (attribute != -1)
            return attribute;
        return spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategoryName(endpointNode, this.ATTRIBUTE_CATEGORY_NAME, attributeName, this.DEFAULT_COMMAND_VALUE);
    }
    async updateGrpValue(bmsgrpDALI, valueToPush, valueEndpoint) {
        const grpNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmsgrpDALI.id.get());
        const endpointNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(valueEndpoint.id.get());
        //update controlValue attribute for the group
        //await this.updateControlValueAttribute(grpNode, this.ATTRIBUTE_CATEGORY_NAME, this.ATTRIBUTE_NAME, valueToPush);
        //grpNode.info.directModificationDate.set(Date.now());
        //update controlValue attribute for the endpoint
        console.log("updating endpoint value for group", grpNode.info.name.get(), "with value:", valueToPush);
        await this.updateControlValueAttribute(endpointNode, this.ATTRIBUTE_CATEGORY_NAME, this.ATTRIBUTE_NAME, valueToPush);
        endpointNode.info.directModificationDate.set(Date.now());
    }
    /*public async BindPositionToGrpDALI(
        position: SpinalNodeRef,
        controlPoint: SpinalNodeRef,
        posinfo: { bmsgroup: SpinalNodeRef; Netgroup: SpinalNodeRef; endpoint: SpinalNodeRef }
    ) {
        if (controlPoint != undefined) {
            console.log("control point ",controlPoint.name.get());
    
            let CPmodifDate = controlPoint.directModificationDate;
            console.log("DirectmodificationDate",CPmodifDate.get());
    
            CPmodifDate.bind(async () => {
                console.log("Control Point modified",controlPoint.name.get());
                
                    let zone = await this.getZone(posinfo.bmsgroup.id.get(), posinfo.bmsgroup.name.get());
                    if (zone != null) {                    console.log(
                            "Position",
                            position.name.get(),
                            "has zone",
                            zone.name.get()
                        );
                        await this.changezoneMode(zone);
                        let valueToPush = (await controlPoint.element.load()).currentValue.get();
                        await this.updateGrpValue(posinfo.bmsgroup, valueToPush,posinfo.endpoint);
                    }
                
            },false);
        }
    
    }*/
    async BindPositionsToGrpDALI(posList) {
        for (const item of posList) {
            const { CP: controlPoint, PosINFO } = item;
            // Vérifier si controlPoint et PosINFO sont valides
            if (controlPoint != undefined && PosINFO.length > 0) {
                //console.log("Binding control point:", controlPoint.name.get(), "for position", position.name.get());
                let CPmodifDate = controlPoint.directModificationDate;
                //console.log("DirectModificationDate for", controlPoint.name.get(), ":", CPmodifDate.get(), [CPmodifDate._server_id]);
                // Surveiller les modifications pour ce controlPoint
                this.processBind.addBind(CPmodifDate, 
                // CPmodifDate.bind(async () => {
                async () => {
                    console.log("Control Point modified:", controlPoint.name.get());
                    await this.bindControlPointCallBack(item);
                });
                // }, false);
            }
        }
    }
    async updateEndpointValue(endpoint, valueToPush) {
        const endpointNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(endpoint.id.get());
        //update controlValue attribute for the endpoint sig_Hauteur
        await this.updateControlValueAttribute(endpointNode, this.ATTRIBUTE_CATEGORY_NAME, this.ATTRIBUTE_NAME, valueToPush);
        endpointNode.info.directModificationDate.set(Date.now());
    }
    async BindStoresControlPoint(posList) {
        for (const item of posList) {
            const { position, CP: controlPoint, storeINFO } = item;
            // Vérifier si controlPoint et PosINFO sont valides
            if (controlPoint != undefined && storeINFO.length > 0) {
                //console.log("Binding control point:", controlPoint.name.get(), "for position", position.name.get());
                let CPmodifDate = controlPoint.directModificationDate;
                //console.log("DirectModificationDate for", controlPoint.name.get(), ":", CPmodifDate.get(), [CPmodifDate._server_id]);
                // Surveiller les modifications pour ce controlPoint
                // CPmodifDate.bind(async () => {
                this.processBind.addBind(CPmodifDate, async () => {
                    console.log("Control Point modified:", controlPoint.name.get());
                    for (const info of storeINFO) {
                        const endpValue = (await controlPoint.element.load()).currentValue.get();
                        await this.updateEndpointValue(info.endpoint, endpValue);
                    }
                });
                // }, false);
            }
        }
    }
    /*private async bindControlPointCallBack(PositionData: PositionData) {
        const { position, CP: controlPoint, PosINFO } = PositionData;

        for (const posinfo of PosINFO) {
            const zone = await this.getZone(posinfo.bmsgroup.id.get(), posinfo.bmsgroup.name.get());
            if (zone) {
                console.log("Position", position.name.get(), "has zone", zone.name.get());

                await this.checkAndUpdateMode(zone, posinfo, controlPoint);
            }
        }
    }*/
    async bindControlPointCallBack(PositionData) {
        const { position, CP: controlPoint, PosINFO } = PositionData;
        const zoneData = [];
        for (const posinfo of PosINFO) {
            const zone = await this.getZone(posinfo.bmsgroup.id.get(), posinfo.bmsgroup.name.get());
            if (zone) {
                const zoneId = zone.id.get();
                const existingZoneEntry = zoneData.find(entry => entry.zoneNode.id.get() === zoneId);
                const groupEntry = {
                    bmsGrp: posinfo.bmsgroup,
                    endpoint: posinfo.endpoint
                };
                if (existingZoneEntry) {
                    // Évite les doublons en vérifiant l'id du bmsGrp
                    const isDuplicate = existingZoneEntry.groupes.some(g => g.bmsGrp.id.get() === posinfo.bmsgroup.id.get());
                    if (!isDuplicate) {
                        existingZoneEntry.groupes.push(groupEntry);
                    }
                }
                else {
                    zoneData.push({
                        zoneNode: zone,
                        groupes: [groupEntry]
                    });
                }
                console.log("Group DALI", posinfo.bmsgroup.name.get(), "has zone", zone.name.get());
            }
        }
        await this.checkAndUpdateMode(zoneData, controlPoint);
    }
    async getTempEndpoint(positionID) {
        try {
            const PosParents = await spinal_env_viewer_graph_service_1.SpinalGraphService.getParents(positionID, ["hasNetworkTreeBimObject"]);
            if (PosParents.length === 0)
                return undefined;
            const zoneTemp = PosParents.find((parent) => { var _a; return ((_a = parent.subtype) === null || _a === void 0 ? void 0 : _a.get()) === "zone_temperature"; });
            if (zoneTemp == undefined)
                return undefined;
            const zonefilter = (zoneTemp.name.get()).split("-")[1];
            const automate = await spinal_env_viewer_graph_service_1.SpinalGraphService.getParents(zoneTemp.id.get(), ["hasNetworkTreeGroup"]);
            if (automate.length === 0)
                return undefined;
            const bmsAutomate = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(automate[0].id.get(), ["hasBmsDevice"]);
            if (bmsAutomate.length === 0)
                return undefined;
            const bmsendpointGroup = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(bmsAutomate[0].id.get(), ["hasBmsEndpointGroup"]);
            if (bmsendpointGroup.length === 0)
                return undefined;
            const analog_values = bmsendpointGroup.find((child) => child.name.get() === "analog_value");
            if (analog_values === undefined)
                return undefined;
            const bmsendpoints = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(analog_values.id.get(), ["hasBmsEndpoint"]);
            if (bmsendpoints.length === 0)
                return undefined;
            const endpoint = bmsendpoints.find((child) => (child.name.get()).includes("X3") && (child.name.get()).includes(zonefilter));
            if (endpoint === undefined)
                return undefined;
            return (endpoint);
        }
        catch (error) {
            const realposition = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(positionID);
            console.log(realposition._server_id, "getTempEndpoint ERROR for position", realposition.info.name.get());
        }
    }
    async BindTempControlPoint(TempDataList) {
        for (const item of TempDataList) {
            const { position, CP: controlPoint, TempEndpoint } = item;
            if (controlPoint != undefined && TempEndpoint != undefined) {
                // console.log("Binding Temperature control point:", controlPoint.name.get(), "for position", position.name.get());
                let CPmodifDate = controlPoint.directModificationDate;
                // console.log("DirectModificationDate for", controlPoint.name.get(), ":", CPmodifDate.get(), [CPmodifDate._server_id]);
                // Surveiller les modifications pour ce controlPoint
                // CPmodifDate.bind(async () => {
                this.processBind.addBind(CPmodifDate, async () => {
                    console.log("Control Point modified:", controlPoint.name.get());
                    const endpValue = (await controlPoint.element.load()).currentValue.get();
                    await this.updateEndpointValue(TempEndpoint, endpValue);
                });
                // }, false);
            }
        }
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map