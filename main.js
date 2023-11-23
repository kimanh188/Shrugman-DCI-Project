import { Printer } from "./PrinterClass.js";
import { Shrugman } from "./ShrugmanClass.js";

const printer = new Printer();
const game = new Shrugman(printer);

game.start();
