import { SpinalNodeRef } from "spinal-env-viewer-graph-service";
import { SpinalNode } from "spinal-model-graph";
import { NetworkService } from "spinal-model-bmsnetwork";
import { SpinalAttribute } from "spinal-models-documentation/declarations";
import { ICategory } from "spinal-env-viewer-plugin-documentation-service";
export declare const networkService: NetworkService;
/**
 * @export
 * @class Utils
 */
export declare class Utils {
    ATTRIBUTE_NAME: string;
    ATTRIBUTE_CATEGORY_NAME: string;
    DEFAULT_COMMAND_VALUE: string;
    /**
     * Function that returns the rooms in a specified category of a geographicRoomGroupContext
     * @param  {string} contextName
     * @param  {string} categoryName
     * @returns Promise
     */
    getMonitorableRoom(contextName: string, categoryName: string): Promise<Array<SpinalNodeRef>>;
    /**
     * Function that return the command controlPoint of a room
     * @param  {string} roomId
     * @returns Promise
     */
    getCommandControlPoint(roomId: string): Promise<Array<SpinalNodeRef>>;
    /**
     * Function that return an object of endpointGroupCommand
     *  = {Command_Light: [endpoint1 ....], Command_Blind: [endpoint2 ....], Command_Temperature: [endpoint3 ....]}
     * @param  {Array<SpinalNodeRef>} endPointList
     * @returns Promise
     */
    getBmsEndpointGroup(endPointList: Array<SpinalNodeRef>): Promise<Object>;
    /**
     * Add into the object, every endpoint that is linked to it's corresponding bmsEndpointGroup command
     * @param  {SpinalNodeRef} group
     * @param  {SpinalNodeRef} endpoint
     * @param  {Object} object = {Command_Light: [], Command_Blind: [], Command_Temperature: []}
     * @returns Object
     */
    orderEndpointGroupCommand(group: SpinalNodeRef, endpoint: SpinalNodeRef, object: Object): Object;
    /**
     * function that return the object = {Command_Light: [], Command_Blind: [], Command_Temperature: []}
     * @returns Object
     */
    getObjectFormat(): Object;
    /**
     * Function that return a list of all romm's bmsEndpoints
     * @param  {string} roomId
     * @returns Promise
     */
    getRoomBmsEndpoints(roomId: string): Promise<Array<SpinalNodeRef>>;
    /**
     * Function that bind the command controlPoint of a romm with it's specified endpoints.
     * And update the endpoints value when the command controlPoint of a romm is modified
     * @param  {Array<SpinalNodeRef>} controlPointList
     * @param  {Object} endpointObject
     * @returns Promise
     */
    bindControlpointToEndpoint(controlPointList: Array<SpinalNodeRef>, endpointObject: Object): Promise<void>;
    /**
     * Function that search for the targeted attribute of a node and update it's value
     * @param  {SpinalNode} endpointNode
     * @param  {any} valueToPush
     * @returns Promise
     */
    updateControlValueAttribute(endpointNode: SpinalNode, attributeCategoryName: string | ICategory, attributeName: string, valueToPush: any): Promise<void>;
    /**
     * Function that search and return the targeted attribute. Creates it if it doesn't exist with a default value of null
     * @param  {SpinalNode} endpointNode
     * @returns Promise
     */
    _getEndpointControlValue(endpointNode: SpinalNode, attributeCategoryName: string | ICategory, attributeName: string): Promise<SpinalAttribute>;
}
