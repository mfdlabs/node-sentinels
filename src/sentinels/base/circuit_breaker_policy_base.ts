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
	File Name: circuit_breaker_policy_base.ts
	Description: Base class for circuit breaker policies.
	Written by: Nikita Petko
*/

import ITripReasonAuthority from '../interfaces/trip_reason_authority';
import ICircuitBreakerPolicy, { OnRequestToOpen, OnTerminatingRequest } from '../interfaces/circuit_breaker_policy';

/**
 * Base class for circuit breaker policies.
 * @template TExecutionContext The type of the execution context.
 */
export default abstract class CircuitBreakerPolicyBase<TExecutionContext>
  implements ICircuitBreakerPolicy<TExecutionContext>
{
  /**
   * @internal This is a private member.
   */
  private readonly _tripReasonAuthority: ITripReasonAuthority<TExecutionContext>;

  /**
   * Construct a new instance of the CircuitBreakerPolicyBase class.
   * @param {ITripReasonAuthority<TExecutionContext>} tripReasonAuthority The trip reason authority.
   */
  protected constructor(tripReasonAuthority: ITripReasonAuthority<TExecutionContext>) {
    if (tripReasonAuthority === undefined || tripReasonAuthority === null) {
      throw new Error('The trip reason authority cannot be null or undefined.');
    }

    this._tripReasonAuthority = tripReasonAuthority;
  }

  /**
   * An action to perform when the circuit breaker is terminating a request.
   */
  public onTerminatingRequest: OnTerminatingRequest | undefined;

  /**
   * An action to perform when a request to open the circuit breaker is made.
   */
  public onRequestToOpen: OnRequestToOpen | undefined;

  /**
   * Notify the policy that a request has finished.
   * @param {TExecutionContext} executionContext The execution context.
   * @param {Error} error The error that occurred.
   */
  public notifyRequestFinished(executionContext: TExecutionContext, error: Error): void {
    try {
      if (this._tripReasonAuthority.isReasonForTrip(executionContext, error)) {
        this.onRequestToOpen?.();
        this.tryToTripCircuitBreaker(executionContext);
      } else {
        this.onSuccessfulRequest(executionContext);
      }
    } finally {
      this.onNotified(executionContext);
    }
  }

  /**
   * Throw if the circuit breaker is tripped.
   * @param {TExecutionContext} executionContext The execution context.
   */
  public throwIfTripped(executionContext: TExecutionContext): void {
    const [isTripped, ex] = this.isCircuitBreakerOpen(executionContext);

    if (!isTripped) {
      return;
    }

    this.onTerminatingRequest?.();
    throw ex;
  }

  /**
   * Determine if the circuit breaker is openened.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {[boolean, Error]} A tuple containing a boolean indicating if the circuit breaker is openened and the error that caused the circuit breaker to open.
   */
  protected abstract isCircuitBreakerOpen(executionContext: TExecutionContext): [boolean, Error];

  /**
   * Try to trip the circuit breaker.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {boolean} True if the circuit breaker was tripped, otherwise false.
   */
  protected abstract tryToTripCircuitBreaker(executionContext: TExecutionContext): boolean;

  /**
   * An action to perform when a request has finished successfully.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {void}
   */
  protected abstract onSuccessfulRequest(executionContext: TExecutionContext): void;

  /**
   * An action to perform when the policy is notified.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {void}
   */
  protected abstract onNotified(executionContext: TExecutionContext): void;
}
