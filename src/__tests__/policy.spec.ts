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
	File Name: policy.spec.ts
	Description: Test specification for the circuit breaker policy classes.
	Written by: Nikita Petko
*/

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import TripReasonAuthorityBase from '../sentinels/base/trip_reason_authority_base';
import DefaultCircuitBreakerPolicy from '../sentinels/policy/default_circuit_breaker_policy';
import DefaultCircuitBreakerPolicyConfig from '../sentinels/policy/default_circuit_breaker_policy_config';

describe('Circuit breaker policies', () => {
  describe('DefaultCircuitBreakerPolicy', () => {
    class TripReasonAuthority extends TripReasonAuthorityBase<string> {
      public isReasonForTrip(executionContext: string, error: Error): boolean {
        return error?.message === 'Test error' || executionContext === 'Test context';
      }
    }

    describe('#constructor', () => {
      it('should construct a new instance of the DefaultCircuitBreakerPolicy class', () => {
        const policy = new DefaultCircuitBreakerPolicy(
          'Test Circuit Breaker',
          new DefaultCircuitBreakerPolicyConfig(),
          new TripReasonAuthority(),
        );

        expect(policy).toBeInstanceOf(DefaultCircuitBreakerPolicy);
      });

      it('should throw an error if the circuit breaker identifier is not specified', () => {
        expect(() => {
          new DefaultCircuitBreakerPolicy('', new DefaultCircuitBreakerPolicyConfig(), new TripReasonAuthority());
        }).toThrow();

        expect(() => {
          new DefaultCircuitBreakerPolicy(
            undefined as any,
            new DefaultCircuitBreakerPolicyConfig(),
            new TripReasonAuthority(),
          );
        }).toThrow();

        expect(() => {
          new DefaultCircuitBreakerPolicy(
            null as any,
            new DefaultCircuitBreakerPolicyConfig(),
            new TripReasonAuthority(),
          );
        }).toThrow();
      });

      it('should throw an error if the circuit breaker policy configuration is not specified', () => {
        expect(() => {
          new DefaultCircuitBreakerPolicy('Test Circuit Breaker', undefined as any, new TripReasonAuthority());
        }).toThrow();

        expect(() => {
          new DefaultCircuitBreakerPolicy('Test Circuit Breaker', null as any, new TripReasonAuthority());
        }).toThrow();
      });

      it('should throw an error if the trip reason authority is not specified', () => {
        expect(() => {
          new DefaultCircuitBreakerPolicy(
            'Test Circuit Breaker',
            new DefaultCircuitBreakerPolicyConfig(),
            undefined as any,
          );
        }).toThrow();

        expect(() => {
          new DefaultCircuitBreakerPolicy('Test Circuit Breaker', new DefaultCircuitBreakerPolicyConfig(), null as any);
        }).toThrow();
      });

      it('should throw an error if the config failuresAllowedBeforeTrip is less than 0', () => {
        class CircuitBreakerPolicyConfig extends DefaultCircuitBreakerPolicyConfig {
          public get failuresAllowedBeforeTrip(): number {
            return -1;
          }
        }

        expect(() => {
          new DefaultCircuitBreakerPolicy(
            'Test Circuit Breaker',
            new CircuitBreakerPolicyConfig(),
            new TripReasonAuthority(),
          );
        }).toThrow();
      });
    });

    describe('#isCircuitBreakerOpen', () => {
      it('should return true if the circuit breaker is open', () => {
        const policy = new DefaultCircuitBreakerPolicy(
          'Test Circuit Breaker',
          new DefaultCircuitBreakerPolicyConfig(),
          new TripReasonAuthority(),
        );

        policy['_circuitBreaker'].trip();

        policy['_nextRetry'] = Date.now() + 10000;

        expect(policy['isCircuitBreakerOpen']('Test context')[0]).toBe(true);
      });

      it('should return false if the circuit breaker is not open', () => {
        const policy = new DefaultCircuitBreakerPolicy(
          'Test Circuit Breaker',
          new DefaultCircuitBreakerPolicyConfig(),
          new TripReasonAuthority(),
        );

        expect(policy['isCircuitBreakerOpen']('Test context')[0]).toBe(false);
      });

      it('should return false if the _nextRetry is less than or equal to the current time and the _shouldRetry is not set to true', () => {
        const policy = new DefaultCircuitBreakerPolicy(
          'Test Circuit Breaker',
          new DefaultCircuitBreakerPolicyConfig(),
          new TripReasonAuthority(),
        );

        policy['_circuitBreaker'].trip();

        policy['_nextRetry'] = Date.now() - 1000;

        expect(policy['isCircuitBreakerOpen']('Test context')[0]).toBe(false);
      });
    });

    describe('#onSuccessfulRequest', () => {
      it('should reset the circuit breaker', () => {
        const policy = new DefaultCircuitBreakerPolicy(
          'Test Circuit Breaker',
          new DefaultCircuitBreakerPolicyConfig(),
          new TripReasonAuthority(),
        );

        policy['_circuitBreaker'].trip();

        policy['onSuccessfulRequest']('Test context');

        expect(policy['isCircuitBreakerOpen']('Test context')[0]).toBe(false);
      });

      it('should reset the _consecutiveFailures', () => {
        const policy = new DefaultCircuitBreakerPolicy(
          'Test Circuit Breaker',
          new DefaultCircuitBreakerPolicyConfig(),
          new TripReasonAuthority(),
        );

        policy['_consecutiveFailures'] = 10;

        policy['onSuccessfulRequest']('Test context');

        expect(policy['_consecutiveFailures']).toBe(0);
      });
    });

    describe('#onNotified', () => {
      it('should reset the _shouldRetry', () => {
        const policy = new DefaultCircuitBreakerPolicy(
          'Test Circuit Breaker',
          new DefaultCircuitBreakerPolicyConfig(),
          new TripReasonAuthority(),
        );

        policy['_shouldRetry'] = true;

        policy['onNotified']('Test context');

        expect(policy['_shouldRetry']).toBe(false);
      });
    });

    describe('#tryToTripCircuitBreaker', () => {
      class CircuitBreakerPolicyConfig extends DefaultCircuitBreakerPolicyConfig {
        public get failuresAllowedBeforeTrip(): number {
          return 1;
        }
      }

      it('should trip the circuit breaker if the _consecutiveFailures less than or equal to config.failuresAllowedBeforeTrip', () => {
        const policy = new DefaultCircuitBreakerPolicy(
          'Test Circuit Breaker',
          new DefaultCircuitBreakerPolicyConfig(),
          new TripReasonAuthority(),
        );

        policy['_consecutiveFailures'] = 2;

        policy['tryToTripCircuitBreaker']('Test context');

        expect(policy['isCircuitBreakerOpen']('Test context')[0]).toBe(true);
      });

      it('should not trip the circuit breaker if the _consecutiveFailures is greater than config.failuresAllowedBeforeTrip', () => {
        const policy = new DefaultCircuitBreakerPolicy(
          'Test Circuit Breaker',
          new CircuitBreakerPolicyConfig(),
          new TripReasonAuthority(),
        );

        policy['_consecutiveFailures'] = 0;

        policy['tryToTripCircuitBreaker']('Test context');

        expect(policy['isCircuitBreakerOpen']('Test context')[0]).toBe(false);
      });
    });
  });

  describe('DefaultCircuitBreakerPolicyConfig', () => {
    class CircuitBreakerPolicyConfig extends DefaultCircuitBreakerPolicyConfig {
      public get failuresAllowedBeforeTrip(): number {
        return 5;
      }

      public get retryInterval(): number {
        return 1000;
      }
    }

    describe('#failuresAllowedBeforeTrip', () => {
      it('should return 5', () => {
        expect(new CircuitBreakerPolicyConfig().failuresAllowedBeforeTrip).toBe(5);
      });

      it('should set the value', () => {
        const config = new DefaultCircuitBreakerPolicyConfig();

        config.failuresAllowedBeforeTrip = 5;

        expect(config.failuresAllowedBeforeTrip).toBe(5);
      });

      it('should throw if the value is less than 0', () => {
        const config = new DefaultCircuitBreakerPolicyConfig();

        expect(() => {
          config.failuresAllowedBeforeTrip = -1;
        }).toThrow();
      });
    });

    describe('#retryInterval', () => {
      it('should return 1000', () => {
        expect(new CircuitBreakerPolicyConfig().retryInterval).toBe(1000);
      });

      it('should default to 250', () => {
        expect(new DefaultCircuitBreakerPolicyConfig().retryInterval).toBe(250);
      });

      it('should set the value', () => {
        const config = new DefaultCircuitBreakerPolicyConfig();

        config.retryInterval = 1000;

        expect(config.retryInterval).toBe(1000);
      });
    });
  });
});
