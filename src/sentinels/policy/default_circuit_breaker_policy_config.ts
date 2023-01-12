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
	Description: Configuration for the default circuit breaker policy.
	Written by: Nikita Petko
*/

import IDefaultCircuitBreakerPolicyConfig from '../interfaces/default_circuit_breaker_policy_config';

/**
 * Configuration for the default circuit breaker policy.
 */
export default class DefaultCircuitBreakerPolicyConfig implements IDefaultCircuitBreakerPolicyConfig {
  /**
   * @internal This is a private member.
   */
  private _retryInterval = 250;

  /**
   * @internal This is a private member.
   */
  private _failuresAllowedBeforeTrip = 0;

  /**
   * Retry interval in milliseconds.
   * @returns {number} Retry interval in milliseconds.
   */
  public get retryInterval(): number {
    return this._retryInterval;
  }

  /**
   * Retry interval in milliseconds.
   * @param {number} value Retry interval in milliseconds.
   */
  public set retryInterval(value: number) {
    this._retryInterval = value;
  }

  /**
   * Failures allowed before trip.
   * @returns {number} Failures allowed before trip.
   */
  public get failuresAllowedBeforeTrip(): number {
    return this._failuresAllowedBeforeTrip;
  }

  /**
   * Failures allowed before trip.
   * @param {number} value Failures allowed before trip.
   * @throws {Error} Failures allowed before trip is out of range.
   */
  public set failuresAllowedBeforeTrip(value: number) {
    if (value < 0) {
      throw new Error('Failures allowed before trip is out of range.');
    }

    this._failuresAllowedBeforeTrip = value;
  }
}
