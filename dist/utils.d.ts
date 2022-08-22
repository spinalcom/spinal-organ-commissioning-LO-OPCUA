import { SpinalNodeRef } from "spinal-env-viewer-graph-service";
import { NetworkService } from "spinal-model-bmsnetwork";
export declare const networkService: NetworkService;
/**
 * @export
 * @class Utils
 */
export declare class Utils {
    /**
     * @param  {string} contextName
     * @param  {string} categoryName
     * @returns Promise
     */
    getMonitorableRoom(contextName: string, categoryName: string): Promise<Array<SpinalNodeRef>>;
    /**
     * @param  {string} roomId
     * @returns Promise
     */
    getCommandControlPoint(roomId: string): Promise<Array<SpinalNodeRef>>;
    /**
     * @param  {Array<SpinalNodeRef>} endPointList
     * @returns Promise
     */
    getBmsEndpointGroup(endPointList: Array<SpinalNodeRef>): Promise<Object>;
    /**
     * @param  {SpinalNodeRef} group
     * @param  {SpinalNodeRef} endpoint
     * @param  {Object} object
     * @returns Object
     */
    orderEndpointGroupCommand(group: SpinalNodeRef, endpoint: SpinalNodeRef, object: Object): Object;
    /**
     * @returns Object
     */
    getObjectFormat(): Object;
    /**
     * @param  {string} roomId
     * @returns Promise
     */
    getRoomBmsEndpointPoint(roomId: string): Promise<Array<SpinalNodeRef>>;
    /**
     * @param  {Array<SpinalNodeRef>} controlPointList
     * @param  {Object} endpointObject
     * @returns Promise
     */
    bindControlpointToEndpoint(controlPointList: Array<SpinalNodeRef>, endpointObject: Object): Promise<void>;
    /**
     * @param  {SpinalNodeRef} model
     * @param  {any} valueToPush
     * @param  {any} dataType
     * @param  {any} type
     * @returns Promise
     */
    updateControlEndpointWithAnalytic(model: SpinalNodeRef, valueToPush: any, dataType: any, type: any): Promise<void>;
}
