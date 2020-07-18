import { resolve as resolvePath } from "path";

export const alias = {
  "@mary-main": resolvePath(__dirname, "main/src"),
  "@mary-web": resolvePath(__dirname, "renderer/src"),
  "@mary-shared": resolvePath(__dirname, "shared"),
};
