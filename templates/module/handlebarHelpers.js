export function registerHandlebarHelpers() {
  Handlebars.registerHelper("disabled", value => value ? "disabled" : "");
}
