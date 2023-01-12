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
	File Name: exponential_backoff.spec.ts
	Description: Test specification for the exponential backoff class.
	Written by: Nikita Petko
*/

import { Jitter } from '../sentinels/enums/jitter';
import ExponentialBackoff from '../sentinels/exponential_backoff';

describe('ExponentialBackoff', () => {
  describe('#calculateBackoff', () => {
    it('should return a delay of baseDelay * 2^(attempt - 1) when jitter is None', () => {
      const baseDelay = 100;
      const maxDelay = 1000;
      const jitter = Jitter.None;
      const maxAttempts = 5;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const expectedDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        const actualDelay = ExponentialBackoff.calculateBackoff(attempt, maxAttempts, baseDelay, maxDelay, jitter);

        expect(actualDelay).toBe(expectedDelay);
      }
    });

    it('should return a delay of (baseDelay * 2^(attempt - 1)) * random when jitter is Full', () => {
      const baseDelay = 100;
      const maxDelay = 1000;
      const jitter = Jitter.Full;
      const maxAttempts = 5;

      // mock Math.random() to return a constant value
      const oldMathRandom = Math.random;
      Math.random = jest.fn(() => 0.5);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const expectedDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay) * Math.random();
        const actualDelay = ExponentialBackoff.calculateBackoff(attempt, maxAttempts, baseDelay, maxDelay, jitter);

        expect(actualDelay).toBe(expectedDelay);
      }

      // restore Math.random()
      Math.random = oldMathRandom;
    });

    it('should return a delay of (baseDelay * 2^(attempt - 1)) * (0.5 + random * 0.5) when jitter is Equal', () => {
      const baseDelay = 100;
      const maxDelay = 1000;
      const jitter = Jitter.Equal;
      const maxAttempts = 5;

      // mock Math.random() to return a constant value
      const oldMathRandom = Math.random;
      Math.random = jest.fn(() => 0.5);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const expectedDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay) * (0.5 + Math.random() * 0.5);
        const actualDelay = ExponentialBackoff.calculateBackoff(attempt, maxAttempts, baseDelay, maxDelay, jitter);

        expect(actualDelay).toBe(expectedDelay);
      }

      // restore Math.random()
      Math.random = oldMathRandom;
    });

    it('should set the attempt to maxAttempts if it is greater than maxAttempts', () => {
      const baseDelay = 100;
      const maxDelay = 1000;
      const jitter = Jitter.None;
      const maxAttempts = 5;
      const attempt = maxAttempts + 1;

      const expectedDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const actualDelay = ExponentialBackoff.calculateBackoff(attempt, maxAttempts, baseDelay, maxDelay, jitter);

      expect(actualDelay).toBe(expectedDelay);
    });

    it('should throw an error if the maxAttempts is less than 0', () => {
      const baseDelay = 100;
      const maxDelay = 1000;
      const jitter = Jitter.None;
      const maxAttempts = -1;
      const attempt = 1;

      expect(() => {
        ExponentialBackoff.calculateBackoff(attempt, maxAttempts, baseDelay, maxDelay, jitter);
      }).toThrow();
    });

    it('should throw an error if the maxAttempts is greater than ceilingForMaxAttempts', () => {
      const baseDelay = 100;
      const maxDelay = 1000;
      const jitter = Jitter.None;
      const maxAttempts = ExponentialBackoff.ceilingForMaxAttempts + 1;
      const attempt = 1;

      expect(() => {
        ExponentialBackoff.calculateBackoff(attempt, maxAttempts, baseDelay, maxDelay, jitter);
      }).toThrow();
    });
  });
});
