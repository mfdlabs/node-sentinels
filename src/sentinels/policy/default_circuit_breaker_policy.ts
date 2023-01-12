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
	File Name: default_circuit_breaker_policy.ts
	Description: Default circuit breaker policy.
	Written by: Nikita Petko
*/

/* eslint-disable @typescript-eslint/no-unused-vars */

import CircuitBreaker from '../circuit_breakers/circuit_breaker';
import ITripReasonAuthority from '../interfaces/trip_reason_authority';
import CircuitBreakerPolicyBase from '../base/circuit_breaker_policy_base';
import IDefaultCircuitBreakerPolicyConfig from '../interfaces/default_circuit_breaker_policy_config';

/**
 * Default circuit breaker policy.
 * @template TExecutionContext The type of the execution context.
 */
export default class DefaultCircuitBreakerPolicy<
  TExecutionContext,
> extends CircuitBreakerPolicyBase<TExecutionContext> {
  /**
   * @internal This is a private member.
   */
  private readonly _circuitBreaker: CircuitBreaker;

  /**
   * @internal This is a private member.
   */
  private _shouldRetry: boolean;

  /**
   * @internal This is a private member.
   */
  private _consecutiveFailures: number;

  /**
   * @internal This is a private member.
   */
  private _nextRetry: number = new Date('0001-01-01T00:00:00.000Z').getTime();

  /**
   * The circuit breaker policy configuration.
   */
  protected readonly config: IDefaultCircuitBreakerPolicyConfig;

  /**
   * Construct a new instance of the DefaultCircuitBreakerPolicy class.
   * @param {string} circuitBreakerIdentifier The identifier of the circuit breaker.
   * @param {IDefaultCircuitBreakerPolicyConfig} config The circuit breaker policy configuration.
   * @param {ITripReasonAuthority<TExecutionContext>} tripReasonAuthority The trip reason authority.
   */
  public constructor(
    circuitBreakerIdentifier: string,
    config: IDefaultCircuitBreakerPolicyConfig,
    tripReasonAuthority: ITripReasonAuthority<TExecutionContext>,
  ) {
    super(tripReasonAuthority);

    if (
      circuitBreakerIdentifier === undefined ||
      circuitBreakerIdentifier === null ||
      circuitBreakerIdentifier === ''
    ) {
      throw new Error('The circuit breaker identifier cannot be null or undefined.');
    }

    if (config === undefined || config === null) {
      throw new Error('The circuit breaker policy configuration cannot be null or undefined.');
    }

    if (config.failuresAllowedBeforeTrip < 0) {
      throw new Error('The number of failures allowed before trip cannot be less than zero.');
    }

    this._circuitBreaker = new CircuitBreaker(circuitBreakerIdentifier);
    this.config = config;
  }

  /**
   * Is the circuit breaker open?
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {[boolean, Error]} A tuple containing a boolean indicating whether the circuit breaker is open and an error if the circuit breaker is open.
   * @override
   */
  protected isCircuitBreakerOpen(executionContext: TExecutionContext): [boolean, Error] {
    if (!this._circuitBreaker.isTripped) {
      return [false, undefined];
    }

    if (this._nextRetry <= Date.now() && !this._shouldRetry) {
      return [false, undefined];
    }

    return [true, this._circuitBreaker.getTripError()];
  }

  /**
   * On successful reequst.
   * @param {TExecutionContext} executionContext The execution context.
   * @override
   */
  protected onSuccessfulRequest(executionContext: TExecutionContext): void {
    this._consecutiveFailures = 0;
    this._circuitBreaker.reset();
  }

  /**
   * On notified.
   * @param {TExecutionContext} executionContext The execution context.
   * @override
   */
  protected onNotified(executionContext: TExecutionContext): void {
    this._shouldRetry = false;
  }

  /**
   * Try to trip the circuit breaker.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {boolean} A boolean indicating whether the circuit breaker was tripped.
   * @override
   */
  protected tryToTripCircuitBreaker(executionContext: TExecutionContext): boolean {
    this._consecutiveFailures++;

    if (this._consecutiveFailures <= this.config.failuresAllowedBeforeTrip) {
      return false;
    }

    this._nextRetry = Date.now() + this.config.retryInterval;
    this._circuitBreaker.trip();

    return true;
  }
}
