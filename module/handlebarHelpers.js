export function registerHandlebarHelpers() {
  Handlebars.registerHelper("disabled", value => value ? "disabled" : "");
  Handlebars.registerHelper('switch', function(value, options) {
    this.switch_value = value;
    return options.fn(this);
  });
  
  Handlebars.registerHelper('case', function(value, options) {
    if (value == this.switch_value) {
      return options.fn(this);
    }
  });  
}
