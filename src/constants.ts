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



export const Objects = Object.freeze({
    context: "Gestion des équipements",
    category: "Commissioning télécommande",
    groupe:"test 2"
});
export const ZoneContext = Object.freeze({
    context: "Hardware Context Zones"

});
export const PositionContext = Object.freeze({
    context: "Hardware Context Position Groupe"

});

export const controlPointProfil = "Commissioning";

export const controlPointNames = [
    "Has Balast",
    "Has Group",
    "Has Zone",
    "Has Duplicated Zone",
    "Monitored/Integration",
    "Monitored/OPCUA",
    "Correct Balast"
];
export const BalastControlPoint = "Has Balast"
export const GroupControlPoint = "Has Group"
export const ZoneControlPoint="Has Zone"
export const DuplicatedZoneControlPoint="Has Duplicated Zone"
export const IntegrationControlPoint="Monitored/Integration"
export const OPCUAControlPoint="Monitored/OPCUA"
export const CorrectBalastControlPoint="Correct Balast"



