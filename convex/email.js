import { mutation } from "./_generated/server";
// Mutation to send email using Resend (for use in cron jobs)
export const sendEmailMutation = mutation({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      const testRecipient = "shreyashkatkar04@gmail.com";
      const result = await resend.emails.send({
        from: "SplitPay <onboarding@resend.dev>",
        to: testRecipient,
        subject: args.subject,
        html: args.html,
        text: args.text,
      });
      return { success: true, id: result.id };
    } catch (error) {
      console.error("Failed to send email (mutation):", error);
      return { success: false, error: error.message };
    }
  },
});
import { v } from "convex/values";
import { action } from "./_generated/server";
import { Resend } from "resend";

// Action to send email using Resend
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {

      // In Resend test mode, only send to your own email to avoid 403 errors
      const testRecipient = "shreyashkatkar04@gmail.com";
      const result = await resend.emails.send({
        from: "SplitPay <onboarding@resend.dev>",
        to: testRecipient,
        subject: args.subject,
        html: args.html,
        text: args.text,
      });

      // console.log("Email sent successfully:", result);

      return { success: true, id: result.id };
    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }
  },
});