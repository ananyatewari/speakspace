export function renderTemplate(template, promptText) {
  return template.replace(/\$PROMPT/g, promptText || "");
}
