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
	File Name: togglable_service_sentinel.ts
	Description: Service sentinel that can be toggled.
	Written by: Nikita Petko
*/

import ServiceSentinel, { HealthCheck, MonitorIntervalGetter } from './service_sentinel';

/**
 * Service sentinel that can be toggled.
 */
export default class TogglableServiceSentinel extends ServiceSentinel {
  /**
   * @internal This is a private member.
   */
  private _isRunning: boolean;

  /**
   * Construct a new instance of the TogglableServiceSentinel class.
   * @param {HealthCheck} healthCheck The function to determine if the service is healthy.
   * @param {MonitorIntervalGetter} monitorIntervalGetter The function to get the monitor interval.
   * @param {boolean} isHealthy The initial health status.
   */
  public constructor(healthCheck: HealthCheck, monitorIntervalGetter: MonitorIntervalGetter, isHealthy: boolean) {
    super(healthCheck, monitorIntervalGetter, isHealthy);

    this._isRunning = true;
  }

  /**
   * Start the sentinel.
   * @returns {void}
   */
  public start(): void {
    if (this._isRunning) {
      return;
    }

    this._isRunning = true;
    this.monitorTimer = setInterval(this.monitor.bind(this), this.monitorIntervalGetter());
  }

  /**
   * Stop the sentinel.
   * @returns {void}
   */
  public stop(): void {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;
    clearInterval(this.monitorTimer);
  }
}
