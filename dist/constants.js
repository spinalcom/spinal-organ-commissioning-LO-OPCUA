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
exports.OCC_MODE_SP = exports.HVAC_MODE_STATUS_NAME = exports.HVAC_MODE_STATUS = exports.ENDPOINT_GROUP_COMMANDE = exports.MONITORABLE_ROOM = void 0;
exports.MONITORABLE_ROOM = Object.freeze({
    context: "Contexte de Salles standardisé",
    category: "Zone"
});
exports.ENDPOINT_GROUP_COMMANDE = ["Command_Light", "Command_Blind", "Command_Temperature"];
exports.HVAC_MODE_STATUS = Object.freeze({
    1: "Auto",
    2: "Heat",
    3: "Mmg_Wmup",
    4: "Cool",
    5: "Night_Purge",
    6: "Pre_Cool",
    7: "Off"
});
exports.HVAC_MODE_STATUS_NAME = "HVACModeStatus";
exports.OCC_MODE_SP = Object.freeze({
    Heat: "OccHeatSP",
    Cool: "OccCoolSP"
});
//# sourceMappingURL=constants.js.map