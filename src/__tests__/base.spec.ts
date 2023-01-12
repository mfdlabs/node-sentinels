/*
   Copyright 2022 Nikita Petko <petko@vmminfra.net>

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/*
	File Name: base.spec.ts
	Description: Test specification for the base classes.
	Written by: Nikita Petko
*/

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import TripReasonAuthorityBase from '../sentinels/base/trip_reason_authority_base';
import CircuitBreakerPolicyBase from '../sentinels/base/circuit_breaker_policy_base';
import ExecutionCircuitBreakerBase from '../sentinels/base/execution_circuit_breaker_base';
import CircuitBreakerBase, { CircuitBreakerError } from '../sentinels/base/circuit_breaker_base';

describe('Base classes', () => {
  describe('CircuitBreakerBase', () => {
    class CircuitBreaker extends CircuitBreakerBase {
      public get name(): string {
        return 'Test';
      }
    }

    describe('#isTripped', () => {
      it('should return true if the circuit breaker is tripped', () => {
        const circuitBreaker = new CircuitBreaker();

        circuitBreaker.trip();

        expect(circuitBreaker.isTripped).toBe(true);
      });

      it('should return false if the circuit breaker is not tripped', () => {
        const circuitBreaker = new CircuitBreaker();

        expect(circuitBreaker.isTripped).toBe(false);
      });
    });

    describe('#trip', () => {
      it('should trip the circuit breaker', () => {
        const circuitBreaker = new CircuitBreaker();

        circuitBreaker.trip();

        expect(circuitBreaker.isTripped).toBe(true);
      });

      it('should set the trippedAt date', () => {
        const circuitBreaker = new CircuitBreaker();

        circuitBreaker.trip();

        expect(circuitBreaker['trippedAt']).not.toBeNull();
      });

      it('should do nothing if the circuit breaker is already tripped', () => {
        const circuitBreaker = new CircuitBreaker();

        circuitBreaker.trip();
        circuitBreaker.trip();

        expect(circuitBreaker.isTripped).toBe(true);
      });
    });

    describe('#reset', () => {
      it('should reset the circuit breaker', () => {
        const circuitBreaker = new CircuitBreaker();

        circuitBreaker.trip();
        circuitBreaker.reset();

        expect(circuitBreaker.isTripped).toBe(false);
      });

      it('should set the trippedAt date to null', () => {
        const circuitBreaker = new CircuitBreaker();

        circuitBreaker.trip();
        circuitBreaker.reset();

        expect(circuitBreaker['trippedAt']).toBeUndefined();
      });

      it('should do nothing if the circuit breaker is not tripped', () => {
        const circuitBreaker = new CircuitBreaker();

        circuitBreaker.reset();

        expect(circuitBreaker.isTripped).toBe(false);
      });
    });

    describe('#now', () => {
      it('should return the current date time', () => {
        const circuitBreaker = new CircuitBreaker();

        expect(circuitBreaker['now']).toBeInstanceOf(Date);
      });
    });

    describe('#test', () => {
      it('should throw a CircuitBreakerError if the circuit breaker is tripped', () => {
        const circuitBreaker = new CircuitBreaker();

        circuitBreaker.trip();

        expect(() => circuitBreaker.test()).toThrow();
      });

      it('should not throw a CircuitBreakerError if the circuit breaker is not tripped', () => {
        const circuitBreaker = new CircuitBreaker();

        expect(() => circuitBreaker.test()).not.toThrow();
      });
    });

    describe('#getTripError', () => {
      it('should return a CircuitBreakerError', () => {
        const circuitBreaker = new CircuitBreaker();

        expect(circuitBreaker.getTripError()).toBeInstanceOf(CircuitBreakerError);
      });

      it('should use CircuitBreakerBase.trippedAt ', () => {
        const circuitBreaker = new CircuitBreaker();

        circuitBreaker.trip();

        expect(circuitBreaker.getTripError()).toBeInstanceOf(CircuitBreakerError);
      });
    });
  });

  describe('CircuitBreakerPolicyBase', () => {
    class TestError extends Error {}

    class TestTripReasonAuthority extends TripReasonAuthorityBase<string> {
      public isReasonForTrip(executionContext: string, error: Error): boolean {
        return error instanceof TestError || executionContext === 'test';
      }
    }

    class CircuitBreaker extends CircuitBreakerBase {
      public get name(): string {
        return 'Test';
      }
    }

    class CircuitBreakerPolicy extends CircuitBreakerPolicyBase<string> {
      private _circuitBreaker: CircuitBreaker;

      public constructor() {
        super(new TestTripReasonAuthority());

        this._circuitBreaker = new CircuitBreaker();
      }

      protected isCircuitBreakerOpen(executionContext: string): [boolean, Error] {
        return [this._circuitBreaker.isTripped, this._circuitBreaker.getTripError()];
      }

      protected tryToTripCircuitBreaker(executionContext: string): boolean {
        this._circuitBreaker.trip();
        return true;
      }

      protected onSuccessfulRequest(executionContext: string): void {
        this._circuitBreaker.reset();
      }

      protected onNotified(executionContext: string): void {
        // do nothing
      }
    }

    class CircuitBreakerPolicyWithTRA extends CircuitBreakerPolicyBase<string> {
      private _circuitBreaker: CircuitBreaker;

      public constructor(tra: TripReasonAuthorityBase<string>) {
        super(tra);

        this._circuitBreaker = new CircuitBreaker();
      }

      protected isCircuitBreakerOpen(executionContext: string): [boolean, Error] {
        return [this._circuitBreaker.isTripped, this._circuitBreaker.getTripError()];
      }

      protected tryToTripCircuitBreaker(executionContext: string): boolean {
        this._circuitBreaker.trip();
        return true;
      }

      protected onSuccessfulRequest(executionContext: string): void {
        this._circuitBreaker.reset();
      }

      protected onNotified(executionContext: string): void {
        // do nothing
      }
    }

    describe('#constructor', () => {
      it('should create a new CircuitBreakerPolicyBase', () => {
        const circuitBreakerPolicy = new CircuitBreakerPolicy();

        expect(circuitBreakerPolicy).toBeInstanceOf(CircuitBreakerPolicyBase);
      });

      it('should throw if the trip reason authority is not provided', () => {
        expect(() => new CircuitBreakerPolicyWithTRA(undefined as any)).toThrow();
      });
    });

    describe('#onTerminatingRequest', () => {
      it('should be invoked if the circuit breaker is open', () => {
        const circuitBreakerPolicy = new CircuitBreakerPolicy();

        const onTerminatingRequest = jest.fn();

        circuitBreakerPolicy.onTerminatingRequest = onTerminatingRequest;

        circuitBreakerPolicy.notifyRequestFinished('test', new TestError());

        expect(() => circuitBreakerPolicy.throwIfTripped('test')).toThrow();
        expect(circuitBreakerPolicy['_circuitBreaker'].isTripped).toBe(true);
        expect(onTerminatingRequest).toBeCalled();
      });
    });

    describe('#onRequestToOpen', () => {
      it('should be invoked if the trip reason authority returns true', () => {
        const circuitBreakerPolicy = new CircuitBreakerPolicy();

        const onRequestToOpen = jest.fn();

        circuitBreakerPolicy.onRequestToOpen = onRequestToOpen;

        circuitBreakerPolicy.notifyRequestFinished('test', new TestError());

        expect(circuitBreakerPolicy['_circuitBreaker'].isTripped).toBe(true);
        expect(onRequestToOpen).toBeCalled();
      });
    });

    describe('#notifyRequestFinished', () => {
      it('should call tryToTripCircuitBreaker if the trip reason authority returns true', () => {
        const circuitBreakerPolicy = new CircuitBreakerPolicy();

        const tryToTripCircuitBreaker = jest.spyOn(circuitBreakerPolicy, 'tryToTripCircuitBreaker' as any);

        circuitBreakerPolicy.notifyRequestFinished('test', new TestError());

        expect(tryToTripCircuitBreaker).toBeCalled();
      });

      it('should call onSuccessfulRequest if the trip reason authority returns false', () => {
        const circuitBreakerPolicy = new CircuitBreakerPolicy();

        const onSuccessfulRequest = jest.spyOn(circuitBreakerPolicy, 'onSuccessfulRequest' as any);

        circuitBreakerPolicy.notifyRequestFinished(undefined as any, undefined as any);

        expect(onSuccessfulRequest).toBeCalled();
      });

      it('should call onNotified', () => {
        const circuitBreakerPolicy = new CircuitBreakerPolicy();

        const onNotified = jest.spyOn(circuitBreakerPolicy, 'onNotified' as any);

        circuitBreakerPolicy.notifyRequestFinished(undefined as any, undefined as any);

        expect(onNotified).toBeCalled();
      });
    });

    describe('#throwIfTripped', () => {
      it('should throw a CircuitBreakerError if the circuit breaker is open', () => {
        const circuitBreakerPolicy = new CircuitBreakerPolicy();

        circuitBreakerPolicy.notifyRequestFinished('test', new TestError());

        expect(() => circuitBreakerPolicy.throwIfTripped('test')).toThrow();
      });

      it('should not throw a CircuitBreakerError if the circuit breaker is closed', () => {
        const circuitBreakerPolicy = new CircuitBreakerPolicy();

        expect(() => circuitBreakerPolicy.throwIfTripped('test')).not.toThrow();
      });
    });
  });

  describe('ExecutionCircuitBreakerBase', () => {
    class TestError extends Error {}

    class ExecutionCircuitBreaker extends ExecutionCircuitBreakerBase {
      private readonly _retryInterval: number;

      public constructor(retryInterval?: number) {
        super();

        this._retryInterval = retryInterval || 0;
      }

      public get name(): string {
        return 'Test';
      }

      public get retryInterval(): number {
        return this._retryInterval;
      }

      protected shouldTrip(error: Error): boolean {
        return error instanceof TestError;
      }
    }

    describe('#_attemptToProceed', () => {
      it('should rethrow if the test() function throws', () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        const test = jest.fn(() => {
          throw new TestError();
        });

        try {
          executionCircuitBreaker.execute(test);
        } catch (error) {
          // Ignore the error
        }

        expect(() => executionCircuitBreaker['_attemptToProceed']()).toThrow(CircuitBreakerError);
      });

      it('should rethrow if the test() function throws an error that is not an instance of CircuitBreakerError', () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        const test = jest.fn(() => {
          throw new TestError();
        });

        try {
          executionCircuitBreaker.execute(test);
        } catch (error) {
          // Ignore the error
        }

        // Mock the .test() function to throw an error that is not an instance of CircuitBreakerError
        executionCircuitBreaker['test'] = () => {
          throw new TestError();
        };

        expect(() => executionCircuitBreaker['_attemptToProceed']()).toThrow(TestError);
      });

      it('should throw if either _isTimeForRetry or _shouldRetry returns false', () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        const test = jest.fn(() => {
          throw new TestError();
        });

        try {
          executionCircuitBreaker.execute(test);
        } catch (error) {
          // Ignore the error
        }

        // Mock the ._isTimeForRetry() function to return false
        executionCircuitBreaker['_nextRetry'] = new Date('9999-12-31T23:59:59.999Z');

        expect(() => executionCircuitBreaker['_attemptToProceed']()).toThrow(CircuitBreakerError);

        const otherExecutionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        try {
          otherExecutionCircuitBreaker.execute(test);
        } catch (error) {
          // Ignore the error
        }

        otherExecutionCircuitBreaker['_shouldRetry'] = true;
        otherExecutionCircuitBreaker['_nextRetry'] = new Date('0001-01-01T00:00:00.000Z');

        // Should not throw
        otherExecutionCircuitBreaker['_attemptToProceed']();

        otherExecutionCircuitBreaker['_shouldRetry'] = false;

        expect(() => otherExecutionCircuitBreaker['_attemptToProceed']()).toThrow(CircuitBreakerError);
      });
    });

    describe('#shouldTrip', () => {
      it('should return true if the error is an instance of TestError', () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker();

        expect(executionCircuitBreaker['shouldTrip'](new TestError())).toBe(true);
      });
    });

    describe('#execute', () => {
      it('should execute the function if the circuit breaker is closed', () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker();

        const action = jest.fn();

        executionCircuitBreaker.execute(action);

        expect(action).toBeCalled();
      });

      it('should throw a CircuitBreakerError if the circuit breaker is open', () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        const action = jest.fn(() => {
          throw new TestError();
        });

        try {
          executionCircuitBreaker.execute(action);
        } catch (error) {
          // do nothing
        }

        expect(() => executionCircuitBreaker.execute(action)).toThrow(CircuitBreakerError);
      });

      it('should execute trip the circuit breaker if the function throws an error of type TestError', () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        const action = jest.fn(() => {
          throw new TestError();
        });

        try {
          executionCircuitBreaker.execute(action);
        } catch (error) {
          // do nothing
        }

        expect(executionCircuitBreaker.isTripped).toBe(true);
      });

      it('should set _shouldRetry to true in the finally block', () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        const action = jest.fn(() => {
          throw new TestError();
        });

        try {
          executionCircuitBreaker.execute(action);
        } catch (error) {
          // do nothing
        }

        expect(executionCircuitBreaker['_shouldRetry']).toBe(true);
      });
    });

    describe('#executeAsync', () => {
      it('should execute the function if the circuit breaker is closed', async () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker();

        const action = jest.fn();

        await executionCircuitBreaker.executeAsync(action);

        expect(action).toBeCalled();
      });

      it('should throw a CircuitBreakerError if the circuit breaker is open', async () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        const action = jest.fn(async () => {
          throw new TestError();
        });

        try {
          await executionCircuitBreaker.executeAsync(action);
        } catch (error) {
          // do nothing
        }

        expect(executionCircuitBreaker.executeAsync(action)).rejects.toThrow(CircuitBreakerError);
      });

      it('should execute trip the circuit breaker if the function throws an error of type TestError', async () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        const action = jest.fn(async () => {
          throw new TestError();
        });

        try {
          await executionCircuitBreaker.executeAsync(action);
        } catch (error) {
          // do nothing
        }

        expect(executionCircuitBreaker.isTripped).toBe(true);
      });

      it('should set _shouldRetry to true in the finally block', async () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker(5000);

        const action = jest.fn(async () => {
          throw new TestError();
        });

        try {
          await executionCircuitBreaker.executeAsync(action);
        } catch (error) {
          // do nothing
        }

        expect(executionCircuitBreaker['_shouldRetry']).toBe(true);
      });
    });

    describe('#reset', () => {
      it('should set _nextRetry to 0001-01-01T00:00:00.00Z', () => {
        const executionCircuitBreaker = new ExecutionCircuitBreaker();

        executionCircuitBreaker.reset();

        expect(executionCircuitBreaker['_nextRetry']).toEqual(new Date('0001-01-01T00:00:00.00Z'));
      });
    });
  });

  describe('TripReasonAuthorityBase', () => {
    class TestError extends Error {
      constructor() {
        super('TestError');
      }
    }

    class TestTripReasonAuthority extends TripReasonAuthorityBase<string> {
      public isReasonForTrip(context: string, error: Error): boolean {
        return error instanceof TestError || context === 'test';
      }
    }

    describe('#isReasonForTrip', () => {
      it('should return true if the error is an instance of TestError', () => {
        const tripReasonAuthority = new TestTripReasonAuthority();

        expect(tripReasonAuthority.isReasonForTrip('test', new TestError())).toBe(true);
      });

      it('should return true if the context is "test"', () => {
        const tripReasonAuthority = new TestTripReasonAuthority();

        expect(tripReasonAuthority.isReasonForTrip('test', new Error())).toBe(true);
      });
    });
  });
});
