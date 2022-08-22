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
        const url = `https://${config.userId}:${config.userPassword}@${config.hubHost}:${config.hubPort}/`;
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
    async MainJob() {
        const contextName = constants.MONITORABLE_ROOM.context;
        const categoryName = constants.MONITORABLE_ROOM.category;
        let rooms = await utils.getMonitorableRoom(contextName, categoryName);
        for (let room of rooms) {
            console.log("Room name ====> ", room.name.get());
            // let cp = await utils.getCommandControlPoint(rooms[0].id.get())
            // let ep = await utils.getRoomBmsEndpointPoint(rooms[0].id.get())
            let cp = await utils.getCommandControlPoint(room.id.get());
            let ep = await utils.getRoomBmsEndpointPoint(room.id.get());
            let group = await utils.getBmsEndpointGroup(ep);
            await utils.bindControlpointToEndpoint(cp, group);
        }
        console.log("DONE");
    }
}
async function job() {
    try {
        const spinalMain = new SpinalMain();
        await spinalMain.init();
        await spinalMain.MainJob();
        // setTimeout(() => {
        //   console.log('STOP OK');
        //   process.exit(0);
        // }, 1000 * 60 * 5); // (5min)
    }
    catch (error) {
        console.error(error);
        setTimeout(() => {
            console.log('STOP ERROR');
            process.exit(0);
        }, 5000);
    }
}
async function Main() {
    // start every 1h+10min
    console.log('Organ Start');
    // cron.schedule('10 * * * *', async (): Promise<void> => {
    //   console.log('Analytic job Start');
    //   await job();
    // });
    //FOR DEBUG
    await job();
}
// Call main function
Main();
//# sourceMappingURL=index.js.map