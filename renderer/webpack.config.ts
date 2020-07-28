import type { Configuration } from "webpack";

import InternalConfig from "./internal.config";
import RendererConfig from "./renderer.config";


const config: Configuration[] = [
  InternalConfig,
  RendererConfig
];

export default config;