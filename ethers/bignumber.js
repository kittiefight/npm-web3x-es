'use strict';
/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */
import BN from 'bn.js';
import { hexlify, isArrayish, isHexString } from './bytes';
import { defineReadOnly, isType, setType } from './properties';
import * as errors from './errors';
const BN_1 = new BN(-1);
function toHex(bn) {
    let value = bn.toString(16);
    if (value[0] === '-') {
        if (value.length % 2 === 0) {
            return '-0x0' + value.substring(1);
        }
        return '-0x' + value.substring(1);
    }
    if (value.length % 2 === 1) {
        return '0x0' + value;
    }
    return '0x' + value;
}
function toBN(value) {
    return _bnify(bigNumberify(value));
}
function toBigNumber(bn) {
    return new BigNumber(toHex(bn));
}
function _bnify(value) {
    let hex = value._hex;
    if (hex[0] === '-') {
        return new BN(hex.substring(3), 16).mul(BN_1);
    }
    return new BN(hex.substring(2), 16);
}
export class BigNumber {
    constructor(value) {
        this._hex = '';
        errors.checkNew(this, BigNumber);
        setType(this, 'BigNumber');
        if (typeof value === 'string') {
            if (isHexString(value)) {
                if (value == '0x') {
                    value = '0x0';
                }
                defineReadOnly(this, '_hex', value);
            }
            else if (value[0] === '-' && isHexString(value.substring(1))) {
                defineReadOnly(this, '_hex', value);
            }
            else if (value.match(/^-?[0-9]*$/)) {
                if (value == '') {
                    value = '0';
                }
                defineReadOnly(this, '_hex', toHex(new BN(value)));
            }
            else {
                errors.throwError('invalid BigNumber string value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
            }
        }
        else if (typeof value === 'number') {
            if (parseInt(String(value)) !== value) {
                errors.throwError('underflow', errors.NUMERIC_FAULT, {
                    operation: 'setValue',
                    fault: 'underflow',
                    value: value,
                    outputValue: parseInt(String(value)),
                });
            }
            try {
                defineReadOnly(this, '_hex', toHex(new BN(value)));
            }
            catch (error) {
                errors.throwError('overflow', errors.NUMERIC_FAULT, {
                    operation: 'setValue',
                    fault: 'overflow',
                    details: error.message,
                });
            }
        }
        else if (value instanceof BigNumber) {
            defineReadOnly(this, '_hex', value._hex);
        }
        else if (value.toHexString) {
            defineReadOnly(this, '_hex', toHex(toBN(value.toHexString())));
        }
        else if (value._hex && isHexString(value._hex)) {
            defineReadOnly(this, '_hex', value._hex);
        }
        else if (isArrayish(value)) {
            defineReadOnly(this, '_hex', toHex(new BN(hexlify(value).substring(2), 16)));
        }
        else {
            errors.throwError('invalid BigNumber value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
    }
    fromTwos(value) {
        return toBigNumber(_bnify(this).fromTwos(value));
    }
    toTwos(value) {
        return toBigNumber(_bnify(this).toTwos(value));
    }
    add(other) {
        return toBigNumber(_bnify(this).add(toBN(other)));
    }
    sub(other) {
        return toBigNumber(_bnify(this).sub(toBN(other)));
    }
    div(other) {
        let o = bigNumberify(other);
        if (o.isZero()) {
            errors.throwError('division by zero', errors.NUMERIC_FAULT, { operation: 'divide', fault: 'division by zero' });
        }
        return toBigNumber(_bnify(this).div(toBN(other)));
    }
    mul(other) {
        return toBigNumber(_bnify(this).mul(toBN(other)));
    }
    mod(other) {
        return toBigNumber(_bnify(this).mod(toBN(other)));
    }
    pow(other) {
        return toBigNumber(_bnify(this).pow(toBN(other)));
    }
    maskn(value) {
        return toBigNumber(_bnify(this).maskn(value));
    }
    eq(other) {
        return _bnify(this).eq(toBN(other));
    }
    lt(other) {
        return _bnify(this).lt(toBN(other));
    }
    lte(other) {
        return _bnify(this).lte(toBN(other));
    }
    gt(other) {
        return _bnify(this).gt(toBN(other));
    }
    gte(other) {
        return _bnify(this).gte(toBN(other));
    }
    isZero() {
        return _bnify(this).isZero();
    }
    toNumber() {
        try {
            return _bnify(this).toNumber();
        }
        catch (error) {
            return errors.throwError('overflow', errors.NUMERIC_FAULT, {
                operation: 'setValue',
                fault: 'overflow',
                details: error.message,
            });
        }
    }
    toString() {
        return _bnify(this).toString(10);
    }
    toHexString() {
        return this._hex;
    }
    static isBigNumber(value) {
        return isType(value, 'BigNumber');
    }
}
export function bigNumberify(value) {
    if (BN.isBN(value)) {
        return new BigNumber(value.toString());
    }
    if (BigNumber.isBigNumber(value)) {
        return value;
    }
    return new BigNumber(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmlnbnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V0aGVycy9iaWdudW1iZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBRWI7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRXZCLE9BQU8sRUFBVyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNwRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFJL0QsT0FBTyxLQUFLLE1BQU0sTUFBTSxVQUFVLENBQUM7QUFFbkMsTUFBTSxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUV4QixTQUFTLEtBQUssQ0FBQyxFQUFNO0lBQ25CLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO1FBQ3BCLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzFCLE9BQU8sTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEM7UUFDRCxPQUFPLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ25DO0lBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQ3RCO0lBQ0QsT0FBTyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLENBQUM7QUFFRCxTQUFTLElBQUksQ0FBQyxLQUFtQjtJQUMvQixPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztB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Q0FBQztJQUVELEdBQUcsQ0FBQyxLQUFtQjtRQUNyQixPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFtQjtRQUNyQixPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFtQjtRQUNyQixJQUFJLENBQUMsR0FBYyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDZCxNQUFNLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUM7U0FDakg7UUFDRCxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFtQjtRQUNyQixPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFtQjtRQUNyQixPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFtQjtRQUNyQixPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFhO1FBQ2pCLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsRUFBRSxDQUFDLEtBQW1CO1FBQ3BCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsRUFBRSxDQUFDLEtBQW1CO1FBQ3BCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsR0FBRyxDQUFDLEtBQW1CO1FBQ3JCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsRUFBRSxDQUFDLEtBQW1CO1FBQ3BCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsR0FBRyxDQUFDLEtBQW1CO1FBQ3JCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsTUFBTTtRQUNKLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSTtZQUNGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ2hDO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUU7Z0JBQ3pELFNBQVMsRUFBRSxVQUFVO2dCQUNyQixLQUFLLEVBQUUsVUFBVTtnQkFDakIsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO2FBQ3ZCLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVELFFBQVE7UUFDTixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELFdBQVc7UUFDVCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBVTtRQUMzQixPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDcEMsQ0FBQztDQUNGO0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxLQUFtQjtJQUM5QyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbEIsT0FBTyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztLQUN4QztJQUNELElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNoQyxPQUFPLEtBQUssQ0FBQztLQUNkO0lBQ0QsT0FBTyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QixDQUFDIn0=