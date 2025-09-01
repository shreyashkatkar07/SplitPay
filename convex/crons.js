import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "daily-payment-reminders",
  "16 18 * * *", // 11:00pm IST = 17:30 UTC
  api.reminders.sendDailyPaymentReminders
);

export default crons;