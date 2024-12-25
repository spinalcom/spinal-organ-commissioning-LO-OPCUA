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
exports.networkService = new spinal_model_bmsnetwork_1.NetworkService();
/**
 * @export
 * @class Utils
 */
class Utils {
    constructor() {
        this.ATTRIBUTE_NAME = "controlValue";
        this.ATTRIBUTE_CATEGORY_NAME = "default";
        this.DEFAULT_COMMAND_VALUE = "null";
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
    async getCommandControlPoint(workpositionId) {
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
                        if (bmsEndPoint.name.get() === "COMMAND_LIGHT") {
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
        console.log("current value for zone mode ", currentvalue);
        //if (currentvalue=="0"){
        const zoneNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmszone[0].id.get());
        const endpointNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmsendpoint.id.get());
        //update controlvalue attribute pour la zone 
        await this.updateControlValueAttribute(zoneNode, this.ATTRIBUTE_CATEGORY_NAME, this.ATTRIBUTE_NAME, "1");
        zoneNode.info.directModificationDate.set(Date.now());
        //update controlvalue attribute pour le endpoint mode de fonctionnement
        await this.updateControlValueAttribute(endpointNode, this.ATTRIBUTE_CATEGORY_NAME, this.ATTRIBUTE_NAME, "1");
        endpointNode.info.directModificationDate.set(Date.now()); // 
        //}
    }
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
            console.log(endpointNode.info.name.get() + " ==>  is updated with the value : " + attribute.value);
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
        return spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategoryName(endpointNode, this.ATTRIBUTE_CATEGORY_NAME, this.ATTRIBUTE_NAME, this.DEFAULT_COMMAND_VALUE);
    }
    async updateGrpValue(bmsgrpDALI, valueToPush, valueEndpoint) {
        const grpNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmsgrpDALI.id.get());
        const endpointNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(valueEndpoint.id.get());
        //update controlValue attribute for the group
        await this.updateControlValueAttribute(grpNode, this.ATTRIBUTE_CATEGORY_NAME, this.ATTRIBUTE_NAME, valueToPush);
        grpNode.info.directModificationDate.set(Date.now());
        //update controlValue attribute for the endpoint
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
            const { position, CP: controlPoint, PosINFO } = item;
            // Vérifier si controlPoint et PosINFO sont valides
            if (controlPoint != undefined && PosINFO.length > 0) {
                console.log("Binding control point:", controlPoint.name.get(), "for position", position.name.get());
                let CPmodifDate = controlPoint.directModificationDate;
                console.log("DirectModificationDate for", controlPoint.name.get(), ":", CPmodifDate.get());
                // Surveiller les modifications pour ce controlPoint
                CPmodifDate.bind(async () => {
                    console.log("Control Point modified:", controlPoint.name.get());
                    // Parcourir toutes les objets de PosINFO (en cas de plusieurs groupes pour une position)
                    for (const posinfo of PosINFO) {
                        const zone = await this.getZone(posinfo.bmsgroup.id.get(), posinfo.bmsgroup.name.get());
                        if (zone != null) {
                            console.log("Position", position.name.get(), "has zone", zone.name.get());
                            await this.changezoneMode(zone);
                            const valueToPush = (await controlPoint.element.load()).currentValue.get();
                            await this.updateGrpValue(posinfo.bmsgroup, valueToPush, posinfo.endpoint);
                        }
                    }
                }, false);
            }
        }
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map