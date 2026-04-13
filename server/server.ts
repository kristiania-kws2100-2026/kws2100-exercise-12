import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import pg from "pg";

const app = new Hono();

const db = new pg.Pool({
  connectionString: "psql://postgres:postgres@localhost",
});
app.get("/api/grunnskole", async (c) => {
  const result = await db.query(`
    select skolenavn,
           organisasjonsnummer,
           antallelever,
           st_transform(posisjon, 4326)::json geometry
    from grunnskoler_ab90da242c084b34aaa0acfbbd6fada6.grunnskole
  `);
  return c.json({
    type: "FeatureCollection",
    features: result.rows.map(({ geometry, ...properties }) => ({
      type: "Feature",
      geometry,
      properties,
    })),
  });
});

// `serveStatic` makes Hono serve the output from `vite build`
app.get("*", serveStatic({ root: "../dist" }));
serve(app);
