import axios from "axios";

const local = "http://localhost:3001";
const remote =
  "http://ec2-18-143-187-232.ap-southeast-1.compute.amazonaws.com:3001";
const baseUrl = process.env.NODE_ENV === "development" ? local : remote;

export default axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});
