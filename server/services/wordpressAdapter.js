import axios from "axios";

export async function publishToWordPress({ title, htmlContent }) {
  if (
    !process.env.WP_BASE_URL ||
    !process.env.WP_USER ||
    !process.env.WP_APP_PASSWORD
  ) {
    return {
      status: "skipped",
      message: "WordPress credentials missing. No publish attempted."
    };
  }

  const url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/posts`;
  const auth = Buffer.from(
    `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`
  ).toString("base64");

  const res = await axios.post(
    url,
    {
      title,
      content: htmlContent,
      status: "publish"
    },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      }
    }
  );

  return {
    status: "success",
    postId: res.data.id,
    link: res.data.link
  };
}
