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
	File Name: circuit_breaker.ts
	Description: Simple circuit breaker. Provides an implementation for the name property.
	Written by: Nikita Petko
*/

import CircuitBreakerBase from '../base/circuit_breaker_base';

/**
 * Simple circuit breaker. Provides an implementation for the name property.
 */
export default class CircuitBreaker extends CircuitBreakerBase {
  /**
   * @internal This is a private member.
   */
  private readonly _name: string;

  /**
   * Construct a new instance of the CircuitBreaker class.
   * @param {string} name The name of the circuit breaker.
   */
  constructor(name: string) {
    super();

    this._name = name;
  }

  /**
   * The name of the circuit breaker.
   * @returns {string} The name of the circuit breaker.
   * @override
   */
  protected get name(): string {
    return this._name;
  }
}
