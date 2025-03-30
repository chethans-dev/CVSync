import axios from "axios";
import * as cheerio from "cheerio";
import { config } from "dotenv";

config({ path: "backend/config/config.env" });

const ADZUNA_API_ID = process.env.ADZUNA_API_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;

export const scrapeLinkedIn = async (jobRoles = []) => {
  if (!jobRoles.length) return [];

  let allJobs = [];

  for (const role of jobRoles) {
    try {
      const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(
        role
      )}&f_TPR=r86400`;
      // console.log(`Fetching jobs for: ${role}`);

      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      const $ = cheerio.load(data);
      let jobs = [];

      $(".jobs-search__results-list li").each((i, el) => {
        if (i >= 5) return false; // Stop after 10 jobs per role

        jobs.push({
          title: $(el).find(".base-search-card__title").text().trim(),
          company: $(el).find("a.hidden-nested-link").text().trim(),
          location: $(el).find("span.job-search-card__location").text().trim(),
          url: $(el).find("a.base-card__full-link").attr("href"),
          posted:
            $(el).find(".job-search-card__listdate").text().trim() ||
            $(el).find(".job-search-card__listdate--new").text().trim(),
          // owner_image: $(el)
          //   .find("div.search-entity-media img.artdeco-entity-image")
          //   .attr("data-delayed-url"),
        });
      });

      allJobs.push({ role, jobs });

      // Optional: Delay between requests to avoid rate-limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping jobs for ${role}:`, error.message);
    }
  }

  return allJobs;
};

// Function to search for real-time jobs based on job title & skills
const fetchRealTimeJobs = async (jobRoles, location = "India") => {
  if (!jobRoles.length) return [];
  try {
    const randomJob = jobRoles[Math.floor(Math.random() * jobRoles.length)];
    const apiUrl = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_API_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=5&what=${encodeURIComponent(
      randomJob
    )}&where=${encodeURIComponent(location)}`;

    const response = await axios.get(apiUrl);
    return response.data.results.map((job) => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      description: job.description,
      salary: job.salary_min
        ? `₹${job.salary_min} - ₹${job.salary_max}`
        : "N/A",
      url: job.redirect_url,
    }));
  } catch (error) {
    console.error("Job API Error:", error);
    return [];
  }
};
