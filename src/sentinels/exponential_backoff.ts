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
	File Name: exponential_backoff.ts
	Description: A class that calculates the exponential backoff time.
	Written by: Nikita Petko
*/

import { Jitter } from './enums/jitter';

/**
 * A class that calculates the exponential backoff time.
 */
export default class ExponentialBackoff {
  /**
   * The ceiling for the maximum number of attempts.
   */
  public static readonly ceilingForMaxAttempts = 10;

  /**
   * Calculates the exponential backoff time.
   * @param {number} attempt The attempt number.
   * @param {number} maxAttempts The maximum number of attempts.
   * @param {number} baseDelay The base delay.
   * @param {number} maxDelay The maximum delay.
   * @param {Jitter} jitter The jitter.
   * @returns {number} The exponential backoff time.
   * @throws {Error} The max attempts must be between 0 and 10.
   */
  public static calculateBackoff(
    attempt: number,
    maxAttempts: number,
    baseDelay: number,
    maxDelay: number,
    jitter: Jitter,
  ): number {
    if (maxAttempts < 0 || maxAttempts > this.ceilingForMaxAttempts) {
      throw new Error(`The max attempts must be between 0 and ${this.ceilingForMaxAttempts}.`);
    }

    if (attempt > maxAttempts) {
      attempt = maxAttempts;
    }

    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

    const nextRandomValue = Math.random();
    switch (jitter) {
      case Jitter.Full:
        return delay * nextRandomValue;
      case Jitter.Equal:
        return delay * (0.5 + nextRandomValue * 0.5);
      default:
        return delay;
    }
  }
}
