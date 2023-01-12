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
	File Name: circuit_breakers.spec.ts
	Description: Test specification for the circuit breaker classes.
	Written by: Nikita Petko
*/

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import CircuitBreaker from '../sentinels/circuit_breakers/circuit_breaker';
import ExecutionCircuitBreaker from '../sentinels/circuit_breakers/execution_circuit_breaker';
import ThresholdExecutionCircuitBreaker from '../sentinels/circuit_breakers/threshold_execution_circuit_breaker';

describe('Circuit breakers', () => {
  describe('CircuitBreaker', () => {
    describe('#constructor', () => {
      it('should construct a new instance of the CircuitBreaker class', () => {
        const circuitBreaker = new CircuitBreaker('Test circuit breaker');

        expect(circuitBreaker).toBeInstanceOf(CircuitBreaker);
      });
    });

    describe('#name', () => {
      it('should return the name of the circuit breaker', () => {
        const circuitBreaker = new CircuitBreaker('Test circuit breaker');

        expect(circuitBreaker['name']).toBe('Test circuit breaker');
      });
    });
  });

  describe('ExecutionCircuitBreaker', () => {
    describe('#constructor', () => {
      it('should construct a new instance of the ExecutionCircuitBreaker class', () => {
        const circuitBreaker = new ExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
        );

        expect(circuitBreaker).toBeInstanceOf(ExecutionCircuitBreaker);
      });

      it('should throw an error if the name is not specified', () => {
        expect(
          () =>
            new ExecutionCircuitBreaker(
              '',
              (ex) => true,
              () => 0,
            ),
        ).toThrow();
      });

      it('should throw an error if the shouldTrip function is not specified', () => {
        expect(() => new ExecutionCircuitBreaker('Test circuit breaker', undefined as any, () => 0)).toThrow();
      });

      it('should throw an error if the retryInterval function is not specified', () => {
        expect(() => new ExecutionCircuitBreaker('Test circuit breaker', (ex) => true, undefined as any)).toThrow();
      });
    });

    describe('#name', () => {
      it('should return the name of the circuit breaker', () => {
        const circuitBreaker = new ExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
        );

        expect(circuitBreaker['name']).toBe('Test circuit breaker');
      });
    });

    describe('#shouldTrip', () => {
      it('should return true if the error is a reason for tripping the circuit breaker', () => {
        const circuitBreaker = new ExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
        );

        expect(circuitBreaker['shouldTrip'](new Error('Test error'))).toBe(true);
      });
    });

    describe('#retryInterval', () => {
      it('should return the retry interval', () => {
        const circuitBreaker = new ExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
        );

        expect(circuitBreaker['retryInterval']).toBe(0);
      });
    });
  });

  describe('ThresholdExecutionCircuitBreaker', () => {
    describe('#constructor', () => {
      it('should construct a new instance of the ThresholdExecutionCircuitBreaker class', () => {
        const circuitBreaker = new ThresholdExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
          () => 0,
          () => 0,
        );

        expect(circuitBreaker).toBeInstanceOf(ThresholdExecutionCircuitBreaker);
      });

      it('should throw an error if the name is not specified', () => {
        expect(
          () =>
            new ThresholdExecutionCircuitBreaker(
              '',
              (ex) => true,
              () => 0,
              () => 0,
              () => 0,
            ),
        ).toThrow();
      });

      it('should throw an error if the shouldTrip function is not specified', () => {
        expect(
          () =>
            new ThresholdExecutionCircuitBreaker(
              'Test circuit breaker',
              undefined as any,
              () => 0,
              () => 0,
              () => 0,
            ),
        ).toThrow();
      });

      it('should throw an error if the retryInterval function is not specified', () => {
        expect(
          () =>
            new ThresholdExecutionCircuitBreaker(
              'Test circuit breaker',
              (ex) => true,
              undefined as any,
              () => 0,
              () => 0,
            ),
        ).toThrow();
      });

      it('should throw an error if the threshold function is not specified', () => {
        expect(
          () =>
            new ThresholdExecutionCircuitBreaker(
              'Test circuit breaker',
              (ex) => true,
              () => 0,
              undefined as any,
              () => 0,
            ),
        ).toThrow();
      });

      it('should throw an error if the interval function is not specified', () => {
        expect(
          () =>
            new ThresholdExecutionCircuitBreaker(
              'Test circuit breaker',
              (ex) => true,
              () => 0,
              () => 0,
              undefined as any,
            ),
        ).toThrow();
      });
    });

    describe('#_resetErrorCount', () => {
      it('should reset the error count', () => {
        const circuitBreaker = new ThresholdExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
          () => 0,
          () => 0,
        );

        circuitBreaker['_errorCount'] = 1;

        circuitBreaker['_resetErrorCount']();

        expect(circuitBreaker['_errorCount']).toBe(0);
      });
    });

    describe('#name', () => {
      it('should return the name of the circuit breaker', () => {
        const circuitBreaker = new ThresholdExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
          () => 0,
          () => 0,
        );

        expect(circuitBreaker['name']).toBe('Test circuit breaker');
      });
    });

    describe('#shouldTrip', () => {
      it('should return true if the error is a reason for tripping the circuit breaker', () => {
        const circuitBreaker = new ThresholdExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
          () => 0,
          () => 0,
        );

        expect(circuitBreaker['shouldTrip'](new Error('Test error'))).toBe(true);
      });

      it('should return false if the error is not a reason for tripping the circuit breaker', () => {
        const circuitBreaker = new ThresholdExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => false,
          () => 0,
          () => 0,
          () => 0,
        );

        expect(circuitBreaker['shouldTrip'](new Error('Test error'))).toBe(false);
      });

      it('should return false if the error count is less than the threshold', () => {
        const circuitBreaker = new ThresholdExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
          () => 1,
          () => 0,
        );

        expect(circuitBreaker['shouldTrip'](new Error('Test error'))).toBe(false);
      });

      it('should call _resetErrorCount if the error count interval end is smaller than the current time', () => {
        const circuitBreaker = new ThresholdExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
          () => 1,
          () => 0,
        );

        circuitBreaker['_errorCount'] = 1;
        circuitBreaker['_errorCountIntervalEnd'] = 0;

        jest.spyOn(circuitBreaker, '_resetErrorCount' as any);

        circuitBreaker['shouldTrip'](new Error('Test error'));

        expect(circuitBreaker['_resetErrorCount']).toHaveBeenCalled();
      });

      it('should throw an error if the error argument is not specified', () => {
        const circuitBreaker = new ThresholdExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
          () => 1,
          () => 0,
        );

        expect(() => circuitBreaker['shouldTrip'](undefined as any)).toThrow();
        expect(() => circuitBreaker['shouldTrip'](null as any)).toThrow();
      });
    });

    describe('#retryInterval', () => {
      it('should return the retry interval', () => {
        const circuitBreaker = new ThresholdExecutionCircuitBreaker(
          'Test circuit breaker',
          (ex) => true,
          () => 0,
          () => 0,
          () => 0,
        );

        expect(circuitBreaker['retryInterval']).toBe(0);
      });
    });
  });
});
