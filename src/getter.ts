function Getter( getterPattern=false) {
  return function (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey) 
      return applyToProperty(propertyKey,descriptor,getterPattern);
    else {
      return applyToClass(target,getterPattern);
    }
  };
}

function applyToProperty(propertyKey,descriptor,getterPattern){
  const propertyName = propertyKey.replace(/^_/, "");
  if (descriptor && typeof descriptor.get === "function") {
    const originalGetter = descriptor.get;
    descriptor.get = function () {
      const value = originalGetter.apply(this);
      if (getterPattern) 
        return this[`get${propertyName.charAt(0).toUpperCase()}${propertyName.slice(1)}`]();
       else 
        return value;      
    };
    return descriptor;
  }
}

function applyToClass(target,getterPattern){
  const originalConstructor = target;
  const newConstructor = function (...args: any[]) {
    originalConstructor.apply(this, args);
    const properties = Object.getOwnPropertyNames(target.prototype);
    properties
      .filter(
        (property) =>
          property !== "constructor" &&
          typeof target.prototype[property] === "function" &&
          property.startsWith("_")
      )
      .forEach((property) => {
        const propertyName = property.replace(/^_/, "");
        const originalGetter = target.prototype[property];
        Object.defineProperty(this, propertyName, {
          get() {
            const value = originalGetter.apply(this);
            if (getterPattern) {
              return this[
                `get${propertyName.charAt(0).toUpperCase()}${propertyName.slice(1)}`
              ]();
            } else {
              return value;
            }
          },
        });
      });
  };
  newConstructor.prototype = Object.create(originalConstructor.prototype);
  return newConstructor;
}