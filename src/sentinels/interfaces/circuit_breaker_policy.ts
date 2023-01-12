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
	File Name: circuit_breaker_policy.ts
	Description: Interface for the circuit breaker policy.
	Written by: Nikita Petko
*/

/* eslint-disable semi */

/**
 * Function that is called when the circuit breaker is terminating a request.
 */
export type OnTerminatingRequest = () => void;

/**
 * Function that is called when a request to open the circuit breaker is made.
 */
export type OnRequestToOpen = () => void;

/**
 * Interface for the circuit breaker policy.
 * @template TExecutionContext The execution context type.
 */
export default interface ICircuitBreakerPolicy<in TExecutionContext> {
  /**
   * Invoked when the circuit breaker terminates the request.
   */
  onTerminatingRequest: OnTerminatingRequest | undefined;

  /**
   * Invoked when a request to open the circuit breaker is made.
   */
  onRequestToOpen: OnRequestToOpen | undefined;

  /**
   * Notify the policy that a request has finished.
   * @param {TExecutionContext} executionContext The execution context.
   * @param {Error?} error The error that occurred.
   */
  notifyRequestFinished(executionContext: TExecutionContext, error?: Error): void;

  /**
   * Throw if the circuit breaker is tripped.
   * @param {TExecutionContext} executionContext The execution context.
   * @throws {CircuitBreakerError} Thrown if the circuit breaker is tripped.
   * @returns {void}
   */
  throwIfTripped(executionContext: TExecutionContext): void;
}
