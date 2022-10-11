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
exports.getDefaultTemp = exports.getModeCVC = exports.getTemperatureOffset = void 0;
const constants = require("./constants");
/**
 * Function that calculate the offset to apply to temperature setpoint
 * @param  {SpinalNodeRef[]} roomBmsEndPoints
 * @param  {number} value
 * @returns Promise
 */
async function getTemperatureOffset(roomBmsEndPoints, value) {
    let HVAC_value = await getModeCVC(roomBmsEndPoints);
    // console.log(HVAC_value)
    let [mode] = Object.values(HVAC_value);
    if (mode == "Heat" || mode == "Cool") {
        let defaultTempValue = await getDefaultTemp(roomBmsEndPoints, HVAC_value);
        // console.log(defaultTempValue)
        let offSet = value - defaultTempValue;
        return offSet;
    }
    else {
        console.log(`ERROR update  ==> CVC is in a <${mode}> mode`);
        return undefined;
    }
}
exports.getTemperatureOffset = getTemperatureOffset;
/**
 * Function that returns an object of HVAC_MODE
 * @param  {SpinalNodeRef[]} roomBmsEndPoints
 * @returns Promise
 */
async function getModeCVC(roomBmsEndPoints) {
    const HVAC_MODE_STATUS = constants.HVAC_MODE_STATUS;
    let [HVAC_Endpoint] = roomBmsEndPoints.filter(x => {
        return x.name.get().includes(constants.HVAC_MODE_STATUS_NAME);
    });
    let HVAC_value = (await HVAC_Endpoint.element.load()).currentValue.get();
    for (let [key, value] of Object.entries(HVAC_MODE_STATUS)) {
        if (key == HVAC_value) {
            let obj = new Object();
            obj[key] = value;
            return obj;
        }
    }
    return undefined;
}
exports.getModeCVC = getModeCVC;
/**
 * Function that retruns the default temperature value depending on HVAC_MODE
 * @param  {SpinalNodeRef[]} roomBmsEndPoints
 * @param  {object} HVAC_mode
 * @returns Promise
 */
async function getDefaultTemp(roomBmsEndPoints, HVAC_mode) {
    const OCC_MODE_SP = constants.OCC_MODE_SP;
    let [occMode_Endpoint] = roomBmsEndPoints.filter(x => {
        let [HVAC_modeValue] = Object.values(HVAC_mode);
        return x.name.get().includes(constants.OCC_MODE_SP[HVAC_modeValue]);
    });
    let occMode_value = (await occMode_Endpoint.element.load()).currentValue.get();
    return occMode_value;
}
exports.getDefaultTemp = getDefaultTemp;
//# sourceMappingURL=controlCVC.js.map