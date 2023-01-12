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
	File Name: sentinels.spec.ts
	Description: Test specification for the sentinel classes.
	Written by: Nikita Petko
*/

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import ServiceSentinel from '../sentinels/sentinels/service_sentinel';
import TogglableServiceSentinel from '../sentinels/sentinels/togglable_service_sentinel';

describe('Sentinels', () => {
  describe('ServiceSentinel', () => {
    describe('#constructor', () => {
      it('should construct a new instance of the ServiceSentinel class', () => {
        const sentinel = new ServiceSentinel(() => true, () => 100, true);

        expect(sentinel).toBeInstanceOf(ServiceSentinel);

        sentinel.dispose(true);
      });

      it('should throw if the check function is not specified', () => {
        expect(() => new ServiceSentinel(null as any, () => 10000, true)).toThrow();
        expect(() => new ServiceSentinel(undefined as any, () => 10000, true)).toThrow();
      });

      it('should throw if the monitor interval function is not specified', () => {
        expect(() => new ServiceSentinel(() => true, null as any, true)).toThrow();
        expect(() => new ServiceSentinel(() => true, undefined as any, true)).toThrow();
      });
    });

    describe('#isHealthy', () => {
      it('should return the health status', () => {
        const sentinel = new ServiceSentinel(() => true, () => 100, true);

        expect(sentinel.isHealthy).toBe(true);

        sentinel.dispose(true);
      });
    });

    describe('#dispose', () => {
      it('should dispose the sentinel', () => {
        const sentinel = new ServiceSentinel(() => true, () => 100, true);

        sentinel.dispose(true);

        expect(sentinel['_isDisposed']).toBe(true);
      });

      it('should not dispose the sentinel if it is already disposed', () => {
        const sentinel = new ServiceSentinel(() => true, () => 100, true);

        sentinel.dispose(true);
        sentinel.dispose(true);

        expect(sentinel['_isDisposed']).toBe(true);
      });

      it('should not dispose the sentinel if the disposing flag is not set', () => {
        const sentinel = new ServiceSentinel(() => true, () => 100, true);

        sentinel.dispose(false);

        expect(sentinel['_isDisposed']).toBe(false);

        sentinel.dispose(true);
      });
    });
  });

  describe('TogglableServiceSentinel', () => {
    describe('#constructor', () => {
      it('should construct a new instance of the TogglableServiceSentinel class', () => {
        const sentinel = new TogglableServiceSentinel(() => true, () => 100, true);

        expect(sentinel).toBeInstanceOf(TogglableServiceSentinel);

        sentinel.dispose(true);
      });
    });

    describe('#start', () => {
      it('should start the sentinel', () => {
        const sentinel = new TogglableServiceSentinel(() => true, () => 100, true);

        sentinel.stop();
        sentinel.start();

        expect(sentinel['_isRunning']).toBe(true);

        sentinel.dispose(true);
      });

      it('should not start the sentinel if it is already running', () => {
        const sentinel = new TogglableServiceSentinel(() => true, () => 100, true);

        sentinel.start();
        sentinel.start();

        expect(sentinel['_isRunning']).toBe(true);

        sentinel.dispose(true);
      });
    });

    describe('#stop', () => {
      it('should stop the sentinel', () => {
        const sentinel = new TogglableServiceSentinel(() => true, () => 100, true);

        sentinel.stop();

        expect(sentinel['_isRunning']).toBe(false);

        sentinel.dispose(true);
      });

      it('should not stop the sentinel if it is already stopped', () => {
        const sentinel = new TogglableServiceSentinel(() => true, () => 100, true);

        sentinel.stop();
        sentinel.stop();

        expect(sentinel['_isRunning']).toBe(false);

        sentinel.dispose(true);
      });
    });
  });
});
