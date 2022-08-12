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

import {SpinalGraphService, SpinalNodeRef} from "spinal-env-viewer-graph-service";
import {spinalCore,Process} from "spinal-core-connectorjs_type";
import cron = require('node-cron');
import * as config from "../config";
import {Utils} from "./utils"
import * as constants from "./constants"

const utils = new Utils();

class SpinalMain {
    connect: spinal.FileSystem;
    constructor() { 
        const url = `https://${config.userId}:${config.userPassword}@${config.hubHost}:${config.hubPort}/`;
        this.connect = spinalCore.connect(url)
    }
    
    /**
     * 
     * Initialize connection with the hub and load graph
     * @return {*}
     * @memberof SpinalMain
     */
    public init() {
        return new Promise((resolve, reject) => {
            spinalCore.load(this.connect, config.digitalTwinPath, async (graph: any) => {
                await SpinalGraphService.setGraph(graph);
                console.log("Connected to the hub");
                resolve(graph);
            }, () => {
                reject()
            })
        });
    }


  
    public async MainJob() {
        const contextName = constants.MONITORABLE_ROOM.context;
        const categoryName = constants.MONITORABLE_ROOM.category;

        let rooms = await utils.getMonitorableRoom(contextName,categoryName);
        for(let room of rooms){
            console.log("Room name ====> ",room.name.get())
            // let cp = await utils.getCommandControlPoint(rooms[0].id.get())
            // let ep = await utils.getRoomBmsEndpointPoint(rooms[0].id.get())

            let cp = await utils.getCommandControlPoint(room.id.get())
            let ep = await utils.getRoomBmsEndpointPoint(room.id.get())
            let group = await utils.getBmsEndpointGroup(ep);
            
            await utils.bindControlpointToEndpoint(cp,group);

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
Main()