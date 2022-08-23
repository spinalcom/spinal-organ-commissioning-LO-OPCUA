"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const spinal_model_bacnet_1 = require("spinal-model-bacnet");
const endpointToOrgan = new Map();
const endpointToDevices = new Map();
exports.default = {
    getEndpointOrgan(endpointNodeId) {
        if (endpointToOrgan.get(endpointNodeId))
            return endpointToOrgan.get(endpointNodeId);
        const organs = this.findParents(endpointNodeId, [
            spinal_model_bmsnetwork_1.SpinalBmsNetwork.relationName,
            spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName,
            spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName,
            spinal_model_bmsnetwork_1.SpinalBmsEndpointGroup.relationName,
        ], (node) => {
            if (node.getType().get() === spinal_model_bacnet_1.BACNET_ORGAN_TYPE) {
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
                return true;
            }
            return false;
        });
        endpointToOrgan.set(endpointNodeId, organs);
        return organs;
    },
    getDevices(endpointNodeId) {
        if (endpointToDevices.get(endpointNodeId))
            return endpointToDevices.get(endpointNodeId);
        const devices = this.findParents(endpointNodeId, [
            spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName,
            spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName,
            spinal_model_bmsnetwork_1.SpinalBmsEndpointGroup.relationName,
        ], (node) => {
            if (node.getType().get() === spinal_model_bmsnetwork_1.SpinalBmsDevice.nodeTypeName) {
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
                return true;
            }
            return false;
        });
        endpointToOrgan.set(endpointNodeId, devices);
        return devices;
    },
    filterContextIdsByType(contextIds, type) {
        return contextIds.filter((id) => {
            const info = spinal_env_viewer_graph_service_1.SpinalGraphService.getInfo(id);
            if (info && info.type.get() === type)
                return true;
            return false;
        });
    },
    async findParents(startId, relations, predicate) {
        if (typeof predicate !== "function") {
            throw new Error("The predicate function must be a function");
        }
        const startNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(startId);
        if (startNode) {
            const seen = new Set([startNode]);
            let promises = [];
            let nextGen = [startNode];
            let currentGen = [];
            const found = [];
            while (nextGen.length) {
                currentGen = nextGen;
                promises = [];
                nextGen = [];
                for (const node of currentGen) {
                    promises.push(node.getParents(relations));
                    if (predicate(node)) {
                        found.push(node);
                    }
                }
                const parentArrays = await Promise.all(promises);
                for (const parents of parentArrays) {
                    for (const parent of parents) {
                        if (parent) {
                            if (!seen.has(parent)) {
                                nextGen.push(parent);
                                seen.add(parent);
                            }
                        }
                    }
                }
            }
            return found;
        }
        return [];
    },
    sendUpdateRequest(nodeId, endpointNode, value) {
        return new Promise(async (resolve, reject) => {
            const [organNode] = await this.getEndpointOrgan(nodeId);
            const devices = await this.getDevices(nodeId);
            if (organNode && devices && devices.length > 0) {
                const organ = await organNode.getElement();
                if (organ) {
                    const endpointElement = await endpointNode.getElement();
                    const requests = devices.map((device) => {
                        return {
                            address: device.info.address && device.info.address.get(),
                            deviceId: device.info.idNetwork && device.info.idNetwork.get(),
                            objectId: {
                                type: endpointElement.typeId.get(),
                                instance: endpointElement.id.get(),
                            },
                            value: value,
                        };
                    });
                    const spinalPilot = new spinal_model_bacnet_1.SpinalPilotModel(organ, requests);
                    await spinalPilot.addToNode(endpointNode);
                    const bindId = spinalPilot.state.bind(async () => {
                        switch (spinalPilot.state.get()) {
                            case "success":
                                spinalPilot.state.unbind(bindId);
                                await spinalPilot.removeToNode();
                                resolve(spinalPilot);
                                break;
                            case "error":
                                spinalPilot.state.unbind(bindId);
                                await spinalPilot.removeToNode();
                                reject("pilotage a échoué");
                                break;
                            default:
                                break;
                        }
                    });
                }
            }
            else {
                reject("no organe or device found");
            }
        });
    },
};
//# sourceMappingURL=pilotage_utilities.js.map