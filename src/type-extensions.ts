import "locklift";
import { SamplePlugin } from "./index";

//Your plugin name, it should be renamed
export const PLUGIN_NAME = "samplePlugin";

// type extensions for locklift config
declare module "locklift" {
  export interface LockliftConfig {
    greetingPhrase: string;
  }
  //@ts-ignore
  export interface Locklift {
    [PLUGIN_NAME]: SamplePlugin;
  }
}
