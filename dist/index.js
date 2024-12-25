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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const config = require("../config");
const utils_1 = require("./utils");
const constants = require("./constants");
const utils = new utils_1.Utils();
class SpinalMain {
    constructor() {
        const url = `${config.hubProtocol}://${config.userId}:${config.userPassword}@${config.hubHost}:${config.hubPort}/`;
        this.connect = spinal_core_connectorjs_type_1.spinalCore.connect(url);
    }
    /**
     *
     * Initialize connection with the hub and load graph
     * @return {*}
     * @memberof SpinalMain
     */
    init() {
        return new Promise((resolve, reject) => {
            spinal_core_connectorjs_type_1.spinalCore.load(this.connect, config.digitalTwinPath, async (graph) => {
                await spinal_env_viewer_graph_service_1.SpinalGraphService.setGraph(graph);
                console.log("Connected to the hub");
                resolve(graph);
            }, () => {
                reject();
            });
        });
    }
    /**
     * The main function of the class
     */
    async MainJob() {
        await this.workingPositionsJob();
    }
    async workingPositionsJob() {
        const contextName = constants.Positions.context;
        const categoryName = constants.Positions.category;
        const groupName = constants.Positions.groupe;
        console.log("before call");
        let Positions = await utils.getPositions(contextName, categoryName, groupName);
        // Initialisation de PosList comme tableau vide
        let PosList = [];
        const promises = Positions.map(async (pos) => {
            const CP = await utils.getCommandControlPoint(pos.id.get());
            const PosINFO = await utils.getGroupsForPosition(pos.id.get());
            PosList.push({ position: pos, CP: CP, PosINFO: PosINFO });
        });
        await Promise.all(promises);
        await utils.BindPositionsToGrpDALI(PosList);
        console.log("DONE");
    }
}
async function Main() {
    try {
        console.log('Organ Start');
        const spinalMain = new SpinalMain();
        await spinalMain.init();
        await spinalMain.MainJob();
        //process.exit(0);
    }
    catch (error) {
        console.error(error);
        setTimeout(() => {
            console.log('STOP ERROR');
            process.exit(0);
        }, 5000);
    }
}
// Call main function
Main();
//# sourceMappingURL=index.js.map