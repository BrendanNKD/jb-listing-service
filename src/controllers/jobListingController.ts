import { JobListing, type IJobListing } from "../models/jobListing";

interface ControllerResult {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

// GET all job listings
export const getAllJobListings = async (): Promise<ControllerResult> => {
  try {
    const listings = await JobListing.find();
    return { success: true, data: listings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// CREATE a new job listing
export const createJobListing = async (
  payload: Partial<IJobListing>
): Promise<ControllerResult> => {
  try {
    const newJob = new JobListing(payload);
    const savedJob = await newJob.save();
    return { success: true, data: savedJob };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// GET a job listing by ID
export const getJobListingById = async (id: string): Promise<ControllerResult> => {
  try {
    const job = await JobListing.findById(id);
    if (!job)
      return { success: false, error: "Job listing not found", status: 404 };
    return { success: true, data: job };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// UPDATE a job listing by ID
export const updateJobListing = async (
  id: string,
  payload: Partial<IJobListing>
): Promise<ControllerResult> => {
  try {
    payload.updatedAt = new Date();
    const updatedJob = await JobListing.findByIdAndUpdate(id, payload, { new: true });
    if (!updatedJob)
      return { success: false, error: "Job listing not found", status: 404 };
    return { success: true, data: updatedJob };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// DELETE a job listing by ID
export const deleteJobListing = async (id: string): Promise<ControllerResult> => {
  try {
    const deletedJob = await JobListing.findByIdAndDelete(id);
    if (!deletedJob)
      return { success: false, error: "Job listing not found", status: 404 };
    return { success: true, data: { message: "Job listing deleted successfully" } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
