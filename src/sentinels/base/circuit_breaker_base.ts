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
	File Name: circuit_breaker_base.ts
	Description: Base class for circuit breakers.
	Written by: Nikita Petko
*/

import ICircuitBreaker from '../interfaces/circuit_breaker';

/**
 * Error thrown when the circuit breaker is tripped.
 */
export class CircuitBreakerError extends Error {
  /**
   * Construct a new instance of the CircuitBreakerError class.
   * @param {string} message The error message.
   */
  public constructor(message: string) {
    super(message);

    this.name = 'CircuitBreaker Error';
  }
}

/**
 * Base class for circuit breakers.
 */
export default abstract class CircuitBreakerBase implements ICircuitBreaker {
  /**
   * @internal This is a private member.
   */
  private _isTripped = false;

  /**
   * The name of the circuit breaker.
   */
  protected abstract get name(): string;

  /**
   * The date when the circuit breaker was tripped.
   * If the circuit breaker is not tripped, this value is undefined.
   */
  protected trippedAt: Date | undefined;

  /**
   * Gets the current date time.
   */
  protected get now(): Date {
    return new Date();
  }

  /**
   * Is the circuit breaker tripped?
   */
  public get isTripped(): boolean {
    return this._isTripped;
  }

  /**
   * Resets the circuit breaker.
   * @returns {boolean} True if the circuit breaker was reset, false otherwise.
   */
  public reset(): boolean {
    if (!this._isTripped) {
      return false;
    }

    this._isTripped = false;
    this.trippedAt = undefined;

    return true;
  }

  /**
   * Tests the circuit breaker.
   * @throws {Error} If the circuit breaker is tripped.
   */
  public test(): void {
    if (this._isTripped) {
      throw this.getTripError();
    }
  }

  /**
   * Trips the circuit breaker.
   * @returns {boolean} True if the circuit breaker was tripped, false otherwise.
   */
  public trip(): boolean {
    if (this._isTripped) {
      return false;
    }

    this._isTripped = true;
    this.trippedAt = this.now;

    return true;
  }

  /**
   * Get the trip error.
   * @returns {Error} The trip error.
   */
  public getTripError(): Error {
    const now = this.now.getTime();
    const trippedAt = now - (this.trippedAt?.getTime() ?? now);
    const seconds = trippedAt / 1000;

    return new CircuitBreakerError(`'${this.name}' has been tripped for ${seconds} seconds.`);
  }
}
