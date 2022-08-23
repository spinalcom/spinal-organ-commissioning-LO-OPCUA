import {
  SpinalGraphService,
  SpinalNode,
} from "spinal-env-viewer-graph-service";
import {
  SpinalBmsNetwork,
  SpinalBmsDevice,
  SpinalBmsEndpoint,
  SpinalBmsEndpointGroup,
} from "spinal-model-bmsnetwork";
import { BACNET_ORGAN_TYPE, SpinalPilotModel } from "spinal-model-bacnet";

const endpointToOrgan = new Map();
const endpointToDevices = new Map();

export default {
  getEndpointOrgan(endpointNodeId) {
    if (endpointToOrgan.get(endpointNodeId))
      return endpointToOrgan.get(endpointNodeId);

    const organs = this.findParents(
      endpointNodeId,
      [
        SpinalBmsNetwork.relationName,
        SpinalBmsDevice.relationName,
        SpinalBmsEndpoint.relationName,
        SpinalBmsEndpointGroup.relationName,
      ],
      (node) => {
        if (node.getType().get() === BACNET_ORGAN_TYPE) {
          //@ts-ignore
          SpinalGraphService._addNode(node);
          return true;
        }
        return false;
      }
    );

    endpointToOrgan.set(endpointNodeId, organs);
    return organs;
  },

  getDevices(endpointNodeId): Promise<SpinalNode[]> {
    if (endpointToDevices.get(endpointNodeId))
      return endpointToDevices.get(endpointNodeId);

    const devices = this.findParents(
      endpointNodeId,
      [
        SpinalBmsDevice.relationName,
        SpinalBmsEndpoint.relationName,
        SpinalBmsEndpointGroup.relationName,
      ],
      (node) => {
        if (node.getType().get() === SpinalBmsDevice.nodeTypeName) {
          //@ts-ignore
          SpinalGraphService._addNode(node);
          return true;
        }
        return false;
      }
    );

    endpointToOrgan.set(endpointNodeId, devices);
    return devices;
  },

  filterContextIdsByType(contextIds, type): string[] {
    return contextIds.filter((id) => {
      const info = SpinalGraphService.getInfo(id);
      if (info && info.type.get() === type) return true;
      return false;
    });
  },

  async findParents(startId, relations, predicate): Promise<SpinalNode[]> {
    if (typeof predicate !== "function") {
      throw new Error("The predicate function must be a function");
    }
    const startNode = SpinalGraphService.getRealNode(startId);
    if (startNode) {
      const seen = new Set([startNode]);
      let promises = [];
      let nextGen = [startNode];
      let currentGen = [];
      const found = [];
      while (nextGen.length) {
        currentGen = nextGen;
        promises = [];
        nextGen = [];
        for (const node of currentGen) {
          promises.push(node.getParents(relations));
          if (predicate(node)) {
            found.push(node);
          }
        }
        const parentArrays = await Promise.all(promises);
        for (const parents of parentArrays) {
          for (const parent of parents) {
            if (parent) {
              if (!seen.has(parent)) {
                nextGen.push(parent);
                seen.add(parent);
              }
            }
          }
        }
      }

      return found;
    }

    return [];
  },

  sendUpdateRequest(nodeId, endpointNode, value): Promise<SpinalPilotModel> {
    return new Promise(async (resolve, reject) => {
      const [organNode] = await this.getEndpointOrgan(nodeId);
      const devices = await this.getDevices(nodeId);

      if (organNode && devices && devices.length > 0) {
        const organ = await organNode.getElement();
        if (organ) {
          const endpointElement = await endpointNode.getElement();

          const requests = devices.map((device) => {
            return {
              address: device.info.address && device.info.address.get(),
              deviceId: device.info.idNetwork && device.info.idNetwork.get(),
              objectId: {
                type: endpointElement.typeId.get(),
                instance: endpointElement.id.get(),
              },
              value: value,
            };
          });

          const spinalPilot = new SpinalPilotModel(organ, requests);
          await spinalPilot.addToNode(endpointNode);
          const bindId = spinalPilot.state.bind(async () => {
            switch (spinalPilot.state.get()) {
              case "success":
                spinalPilot.state.unbind(bindId);
                await spinalPilot.removeToNode();
                resolve(spinalPilot);
                break;
              case "error":
                spinalPilot.state.unbind(bindId);
                await spinalPilot.removeToNode();
                reject("pilotage a échoué");
                break;
              default:
                break;
            }
          });
        }
      } else {

         reject("no organe or device found");
      }

    });
  },
};
