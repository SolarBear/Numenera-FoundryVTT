import { NumeneraCommunityActor } from "./NumeneraCommunityActor.js";
import { NumeneraNPCActor } from "./NumeneraNPCActor.js";
import { NumeneraPCActor } from "./NumeneraPCActor.js";

//TODO NumeneraActor and NumeneraItem are almost identical, genericisize (???) them

const actorMappings = {
  pc: NumeneraPCActor,
  npc: NumeneraNPCActor,
  community: NumeneraCommunityActor,
}

/**
 * Numenera Actor base class
 *
 * Acts as a mix of factory and proxy: depending on its "type" argument,
 * creates an object of the right class (also extending Actor) and simply
 * overrides its own properties with that of that new objects.
 *
 * This is used since Actor doesn't really allow for real inheritance, so
 * we're simply faking it. #yolo #ididntchoosethethuglife
 *
 * @export
 */
export const NumeneraActor = new Proxy(function () {}, {
  //Calling a constructor from this proxy object
  construct: function (target, args) {
    const [data] = args;

    if (!actorMappings.hasOwnProperty(data.type))
      throw new Error("Unsupported Entity type for create(): " + data.type);

    return new actorMappings[data.type](...args);
  },
  //Property access on this weird, dirty proxy object
  get: function (target, prop, receiver) {  
    switch (prop) {
      case "create":
      case "createDocuments":
        //Calling the class' create() static function
        return function (data, options) {
          if (data.constructor === Array) {
            //Array of data, this happens when creating Actors imported from a compendium
            return data.map(i => NumeneraActor.create(i, options));
          }

          if (!actorMappings.hasOwnProperty(data.type))
            throw new Error("Unsupported Entity type for create(): " + data.type);

          return actorMappings[data.type].create(data, options);
        };
        
      case Symbol.hasInstance:
        //Applying the "instanceof" operator on the instance object
        return function (instance) {
          return Object.values(actorMappings).some(i => instance instanceof i);
        };

      default:
        //Just forward any requested properties to the base Item class
        return Actor[prop];
    }
  },
});
