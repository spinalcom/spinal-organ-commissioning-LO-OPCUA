/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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

import {SpinalGraphService, SpinalNode, SpinalNodeRef} from "spinal-env-viewer-graph-service";
import {spinalCore,FileSystem} from "spinal-core-connectorjs_type";
import cron = require('node-cron');
import * as config from "../config";
import {Utils} from "./utils"
import * as constants from "./constants"
import { } from "./types";
const utils = new Utils();



class SpinalMain {
    connect: spinal.FileSystem;

    //private CP_to_PositionsToData = new Map<string, PositionData>();

    constructor() { 
        const url = `${config.hubProtocol}://${config.userId}:${config.userPassword}@${config.hubHost}:${config.hubPort}/`;
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


  
    /**
     * The main function of the class
     */
    public async MainJob() {
        const contextName = constants.Objects.context;
        const categoryName = constants.Objects.category;
        const groupName = constants.Objects.groupe;

        const objects = await utils.getObjects(contextName, categoryName, groupName);
        //const test = objects.slice(0, 30);
        //console.log("Objects:", objects);


        const chunkSize = 100; // define chunk size
        
        console.log("start Integration Data Handler");

        for (let i = 0; i < objects.length; i += chunkSize) {
            console.log("Processing object number: ", i, "/", chunkSize);
            const chunk = objects.slice(i, i + chunkSize);
            await Promise.all(chunk.map(item => utils.IntegDataHandler(item)));
            console.log("Processed chunk: ", i + chunkSize, "/", objects.length);
        }
        console.log("Done Integration Data Handler");

        //Process OPCUA

        console.log("start Opcua Data Handler");
        for (let i = 0; i < objects.length; i += chunkSize) {
            console.log("Processing object number: ", i, "/", chunkSize);
            const chunk = objects.slice(i, i + chunkSize);
            await Promise.all(chunk.map(item => utils.OpcuaDataHandler(item)));
            console.log("Processed chunk: ", i + chunkSize, "/", objects.length);
        }
        console.log("Done Opcua Data Handler");
        console.log("Done main job");
    }

        
    

   
   
  
        



}
async function Main() {
    try {
        console.log('Organ Start');
        const spinalMain = new SpinalMain();
        await spinalMain.init();
         
         /*cron.schedule(`0 23 * * *`, async (): Promise<void> => {
            console.log("Starting main job at 23:00");
            await spinalMain.MainJob();
            console.log("Main job finished");
        });*/

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
Main()