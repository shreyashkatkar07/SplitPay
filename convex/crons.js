import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "daily-payment-reminders",
  "59 16 * * *", // 10:00pm IST = 16:30 UTC
  api.reminders.sendDailyPaymentReminders
);

export default crons;