import { Elysia } from "elysia";
import {
  getAllJobListings,
  createJobListing,
  getJobListingById,
  updateJobListing,
  deleteJobListing,
} from "../controllers/jobListingController";
import { JobListing } from "../models/jobListing";

export const jobListingRoutes = (app: Elysia) => {
  // GET all job listings
  app.get("/v1/api/", async () => {
    const result = await getAllJobListings();
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  // CREATE a new job listing
  app.post("/v1/api/", async ({ request }) => {
    const payload = await request.json();
    const result = await createJobListing(payload);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(result.data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });

  // GET a job listing by ID
  app.get("/v1/api/:id", async ({ params }) => {
    const result = await getJobListingById(params.id);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status || 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  // UPDATE a job listing by ID
  app.put("/v1/api/:id", async ({ params: { id }, request }) => { 
    const payload = await request.json();
    const result = await updateJobListing(id, payload);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status || 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  // DELETE a job listing by ID
  app.delete("/v1/api/:id", async ({ params }) => {
    const result = await deleteJobListing(params.id);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status || 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  //special routes
  app.get("/v1/api/search", async ({ query }) => {
    // Build a dynamic filter from query parameters. If none are provided,
    // the filter object remains empty and returns all listings.
    const filter: Record<string, any> = {};
    if (query.title) {
      filter.title = { $regex: query.title, $options: "i" };
    }
    if (query.company) {
      filter.company = { $regex: query.company, $options: "i" };
    }
    if (query.location) {
      filter.location = { $regex: query.location, $options: "i" };
    }
    if (query.description) {
      filter.description = { $regex: query.description, $options: "i" };
    }
    if (query.jobType) {
      filter.jobType = query.jobType;
    }

    console.log(filter)

    try {
        //create one for search
      const results = await JobListing.find(filter);
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  });

};
