import { SpinalNodeRef } from "spinal-env-viewer-graph-service";
import { SpinalNode } from "spinal-model-graph";
import { NetworkService } from "spinal-model-bmsnetwork";
import { SpinalAttribute } from "spinal-models-documentation/declarations";
import { ICategory } from "spinal-env-viewer-plugin-documentation-service";
import { PositionData, PositionsDataStore } from "./types";
export declare const networkService: NetworkService;
/**
 * @export
 * @class Utils
 */
export declare class Utils {
    ATTRIBUTE_NAME: string;
    INIT_ZONE_MODE: string;
    ATTRIBUTE_CATEGORY_NAME: string;
    DEFAULT_COMMAND_VALUE: string;
    store_filter: string;
    /**
     

    /**
     * Function that returns Positions from an equipment context
     * @param  {string} contextName
     * @param  {string} categoryName
     * @param  {string} GroupName
     * @returns Promise
     */
    getPositions(ContextName: string, CategoryName: string, GroupName: string): Promise<SpinalNodeRef[]>;
    getCommandControlPoint(workpositionId: string, controlPointName: String): Promise<SpinalNodeRef | undefined>;
    getGroupsForPosition(workpositionId: string): Promise<Array<{
        bmsgroup: SpinalNodeRef;
        Netgroup: SpinalNodeRef;
        endpoint: SpinalNodeRef;
    }>>;
    getStoreForPosition(workpositionId: string): Promise<Array<{
        canal: SpinalNodeRef;
        Motstore: SpinalNodeRef;
        endpoint: SpinalNodeRef;
    }>>;
    getZone(bmsGrpId: string, grpname: string): Promise<SpinalNodeRef | null>;
    changezoneMode(zone: SpinalNodeRef): Promise<SpinalAttribute>;
    private _waitModeChange;
    checkAndUpdateMode(zone: any, posinfo: any, controlPoint: any): Promise<void>;
    /**
        * Function that search for the targeted attribute of a node and update it's value
        * @param  {SpinalNode} endpointNode
        * @param  {any} valueToPush
        * @returns Promise
        */
    updateControlValueAttribute(endpointNode: SpinalNode, attributeCategoryName: string | ICategory, attributeName: string, valueToPush: any): Promise<SpinalAttribute | undefined>;
    /**
        * Function that search and return the targeted attribute. Creates it if it doesn't exist with a default value of null
        * @param  {SpinalNode} endpointNode
        * @returns Promise
        */
    _getEndpointControlValue(endpointNode: SpinalNode, attributeCategoryName: string | ICategory, attributeName: string): Promise<SpinalAttribute>;
    updateGrpValue(bmsgrpDALI: SpinalNodeRef, valueToPush: string, valueEndpoint: SpinalNodeRef): Promise<void>;
    BindPositionsToGrpDALI(posList: PositionData[]): Promise<void>;
    updateEndpointValue(endpoint: SpinalNodeRef, valueToPush: string): Promise<void>;
    BindStoresControlPoint(posList: PositionsDataStore[]): Promise<void>;
    private bindControlPointCallBack;
}
