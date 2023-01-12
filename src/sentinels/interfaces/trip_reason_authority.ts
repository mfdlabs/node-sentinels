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
	File Name: trip_reason_authority.ts
	Description: Interface for the trip reason authority.
	Written by: Nikita Petko
*/

/* eslint-disable semi */

/**
 * Interface for the trip reason authority.
 * @template TExecutionContext The execution context type.
 */
export default interface ITripReasonAuthority<in TExecutionContext> {
  /**
   * Is this a reason to trip the circuit breaker?
   * @param {TExecutionContext} executionContext The execution context.
   * @param {Error} error The error.
   * @returns {boolean} Is this a reason to trip the circuit breaker?
   */
  isReasonForTrip(executionContext: TExecutionContext, error: Error): boolean;
}
