import { SpinalNode } from "spinal-env-viewer-graph-service";
import { SpinalPilotModel } from 'spinal-model-bacnet';
declare const _default: {
    getEndpointOrgan(endpointNodeId: any): any;
    getDevices(endpointNodeId: any): Promise<SpinalNode[]>;
    filterContextIdsByType(contextIds: any, type: any): string[];
    findParents(startId: any, relations: any, predicate: any): Promise<SpinalNode[]>;
    sendUpdateRequest(nodeId: any, endpointNode: any, value: any): Promise<SpinalPilotModel>;
};
export default _default;
