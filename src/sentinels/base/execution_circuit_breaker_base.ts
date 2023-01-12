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
	File Name: execution_circuit_breaker_base.ts
	Description: Base class for execution circuit breakers.
	Written by: Nikita Petko
*/

import CircuitBreakerBase, { CircuitBreakerError } from './circuit_breaker_base';

/**
 * Represents a function that can be executed by an execution circuit breaker.
 */
export type Action = () => void;

/**
 * Represents a function that can be executed by an execution circuit breaker asynchronously.
 * @returns {Promise<void>} A promise that resolves when the function has completed.
 */
export type AsyncAction = () => Promise<void>;

/**
 * Base class for execution circuit breakers.
 */
export default abstract class ExecutionCircuitBreakerBase extends CircuitBreakerBase {
  /**
   * @internal This is a private member.
   */
  private _nextRetry: Date = new Date('0001-01-01T00:00:00Z');

  /**
   * @internal This is a private member.
   */
  private _shouldRetry: boolean;

  /**
   * @internal This is a private member.
   */
  private get _isTimeForRetry(): boolean {
    return super.now.getTime() >= this._nextRetry.getTime();
  }

  /**
   * The retry interval for the circuit breaker.
   */
  protected abstract get retryInterval(): number;

  /**
   * @internal This is a private member.
   */
  private _attemptToProceed(): void {
    try {
      this.test();
    } catch (e) {
      if (!(e instanceof CircuitBreakerError)) {
        throw e;
      }

      if (!this._isTimeForRetry || !this._shouldRetry) {
        throw e;
      }
    }
  }

  /**
   * Should this circuit breaker trip?
   * @param {Error} error The error that was thrown.
   * @returns {boolean} True if the circuit breaker should trip, false otherwise.
   */
  protected abstract shouldTrip(error: Error): boolean;

  /**
   * Execute the given circuit action.
   * @param {Action} action The action to execute.
   */
  public execute(action: Action): void {
    this._attemptToProceed();

    try {
      action();
    } catch (e) {
      if (this.shouldTrip(e)) {
        this._nextRetry = new Date(super.now.getTime() + this.retryInterval);
        this.trip();
      }

      throw e;
    } finally {
      this._shouldRetry = true;
    }

    this.reset();
  }

  /**
   * Execute the given circuit action asynchronously.
   * @param {AsyncAction} action The action to execute.
   * @returns {Promise<void>} A promise that resolves when the action is executed.
   */
  public async executeAsync(action: AsyncAction): Promise<void> {
    this._attemptToProceed();

    try {
      await action();
    } catch (e) {
      if (this.shouldTrip(e)) {
        this._nextRetry = new Date(super.now.getTime() + this.retryInterval);
        this.trip();
      }

      throw e;
    } finally {
      this._shouldRetry = true;
    }

    this.reset();
  }

  /**
   * Reset the circuit breaker.
   * @returns {boolean} True if the circuit breaker was reset, false otherwise.
   */
  public reset(): boolean {
    this._nextRetry = new Date('0001-01-01T00:00:00Z');
    return super.reset();
  }
}
