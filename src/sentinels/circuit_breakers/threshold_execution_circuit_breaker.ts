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
	File Name: threshold_execution_circuit_breaker.ts
	Description: Execution circuit breaker with an error threshold.
	Written by: Nikita Petko
*/

import ExecutionCircuitBreakerBase from '../base/execution_circuit_breaker_base';
import { FailureDetector, RetryIntervalCalculator } from './execution_circuit_breaker';

/**
 * Represents a function to get the error count for tripping the circuit breaker.
 * @returns {number} The error count for tripping the circuit breaker.
 */
export type ErrorCountGetter = () => number;

/**
 * Represents a function to get the error interval for tripping the circuit breaker.
 * @returns {number} The error interval for tripping the circuit breaker.
 * @remarks The error interval is the time window in which the error count is calculated.
 */
export type ErrorIntervalGetter = () => number;

/**
 * Execution circuit breaker with an error threshold.
 */
export default class ThresholdExecutionCircuitBreaker extends ExecutionCircuitBreakerBase {
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
   * @internal This is a private member.
   */
  private readonly _errorCountGetter: ErrorCountGetter;

  /**
   * @internal This is a private member.
   */
  private readonly _errorIntervalGetter: ErrorIntervalGetter;

  /**
   * @internal This is a private member.
   */
  private _errorCountIntervalEnd: number = new Date('0001-01-01T00:00:00Z').getTime();

  /**
   * @internal This is a private member.
   */
  private _errorCount: number;

  /**
   * Construct a new instance of the ThresholdExecutionCircuitBreaker class.
   * @param {string} name The name of the circuit breaker.
   * @param {FailureDetector} failureDetector The function to determine if an error is a failure.
   * @param {RetryIntervalCalculator} retryIntervalCalculator The function to calculate the retry interval.
   * @param {ErrorCountGetter} errorCountGetter The function to get the error count for tripping the circuit breaker.
   * @param {ErrorIntervalGetter} errorIntervalGetter The function to get the error interval for tripping the circuit breaker.
   */
  public constructor(
    name: string,
    failureDetector: FailureDetector,
    retryIntervalCalculator: RetryIntervalCalculator,
    errorCountGetter: ErrorCountGetter,
    errorIntervalGetter: ErrorIntervalGetter,
  ) {
    if (name === undefined || name === null || name === '') {
      throw new Error('name cannot be null, undefined or empty.');
    }

    if (failureDetector === undefined || failureDetector === null) {
      throw new Error('failureDetector cannot be null or undefined.');
    }

    if (retryIntervalCalculator === undefined || retryIntervalCalculator === null) {
      throw new Error('retryIntervalCalculator cannot be null or undefined.');
    }

    if (errorCountGetter === undefined || errorCountGetter === null) {
      throw new Error('errorCountGetter cannot be null or undefined.');
    }

    if (errorIntervalGetter === undefined || errorIntervalGetter === null) {
      throw new Error('errorIntervalGetter cannot be null or undefined.');
    }

    super();

    this._name = name;
    this._failureDetector = failureDetector;
    this._retryIntervalCalculator = retryIntervalCalculator;
    this._errorCountGetter = errorCountGetter;
    this._errorIntervalGetter = errorIntervalGetter;
  }

  /**
   * @internal This is a private member.
   */
  private _resetErrorCount(): void {
    this._errorCount = 0;
    this._errorCountIntervalEnd = super.now.getTime() + this._errorIntervalGetter();
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
   * Should the circuit breaker be tripped.
   * @param {Error} error The error.
   * @returns {boolean} True if the circuit breaker should be tripped, otherwise false.
   */
  protected shouldTrip(error: Error): boolean {
    if (error === undefined || error === null) {
      throw new Error('error cannot be null or undefined.');
    }

    if (this._failureDetector(error)) {
      if (super.now.getTime() > this._errorCountIntervalEnd) {
        this._resetErrorCount();
      }

      this._errorCount++;

      if (this._errorCount > this._errorCountGetter()) {
        return true;
      }
    }

    return false;
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
