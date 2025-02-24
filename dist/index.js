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
        this.CP_to_PositionsToData = new Map();
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
        const contextName = constants.Positions.context;
        const categoryName = constants.Positions.category;
        const groupName = constants.Positions.groupe;
        this.LightControl(contextName, categoryName, groupName);
        this.StoresControl(contextName, categoryName, groupName);
    }
    async getPositionDataLight(position) {
        const CP = await utils.getCommandControlPoint(position.id.get(), constants.LightControlPoint);
        const PosINFO = await utils.getGroupsForPosition(position.id.get());
        return { position, CP, PosINFO };
    }
    async getPositionDataStore(position) {
        const CP = await utils.getCommandControlPoint(position.id.get(), constants.StoreControlPoint);
        const storeINFO = await utils.getStoreForPosition(position.id.get());
        return { position, CP, storeINFO };
    }
    async LightControl(contextName, categoryName, groupName) {
        let Positions = await utils.getPositions(contextName, categoryName, groupName);
        const promises = Positions.map(async (pos) => {
            const posData = await this.getPositionDataLight(pos);
            this.CP_to_PositionsToData.set(posData.CP.id.get(), posData);
            return posData;
        });
        const PosList = await Promise.all(promises);
        await utils.BindPositionsToGrpDALI(PosList);
        console.log("done binding light control");
    }
    async StoresControl(contextName, categoryName, groupName) {
        let Positions = await utils.getPositions(contextName, categoryName, groupName);
        const promeses2 = Positions.map(async (pos) => {
            const PosStoreData = this.getPositionDataStore(pos);
            return PosStoreData;
        });
        const storeList = await Promise.all(promeses2);
        await utils.BindStoresControlPoint(storeList);
        console.log("done binding store control");
        console.log("debug test");
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