import { siteConfig } from "./site";

export const seoConfig = {
  defaultTitle: `${siteConfig.name} - Explore, Build, Share`,
  titleTemplate: `%s - ${siteConfig.name}`,
  description: siteConfig.description,
};
