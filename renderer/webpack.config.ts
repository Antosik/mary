import type { Configuration } from "webpack";

import WebConfig from "./web.config";
import RendererConfig from "./renderer.config";


const config: Configuration[] = [
  WebConfig,
  RendererConfig
];

export default config;