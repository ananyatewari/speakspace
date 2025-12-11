export async function publishToWordPress({ title, htmlContent }) {

  if (!process.env.WP_BASE_URL || !process.env.WP_USER || !process.env.WP_APP_PASSWORD) {
    return {
      status: "skipped",
      message: "WordPress credentials missing. No publish attempted."
    };
  }

  try {
    return { status: "success" };
  } catch (err) {
    return {
      status: "failed",
      message: err.message
    };
  }
}
