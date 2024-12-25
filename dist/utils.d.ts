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
     

    /**
     * Function that returns Positions from an equipment context
     * @param  {string} contextName
     * @param  {string} categoryName
     * @param  {string} GroupName
     * @returns Promise
     */
    getPositions(ContextName: string, CategoryName: string, GroupName: string): Promise<SpinalNodeRef[]>;
    getCommandControlPoint(workpositionId: string): Promise<SpinalNodeRef | undefined>;
    getGroupsForPosition(workpositionId: string): Promise<Array<{
        bmsgroup: SpinalNodeRef;
        Netgroup: SpinalNodeRef;
        endpoint: SpinalNodeRef;
    }>>;
    getZone(bmsGrpId: string, grpname: string): Promise<SpinalNodeRef | null>;
    changezoneMode(zone: SpinalNodeRef): Promise<void>;
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
    updateGrpValue(bmsgrpDALI: SpinalNodeRef, valueToPush: string, valueEndpoint: SpinalNodeRef): Promise<void>;
    BindPositionsToGrpDALI(posList: Array<{
        position: SpinalNodeRef;
        CP: SpinalNodeRef | undefined;
        PosINFO: Array<{
            bmsgroup: SpinalNodeRef;
            Netgroup: SpinalNodeRef;
            endpoint: SpinalNodeRef;
        }>;
    }>): Promise<void>;
}
