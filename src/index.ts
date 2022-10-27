import "./type-extensions";
import { Locklift, LockliftConfig } from "locklift";
import path from "path";
import { addPlugin, ExtenderActionParams } from "locklift/plugins";
import { PLUGIN_NAME } from "./type-extensions";
export * from "./type-extensions";

//plugin store that should be initialized  in the initializer
export class SamplePlugin {
  constructor(private readonly locklift: Locklift<any>, private readonly greetingPhrase: string) {}

  getCountOfContracts = () => this.locklift.factory.getAllArtifacts().length;
  getGreeting = () => this.greetingPhrase;
}

type LockliftConfigOptions = Locklift<any> extends Locklift<infer F> ? F : never;
// add plugin flow
addPlugin({
  // plugin name
  pluginName: PLUGIN_NAME,
  //Initializer function that will be called by locklift
  initializer: async ({
    network,
    locklift,
    config,
  }: {
    locklift: Locklift<any>;
    config: LockliftConfig<LockliftConfigOptions>;
    network: string;
  }) => {
    // in this case we got custom config parameter `greetingPhrase` that was added in the type expansion file
    return new SamplePlugin(locklift, config.greetingPhrase);
  },
  // Custom commands, this is array of functions that accepting `Commander` instance
  // command object already included default params, and pre action hook that append locklift instance (see the second command)
  commandBuilders: [
    //Example of running custom script
    {
      commandCreator: (command) =>
        command
          .name("TEST_COMMAND")
          .requiredOption("-ct, --checktest <checktest>", "To use for testing plugin")
          .action((options: ExtenderActionParams) => {
            require(path.resolve(process.cwd(), options.script || ""))?.default("HI!");
          }),
    },
    {
      commandCreator: (command) =>
        command
          .name("getcode")
          .requiredOption("--contract <contract>", "Contract name") // ------------------┐
          // in this case we are extending `ExtenderActionParams` and add new field `contract` from `requiredOption` method
          //                                             ┌-------------------------------┘
          .action((option: ExtenderActionParams & { contract: string }) => {
            console.log(option.locklift.factory.getContractArtifacts(option.contract).code);
            process.exit(0);
          }),
      //settings for skipping steps e.g. skip step build
      skipSteps: {
        build: true,
      },
    },
    // example of implementation get contract code function
    {
      commandCreator: (command) =>
        command.name("get-greeting").action((option: ExtenderActionParams) => {
          console.log(option.config().greetingPhrase);
          process.exit(0);
        }),
    },
  ],
});
