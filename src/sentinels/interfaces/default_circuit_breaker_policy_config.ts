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
	File Name: default_circuit_breaker_policy_config.ts
	Description: Interface for the circuit breaker policy config.
	Written by: Nikita Petko
*/

/* eslint-disable semi */

/**
 * Interface for the circuit breaker policy config.
 */
export default interface IDefaultCircuitBreakerPolicyConfig {
  /**
   * The retry interval.
   * @returns {number} The retry interval.
   */
  get retryInterval(): number;

  /**
   * The retry interval.
   * @param {number} value The retry interval.
   */
  set retryInterval(value: number);

  /**
   * The failures allowed before tripping the circuit breaker.
   * @returns {number} The failures allowed before tripping the circuit breaker.
   */
  get failuresAllowedBeforeTrip(): number;

  /**
   * The failures allowed before tripping the circuit breaker.
   * @param {number} value The failures allowed before tripping the circuit breaker.
   */
  set failuresAllowedBeforeTrip(value: number);
}
