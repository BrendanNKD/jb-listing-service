import mongoose, { Document, Schema } from "mongoose";

export interface IJobListing extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: number;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  createdAt: Date;
  updatedAt: Date;
}

const jobListingSchema: Schema<IJobListing> = new Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
  },
  jobType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
    default: "Full-time",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const JobListing = mongoose.model<IJobListing>("JobListing", jobListingSchema);
