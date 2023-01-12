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
	Description: Interface for the sentinel.
	Written by: Nikita Petko
*/

/* eslint-disable semi */

/**
 * Interface for the sentinel.
 */
export default interface ISentinel {
  /**
   * Is the sentinel healthy.
   * @returns {boolean} Is the sentinel healthy.
   */
  get isHealthy(): boolean;
}
