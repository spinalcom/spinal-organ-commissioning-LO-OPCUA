import { SpinalNodeRef } from "spinal-env-viewer-graph-service";
export type PosInfo = {
    bmsgroup: SpinalNodeRef;
    Netgroup: SpinalNodeRef;
    endpoint: SpinalNodeRef;
};
export type PositionData = {
    position: SpinalNodeRef;
    CP: SpinalNodeRef | undefined;
    PosINFO: PosInfo[];
};
export type PositionsDataStore = {
    position: SpinalNodeRef;
    CP: SpinalNodeRef | undefined;
    storeINFO: PosInfoStore[];
};
export type PosInfoStore = {
    canal: SpinalNodeRef;
    Motstore: SpinalNodeRef;
    endpoint: SpinalNodeRef;
};
