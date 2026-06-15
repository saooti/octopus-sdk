export function deepEqual(obj1: any, obj2: any) {
    // it's just the same object. No need to compare.
    if(obj1 === obj2)  {
        return true;
    }

    // compare primitives
    if(isPrimitive(obj1) && isPrimitive(obj2)) {
        return obj1 === obj2;
    }

    // one is a primitive but not the other (for example undefined vs array)
    if (isPrimitive(obj1) || isPrimitive(obj2)) {
        return false;
    }

    if(Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
    }

    // compare objects with same number of keys
    for(const key in obj1) {
        //other object doesn't have this prop
        if(!(key in obj2)) {
            return false;
        }
        if(!deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

//check if value is primitive
function isPrimitive(obj: unknown) {
    return (obj !== Object(obj));
}
