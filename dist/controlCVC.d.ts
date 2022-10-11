import { SpinalNodeRef } from "spinal-env-viewer-graph-service";
/**
 * Function that calculate the offset to apply to temperature setpoint
 * @param  {SpinalNodeRef[]} roomBmsEndPoints
 * @param  {number} value
 * @returns Promise
 */
export declare function getTemperatureOffset(roomBmsEndPoints: SpinalNodeRef[], value: number): Promise<number>;
/**
 * Function that returns an object of HVAC_MODE
 * @param  {SpinalNodeRef[]} roomBmsEndPoints
 * @returns Promise
 */
export declare function getModeCVC(roomBmsEndPoints: SpinalNodeRef[]): Promise<Object>;
/**
 * Function that retruns the default temperature value depending on HVAC_MODE
 * @param  {SpinalNodeRef[]} roomBmsEndPoints
 * @param  {object} HVAC_mode
 * @returns Promise
 */
export declare function getDefaultTemp(roomBmsEndPoints: SpinalNodeRef[], HVAC_mode: object): Promise<any>;
