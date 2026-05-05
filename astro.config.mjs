import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import netlify from "@astrojs/netlify";
import icon from 'astro-icon';

import db from "@astrojs/db";


export default defineConfig({
    integrations: [tailwind(), db(), icon()],
  output: "server",
  adapter: node({
    mode: "standalone",
      adapter: netlify(),

  }),
});