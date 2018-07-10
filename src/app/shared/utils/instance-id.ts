/**
 * At module level, so innaccessible for change at runtime outside of constructor
 */
let uniqueID = 999;
/**
 * Extend this class to apply an ID to each new instance of a class.
 * ID will be in the form 'ClassName_#', where # is an incremental integer in base 32
 * This is useful for debugging Dependency Injection instances.
 * Note: # number does not indicate nubmer of specific classes created, it's app wide
 *
 * Non configurable, non writable, non enumerable property '__instanceID'
 *
 * @export
 * @class InstanceId
 */
export class InstanceId {

    constructor() {
        let notNewWarning = '';
        // !new.target
        if (!(this instanceof InstanceId)) {
            notNewWarning = 'Warn:NotNew ';
        }
        let value = (uniqueID < Number.MAX_SAFE_INTEGER) ? `${(uniqueID += 1).toString(32)}` : `${Date.now()}${Math.random()}`;
        // this will be the new object, with name of new class/constructor
        const subClassName = (this && this.constructor !== undefined) ? this.constructor.name : 'no_constructor';
        const id = `${notNewWarning}${subClassName}_${value}`;
        // Non configurable, non writable, non enumerable property.
        // get: function() with no value/writable? debug mode shows ellipses - click fatigue:-)
        Object.defineProperty(this, '__instanceID', <PropertyDescriptor>{
            value: id,
            enumerable: false, // Hidden from Object.keys(), or for(var k in __) loops
            configurable: false, // Cannot be redefined
            writable: false // Read only
        });
    }
}
