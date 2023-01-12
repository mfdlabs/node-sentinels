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
	File Name: execution_circuit_breaker.ts
	Description: Simple execution circuit breaker.
	Written by: Nikita Petko
*/

import ExecutionCircuitBreakerBase from '../base/execution_circuit_breaker_base';

/**
 * Represents a function to determine if an error is a failure.
 * @param {Error} error The error to check.
 * @returns {boolean} True if the error is a failure, otherwise false.
 */
export type FailureDetector = (error: Error) => boolean;

/**
 * Represents a function to calculate the retry interval.
 * @returns {number} The retry interval.
 */
export type RetryIntervalCalculator = () => number;

/**
 * Simple execution circuit breaker.
 */
export default class ExecutionCircuitBreaker extends ExecutionCircuitBreakerBase {
  /**
   * @internal This is a private member.
   */
  private readonly _name: string;

  /**
   * @internal This is a private member.
   */
  private readonly _failureDetector: FailureDetector;

  /**
   * @internal This is a private member.
   */
  private readonly _retryIntervalCalculator: RetryIntervalCalculator;

  /**
   * Construct a new instance of the ExecutionCircuitBreaker class.
   * @param {string} name The name of the circuit breaker.
   * @param {FailureDetector} failureDetector The function to determine if an error is a failure.
   * @param {RetryIntervalCalculator} retryIntervalCalculator The function to calculate the retry interval.
   */
  public constructor(name: string, failureDetector: FailureDetector, retryIntervalCalculator: RetryIntervalCalculator) {
    if (name === undefined || name === null || name === '') {
      throw new Error('The name parameter is required.');
    }

    if (failureDetector === undefined || failureDetector === null) {
      throw new Error('The failureDetector parameter is required.');
    }

    if (retryIntervalCalculator === undefined || retryIntervalCalculator === null) {
      throw new Error('The retryIntervalCalculator parameter is required.');
    }

    super();

    this._name = name;
    this._failureDetector = failureDetector;
    this._retryIntervalCalculator = retryIntervalCalculator;
  }

  /**
   * The name of the circuit breaker.
   * @returns {string} The name of the circuit breaker.
   * @override
   */
  protected get name(): string {
    return this._name;
  }

  /**
   * The function to determine if this circuit breaker should be tripped.
   * @param {Error} error The error to check.
   * @returns {boolean} True if the circuit breaker should be tripped, otherwise false.
   * @override
   */
  protected shouldTrip(error: Error): boolean {
    return this._failureDetector(error);
  }

  /**
   * Get the retry interval.
   * @returns {number} The retry interval.
   * @override
   */
  protected get retryInterval(): number {
    return this._retryIntervalCalculator();
  }
}
